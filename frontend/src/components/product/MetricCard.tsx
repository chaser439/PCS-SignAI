import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string
  detail: string
  accent?: 'green' | 'orange' | 'blue'
}

export function MetricCard({ icon: Icon, label, value, detail, accent = 'green' }: MetricCardProps) {
  return <div className={`metric-card metric-card--${accent}`}><div className="metric-card__top"><Icon /><span>{label}</span></div><strong>{value}</strong><small>{detail}</small><i /></div>
}
