import { spawn, spawnSync } from 'child_process'
import { PDFDocument } from 'pdf-lib'
import { tmpdir } from 'os'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

function detectGS(): string | null {
  // 1) .env (GS_CMD) ile verilen tam yol
  const fromEnv = process.env.GS_CMD?.trim()
  if (fromEnv) {
    try { if (spawnSync(fromEnv, ['-v'], { stdio: 'ignore' }).status === 0) return fromEnv } catch {}
  }

  // 2) Windows için tipik kurulum dizinlerinde ara
  if (process.platform === 'win32') {
    const base = process.env['ProgramFiles'] || 'C:\\Program Files'
    try {
      const gsDir = path.join(base, 'gs')
      const entries = fs.readdirSync(gsDir).filter(n => /^gs/i.test(n)).sort().reverse()
      for (const d of entries) {
        const cand = path.join(gsDir, d, 'bin', 'gswin64c.exe')
        try {
          if (spawnSync(cand, ['-v'], { stdio: 'ignore' }).status === 0) return cand
        } catch {}
      }
    } catch {}
  }

  // 3) PATH üzerinde ara
  const candidates = process.platform === 'win32' ? ['gswin64c', 'gswin32c'] : ['gs']
  for (const c of candidates) {
    try { if (spawnSync(c, ['-v'], { stdio: 'ignore' }).status === 0) return c } catch {}
  }
  return null
}

export async function basicResavePdf(input: Uint8Array): Promise<Uint8Array> {
  const doc = await PDFDocument.load(input, { ignoreEncryption: true })
  return await doc.save({ useObjectStreams: true })
}

export async function compressWithGhostscript(input: Uint8Array, level: 'balanced' | 'strong'): Promise<Uint8Array> {
  const gs = detectGS()
  if (!gs) throw new Error('Ghostscript not found')

  const tmp = path.join(tmpdir(), `gs-${randomUUID()}`)
  await fs.mkdir(tmp, { recursive: true })
  const inPath = path.join(tmp, 'in.pdf')
  const outPath = path.join(tmp, 'out.pdf')
  await fs.writeFile(inPath, input)

  const preset = level === 'strong' ? '/screen' : '/ebook'
  const args = [
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.7',
    '-dNOPAUSE','-dQUIET','-dBATCH',
    `-dPDFSETTINGS=${preset}`,
    '-o', outPath,
    inPath
  ]

  try {
    const code = spawnSync(gs, args, { stdio: 'ignore' }).status ?? 1
    if (code !== 0) throw new Error(`gs exit ${code}`)
    return await fs.readFile(outPath)
  } finally {
    try { await fs.rm(tmp, { recursive: true, force: true }) } catch {}
  }
}

/** Basit parola koruma: açılış parolası (user) ve opsiyonel owner. 128-bit kullanır. */
export async function protectWithGhostscript(
  input: Uint8Array,
  opts: { userPassword: string; ownerPassword?: string }
): Promise<Uint8Array> {
  const gs = detectGS()
  if (!gs) throw new Error('Ghostscript not found')
  if (!opts.userPassword?.length) throw new Error('userPassword gerekli')

  const tmp = path.join(tmpdir(), `gs-protect-${randomUUID()}`)
  await fs.mkdir(tmp, { recursive: true })
  const inPath = path.join(tmp, 'in.pdf')
  const outPath = path.join(tmp, 'out.pdf')
  await fs.writeFile(inPath, input)

  const args = [
    '-sDEVICE=pdfwrite',
    '-dCompatibilityLevel=1.7',
    '-dNOPAUSE','-dQUIET','-dBATCH',
    `-sOwnerPassword=${opts.ownerPassword ?? opts.userPassword}`,
    `-sUserPassword=${opts.userPassword}`,
    '-o', outPath,
    inPath
  ]

  try {
    const code = spawnSync(gs, args, { stdio: 'ignore' }).status ?? 1
    if (code !== 0) throw new Error(`gs exit ${code}`)
    return await fs.readFile(outPath)
  } finally {
    try { await fs.rm(tmp, { recursive: true, force: true }) } catch {}
  }
}
