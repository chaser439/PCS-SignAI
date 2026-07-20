import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { capabilities } from '../../data/capabilities'
import { CapabilityVisual } from '../visuals/CapabilityVisual'
import { SectionHeading } from '../ui/SectionHeading'

const semanticFlow = ['Token', 'Knowledge', 'Memory', 'Emotion', 'Intent']

export function CapabilitiesSection() {
  const [active, setActive] = useState(0)
  const itemRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(Number((visible.target as HTMLElement).dataset.index))
      },
      { rootMargin: '-28% 0px -45% 0px', threshold: [0.15, 0.5, 0.8] },
    )
    itemRefs.current.forEach((item) => item && observer.observe(item))
    return () => observer.disconnect()
  }, [])

  const current = capabilities[active]

  return (
    <section id="capabilities" className="capabilities-section section-shell">
      <div className="container">
        <SectionHeading eyebrow="Core Intelligence" title={<>从动作解析，<br />到真实意图。</>} />
        <div className="capabilities-rail" aria-label="Semantic understanding flow">
          {semanticFlow.map((label, index) => (
            <span key={label}><small>{String(index + 1).padStart(2, '0')}</small><strong>{label}</strong></span>
          ))}
        </div>
        <div className="capabilities-layout">
          <div className="capabilities-list">
            {capabilities.map((capability, index) => (
              <motion.article
                key={capability.id}
                ref={(element) => { itemRefs.current[index] = element }}
                data-index={index}
                className={`capability-item ${active === index ? 'capability-item--active' : ''}`}
                onMouseEnter={() => setActive(index)}
                initial={{ opacity: 0.35 }}
                whileInView={{ opacity: 1 }}
                viewport={{ amount: 0.55 }}
              >
                <button type="button" onClick={() => setActive(index)} aria-pressed={active === index}>
                  <span className="capability-item__index">{capability.index}</span>
                  <span className="capability-item__body">
                    <small>{capability.english}</small>
                    <strong>{capability.title}</strong>
                    <p>{capability.description}</p>
                    <span className="tag-row">
                      {capability.keywords.map((keyword) => <i key={keyword}>{keyword}</i>)}
                    </span>
                  </span>
                </button>
              </motion.article>
            ))}
          </div>
          <div className="capabilities-sticky">
            <CapabilityVisual type={current.visual} index={current.index} />
          </div>
        </div>
      </div>
    </section>
  )
}
