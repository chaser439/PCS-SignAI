import { FileVideo, Unplug } from 'lucide-react'
import { LayerVisual } from '../visuals/LayerVisual'
import { SectionHeading } from '../ui/SectionHeading'

export function LayerSection() {
  return (
    <section id="layer" className="layer-section section-shell">
      <div className="container">
        <div className="layer-section__heading-row">
          <SectionHeading
            eyebrow="Universal Semantic Middleware"
            title={<>一种理解能力，<br />连接无限种可能。</>}
            description="PCS-SignAI 与具体采集设备和业务系统解耦，以统一语义接口连接不同输入终端与下游应用。"
          />
          <div className="layer-section__principle">
            <Unplug size={20} />
            <span><strong>设备与业务解耦</strong>输入形式改变，不影响语义理解内核。</span>
          </div>
        </div>
        <LayerVisual />
        <div className="input-boundary">
          <FileVideo size={19} />
          <p><strong>MP4 是当前产品支持的输入方式</strong><span>输入形式可以扩展，不定义 PCS-SignAI 的能力边界。</span></p>
          <span className="input-boundary__tag">CURRENT INPUT ≠ SYSTEM LIMIT</span>
        </div>
      </div>
    </section>
  )
}
