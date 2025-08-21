import * as React from 'react'
import { Box, Grid, Typography, Card, CardActionArea, CardContent } from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router-dom'
import MergeTypeIcon from '@mui/icons-material/MergeType'
import ContentCutIcon from '@mui/icons-material/ContentCut'
import CompressIcon from '@mui/icons-material/Compress'
import ImageIcon from '@mui/icons-material/Image'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

type Tool = {
  to: string
  title: string
  desc: string
  icon: React.ReactNode
}

export default function Home() {
  const t = useTheme()
  const tools: Tool[] = [
    { to: '/merge', title: 'PDF Birleştir', desc: 'Birden fazla PDF’i tek dosyada birleştir', icon: <MergeTypeIcon /> },
    { to: '/split', title: 'PDF Böl', desc: 'Seçtiğin sayfaları ayrı PDF’lere böl', icon: <ContentCutIcon /> },
    { to: '/compress', title: 'PDF Sıkıştır', desc: 'Boyutu küçült, paylaşımı kolaylaştır', icon: <CompressIcon /> },
    { to: '/pdf-to-image', title: 'PDF → Görsel', desc: 'PDF sayfalarını PNG/JPG olarak indir', icon: <ImageIcon /> },
    { to: '/image-to-pdf', title: 'Görsel → PDF', desc: 'Görsellerden PDF oluştur', icon: <PictureAsPdfIcon /> },
    { to: '/reorder', title: 'Sırala / Döndür / Sil', desc: 'Sayfaları yeniden sırala ve düzenle', icon: <SwapVertIcon /> },
    { to: '/protect', title: 'PDF Koru', desc: 'PDF’e açılış parolası ekle', icon: <LockOutlinedIcon /> }
  ]

  return (
    <Box>
      {/* Üstteki DocCraft balonu tamamen kaldırıldı */}

      <Grid container spacing={2}>
        {tools.map((tool) => (
          <Grid key={tool.to} item xs={12} sm={6} md={4}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                ':hover': { boxShadow: '0 14px 40px rgba(20,20,43,0.12)', transform: 'translateY(-2px)' },
                transition: 'all .2s ease'
              }}
            >
              <CardActionArea component={RouterLink} to={tool.to}>
                <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      background: `linear-gradient(180deg,#fff,${alpha('#fff', 0.6)})`,
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.6), 0 10px 22px rgba(0,0,0,.08)',
                      color: t.palette.primary.main
                    }}
                  >
                    {tool.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {tool.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tool.desc}
                    </Typography>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
