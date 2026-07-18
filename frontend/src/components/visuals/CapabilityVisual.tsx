import { AnimatePresence, motion } from 'framer-motion'
import type { CapabilityVisual as CapabilityVisualType } from '../../data/capabilities'

interface CapabilityVisualProps {
  type: CapabilityVisualType
  index: string
}

const captions: Record<CapabilityVisualType, string> = {
  multimodal: 'HAND · FACE · POSE · MOTION',
  knowledge: 'CONTEXTUAL KNOWLEDGE GRAPH',
  memory: 'PERSONAL EXPRESSION MEMORY',
  intent: 'EVIDENCE TO TRUE INTENT',
}

export function CapabilityVisual({ type, index }: CapabilityVisualProps) {
  return (
    <div className="capability-visual" role="img" aria-label={`${captions[type]} 动态抽象图`}>
      <div className="capability-visual__meta"><span>CAPABILITY / {index}</span><i />LIVE MODEL</div>
      <AnimatePresence mode="wait">
        <motion.svg
          key={type}
          viewBox="0 0 600 520"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.45 }}
          aria-hidden="true"
        >
          <g className="visual-grid">
            {Array.from({ length: 8 }, (_, i) => <path key={`v${i}`} d={`M55 ${55 + i * 57}H545`} />)}
            {Array.from({ length: 8 }, (_, i) => <path key={`h${i}`} d={`M72 ${40 + i * 67}V480`} />)}
          </g>
          {type === 'multimodal' && <MultimodalGraphic />}
          {type === 'knowledge' && <KnowledgeGraphic />}
          {type === 'memory' && <MemoryGraphic />}
          {type === 'intent' && <IntentGraphic />}
        </motion.svg>
      </AnimatePresence>
      <p>{captions[type]}</p>
    </div>
  )
}

function MultimodalGraphic() {
  const points = [[125,315],[175,250],[230,285],[280,190],[333,270],[395,205],[457,292],[490,360]]
  return <g className="graphic graphic--multimodal">
    <path d="M104 384C144 337 157 260 213 277s48-86 97-70 45 75 95 23 61 64 89 128" />
    {points.map(([x,y], i) => <g key={i}><circle cx={x} cy={y} r="17" /><circle cx={x} cy={y} r="5" /></g>)}
    <text x="108" y="420">RAW MOTION</text><text x="414" y="420">TOKENIZED</text>
  </g>
}

function KnowledgeGraphic() {
  const nodes = [[300,245],[174,155],[428,148],[156,346],[433,355],[300,420],[299,79]]
  return <g className="graphic graphic--knowledge">
    {nodes.slice(1).map(([x,y],i) => <path key={i} d={`M300 245L${x} ${y}`} />)}
    {nodes.map(([x,y],i) => <g key={i}><circle cx={x} cy={y} r={i===0?48:25} /><text x={x} y={y+5} textAnchor="middle">{['语义','文化','医疗','日常','语境','知识','中文'][i]}</text></g>)}
    <circle className="graphic-pulse" cx="300" cy="245" r="68" />
  </g>
}

function MemoryGraphic() {
  return <g className="graphic graphic--memory">
    {[0,1,2,3].map((i) => <path key={i} d={`M118 ${150+i*70}C190 ${120+i*80} 260 ${190+i*25} 330 ${157+i*70}S445 ${152+i*72} 492 ${170+i*65}`} />)}
    {[140,215,295,370,450].map((x,i) => <circle key={x} cx={x} cy={174+(i%3)*70} r={i===2?16:7} />)}
    <rect x="209" y="101" width="182" height="288" rx="91" />
    <text x="300" y="245" textAnchor="middle">USER 001</text>
    <text className="graphic-label" x="300" y="272" textAnchor="middle">12 MEMORY LINKS</text>
  </g>
}

function IntentGraphic() {
  return <g className="graphic graphic--intent">
    <path d="M101 132H205C238 132 249 196 283 196H341" />
    <path d="M101 235H341" />
    <path d="M101 338H205C238 338 249 275 283 275H341" />
    {['Token','Context','Emotion'].map((label,i) => <g key={label}><rect x="81" y={105+i*103} width="112" height="54" rx="8" /><text x="137" y={138+i*103} textAnchor="middle">{label}</text></g>)}
    <path className="intent-beam" d="M341 196V275M341 235H389" />
    <rect className="intent-result" x="389" y="177" width="132" height="118" rx="14" />
    <text x="455" y="218" textAnchor="middle">TRUE INTENT</text>
    <text className="graphic-label" x="455" y="249" textAnchor="middle">0.94 CONF.</text>
  </g>
}
