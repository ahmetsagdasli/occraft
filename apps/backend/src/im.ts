import { spawn, spawnSync } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { randomUUID } from 'crypto'

const TMP_DIR = path.join(os.tmpdir(), 'doccraft')

// ENV > yaygın adlar
function detectImageMagick(): string | null {
  const fromEnv = process.env.IMAGEMAGICK_CMD?.trim()
  if (fromEnv) {
    try { if (spawnSync(fromEnv, ['-version'], { stdio: 'ignore' }).status === 0) return fromEnv } catch {}
  }
  const candidates = process.platform === 'win32' ? ['magick', 'magick.exe', 'convert'] : ['magick', 'convert']
  for (const c of candidates) {
    try { if (spawnSync(c, ['-version'], { stdio: 'ignore' }).status === 0) return c } catch {}
  }
  return null
}

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] })
    let err = ''
    p.stderr.on('data', d => (err += d.toString()))
    p.on('error', reject)
    p.on('close', code => (code === 0 ? resolve() : reject(new Error(`ImageMagick exited ${code}. ${err}`))))
  })
}

export async function pdfToImages(
  input: Uint8Array,
  opts: { dpi: number; format: 'png' | 'jpg' }
): Promise<{ name: string; data: Buffer }[]> {
  const im = detectImageMagick()
  if (!im) throw new Error('ImageMagick not found')

  await fs.mkdir(TMP_DIR, { recursive: true })
  const dir = path.join(TMP_DIR, `im-${randomUUID()}`)
  await fs.mkdir(dir, { recursive: true })
  const inPath = path.join(dir, 'input.pdf')
  await fs.writeFile(inPath, input)

  const outPattern = path.join(dir, `page-%03d.${opts.format}`)
  const args: string[] = ['-density', String(opts.dpi), inPath]
  if (opts.format === 'jpg') { args.push('-background','white','-alpha','remove','-alpha','off','-quality','85','-strip') }
  else { args.push('-strip','-define','png:compression-level=9') }
  args.push(outPattern)

  try {
    await run(im, args)
    const files = (await fs.readdir(dir)).filter(f => f.startsWith('page-') && f.endsWith(`.${opts.format}`)).sort()
    const out: { name: string; data: Buffer }[] = []
    for (const f of files) { out.push({ name: f, data: await fs.readFile(path.join(dir, f)) }) }
    return out
  } finally {
    try { await fs.rm(dir, { recursive: true, force: true }) } catch {}
  }
}

/** İlk sayfadan hızlı PNG önizleme (tek görsel, düşük DPI). */
export async function pdfFirstPagePreview(input: Uint8Array, dpi = 60): Promise<Buffer> {
  const im = detectImageMagick()
  if (!im) throw new Error('ImageMagick not found')

  await fs.mkdir(TMP_DIR, { recursive: true })
  const dir = path.join(TMP_DIR, `im-prev-${randomUUID()}`)
  await fs.mkdir(dir, { recursive: true })
  const inPath = path.join(dir, 'input.pdf')
  const outPath = path.join(dir, 'preview.png')
  await fs.writeFile(inPath, input)

  const args = ['-density', String(dpi), `${inPath}[0]`, '-strip', '-quality', '70', outPath]

  try {
    await run(im, args)
    return await fs.readFile(outPath)
  } finally {
    try { await fs.rm(dir, { recursive: true, force: true }) } catch {}
  }
}
