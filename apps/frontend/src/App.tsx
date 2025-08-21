import * as React from 'react'
import {
  AppBar, Box, CssBaseline, Divider, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Toolbar, Typography, useMediaQuery, Button, Link
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import BadgeIcon from './components/BadgeIcon'
import { useStats } from './hooks/useStats'

import MenuIcon from '@mui/icons-material/Menu'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import MergeTypeIcon from '@mui/icons-material/MergeType'
import ContentCutIcon from '@mui/icons-material/ContentCut'
import CompressIcon from '@mui/icons-material/Compress'
import ImageIcon from '@mui/icons-material/Image'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import GitHubIcon from '@mui/icons-material/GitHub'

const DRAWER_WIDTH = 240
const LINKEDIN_URL = 'https://www.linkedin.com/in/ahmet-sagdasli/'
const GITHUB_URL   = 'https://github.com/ahmetsagdasli' // farklıysa değiştir

type Item = { to: string; label: string; icon: React.ReactNode; end?: boolean }
const items: Item[] = [
  { to: '/', label: 'Ana Sayfa', icon: <HomeOutlinedIcon />, end: true },
  { to: '/merge', label: 'PDF Birleştir', icon: <MergeTypeIcon /> },
  { to: '/split', label: 'PDF Böl', icon: <ContentCutIcon /> },
  { to: '/compress', label: 'PDF Sıkıştır', icon: <CompressIcon /> },
  { to: '/pdf-to-image', label: 'PDF → Görsel', icon: <ImageIcon /> },
  { to: '/image-to-pdf', label: 'Görsel → PDF', icon: <PictureAsPdfIcon /> },
  { to: '/reorder', label: 'Sırala / Döndür / Sil', icon: <SwapVertIcon /> },
  { to: '/protect', label: 'PDF Koru', icon: <LockOutlinedIcon /> },
]

function SidebarContent() {
  const location = useLocation()
  const theme = useTheme()
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar />
      <Divider />
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(
            theme.palette.secondary.main,
            0.08
          )})`,
        }}
      >
        <List sx={{ py: 1 }}>
          {items.map((it) => {
            const selected = it.end ? location.pathname === it.to : location.pathname.startsWith(it.to)
            return (
              <ListItemButton
                key={it.to}
                component={NavLink}
                to={it.to}
                end={it.end}
                selected={selected}
                sx={{
                  mx: 1,
                  borderRadius: 1.5,
                  '& .MuiListItemIcon-root': {
                    color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
                  },
                  '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.14) },
                  '&.Mui-selected:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) },
                }}
              >
                <ListItemIcon sx={{ minWidth: 44 }}>
                  <BadgeIcon>{it.icon}</BadgeIcon>
                </ListItemIcon>
                <ListItemText primary={it.label} />
              </ListItemButton>
            )
          })}
        </List>
      </Box>
      <Divider />
      <Box sx={{ p: 2 }} />
    </Box>
  )
}

function Header() {
  const mdUp = useMediaQuery(useTheme().breakpoints.up('md'))
  const { stats } = useStats()

  const pillSx = {
    px: 1.25,
    py: 0.5,
    borderRadius: 2,
    bgcolor: 'rgba(255,255,255,.22)',
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    gap: 0.75,
    transition: 'background-color .15s ease',
    '&:hover': { bgcolor: 'rgba(255,255,255,.28)' }
  } as const

  return (
    <AppBar
      position="fixed"
      color="primary"
      elevation={0}
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        // 🔧 Drawer ile çakışmayı önle
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        zIndex: (t) => t.zIndex.drawer + 1
      }}
    >
      <Toolbar sx={{ minHeight: { xs: 72, md: 88 } }}>
        {!mdUp && (
          <IconButton color="inherit" edge="start" onClick={() => { const btn = document.getElementById('dc-drawer-btn'); btn?.click() }} sx={{ mr: 1 }}>
            <MenuIcon />
          </IconButton>
        )}

        {/* Marka: File Converter */}
        <Box
          component={NavLink}
          to="/"
          style={{ textDecoration: 'none' }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1.2, color: 'inherit', mr: 2 }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.2 }}>
            File Converter
          </Typography>
        </Box>

        {/* Sağ alan */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          <Box sx={{ ...pillSx }}>Ziyaretçi: {stats.visitors}</Box>
          <Box sx={{ ...pillSx }}>İşlem: {stats.fileOps}</Box>

          <Button
            component={NavLink}
            to="/about"
            variant="outlined"
            color="inherit"
            sx={{ color: '#fff', borderColor: 'rgba(255,255,255,.55)', '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,.12)' } }}
          >
            About
          </Button>

          <Link href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" underline="none" sx={{ lineHeight: 0 }}>
            <Box sx={{ ...pillSx }}>
              <LinkedInIcon sx={{ fontSize: 18 }} />
              <span>LinkedIn</span>
            </Box>
          </Link>

          <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer" underline="none" sx={{ lineHeight: 0 }}>
            <Box sx={{ ...pillSx }}>
              <GitHubIcon sx={{ fontSize: 18 }} />
              <span>GitHub</span>
            </Box>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default function AppLayout() {
  const theme = useTheme()
  const mdUp = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const handleDrawerToggle = () => setMobileOpen(o => !o)

  const drawer = <SidebarContent />

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />
      <Header />

      {/* SIDEBAR */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {!mdUp ? (
          <>
            <IconButton id="dc-drawer-btn" sx={{ display: 'none' }} onClick={handleDrawerToggle} />
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
            >
              {drawer}
            </Drawer>
          </>
        ) : (
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
                borderRight: 1,
                borderColor: 'divider',
                background: `linear-gradient(180deg, ${alpha(
                  theme.palette.primary.main,
                  0.06
                )}, ${alpha(theme.palette.secondary.main, 0.06)})`,
              },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* CONTENT + FOOTER */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        {/* AppBar artık kendi genişliğini/sol boşluğunu ayarladığı için burada sadece Toolbar bırakmak yeterli */}
        <Toolbar />
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>

        <Box component="footer" sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper', px: 2, py: 2, ml: { md: `${DRAWER_WIDTH}px` } }}>
          <Typography variant="caption" color="text.secondary">
            © 2025 DocCraft — File Conversion App | Developed by Ahmet Sağdaşlı
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
