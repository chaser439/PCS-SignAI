import { motion, useReducedMotion } from 'framer-motion'
import { Activity, BrainCircuit, HeartPulse } from 'lucide-react'
import { useState } from 'react'

const handPoints = [
  [282, 420], [245, 361], [221, 299], [205, 244], [200, 194],
  [286, 341], [280, 269], [282, 205], [287, 150],
  [331, 334], [339, 256], [349, 187], [359, 130],
  [375, 349], [397, 287], [417, 230], [432, 181],
  [410, 384], [449, 344], [482, 310], [510, 283],
]

const handLinks = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17]]

export function HeroVisual() {
  const reduceMotion = useReducedMotion()
  const [pointer, setPointer] = useState({ x: 0, y: 0 })

  return (
    <div
      className="hero-visual"
      onPointerMove={(event) => {
        if (reduceMotion) return
        const rect = event.currentTarget.getBoundingClientRect()
        setPointer({ x: (event.clientX - rect.left) / rect.width - 0.5, y: (event.clientY - rect.top) / rect.height - 0.5 })
      }}
      onPointerLeave={() => setPointer({ x: 0, y: 0 })}
      role="img"
      aria-label="从手部关键点、多模态解析到个性化中文意图的数据转换过程"
    >
      <motion.div
        className="hero-visual__plane"
        animate={{ x: pointer.x * 10, y: pointer.y * 10 }}
        transition={{ type: 'spring', stiffness: 70, damping: 20 }}
      >
        <svg viewBox="0 0 720 640" aria-hidden="true">
          <defs>
            <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="12" stdDeviation="14" floodColor="#194d44" floodOpacity=".12" />
            </filter>
          </defs>
          <g className="hero-grid">
            {Array.from({ length: 9 }, (_, i) => <path key={`v${i}`} d={`M${90 + i * 70} 52V588`} />)}
            {Array.from({ length: 8 }, (_, i) => <path key={`h${i}`} d={`M64 ${78 + i * 68}H660`} />)}
          </g>
          <g className="data-orbits">
            <ellipse cx="348" cy="320" rx="273" ry="196" />
            <ellipse cx="348" cy="320" rx="221" ry="256" transform="rotate(-35 348 320)" />
            <circle className="orbit-dot orbit-dot--one" cx="611" cy="269" r="5" />
            <circle className="orbit-dot orbit-dot--two" cx="162" cy="494" r="4" />
          </g>
          <path className="hand-surface" d="M281 431c-38-20-77-52-96-91-16-34-6-68 10-66 13 2 22 31 34 48-11-57-14-125-4-139 7-10 19-7 24 5 8 21 15 72 21 102-2-69 0-142 14-153 9-8 20-1 23 13 6 31 7 97 8 137 8-66 18-126 34-133 12-5 19 7 17 23-5 41-11 89-9 123 15-49 33-90 51-91 14 0 17 16 9 32-22 45-26 87-20 130 5 40-17 81-61 93-22 6-40 4-55-3z" />
          <g className="hand-links">
            {handLinks.map(([a, b]) => (
              <line key={`${a}-${b}`} x1={handPoints[a][0]} y1={handPoints[a][1]} x2={handPoints[b][0]} y2={handPoints[b][1]} />
            ))}
          </g>
          <g className="hand-points">
            {handPoints.map(([x, y], index) => <circle key={index} cx={x} cy={y} r={index === 0 ? 6 : 4} />)}
          </g>
          <g className="intent-core" filter="url(#soft-shadow)">
            <rect x="382" y="438" width="248" height="92" rx="12" />
            <circle cx="410" cy="466" r="8" />
            <text x="432" y="471">PERSONALIZED INTENT</text>
            <text className="intent-core__result" x="410" y="505">提醒妈妈按时服药</text>
          </g>
          <path className="intent-path" d="M344 405C382 429 393 441 409 454" />
          <circle className="flow-dot" cx="344" cy="405" r="5" />
        </svg>

        <div className="hero-token hero-token--one"><span>Token 01</span>妈妈</div>
        <div className="hero-token hero-token--two"><span>Token 02</span>药</div>
        <div className="hero-token hero-token--three"><span>Motion</span>帮助</div>
        <div className="hero-node hero-node--knowledge"><BrainCircuit /><span>知识<small>Knowledge</small></span></div>
        <div className="hero-node hero-node--memory"><Activity /><span>记忆<small>Memory</small></span></div>
        <div className="hero-node hero-node--emotion"><HeartPulse /><span>情绪<small>Emotion</small></span></div>
        <div className="hero-visual__status"><i />Multimodal stream · 24 fps</div>
      </motion.div>
    </div>
  )
}
