import * as React from 'react'
import { Alert, Box, Button, Chip, Stack, Typography, LinearProgress } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import GlassPanel from '../components/GlassPanel'
import DropArea from '../components/DropArea'
import { useUpload } from '../hooks/useUpload'

export default function ImageToPdf() {
  const [images, setImages] = React.useState<File[]>([])
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const { send, progress, eta, busy, reset } = useUpload()

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = e.target.files ? Array.from(e.target.files) : []
    if (fs.length) setImages((prev) => [...prev, ...fs])
    e.currentTarget.value = ''
  }

  const onMakePdf = async () => {
    try {
      setError(null)
      if (!images.length) throw new Error('En az bir görsel seç')
      const fd = new FormData()
      images.forEach((f) => fd.append('files', f))
      const resp = await send<{ url: string }>('/api/image-to-pdf', fd)
      window.location.href = resp.url
      reset()
    } catch (e: any) {
      setError(e.message || 'PDF oluşturma hatası')
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" gutterBottom>Görsel → PDF</Typography>

      <GlassPanel>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <input ref={inputRef} type="file" accept="image/*" hidden multiple onChange={onPick} />
            <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => inputRef.current?.click()}>
              Görsel Seç
            </Button>
            <Button variant="outlined" onClick={() => setImages([])} disabled={busy || images.length === 0}>
              Temizle
            </Button>
          </Stack>

          <DropArea accept="image/*" multiple onFiles={(fs) => setImages((prev) => [...prev, ...fs])} />

          {images.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Seçilen görseller:
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {images.map((f, i) => (
                  <Chip key={i} label={f.name} onDelete={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} />
                ))}
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button variant="contained" onClick={onMakePdf} disabled={busy}>PDF Oluştur</Button>
                <Button variant="outlined" onClick={() => setImages([])} disabled={busy}>Temizle</Button>
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
