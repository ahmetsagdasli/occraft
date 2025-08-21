import { alpha, createTheme } from '@mui/material/styles'

const PR = { main: '#2563EB', dark: '#1D4ED8', light: '#60A5FA' }   // canlı mavi
const SE = { main: '#E11DAD', dark: '#B8128B', light: '#F472D0' }   // canlı magenta
const RADIUS = 20

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { ...PR, contrastText: '#fff' },
    secondary: { ...SE, contrastText: '#fff' },
    background: { default: '#F7F8FB', paper: '#FFFFFF' },
    text: { primary: '#0F172A', secondary: '#64748B' },
  },
  shape: { borderRadius: RADIUS },
  typography: {
    // @fontsource/inter kurulumu ile
    fontFamily:
      '"InterVariable","Inter","system-ui",-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial',
    h4: { fontWeight: 800, letterSpacing: -0.4 },
    button: { fontWeight: 700, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@font-face': [
          // InterVariable css importu main.tsx içinde yapılacak
        ] as any,
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          background: `linear-gradient(90deg, ${PR.main}, ${SE.main})`,
          color: '#fff',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: (t) =>
            `linear-gradient(180deg, ${alpha(t.palette.primary.main, 0.10)}, ${alpha(
              t.palette.secondary.main,
              0.10
            )})`,
          backdropFilter: 'blur(8px)',
          borderRight: `1px solid ${alpha('#000', 0.06)}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: RADIUS + 4,
          boxShadow: '0 12px 40px rgba(20,20,43,0.08)',
          border: `1px solid ${alpha('#000', 0.06)}`,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        containedPrimary: {
          background: `linear-gradient(90deg, ${PR.main}, ${SE.main})`,
          '&:hover': {
            background: `linear-gradient(90deg, ${PR.dark}, ${SE.dark})`,
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            backgroundColor: alpha(PR.main, 0.06),
            borderWidth: 2,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          '&.Mui-selected': { backgroundColor: alpha(PR.main, 0.12) },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        bar: { borderRadius: 8 },
        root: {
          borderRadius: 8,
          height: 8,
          backgroundColor: alpha(PR.main, 0.15),
        },
      },
    },
  },
})

export default theme
