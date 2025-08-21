import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { randomUUID } from 'crypto'

type DownloadRecord = {
  id: string
  filePath: string
  filename: string
  expiresAt: number // epoch ms
  used: boolean
  mime: string
}

const TMP_DIR = path.join(os.tmpdir(), 'doccraft')
const records = new Map<string, DownloadRecord>()

async function ensureTmpDir() {
  await fs.mkdir(TMP_DIR, { recursive: true })
}

function now() {
  return Date.now()
}

function ttlMinutes() {
  const n = Number(process.env.URL_TTL_MINUTES ?? 15)
  return Number.isFinite(n) && n > 0 ? n : 15
}

export async function initDownloadsReaper() {
  await ensureTmpDir()
  // periyodik temizlik (2 dakikada bir)
  setInterval(async () => {
    const t = now()
    for (const [id, rec] of records) {
      if (rec.used || rec.expiresAt <= t) {
        try { await fs.rm(rec.filePath, { force: true }) } catch {}
        records.delete(id)
      }
    }
  }, 120_000).unref()
}

export async function saveDownload(
  buffer: Uint8Array,
  filename: string,
  mime: string
): Promise<{ id: string; url: string; ttlSeconds: number; filename: string }> {
  await ensureTmpDir()
  const id = randomUUID()
  const filePath = path.join(TMP_DIR, `${id}-${filename}`)
  await fs.writeFile(filePath, buffer)
  const minutes = ttlMinutes()
  const rec: DownloadRecord = {
    id,
    filePath,
    filename,
    mime,
    expiresAt: now() + minutes * 60_000,
    used: false
  }
  records.set(id, rec)
  return {
    id,
    url: `/api/download/${id}`,
    ttlSeconds: minutes * 60,
    filename
  }
}

export async function takeDownloadOnce(id: string): Promise<DownloadRecord | null> {
  const rec = records.get(id)
  if (!rec) return null
  if (rec.used) return null
  if (rec.expiresAt <= now()) {
    try { await fs.rm(rec.filePath, { force: true }) } catch {}
    records.delete(id)
    return null
  }
  rec.used = true
  records.set(id, rec)
  return rec
}
