import { alpha, createTheme } from '@mui/material/styles'

const PRIMARY = {
  light: '#60A5FA',   // canlı mavi (tailwind blue-400)
  main:  '#2563EB',   // canlı mavi (blue-600)
  dark:  '#1D4ED8',
  contrastText: '#FFFFFF'
}

const SECONDARY = {
  light: '#F472D0',   // canlı magenta (pink-400)
  main:  '#E11DAD',   // canlı magenta (≈ rgb(225,29,173))
  dark:  '#B8128B',
  contrastText: '#FFFFFF'
}

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: PRIMARY,
    secondary: SECONDARY,
    background: {
      default: '#fafafa',
      paper: '#ffffff'
    }
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: `"Inter", system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          background: `linear-gradient(90deg, ${PRIMARY.main} 0%, ${SECONDARY.main} 100%)`,
          color: '#fff'
        }
      }
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 14,
          textTransform: 'none',
          fontWeight: 600
        },
        containedPrimary: {
          background: `linear-gradient(90deg, ${PRIMARY.main}, ${SECONDARY.main})`,
          '&:hover': {
            background: `linear-gradient(90deg, ${PRIMARY.dark}, ${SECONDARY.dark})`
          }
        },
        containedSecondary: {
          background: `linear-gradient(90deg, ${SECONDARY.main}, ${PRIMARY.main})`,
          '&:hover': {
            background: `linear-gradient(90deg, ${SECONDARY.dark}, ${PRIMARY.dark})`
          }
        },
        outlinedPrimary: {
          borderColor: alpha(PRIMARY.main, 0.5),
          '&:hover': { borderColor: PRIMARY.main, backgroundColor: alpha(PRIMARY.main, 0.06) }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 8px 24px rgba(0,0,0,0.06)'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: alpha(PRIMARY.main, 0.12)
          },
          '&.Mui-selected:hover': {
            backgroundColor: alpha(PRIMARY.main, 0.18)
          }
        }
      }
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: PRIMARY.main,
          '&:hover': { color: SECONDARY.main }
        }
      }
    }
  }
})

export default theme
