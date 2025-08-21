import * as React from 'react'
import { Box, Typography } from '@mui/material'

type Props = {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  height?: number
}

export default function DropArea({ onFiles, accept, multiple, height = 140 }: Props) {
  const inputRef = React.useRef<HTMLInputElement | null>(null)
  const [hover, setHover] = React.useState(false)

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setHover(false)
    const files = Array.from(e.dataTransfer.files || [])
    if (!files.length) return
    onFiles(accept ? files.filter(f => f.type === accept || (accept.includes('application/pdf') && f.type === 'application/pdf')) : files)
  }

  return (
    <Box
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setHover(true) }}
      onDragLeave={() => setHover(false)}
      onDrop={onDrop}
      sx={{
        border: '2px dashed',
        borderColor: hover ? 'primary.main' : 'divider',
        borderRadius: 3,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        bgcolor: hover ? 'action.hover' : 'background.paper',
        textAlign: 'center',
        px: 2
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={!!multiple}
        hidden
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : []
          if (files.length) onFiles(files)
          e.currentTarget.value = ''
        }}
      />
      <Typography variant="body2" color="text.secondary">
        Dosyayı buraya sürükle-bırak ya da tıkla.
      </Typography>
    </Box>
  )
}
