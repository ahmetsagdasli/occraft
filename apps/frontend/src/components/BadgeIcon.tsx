import * as React from 'react'
import { Box } from '@mui/material'

export default function BadgeIcon({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(180deg,#FFFFFF,rgba(255,255,255,0.65))',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6), 0 8px 20px rgba(0,0,0,.08)',
      }}
    >
      {children}
    </Box>
  )
}
