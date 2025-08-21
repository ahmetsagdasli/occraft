import * as React from 'react'
import { Alert, Box, Button, Stack, TextField, Typography, LinearProgress, Tooltip, IconButton } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import GlassPanel from '../components/GlassPanel'
import DropArea from '../components/DropArea'
import { useUpload } from '../hooks/useUpload'

export default function Reorder() {
  const [file, setFile] = React.useState<File | null>(null)
  const [orderStr, setOrderStr] = React.useState<string>('')        // Örn: 2,1,4,3 (kısmi olabilir)
  const [deleteStr, setDeleteStr] = React.useState<string>('')      // Örn: 5,7
  const [rotStr, setRotStr] = React.useState<string>('')            // Örn: 2:90,5:180
  const [error, setError] = React.useState<string | null>(null)
  const { send, progress, eta, busy, reset } = useUpload()
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
    e.currentTarget.value = ''
  }

  const parseArray = (s: string) =>
    s.split(',').map(v => v.trim()).filter(Boolean).map(v => Number(v)).filter(n => Number.isFinite(n))

  const parseRotations = (s: string) => {
    const map: Record<string, number> = {}
    s.split(',').map(v => v.trim()).filter(Boolean).forEach(pair => {
      const [k, v] = pair.split(':').map(x => x.trim())
      const n = Number(k); const deg = Number(v)
      if (Number.isFinite(n) && [0,90,180,270].includes(deg)) map[String(n)] = deg
    })
    return map
  }

  const onApply = async () => {
    try {
      setError(null)
      if (!file) throw new Error('PDF seç')

      const newOrder = parseArray(orderStr)
      const deletions = parseArray(deleteStr)
      const rotations = parseRotations(rotStr)

      const fd = new FormData()
      fd.append('file', file)
      if (newOrder.length) fd.append('newOrder', JSON.stringify(newOrder))
      if (deletions.length) fd.append('deletions', JSON.stringify(deletions))
      if (Object.keys(rotations).length) fd.append('rotations', JSON.stringify(rotations))

      const resp = await send<{ url: string }>('/api/reorder', fd)
      window.location.href = resp.url
      reset()
    } catch (e: any) {
      setError(e.message || 'Düzenleme hatası')
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" gutterBottom>Sayfa Sırala / Döndür / Sil</Typography>

      <GlassPanel>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
            <input ref={inputRef} type="file" accept="application/pdf" hidden onChange={onPick} />
            <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => inputRef.current?.click()}>
              PDF Seç
            </Button>

            <TextField
              label="Yeni Sıra (1-bazlı)"
              placeholder="Örn: 2,1,4,3  (kısmi girebilirsin)"
              size="small"
              value={orderStr}
              onChange={(e) => setOrderStr(e.target.value)}
              sx={{ minWidth: 260 }}
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
              placeholder="Örn: 2:90,5:180"
              size="small"
              value={rotStr}
              onChange={(e) => setRotStr(e.target.value)}
              sx={{ minWidth: 220 }}
            />
            <Tooltip title="Yeni sıralamayı kısmi girebilirsin; kalan sayfalar mevcut sırayı korur. Rotasyon 0/90/180/270 olabilir.">
              <IconButton>
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          </Stack>

          <DropArea accept="application/pdf" onFiles={(fs) => setFile(fs[0] ?? null)} />

          {file && (
            <Box>
              <Typography variant="body2" color="text.secondary">Seçilen: <b>{file.name}</b></Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Button variant="contained" onClick={onApply} disabled={busy}>Uygula</Button>
                <Button variant="outlined" onClick={() => { setFile(null); setOrderStr(''); setDeleteStr(''); setRotStr(''); reset() }} disabled={busy}>Temizle</Button>
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
