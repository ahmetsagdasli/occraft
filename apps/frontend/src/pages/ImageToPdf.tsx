import * as React from 'react'
import {
  Box, Button, Card, CardContent, LinearProgress, List, ListItem, ListItemText,
  Stack, Typography, Alert, IconButton
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import DeleteIcon from '@mui/icons-material/Delete'

function humanSize(n: number) {
  const u = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let x = n
  while (x >= 1024 && i < u.length - 1) { x /= 1024; i++ }
  return `${x.toFixed(1)} ${u[i]}`
}

export default function ImageToPdf() {
  const [files, setFiles] = React.useState<File[]>([])
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement | null>(null)

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const fs = e.target.files
    if (fs) setFiles(prev => [...prev, ...Array.from(fs)])
    e.target.value = ''
  }

  function move(idx: number, dir: -1 | 1) {
    setFiles(prev => {
      const next = [...prev]
      const j = idx + dir
      if (j < 0 || j >= next.length) return prev
      const t = next[idx]; next[idx] = next[j]; next[j] = t
      return next
    })
  }

  function removeAt(idx: number) {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  async function onConvert() {
    try {
      setBusy(true); setError(null); setDownloadUrl(null)
      if (!files.length) { setError('En az bir PNG/JPG seçin'); return }
      const fd = new FormData()
      for (const f of files) fd.append('files', f)
      const res = await fetch('/api/image-to-pdf', { method: 'POST', body: fd })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `İstek başarısız: ${res.status}`)
      }
      const j = await res.json()
      setDownloadUrl(j.url as string)
    } catch (e: any) {
      setError(e.message || 'Görsel → PDF hatası')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h4" gutterBottom>Görsel → PDF</Typography>

      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg"
              multiple
              hidden
              onChange={onPick}
            />
            <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => inputRef.current?.click()}>
              Görsel Yükle
            </Button>
            <Typography variant="body2" color="text.secondary">
              PNG veya JPG; listedeki sıraya göre sayfaya yerleşir.
            </Typography>
          </Stack>

          {files.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <List dense>
                {files.map((f, idx) => (
                  <ListItem
                    key={idx}
                    secondaryAction={
                      <Stack direction="row" spacing={1}>
                        <IconButton onClick={() => move(idx, -1)} disabled={idx === 0}><ArrowUpwardIcon /></IconButton>
                        <IconButton onClick={() => move(idx, +1)} disabled={idx === files.length - 1}><ArrowDownwardIcon /></IconButton>
                        <IconButton onClick={() => removeAt(idx)}><DeleteIcon /></IconButton>
                      </Stack>
                    }
                  >
                    <ListItemText primary={f.name} secondary={`${humanSize(f.size)} — ${f.type}`} />
                  </ListItem>
                ))}
              </List>

              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Button variant="contained" onClick={onConvert} disabled={busy}>Dönüştür</Button>
                <Button variant="outlined" onClick={() => setFiles([])} disabled={busy}>Temizle</Button>
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
          PDF hazır. <a href={downloadUrl} rel="noreferrer">Tek kullanımlık indir</a> — 15 dakika.
        </Alert>
      )}
    </Stack>
  )
}
