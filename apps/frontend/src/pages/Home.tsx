import * as React from 'react'
import { Box, Card, CardActionArea, CardContent, Grid, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

const tools = [
  { to: '/merge', title: 'PDF Birleştir', desc: 'Birden çok PDF’i tek dosyada topla' },
  { to: '/split', title: 'PDF Böl', desc: 'Sayfa aralıklarına göre parçala' },
  { to: '/compress', title: 'PDF Sıkıştır', desc: 'Boyutu düşür, kaliteyi koru' },
  { to: '/pdf-to-image', title: 'PDF → Görsel', desc: 'Her sayfayı PNG/JPG yap' },
  { to: '/image-to-pdf', title: 'Görsel → PDF', desc: 'PNG/JPG’leri PDF’e dönüştür' },
  { to: '/reorder', title: 'Sırala/Döndür/Sil', desc: 'Sayfa düzenleme araçları' }
]

export default function Home() {
  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <Typography variant="h4" gutterBottom>DocCraft</Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
       
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {tools.map(t => (
          <Grid item xs={12} sm={6} md={4} key={t.to}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardActionArea component={RouterLink} to={t.to}>
                <CardContent>
                  <Typography variant="h6">{t.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{t.desc}</Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
