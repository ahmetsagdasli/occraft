import * as React from 'react'
import { Alert, Box, Button, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography, LinearProgress } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import GlassPanel from '../components/GlassPanel'
import DropArea from '../components/DropArea'
import { useUpload } from '../hooks/useUpload'

export default function PdfToImage() {
  const [file, setFile] = React.useState<File | null>(null)
  const [dpi, setDpi] = React.useState<number>(150)
  const [format, setFormat] = React.useState<'png' | 'jpg'>('png')
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const { send, progress, eta, busy, reset } = useUpload()

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
    e.currentTarget.value = ''
  }

  const onConvert = async () => {
    try {
      setError(null)
      if (!file) throw new Error('PDF seç')
      const fd = new FormData()
      fd.append('file', file)
      fd.append('dpi', String(dpi))
      fd.append('format', format)
      const resp = await send<{ url: string }>('/api/pdf-to-image', fd)
      window.location.href = resp.url
      reset()
    } catch (e: any) {
      setError(e.message || 'Dönüştürme hatası')
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" gutterBottom>PDF → Görsel</Typography>

      <GlassPanel>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={onPick} />
            <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => inputRef.current?.click()}>
              PDF Seç
            </Button>
            <TextField
              label="DPI"
              size="small"
              type="number"
              value={dpi}
              onChange={(e) => setDpi(Number(e.target.value))}
              inputProps={{ min: 72, max: 600, step: 1 }}
              sx={{ width: 120 }}
            />
            <ToggleButtonGroup exclusive value={format} onChange={(_, v) => v && setFormat(v)} size="small">
              <ToggleButton value="png">PNG</ToggleButton>
              <ToggleButton value="jpg">JPG</ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <DropArea accept="application/pdf" onFiles={(fs) => setFile(fs[0] ?? null)} />

          {file && (
            <Box>
              <Typography variant="body2" color="text.secondary">Seçilen: <b>{file.name}</b></Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Button variant="contained" onClick={onConvert} disabled={busy}>Dönüştür</Button>
                <Button variant="outlined" onClick={() => { setFile(null); reset() }} disabled={busy}>Temizle</Button>
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
          )}
        </Stack>
      </GlassPanel>

      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  )
}
