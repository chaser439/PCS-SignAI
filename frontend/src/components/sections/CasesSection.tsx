import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Brain, ScanLine, Sparkles } from 'lucide-react'
import { semanticCases } from '../../data/cases'
import { SectionHeading } from '../ui/SectionHeading'

export function CasesSection() {
  const [active, setActive] = useState(0)
  const reduceMotion = useReducedMotion()
  const go = (direction: number) => setActive((current) => (current + direction + semanticCases.length) % semanticCases.length)

  useEffect(() => {
    if (reduceMotion) return
    const timer = window.setInterval(() => go(1), 9000)
    return () => window.clearInterval(timer)
  }, [reduceMotion])

  const item = semanticCases[active]

  return (
    <section id="cases" className="cases-section section-shell">
      <div className="container">
        <div className="cases-section__top">
          <SectionHeading eyebrow="Semantic Cases" title={<>识别动作只是开始，<br />理解语义才是答案。</>} />
          <div className="case-controls">
            <span>{String(active + 1).padStart(2, '0')} / {String(semanticCases.length).padStart(2, '0')}</span>
            <button className="icon-button" type="button" aria-label="上一个案例" onClick={() => go(-1)}><ArrowLeft /></button>
            <button className="icon-button" type="button" aria-label="下一个案例" onClick={() => go(1)}><ArrowRight /></button>
          </div>
        </div>

        <div className="case-stage" aria-live="polite">
          <AnimatePresence mode="wait" custom={active}>
            <motion.article
              key={item.id}
              className={`case-story case-story--${item.tone}`}
              initial={{ opacity: 0, x: 34 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -34 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              drag={reduceMotion ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.08}
              onDragEnd={(_, info) => {
                if (info.offset.x < -55) go(1)
                if (info.offset.x > 55) go(-1)
              }}
            >
              <div className="case-story__header">
                <span>{item.index}</span>
                <div><small>USE CASE</small><h3>{item.category}</h3></div>
                <span className="case-story__signal"><i />Context signal captured <strong>{item.confidence}</strong></span>
              </div>
              <div className="case-story__flow">
                <div className="case-step case-step--input">
                  <span><ScanLine />动作识别结果</span>
                  <strong>{item.recognition}</strong>
                  <small>RAW SEMANTIC TOKEN</small>
                </div>
                <div className="case-story__connector"><i /><ArrowRight /></div>
                <div className="case-step case-step--baseline">
                  <span><Brain />基础翻译</span>
                  <p>{item.baseline}</p>
                  <small>LITERAL TRANSLATION</small>
                </div>
                <div className="case-story__connector"><i /><ArrowRight /></div>
                <div className="case-step case-step--result">
                  <span><Sparkles />PCS-SignAI</span>
                  <p>{item.understanding}</p>
                  <div className="tag-row">{item.tags.map((tag) => <i key={tag}>{tag}</i>)}</div>
                </div>
              </div>
            </motion.article>
          </AnimatePresence>
          <div className="case-tabs" role="tablist" aria-label="语义案例">
            {semanticCases.map((semanticCase, index) => (
              <button
                type="button"
                role="tab"
                aria-selected={active === index}
                key={semanticCase.id}
                onClick={() => setActive(index)}
              >
                <span>{semanticCase.index}</span>{semanticCase.category}<i />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
