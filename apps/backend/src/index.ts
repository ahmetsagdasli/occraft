import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import multer from 'multer'
import { z } from 'zod'
import { PDFDocument, degrees } from 'pdf-lib'
import JSZip from 'jszip'
import { initDownloadsReaper, saveDownload, takeDownloadOnce } from './downloads.js'
import { compressWithGhostscript, basicResavePdf, protectWithGhostscript } from './gs.js'
import { pdfToImages, pdfFirstPagePreview } from './im.js'
import fs from 'fs'

const app = express()
const PORT = Number(process.env.PORT ?? 4000)
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5174'

app.use(cors({ origin: CORS_ORIGIN }))
app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())

// memoryStorage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: (Number(process.env.MAX_FILE_SIZE_MB ?? 25)) * 1024 * 1024,
    files: Number(process.env.MAX_FILES_PER_BATCH ?? 10)
  }
})

app.get('/api/health', (_req, res) => res.json({ ok: true }))

// Tek-kullanımlık indirme
app.get('/api/download/:id', async (req, res) => {
  try {
    const rec = await takeDownloadOnce(req.params.id)
    if (!rec) return res.status(410).json({ error: 'Link expired or already used' })
    res.setHeader('Content-Type', rec.mime)
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(rec.filename)}"`)
    const stream = fs.createReadStream(rec.filePath)
    stream.on('close', async () => { try { fs.rmSync(rec.filePath, { force: true }) } catch {} })
    stream.pipe(res)
  } catch (e: any) {
    console.error(e)
    res.status(500).json({ error: 'Download error' })
  }
})

// Yardımcı: aralık parse
function parseRanges(inputRaw: string, totalPages: number): { label: string; indices: number[] }[] {
  const input = (inputRaw || '').trim()
  if (!input) throw new Error('Aralık boş olamaz. Örnek: "1-3,5,7-"')
  const tokens = input.split(',').map(t => t.trim()).filter(Boolean)
  if (!tokens.length) throw new Error('Geçersiz aralık ifadesi')

  const parts: { label: string; indices: number[] }[] = []
  for (const t of tokens) {
    let m: RegExpMatchArray | null
    m = t.match(/^(\d+)\-(\d+)$/)
    if (m) {
      const a = Number(m[1]), b = Number(m[2])
      if (!(a >= 1 && b >= 1 && a <= b && b <= totalPages)) throw new Error(`Geçersiz aralık: ${t} (toplam ${totalPages} sayfa)`)
      parts.push({ label: `${a}-${b}`, indices: Array.from({ length: b - a + 1 }, (_, i) => a - 1 + i) })
      continue
    }
    m = t.match(/^(\d+)\-$/)
    if (m) {
      const a = Number(m[1])
      if (!(a >= 1 && a <= totalPages)) throw new Error(`Geçersiz aralık: ${t}`)
      parts.push({ label: `${a}-${totalPages}`, indices: Array.from({ length: totalPages - a + 1 }, (_, i) => a - 1 + i) })
      continue
    }
    m = t.match(/^(\d+)$/)
    if (m) {
      const a = Number(m[1])
      if (!(a >= 1 && a <= totalPages)) throw new Error(`Geçersiz sayfa: ${t}`)
      parts.push({ label: `${a}`, indices: [a - 1] })
      continue
    }
    throw new Error(`Geçersiz ifade: "${t}"`)
  }
  return parts
}

// MERGE
app.post('/api/merge', upload.array('files'), async (req, res) => {
  try {
    const files = (req.files ?? []) as Express.Multer.File[]
    if (!files.length) return res.status(400).json({ error: 'En az bir PDF yükleyin' })
    for (const f of files) {
      if (f.mimetype !== 'application/pdf') return res.status(400).json({ error: `PDF olmayan dosya: ${f.originalname}` })
      if (!f.buffer?.length) return res.status(400).json({ error: `Dosya boş veya okunamadı: ${f.originalname}` })
    }
    const out = await PDFDocument.create()
    for (const f of files) {
      const src = await PDFDocument.load(f.buffer, { ignoreEncryption: true })
      const pages = await out.copyPages(src, src.getPageIndices())
      pages.forEach(p => out.addPage(p))
    }
    const merged = await out.save()
    const save = await saveDownload(merged, 'merged.pdf', 'application/pdf')
    res.json({ url: save.url, ttlSeconds: save.ttlSeconds, filename: save.filename })
  } catch (e: any) {
    console.error('[merge] error:', e)
    res.status(500).json({ error: 'Merge işleminde hata oluştu' })
  }
})

// SPLIT
app.post('/api/split', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ error: 'PDF dosyası gerekli' })
    if (file.mimetype !== 'application/pdf') return res.status(400).json({ error: `PDF olmayan dosya: ${file.originalname}` })
    if (!file.buffer?.length) return res.status(400).json({ error: `Dosya boş veya okunamadı: ${file.originalname}` })

    const rangesSchema = z.object({ ranges: z.string() })
    const parsed = rangesSchema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Geçersiz parametre: ranges' })
    const rangesStr = parsed.data.ranges

    const src = await PDFDocument.load(file.buffer, { ignoreEncryption: true })
    const total = src.getPageCount()
    const parts = parseRanges(rangesStr, total)
    if (!parts.length) return res.status(400).json({ error: 'Aralık boş' })

    const zip = new JSZip()
    for (const p of parts) {
      const doc = await PDFDocument.create()
      const copied = await doc.copyPages(src, p.indices)
      copied.forEach(pg => doc.addPage(pg))
      const bytes = await doc.save()
      const safeLabel = p.label.replace(/[^0-9\-]/g, '_')
      zip.file(`pages_${safeLabel}.pdf`, bytes)
    }
    const zipBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
    const save = await saveDownload(zipBuf, 'split.zip', 'application/zip')
    res.json({ url: save.url, ttlSeconds: save.ttlSeconds, filename: save.filename })
  } catch (e: any) {
    console.error('[split] error:', e)
    res.status(400).json({ error: e?.message || 'Split işleminde hata oluştu' })
  }
})

// COMPRESS
app.post('/api/compress', upload.single('file'), async (req, res) => {
  try {
    const schema = z.object({ level: z.enum(['balanced', 'strong']).default('balanced') })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid level' })
    const level = parsed.data.level

    const file = req.file
    if (!file) return res.status(400).json({ error: 'PDF dosyası gerekli' })
    if (file.mimetype !== 'application/pdf') return res.status(400).json({ error: `PDF olmayan dosya: ${file.originalname}` })
    if (!file.buffer?.length) return res.status(400).json({ error: `Dosya boş veya okunamadı: ${file.originalname}` })

    let output: Uint8Array
    try {
      output = await compressWithGhostscript(file.buffer, level)
    } catch (e) {
      console.warn('[compress] Ghostscript yok/hata, basic fallback kullanılıyor:', (e as any)?.message)
      output = await basicResavePdf(file.buffer)
    }

    const save = await saveDownload(output, 'compressed.pdf', 'application/pdf')
    res.json({ url: save.url, ttlSeconds: save.ttlSeconds, filename: save.filename })
  } catch (e: any) {
    console.error('[compress] error:', e)
    res.status(500).json({ error: 'Compress işleminde hata oluştu' })
  }
})

// PDF -> IMAGE
app.post('/api/pdf-to-image', upload.single('file'), async (req, res) => {
  try {
    const schema = z.object({ dpi: z.coerce.number().min(72).max(600).default(150), format: z.enum(['png', 'jpg']).default('png') })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Invalid params' })
    const { dpi, format } = parsed.data

    const file = req.file
    if (!file) return res.status(400).json({ error: 'PDF dosyası gerekli' })
    if (file.mimetype !== 'application/pdf') return res.status(400).json({ error: `PDF olmayan dosya: ${file.originalname}` })
    if (!file.buffer?.length) return res.status(400).json({ error: `Dosya boş veya okunamadı: ${file.originalname}` })

    const images = await pdfToImages(file.buffer, { dpi, format })
    const zip = new JSZip()
    for (const img of images) zip.file(img.name, img.data)
    const zipBuf = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })
    const save = await saveDownload(zipBuf, 'images.zip', 'application/zip')
    res.json({ url: save.url, ttlSeconds: save.ttlSeconds, filename: save.filename })
  } catch (e: any) {
    console.error('[pdf-to-image] error:', e)
    const msg = e?.message?.includes('ImageMagick') ? 'Sunucuda ImageMagick kurulu değil' : (e?.message || 'PDF → Görsel işleminde hata')
    res.status(500).json({ error: msg })
  }
})

// REORDER / ROTATE / DELETE (kısmi sıralama destekli)
app.post('/api/reorder', upload.single('file'), async (req, res) => {
  try {
    const schema = z.object({
      newOrder: z.string().optional(),   // JSON.stringify([1,3,2])
      rotations: z.string().optional(),  // JSON.stringify({ "2":90 })
      deletions: z.string().optional()   // JSON.stringify([4,7])
    })
    const parsed = schema.safeParse(req.body)
    if (!parsed.success) return res.status(400).json({ error: 'Geçersiz parametre' })

    const file = req.file
    if (!file) return res.status(400).json({ error: 'PDF dosyası gerekli' })
    if (file.mimetype !== 'application/pdf') return res.status(400).json({ error: `PDF olmayan dosya: ${file.originalname}` })
    if (!file.buffer?.length) return res.status(400).json({ error: `Dosya boş veya okunamadı: ${file.originalname}` })

    const src = await PDFDocument.load(file.buffer, { ignoreEncryption: true })
    const total = src.getPageCount()

    const parseJson = <T,>(v?: string): T | undefined => {
      if (!v) return undefined
      try { return JSON.parse(v) as T } catch { throw new Error('JSON parse hatası (newOrder/rotations/deletions)') }
    }

    // Silinecekler
    const deletionsArr = (parseJson<number[]>(parsed.data.deletions) ?? []).map(Number)
    deletionsArr.forEach(n => { if (!(Number.isInteger(n) && n >= 1 && n <= total)) throw new Error(`Silinecek sayfa geçersiz: ${n}`) })
    const delSet = new Set(deletionsArr)

    // Kalan sayfalar (1-bazlı)
    const remaining = Array.from({ length: total }, (_, i) => i + 1).filter(n => !delSet.has(n))

    // Kısmi sıra desteği
    const orderArrRaw = parseJson<number[]>(parsed.data.newOrder)
    let finalOrder: number[]
    if (orderArrRaw && orderArrRaw.length) {
      const requested = orderArrRaw.map(Number).filter(n => !delSet.has(n))
      const remSet = new Set(remaining)
      const seen = new Set<number>()
      for (const n of requested) {
        if (!remSet.has(n)) throw new Error(`newOrder içinde geçersiz sayfa: ${n}`)
        if (seen.has(n)) throw new Error('newOrder içinde tekrar eden sayfa var')
        seen.add(n)
      }
      const rest = remaining.filter(n => !seen.has(n))
      finalOrder = [...requested, ...rest]
    } else {
      finalOrder = remaining
    }

    // Rotasyonlar
    const rotationsMap = parseJson<Record<string, number>>(parsed.data.rotations) ?? {}
    for (const [k, v] of Object.entries(rotationsMap)) {
      const n = Number(k)
      if (!(Number.isInteger(n) && n >= 1 && n <= total)) throw new Error(`Rotasyon sayfa no geçersiz: ${k}`)
      if (![0, 90, 180, 270].includes(Number(v))) throw new Error(`Rotasyon değeri geçersiz (0/90/180/270): ${v}`)
    }

    // Yeni PDF
    const out = await PDFDocument.create()
    for (const origPageNo of finalOrder) {
      const [pg] = await out.copyPages(src, [origPageNo - 1])
      const rot = rotationsMap[String(origPageNo)]
      if (rot !== undefined) pg.setRotation(degrees(Number(rot)))
      out.addPage(pg)
    }

    const bytes = await out.save({ useObjectStreams: true })
    const save = await saveDownload(bytes, 'edited.pdf', 'application/pdf')
    res.json({ url: save.url, ttlSeconds: save.ttlSeconds, filename: save.filename })
  } catch (e: any) {
    console.error('[reorder] error:', e)
    res.status(400).json({ error: e?.message || 'Reorder işleminde hata oluştu' })
  }
})

// PREVIEW (ilk sayfa PNG)
app.post('/api/preview', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    const dpi = Number(req.body?.dpi ?? 60)
    if (!file) return res.status(400).json({ error: 'PDF dosyası gerekli' })
    if (file.mimetype !== 'application/pdf') return res.status(400).json({ error: 'PDF bekleniyor' })
    const png = await pdfFirstPagePreview(file.buffer, dpi)
    res.setHeader('Content-Type', 'image/png')
    res.send(png)
  } catch (e: any) {
    console.error('[preview] error:', e)
    res.status(500).json({ error: 'Önizleme üretilemedi' })
  }
})

// PROTECT (parola)
app.post('/api/protect', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    const userPassword = String(req.body?.userPassword ?? '')
    const ownerPassword = req.body?.ownerPassword ? String(req.body.ownerPassword) : undefined
    if (!file) return res.status(400).json({ error: 'PDF dosyası gerekli' })
    if (!userPassword) return res.status(400).json({ error: 'Kullanıcı parolası gerekli' })
    const out = await protectWithGhostscript(file.buffer, { userPassword, ownerPassword })
    const save = await saveDownload(out, 'protected.pdf', 'application/pdf')
    res.json({ url: save.url, ttlSeconds: save.ttlSeconds, filename: save.filename })
  } catch (e: any) {
    console.error('[protect] error:', e)
    res.status(500).json({ error: e?.message || 'Parola koruma başarısız' })
  }
})

app.use((_req, res) => res.status(404).json({ error: 'Not found' }))

app.listen(PORT, async () => {
  await initDownloadsReaper()
  console.log(`[DocCraft] listening on http://localhost:${PORT}`)
})
