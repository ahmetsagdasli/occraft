import * as React from 'react'
import { Box, Grid, Link, Typography } from '@mui/material'
import GlassPanel from '../components/GlassPanel'

export default function About() {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="h4" gutterBottom>Hakkında</Typography>

      <GlassPanel>
        <Typography variant="body1" paragraph>
          DocCraft, hızlı ve güvenli PDF araçları sunan açık bir arayüzdür. Dosyalar
          tarayıcıdan yüklenir, işlenir ve kısa süre sonra silinir.
        </Typography>
        <Typography variant="body1" paragraph>
          Geliştirici: <b>Ahmet Sağdaşlı</b> — Gen AI &amp; Web Development ve gümrük sınıflandırma
          konularında uzman.
        </Typography>
      </GlassPanel>

      <GlassPanel>
        <Typography variant="h6" gutterBottom>Projeler</Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              • <Link href="https://github.com/ahmetsagdasli/occraft" target="_blank" rel="noopener">
                DocCraft – PDF Araçları
              </Link>
            </Typography>
            <Typography variant="body2">
              • <Link href="https://github.com/your-username/genai-classifier" target="_blank" rel="noopener">
                GenAI Classifier – HS Kod / Customs Sınıflandırma
              </Link>
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2">
              • <Link href="https://github.com/your-username/ai-web-starter" target="_blank" rel="noopener">
                AI Web Starter – Vite + MUI + RAG örnekleri
              </Link>
            </Typography>
            <Typography variant="body2">
              • <Link href="https://github.com/your-username/llm-utils" target="_blank" rel="noopener">
                LLM Utils – Prompt &amp; Eval araçları
              </Link>
            </Typography>
          </Grid>
        </Grid>
      </GlassPanel>
    </Box>
  )
}
