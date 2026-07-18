import { motion } from 'framer-motion'
import { Activity, Boxes, Braces, Database, Radio, ShieldCheck } from 'lucide-react'
import { serviceStatuses } from '../../data/serviceStatus'
import { SectionHeading } from '../ui/SectionHeading'

export function StatusSection() {
  return (
    <section id="status" className="status-section section-shell">
      <div className="container">
        <div className="status-section__top">
          <SectionHeading
            eyebrow="Local Environment"
            title={<>为稳定理解<br />而设计。</>}
            description="当前产品支持本地离线运行。所有状态描述当前可用能力与统一数据协议。"
          />
          <div className="status-section__stamp">
            <ShieldCheck />
            <span>LOCAL SERVICE<strong>Environment verified</strong></span>
          </div>
        </div>

        <motion.div
          className="status-console"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="status-console__bar">
            <span><i />PCS semantic service topology</span>
            <span>PCS / CN-NORTH · <strong>LOCAL</strong></span>
          </div>
          <div className="status-console__body">
            <div className="status-topology" role="img" aria-label="PCS-SignAI 本地服务拓扑图">
              <svg viewBox="0 0 660 390" aria-hidden="true">
                <path d="M111 98C190 98 185 194 268 194M111 292C190 292 185 194 268 194M392 194C470 194 470 98 549 98M392 194C470 194 470 292 549 292" />
                <path className="status-topology__flow" d="M111 98C190 98 185 194 268 194M392 194C470 194 470 292 549 292" />
                <circle cx="330" cy="194" r="84" />
                <circle className="status-topology__ring" cx="330" cy="194" r="105" />
              </svg>
              <div className="topology-node topology-node--input"><Radio /><span>Multimodal<strong>Parser</strong></span></div>
              <div className="topology-node topology-node--memory"><Database /><span>Context<strong>Memory</strong></span></div>
              <div className="topology-node topology-node--output"><Braces /><span>Semantic<strong>Schema</strong></span></div>
              <div className="topology-node topology-node--service"><Boxes /><span>Application<strong>Interface</strong></span></div>
              <div className="topology-core"><Activity /><strong>PCS</strong><span>Semantic Core</span><small><i />RUNNING</small></div>
              <div className="topology-wave"><i /><i /><i /><i /><i /><i /><i /><i /></div>
            </div>

            <div className="status-list">
              {serviceStatuses.map((service, index) => (
                <motion.div
                  className={`status-row status-row--${service.status}`}
                  key={service.label}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                >
                  <span><i />{service.label}</span>
                  <strong>{service.value}</strong>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="status-console__footer">
            <span>Last local check <strong>Just now</strong></span>
            <span>Unified protocol <strong>Schema v1.0</strong></span>
            <span>Network dependency <strong>None</strong></span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
