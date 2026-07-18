import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { scenarios } from '../../data/scenarios'
import { ScenarioVisual } from '../visuals/ScenarioVisual'
import { SectionHeading } from '../ui/SectionHeading'

export function ScenariosSection() {
  return (
    <section id="scenarios" className="scenarios-section section-shell">
      <div className="container">
        <SectionHeading
          eyebrow="Application Scenarios"
          title={<>理解能力，<br />可以抵达每一个真实场景。</>}
          description="以统一语义接口嵌入医疗、教育、服务与公共设施，让下游系统获得可理解、可追溯的中文意图。"
        />
        <div className="scenarios-list">
          {scenarios.map((scenario, index) => {
            const Icon = scenario.icon
            return (
              <motion.article
                key={scenario.index}
                className="scenario-row"
                initial={{ opacity: 0, y: 34 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7 }}
              >
                <div className="scenario-row__copy">
                  <div className="scenario-row__index"><span>{scenario.index}</span><Icon /></div>
                  <small>{scenario.english}</small>
                  <h3>{scenario.title}</h3>
                  <p>{scenario.description}</p>
                  <div className="tag-row">{scenario.tags.map((tag) => <i key={tag}>{tag}</i>)}</div>
                  <span className="scenario-row__interface">Semantic Interface <ArrowUpRight /></span>
                </div>
                <div className="scenario-row__visual"><ScenarioVisual type={scenario.visual} /></div>
                <span className="scenario-row__number">0{index + 1}</span>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
