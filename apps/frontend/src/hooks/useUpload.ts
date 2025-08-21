import * as React from 'react'

export function useUpload() {
  const [progress, setProgress] = React.useState(0)
  const [eta, setEta] = React.useState<number | null>(null)
  const [busy, setBusy] = React.useState(false)

  async function send<T = any>(url: string, form: FormData): Promise<T> {
    setBusy(true); setProgress(0); setEta(null)
    const start = Date.now()
    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url, true)
      xhr.responseType = 'json'
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100)
          setProgress(pct)
          const elapsed = (Date.now() - start) / 1000
          const rate = e.loaded / Math.max(elapsed, 0.5)
          const remaining = e.total - e.loaded
          setEta(Math.max(0, Math.round(remaining / Math.max(rate, 1))))
        }
      }
      xhr.onerror = () => { setBusy(false); reject(new Error('Ağ hatası')) }
      xhr.onload = () => {
        setBusy(false); setProgress(100); setEta(0)
        if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.response as T)
        else {
          try { reject(new Error((xhr.response as any)?.error || `Hata: ${xhr.status}`)) }
          catch { reject(new Error(`Hata: ${xhr.status}`)) }
        }
      }
      xhr.send(form)
    })
  }

  function reset() { setProgress(0); setEta(null); setBusy(false) }
  return { send, progress, eta, busy, reset }
}
