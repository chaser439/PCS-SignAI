import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}

export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <motion.header className="product-page-header" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>
      {actions && <div className="product-page-header__actions">{actions}</div>}
    </motion.header>
  )
}
