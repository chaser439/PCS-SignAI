import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'

type ToastTone = 'success' | 'info' | 'error'

interface ToastItem {
  id: number
  message: string
  detail?: string
  tone: ToastTone
}

interface ToastContextValue {
  notify: (message: string, detail?: string, tone?: ToastTone) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const dismiss = useCallback((id: number) => setItems((current) => current.filter((item) => item.id !== id)), [])
  const notify = useCallback((message: string, detail?: string, tone: ToastTone = 'success') => {
    const id = Date.now() + Math.round(Math.random() * 100)
    setItems((current) => [...current.slice(-2), { id, message, detail, tone }])
    window.setTimeout(() => dismiss(id), 4800)
  }, [dismiss])
  const value = useMemo(() => ({ notify }), [notify])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        <AnimatePresence>
          {items.map((item) => {
            const Icon = item.tone === 'success' ? CheckCircle2 : item.tone === 'error' ? AlertCircle : Info
            return (
              <motion.div className={`product-toast product-toast--${item.tone}`} key={item.id} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
                <Icon />
                <p><strong>{item.message}</strong>{item.detail && <span>{item.detail}</span>}</p>
                <button className="icon-button" type="button" aria-label="关闭消息" onClick={() => dismiss(item.id)}><X /></button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const value = useContext(ToastContext)
  if (!value) throw new Error('useToast must be used inside ToastProvider')
  return value
}
