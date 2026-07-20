import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, BrainCircuit, Languages, ScanFace } from 'lucide-react'
import { BrandMark } from '../../components/ui/BrandMark'

export function AuthLayout({ children, mode }: { children: ReactNode; mode: 'login' | 'register' }) {
  return (
    <main className="auth-page">
      <div className="auth-page__bar">
        <Link to="/" aria-label="返回 PCS-SignAI 首页"><BrandMark /></Link>
        <Link className="auth-page__back" to="/"><ArrowLeft />返回首页</Link>
      </div>
      <section className="auth-page__form-wrap">
        <motion.div className="auth-panel" key={mode} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
          {children}
        </motion.div>
      </section>
      <aside className="auth-visual" aria-label="PCS-SignAI 个性化语义理解流程">
        <div className="auth-visual__grid" />
        <div className="auth-visual__copy">
          <span>Personalized Understanding</span>
          <h2>从每一次表达中，<br />持续理解你。</h2>
          <p>多模态解析、中文知识与长期记忆，共同构成更准确的语义判断。</p>
        </div>
        <div className="auth-orbit auth-orbit--one" />
        <div className="auth-orbit auth-orbit--two" />
        <div className="auth-core"><strong>PCS</strong><span>Semantic Core</span><i /></div>
        <div className="auth-node auth-node--scan"><ScanFace /><span>动作解析<small>Multimodal</small></span></div>
        <div className="auth-node auth-node--knowledge"><Languages /><span>中文知识<small>Context</small></span></div>
        <div className="auth-node auth-node--memory"><BrainCircuit /><span>长期记忆<small>Personalized</small></span></div>
        <div className="auth-visual__status"><i />Understanding service ready</div>
      </aside>
    </main>
  )
}
