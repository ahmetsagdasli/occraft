import * as React from 'react'
import { Box } from '@mui/material'
import { alpha } from '@mui/material/styles'

export default function GlassPanel({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        background: `linear-gradient(180deg, ${alpha('#FFFFFF', 0.6)}, ${alpha('#FFFFFF', 0.35)})`,
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha('#000', 0.06)}`,
        boxShadow: '0 12px 40px rgba(20,20,43,0.08)',
      }}
    >
      {children}
    </Box>
  )
}
