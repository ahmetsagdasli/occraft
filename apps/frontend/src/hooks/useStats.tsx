import * as React from 'react'

type Stats = {
  visitors: number
  fileOps: number
}

const LS_VISITORS = 'doccraft.stats.visitors'
const LS_FILEOPS = 'doccraft.stats.fileOps'
const LS_VISITED = 'doccraft.stats.visited' // bu tarayıcı ilk kez mi?

function readInt(key: string, def = 0) {
  try { const v = localStorage.getItem(key); return v ? parseInt(v, 10) : def } catch { return def }
}
function writeInt(key: string, val: number) {
  try { localStorage.setItem(key, String(val)) } catch {}
}

const StatsContext = React.createContext<{
  stats: Stats
  incFileOps: (n?: number) => void
}>({
  stats: { visitors: 0, fileOps: 0 },
  incFileOps: () => {}
})

export function StatsProvider({ children }: { children: React.ReactNode }) {
  const [stats, setStats] = React.useState<Stats>(() => ({
    visitors: readInt(LS_VISITORS, 0),
    fileOps: readInt(LS_FILEOPS, 0),
  }))

  // ziyaretçi sayacı (bu tarayıcı ilk kez ise +1)
  React.useEffect(() => {
    const visited = localStorage.getItem(LS_VISITED)
    if (!visited) {
      const next = stats.visitors + 1
      writeInt(LS_VISITORS, next)
      localStorage.setItem(LS_VISITED, '1')
      setStats(s => ({ ...s, visitors: next }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // file-op event dinleyicisi (useUpload tetikleyecek)
  React.useEffect(() => {
    const onOp = (e: Event) => {
      const n = (e as CustomEvent<number>).detail ?? 1
      setStats(s => {
        const next = s.fileOps + n
        writeInt(LS_FILEOPS, next)
        return { ...s, fileOps: next }
      })
    }
    window.addEventListener('doccraft:file-op', onOp as EventListener)
    return () => window.removeEventListener('doccraft:file-op', onOp as EventListener)
  }, [])

  const incFileOps = React.useCallback((n = 1) => {
    const ev = new CustomEvent('doccraft:file-op', { detail: n })
    window.dispatchEvent(ev)
  }, [])

  return (
    <StatsContext.Provider value={{ stats, incFileOps }}>
      {children}
    </StatsContext.Provider>
  )
}

export function useStats() {
  return React.useContext(StatsContext)
}
