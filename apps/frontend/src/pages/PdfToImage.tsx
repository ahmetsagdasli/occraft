import * as React from 'react'
import {
  Box, Button, Card, CardContent, LinearProgress, Stack, Typography, Alert, TextField, ToggleButtonGroup, ToggleButton
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'

export default function PdfToImage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [dpi, setDpi] = React.useState<number>(150)
  const [format, setFormat] = React.useState<'png' | 'jpg'>('png')
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
    e.target.value = ''
  }

  async function onConvert() {
    try {
      setBusy(true); setError(null); setDownloadUrl(null)
      if (!file) { setError('Lütfen bir PDF seçin'); return }
      const fd = new FormData()
      fd.append('file', file)
      fd.append('dpi', String(dpi))
      fd.append('format', format)
      const res = await fetch('/api/pdf-to-image', { method: 'POST', body: fd })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `İstek başarısız: ${res.status}`)
      }
      const j = await res.json()
      setDownloadUrl(j.url as string)
    } catch (e: any) {
      setError(e.message || 'PDF → Görsel hatası')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" gutterBottom>PDF → Görsel</Typography>

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
            <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => inputRef.current?.click()}>
              PDF Yükle
            </Button>

            <TextField
              label="DPI"
              type="number"
              size="small"
              value={dpi}
              onChange={(e) => setDpi(Number(e.target.value))}
              inputProps={{ min: 72, max: 600, step: 1 }}
              sx={{ width: 120 }}
            />

            <ToggleButtonGroup
              exclusive
              value={format}
              onChange={(_, v) => v && setFormat(v)}
              size="small"
            >
              <ToggleButton value="png">PNG</ToggleButton>
              <ToggleButton value="jpg">JPG</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          {file && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Seçilen: <b>{file.name}</b>
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button variant="contained" onClick={onConvert} disabled={busy}>Dönüştür</Button>
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
          Görseller hazır. <a href={downloadUrl} rel="noreferrer">ZIP indir</a> — 15 dakika.
        </Alert>
      )}
    </Stack>
  )
}
