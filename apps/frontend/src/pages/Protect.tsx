import * as React from 'react'
import { Alert, Box, Button, Stack, TextField, Typography, LinearProgress } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DropArea from '../components/DropArea'
import { useUpload } from '../hooks/useUpload'
import GlassPanel from '../components/GlassPanel'

export default function Protect() {
  const [file, setFile] = React.useState<File | null>(null)
  const [userPass, setUserPass] = React.useState('')
  const [ownerPass, setOwnerPass] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const { send, progress, eta, busy, reset } = useUpload()
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
    e.target.value = ''
  }

  async function onProtect() {
    try {
      setError(null)
      if (!file) throw new Error('PDF seç')
      if (!userPass) throw new Error('Kullanıcı parolasını gir')
      const fd = new FormData()
      fd.append('file', file)
      fd.append('userPassword', userPass)
      if (ownerPass) fd.append('ownerPassword', ownerPass)
      const resp = await send<{ url: string }>('/api/protect', fd)
      window.location.href = resp.url
      reset()
    } catch (e: any) {
      setError(e.message || 'İşlem hatası')
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" gutterBottom>PDF’i Parola ile Koru</Typography>

      <GlassPanel>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={pick} />
            <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => inputRef.current?.click()}>
              PDF Seç
            </Button>
            <TextField label="Kullanıcı Parolası" type="password" size="small" value={userPass} onChange={(e) => setUserPass(e.target.value)} />
            <TextField label="Sahip Parolası (opsiyonel)" type="password" size="small" value={ownerPass} onChange={(e) => setOwnerPass(e.target.value)} />
          </Stack>

          <DropArea accept="application/pdf" onFiles={(fs) => setFile(fs[0] ?? null)} />

          {file && (
            <Box>
              <Typography variant="body2" color="text.secondary">Seçilen: <b>{file.name}</b></Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Button variant="contained" onClick={onProtect} disabled={busy}>Parola Uygula</Button>
                <Button variant="outlined" onClick={() => { setFile(null); setUserPass(''); setOwnerPass(''); reset() }} disabled={busy}>Temizle</Button>
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
