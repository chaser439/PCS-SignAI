import { AlertTriangle } from 'lucide-react'
import { Dialog } from './Dialog'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onClose: () => void
  onConfirm: () => void
  tone?: 'danger' | 'default'
}

export function ConfirmDialog({ open, title, description, confirmLabel = '确认', onClose, onConfirm, tone = 'default' }: ConfirmDialogProps) {
  return (
    <Dialog open={open} title={title} onClose={onClose} size="small">
      <div className="confirm-dialog__content"><AlertTriangle /><p>{description}</p></div>
      <div className="dialog-actions">
        <button className="button button--ghost" type="button" onClick={onClose}>取消</button>
        <button className={`button ${tone === 'danger' ? 'button--danger' : ''}`} type="button" onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</button>
      </div>
    </Dialog>
  )
}
