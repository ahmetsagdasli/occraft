import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import App from './App'
import Home from './pages/Home'
import Merge from './pages/Merge'
import Split from './pages/Split'
import Compress from './pages/Compress'
import PdfToImage from './pages/PdfToImage'
import ImageToPdf from './pages/ImageToPdf'
import Reorder from './pages/Reorder'
import Protect from './pages/Protect'
import theme from './theme'
import './i18n'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'merge', element: <Merge /> },
      { path: 'split', element: <Split /> },
      { path: 'compress', element: <Compress /> },
      { path: 'pdf-to-image', element: <PdfToImage /> },
      { path: 'image-to-pdf', element: <ImageToPdf /> },
      { path: 'reorder', element: <Reorder /> },
      { path: 'protect', element: <Protect /> }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
)
