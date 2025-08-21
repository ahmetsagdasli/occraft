import * as React from 'react'
import {
  Alert, Box, Button, Card, CardContent, LinearProgress, Stack, ToggleButton, ToggleButtonGroup, Typography
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DropArea from '../components/DropArea'
import { useUpload } from '../hooks/useUpload'

export default function Compress() {
  const [file, setFile] = React.useState<File | null>(null)
  const [level, setLevel] = React.useState<'balanced' | 'strong'>('balanced')
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const { send, progress, eta, busy, reset } = useUpload()
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) { setFile(f); makePreview(f) }
    e.target.value = ''
  }

  async function makePreview(f: File) {
    try {
      setPreviewUrl(null)
      const fd = new FormData()
      fd.append('file', f)
      fd.append('dpi', '60')
      const res = await fetch('/api/preview', { method: 'POST', body: fd })
      if (!res.ok) return
      const blob = await res.blob()
      setPreviewUrl(URL.createObjectURL(blob))
    } catch {}
  }

  async function onCompress() {
    try {
      setError(null)
      if (!file) { setError('Lütfen bir PDF seçin'); return }
      const fd = new FormData()
      fd.append('file', file)
      fd.append('level', level)
      const resp = await send<{ url: string }>(
        '/api/compress',
        fd
      )
      window.location.href = resp.url
      reset()
    } catch (e: any) {
      setError(e.message || 'Sıkıştırma hatası')
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" gutterBottom>PDF Sıkıştır</Typography>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
              <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={pick} />
              <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => inputRef.current?.click()}>
                PDF Seç
              </Button>

              <ToggleButtonGroup exclusive value={level} onChange={(_, v) => v && setLevel(v)} size="small">
                <ToggleButton value="balanced">Dengeli</ToggleButton>
                <ToggleButton value="strong">Güçlü</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            <DropArea accept="application/pdf" onFiles={(fs) => { const f = fs[0]; if (f) { setFile(f); makePreview(f) } }} />

            {file && (
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
                {previewUrl && (
                  <Box sx={{ width: 180, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                    <img src={previewUrl} alt="preview" style={{ display: 'block', width: '100%' }} />
                  </Box>
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Seçilen: <b>{file.name}</b>
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <Button variant="contained" onClick={onCompress} disabled={busy}>Sıkıştır</Button>
                    <Button variant="outlined" onClick={() => { setFile(null); setPreviewUrl(null); reset() }} disabled={busy}>Temizle</Button>
                  </Stack>

                  {busy && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress variant="determinate" value={progress} />
                      <Typography variant="caption" color="text.secondary">
                        Yükleme: %{progress}{eta !== null ? ` • ETA ~${eta}s` : ''}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  )
}
