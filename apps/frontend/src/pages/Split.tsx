import * as React from 'react'
import {
  Box, Button, Card, CardContent, LinearProgress, Stack, TextField, Typography, Alert
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'

function humanSize(n: number) {
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let x = n
  while (x >= 1024 && i < u.length - 1) { x /= 1024; i++ }
  return `${x.toFixed(1)} ${u[i]}`
}

export default function Split() {
  const [file, setFile] = React.useState<File | null>(null)
  const [ranges, setRanges] = React.useState<string>('1-3,5,7-') // örnek
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
    e.target.value = ''
  }

  async function onSplit() {
    try {
      setBusy(true); setError(null); setDownloadUrl(null)
      if (!file) { setError('Lütfen bir PDF seçin'); return }
      const fd = new FormData()
      fd.append('file', file)
      fd.append('ranges', ranges.trim())
      const res = await fetch('/api/split', { method: 'POST', body: fd })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `İstek başarısız: ${res.status}`)
      }
      const j = await res.json()
      setDownloadUrl(j.url as string)
    } catch (e: any) {
      setError(e.message || 'Bölme hatası')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" gutterBottom>PDF Böl</Typography>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              hidden
              onChange={onPick}
            />
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={() => inputRef.current?.click()}
            >
              PDF Yükle
            </Button>

            <TextField
              size="small"
              label="Aralıklar"
              placeholder="Ör: 1-3,5,7-"
              value={ranges}
              onChange={(e) => setRanges(e.target.value)}
              sx={{ minWidth: 260 }}
            />
          </Stack>

          {file && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Seçilen dosya: <b>{file.name}</b> — {humanSize(file.size)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Format: <code>1-3,5,7-</code> (1’den 3’e, sayfa 5, 7’den sona kadar).
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button variant="contained" onClick={onSplit} disabled={busy}>Böl</Button>
                <Button variant="outlined" onClick={() => setFile(null)} disabled={busy}>Temizle</Button>
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {busy && (
        <Box>
          <LinearProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>İşlem yapılıyor…</Typography>
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {downloadUrl && (
        <Alert severity="success">
          Bölme hazır.{' '}
          <a href={downloadUrl} rel="noreferrer">Tek kullanımlık indir (ZIP)</a> — 15 dakika.
        </Alert>
      )}
    </Stack>
  )
}
