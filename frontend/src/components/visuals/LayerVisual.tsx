import { BookOpen, Building2, Camera, Glasses, GraduationCap, Headphones, HeartPulse, Laptop, Smartphone, Stethoscope, Video } from 'lucide-react'

const inputs = [
  { label: '摄像头', icon: Camera },
  { label: '移动设备', icon: Smartphone },
  { label: '视频', icon: Video },
  { label: '智能眼镜', icon: Glasses },
  { label: '采集设备', icon: Laptop },
]

const outputs = [
  { label: '医疗', icon: Stethoscope },
  { label: '教育', icon: GraduationCap },
  { label: '客服', icon: Headphones },
  { label: '会议', icon: Video },
  { label: '公共服务', icon: Building2 },
  { label: '辅助设备', icon: HeartPulse },
]

export function LayerVisual() {
  return (
    <div className="layer-visual" role="img" aria-label="不同输入终端通过 PCS-SignAI 语义中间层连接到下游应用">
      <svg className="layer-visual__paths" viewBox="0 0 1200 540" preserveAspectRatio="none" aria-hidden="true">
        <g className="layer-paths layer-paths--input">
          {[94, 182, 270, 358, 446].map((y, index) => <path key={y} d={`M185 ${y}C330 ${y} 345 ${270 + (index - 2) * 14} 486 270`} />)}
        </g>
        <g className="layer-paths layer-paths--output">
          {[72, 151, 230, 309, 388, 467].map((y, index) => <path key={y} d={`M714 270C855 ${270 + (index - 2.5) * 12} 870 ${y} 1015 ${y}`} />)}
        </g>
        <circle className="layer-pulse layer-pulse--a" r="5"><animateMotion dur="5.5s" repeatCount="indefinite" path="M185 182C330 182 345 256 486 270" /></circle>
        <circle className="layer-pulse layer-pulse--b" r="5"><animateMotion dur="6.4s" repeatCount="indefinite" path="M714 270C855 264 870 388 1015 388" /></circle>
      </svg>

      <div className="layer-visual__column layer-visual__column--input">
        <span className="layer-visual__label">UPSTREAM / 输入</span>
        {inputs.map(({ label, icon: Icon }) => <div className="layer-node" key={label}><Icon /><span>{label}</span><i /></div>)}
      </div>

      <div className="layer-core">
        <div className="layer-core__back layer-core__back--one" />
        <div className="layer-core__back layer-core__back--two" />
        <div className="layer-core__body">
          <span className="layer-core__status"><i />Semantic engine online</span>
          <strong>PCS-SignAI</strong>
          <p>Multimodal Sign<br />Understanding Layer</p>
          <div className="layer-core__stages">
            <span>Parse</span><i /> <span>Context</span><i /> <span>Intent</span>
          </div>
        </div>
      </div>

      <div className="layer-visual__column layer-visual__column--output">
        <span className="layer-visual__label">DOWNSTREAM / 输出</span>
        {outputs.map(({ label, icon: Icon }) => <div className="layer-node" key={label}><i /><Icon /><span>{label}</span></div>)}
      </div>
      <BookOpen className="layer-visual__watermark" aria-hidden="true" />
    </div>
  )
}
