import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '../ui/SectionHeading'
import { BrandMark } from '../ui/BrandMark'

const stages = [
  { index: '01', era: 'Recognition', title: '动作识别', question: '看到了什么？', detail: '从连续画面中提取手部、面部与姿态特征。' },
  { index: '02', era: 'Translation', title: '连续手语翻译', question: '表达了什么？', detail: '将动作序列组织为结构化手语 Token。' },
  { index: '03', era: 'Context', title: '语境与知识增强', question: '在什么场景下表达？', detail: '引入中文知识、文化语境与当前任务场景。' },
  { index: '04', era: 'Understanding', title: '个性化语义理解', question: '这个人真正想表达什么？', detail: '融合长期记忆与情绪证据，推断真实意图。' },
]

export function JourneySection() {
  return (
    <section id="journey" className="journey-section section-shell">
      <div className="container">
        <div className="journey-section__heading">
          <SectionHeading eyebrow="Evolution of Understanding" title={<>从识别一个动作，<br />到理解一个人。</>} />
          <p>技术的演进，不只是模型看见更多，而是系统逐渐学会把表达放回一个人的经历与语境中。</p>
        </div>

        <div className="journey-track">
          <motion.div
            className="journey-track__line"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
          {stages.map((stage, index) => (
            <motion.article
              className="journey-stage"
              key={stage.index}
              initial={{ opacity: 0.25, y: 30, filter: 'blur(6px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="journey-stage__top"><span>{stage.index}</span><small>{stage.era}</small></div>
              <div className="journey-stage__marker"><i /><ArrowRight /></div>
              <h3>{stage.title}</h3>
              <strong>{stage.question}</strong>
              <p>{stage.detail}</p>
            </motion.article>
          ))}
        </div>

        <motion.div
          className="journey-destination"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <BrandMark />
          <p>From Sign Recognition <ArrowRight /> <strong>to Personalized Understanding</strong></p>
          <span><i />The next layer of accessible intelligence</span>
        </motion.div>
      </div>
    </section>
  )
}
