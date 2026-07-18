import { useEffect, useRef, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

interface DialogProps {
  open: boolean
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  size?: 'small' | 'medium' | 'large'
}

export function Dialog({ open, title, description, onClose, children, size = 'medium' }: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button,input,textarea,select,a[href],[tabindex]:not([tabindex="-1"])')).filter((element) => !element.hasAttribute('disabled'))
      const first = focusable[0]
      const last = focusable.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('keydown', onKey); previous?.focus() }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="product-dialog-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.currentTarget === event.target) onClose() }}>
          <motion.div ref={dialogRef} className={`product-dialog product-dialog--${size}`} role="dialog" aria-modal="true" aria-labelledby="dialog-title" initial={{ opacity: 0, y: 20, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: .985 }}>
            <header className="product-dialog__header">
              <div><span>PCS-SignAI</span><h2 id="dialog-title">{title}</h2>{description && <p>{description}</p>}</div>
              <button ref={closeRef} className="icon-button" type="button" aria-label="关闭弹窗" onClick={onClose}><X /></button>
            </header>
            <div className="product-dialog__body">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
