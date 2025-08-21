import * as React from 'react'
import { Alert, Box, Button, Stack, TextField, Typography, LinearProgress } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import GlassPanel from '../components/GlassPanel'
import DropArea from '../components/DropArea'
import { useUpload } from '../hooks/useUpload'

export default function Split() {
  const [file, setFile] = React.useState<File | null>(null)
  const [ranges, setRanges] = React.useState<string>('1-')
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const { send, progress, eta, busy, reset } = useUpload()

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
    e.currentTarget.value = ''
  }

  const onSplit = async () => {
    try {
      setError(null)
      if (!file) throw new Error('PDF seç')
      if (!ranges.trim()) throw new Error('Aralık gir (örn: 1-3,5,7-)')
      const fd = new FormData()
      fd.append('file', file)
      fd.append('ranges', ranges.trim())
      const resp = await send<{ url: string }>('/api/split', fd)
      window.location.href = resp.url
      reset()
    } catch (e: any) {
      setError(e.message || 'Bölme hatası')
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" gutterBottom>PDF Böl</Typography>

      <GlassPanel>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={onPick} />
            <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => inputRef.current?.click()}>
              PDF Seç
            </Button>
            <TextField
              label="Aralıklar"
              size="small"
              value={ranges}
              onChange={(e) => setRanges(e.target.value)}
              helperText={`Örnekler: 1-3,8  |  2-  |  5`}
              sx={{ minWidth: 260 }}
            />
          </Stack>

          <DropArea accept="application/pdf" onFiles={(fs) => setFile(fs[0] ?? null)} />

          {file && (
            <Box>
              <Typography variant="body2" color="text.secondary">Seçilen: <b>{file.name}</b></Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Button variant="contained" onClick={onSplit} disabled={busy}>Böl</Button>
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
