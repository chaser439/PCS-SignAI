import type { LucideIcon } from 'lucide-react'
import { AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return <div className="product-empty"><Icon /><h3>{title}</h3><p>{description}</p>{action}</div>
}

interface ErrorStateProps {
  title: string
  summary: string
  stage: string
  completed?: string[]
  onRetry: () => void
  onCases: () => void
  onServices: () => void
}

export function ErrorState({ title, summary, stage, completed = [], onRetry, onCases, onServices }: ErrorStateProps) {
  return (
    <div className="product-error" role="alert">
      <div className="product-error__mark"><AlertTriangle /></div>
      <span>PROCESS RECOVERY</span>
      <h2>{title}</h2>
      <p>{summary}</p>
      <div className="product-error__stage"><small>当前阶段</small><strong>{stage}</strong></div>
      {completed.length > 0 && <div className="product-error__completed"><small>已保留结果</small>{completed.map((item) => <span key={item}>{item}</span>)}</div>}
      <div className="dialog-actions">
        <button className="button" type="button" onClick={onRetry}><RotateCcw />重新处理</button>
        <button className="button button--ghost" type="button" onClick={onCases}>返回案例<ArrowRight /></button>
        <button className="text-button" type="button" onClick={onServices}>查看服务状态</button>
      </div>
    </div>
  )
}
