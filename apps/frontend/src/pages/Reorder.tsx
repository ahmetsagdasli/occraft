import * as React from 'react'
import {
  Alert, Box, Button, Card, CardContent, LinearProgress, Stack, TextField, Typography
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'

type RotMap = Record<number, 0 | 90 | 180 | 270>

function parseList(str: string): number[] {
  const s = (str || '').trim()
  if (!s) return []
  return s.split(',').map(x => Number(x.trim())).filter(n => Number.isFinite(n))
}

function parseRot(str: string): RotMap {
  const s = (str || '').trim()
  if (!s) return {}
  const map: RotMap = {}
  for (const token of s.split(',')) {
    const [k, v] = token.split(':').map(t => t.trim())
    const page = Number(k)
    const deg = Number(v) as 0 | 90 | 180 | 270
    if (Number.isFinite(page) && [0, 90, 180, 270].includes(deg)) {
      map[page] = deg
    }
  }
  return map
}

export default function Reorder() {
  const [file, setFile] = React.useState<File | null>(null)
  const [orderStr, setOrderStr] = React.useState<string>('')     // Örn: 2,1,4,3
  const [deleteStr, setDeleteStr] = React.useState<string>('')   // Örn: 5,7
  const [rotStr, setRotStr] = React.useState<string>('')         // Örn: 2:90, 5:180
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
    e.target.value = ''
  }

  async function onProcess() {
    try {
      setBusy(true); setError(null); setDownloadUrl(null)
      if (!file) { setError('Lütfen bir PDF seçin'); return }

      const orderArr = parseList(orderStr)
      const delArr = parseList(deleteStr)
      const rotMap = parseRot(rotStr)

      const fd = new FormData()
      fd.append('file', file)
      if (orderArr.length) fd.append('newOrder', JSON.stringify(orderArr))
      if (delArr.length) fd.append('deletions', JSON.stringify(delArr))
      if (Object.keys(rotMap).length) fd.append('rotations', JSON.stringify(rotMap))

      const res = await fetch('/api/reorder', { method: 'POST', body: fd })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `İstek başarısız: ${res.status}`)
      }
      const j = await res.json()
      setDownloadUrl(j.url as string)
    } catch (e: any) {
      setError(e.message || 'İşlem hatası')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" gutterBottom>Sayfa Sırala / Döndür / Sil</Typography>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
            <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={onPick} />
            <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => inputRef.current?.click()}>
              PDF Yükle
            </Button>

            <TextField
              label="Yeni Sıra (1-bazlı)"
              placeholder="Örn: 2,1,4,3"
              size="small"
              value={orderStr}
              onChange={(e) => setOrderStr(e.target.value)}
              sx={{ minWidth: 220 }}
              helperText="Boş bırakılırsa mevcut sıra korunur."
            />
            <TextField
              label="Silinecekler"
              placeholder="Örn: 5,7"
              size="small"
              value={deleteStr}
              onChange={(e) => setDeleteStr(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Rotasyonlar"
              placeholder="Örn: 2:90, 5:180"
              size="small"
              value={rotStr}
              onChange={(e) => setRotStr(e.target.value)}
              sx={{ minWidth: 220 }}
              helperText="Değerler: 0,90,180,270"
            />
          </Stack>

          {file && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Seçilen: <b>{file.name}</b>
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button variant="contained" onClick={onProcess} disabled={busy}>Uygula</Button>
                <Button
                  variant="outlined"
                  onClick={() => { setFile(null); setOrderStr(''); setDeleteStr(''); setRotStr('') }}
                  disabled={busy}
                >
                  Temizle
                </Button>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {busy && (<><LinearProgress /><Typography variant="body2" sx={{ mt: 1 }}>İşlem yapılıyor…</Typography></>)}
      {error && <Alert severity="error">{error}</Alert>}
      {downloadUrl && (
        <Alert severity="success">
          Düzenlenmiş PDF hazır. <a href={downloadUrl} rel="noreferrer">Tek kullanımlık indir</a> — 15 dakika.
        </Alert>
      )}
    </Stack>
  )
}
