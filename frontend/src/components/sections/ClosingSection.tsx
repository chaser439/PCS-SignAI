import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { BrandMark } from '../ui/BrandMark'

interface ClosingSectionProps {
  onExperience: () => void
}

const footerLinks = [
  ['首页', '#home'],
  ['核心能力', '#capabilities'],
  ['应用场景', '#scenarios'],
  ['联系反馈', '#contact'],
]

export function ClosingSection({ onExperience }: ClosingSectionProps) {
  return (
    <footer className="closing-section">
      <div className="closing-section__grid" aria-hidden="true" />
      <motion.div
        className="closing-section__statement container"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
      >
        <span className="eyebrow eyebrow--light"><i />One expression, fully understood</span>
        <h2>让每一种表达，<br />都被真正理解。</h2>
        <button className="button button--light" type="button" onClick={onExperience}>进入 PCS-SignAI<ArrowRight /></button>
      </motion.div>
      <div className="footer container">
        <div className="footer__brand">
          <BrandMark />
          <p>Personalized Chinese Sign Language<br />Semantic Understanding Layer</p>
        </div>
        <nav className="footer__nav" aria-label="页脚导航">
          {footerLinks.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
        </nav>
        <div className="footer__status">
          <span><i />Local Environment</span>
          <span>Schema v1.0</span>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} PCS-SignAI</span>
          <span>Built for accessible understanding</span>
        </div>
      </div>
    </footer>
  )
}
