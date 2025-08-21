import * as React from 'react'
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery
} from '@mui/material'
import { useTheme, alpha } from '@mui/material/styles'
import { Outlet, NavLink, useLocation } from 'react-router-dom'

// Sosyal linkler
const LINKEDIN_URL = 'https://www.linkedin.com/in/your-profile'
const GITHUB_URL   = 'https://github.com/your-username'

// Icons
import MenuIcon from '@mui/icons-material/Menu'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import MergeTypeIcon from '@mui/icons-material/MergeType'
import ContentCutIcon from '@mui/icons-material/ContentCut'
import CompressIcon from '@mui/icons-material/Compress'
import ImageIcon from '@mui/icons-material/Image'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import SwapVertIcon from '@mui/icons-material/SwapVert'
import GitHubIcon from '@mui/icons-material/GitHub'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'

const DRAWER_WIDTH = 240

type Item = { to: string; label: string; icon: React.ReactNode; end?: boolean }
const items: Item[] = [
  { to: '/', label: 'Ana Sayfa', icon: <HomeOutlinedIcon />, end: true },
  { to: '/merge', label: 'PDF Birleştir', icon: <MergeTypeIcon /> },
  { to: '/split', label: 'PDF Böl', icon: <ContentCutIcon /> },
  { to: '/compress', label: 'PDF Sıkıştır', icon: <CompressIcon /> },
  { to: '/pdf-to-image', label: 'PDF → Görsel', icon: <ImageIcon /> },
  { to: '/image-to-pdf', label: 'Görsel → PDF', icon: <PictureAsPdfIcon /> },
  { to: '/reorder', label: 'Sırala / Döndür / Sil', icon: <SwapVertIcon /> },
  { to: '/protect', label: 'PDF Koru', icon: <LockOutlinedIcon /> }
]

function SidebarContent() {
  const location = useLocation()
  const theme = useTheme()
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header ile tek parça görünmesi için burada boş Toolbar */}
      <Toolbar />
      <Divider />
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)}, ${alpha(theme.palette.secondary.main, 0.08)})`
      }}>
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
                  '&.Mui-selected:hover': { bgcolor: alpha(theme.palette.primary.main, 0.18) }
                }}
              >
                <ListItemIcon>{it.icon}</ListItemIcon>
                <ListItemText primary={it.label} />
              </ListItemButton>
            )
          })}
        </List>
      </Box>
      <Divider />
      {/* Altta sürüm yazısını kaldırdık; istersen footer'a ekleyebiliriz */}
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          {/* boş bırakıldı */}
        </Typography>
      </Box>
    </Box>
  )
}

export default function AppLayout() {
  const theme = useTheme()
  const mdUp = useMediaQuery(theme.breakpoints.up('md'))
  const [mobileOpen, setMobileOpen] = React.useState(false)
  const handleDrawerToggle = () => setMobileOpen((o) => !o)

  const drawer = <SidebarContent />

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      {/* HEADER — tek isim */}
      <AppBar
        position="fixed"
        color="primary"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar>
          {!mdUp && (
            <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            DocCraft
          </Typography>
        </Toolbar>
      </AppBar>

      {/* SIDEBAR */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {!mdUp ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH } }}
          >
            {drawer}
          </Drawer>
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
                background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.06)}, ${alpha(theme.palette.secondary.main, 0.06)})`
              }
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      {/* CONTENT + FOOTER */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%', ml: { md: `${DRAWER_WIDTH}px` } }}>
        {/* Header boşluğunu telafi et */}
        <Toolbar />

        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Box>

        {/* FOOTER — sosyal ikonlar + metin */}
        <Box
          component="footer"
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: 2,
            py: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                © {new Date().getFullYear()} DocCraft — Files are processed ephemerally.
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                v1 • Şık ve sade PDF araçları
              </Typography>
            </Box>
            <Box>
              <IconButton
                component="a"
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                sx={{ color: theme.palette.primary.main }}
              >
                <LinkedInIcon />
              </IconButton>
              <IconButton
                component="a"
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                sx={{ color: theme.palette.secondary.main }}
              >
                <GitHubIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
