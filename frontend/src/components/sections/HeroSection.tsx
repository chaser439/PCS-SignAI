import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, Camera, Glasses, Smartphone, Video } from 'lucide-react'
import { HeroVisual } from '../visuals/HeroVisual'

interface HeroSectionProps {
  onExperience: () => void
}

const reveal = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0 },
}

export function HeroSection({ onExperience }: HeroSectionProps) {
  return (
    <section id="home" className="hero section-shell" aria-labelledby="hero-title">
      <div className="hero__ambient hero__ambient--a" />
      <div className="hero__ambient hero__ambient--b" />
      <div className="hero__content container">
        <motion.div
          className="hero__copy"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.11, delayChildren: 0.12 }}
        >
          <motion.div className="hero__kicker" variants={reveal} transition={{ duration: 0.6 }}>
            <span className="eyebrow"><i />Personalized Sign Intelligence</span>
            <span className="hero__version">Semantic Layer · v1.0</span>
          </motion.div>
          <motion.h1 id="hero-title" variants={reveal} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            让手语不止被看见，<br />
            <span>更被真正理解。</span>
          </motion.h1>
          <motion.p className="hero__english" variants={reveal}>
            Beyond Sign Recognition. <strong>Toward Personalized Understanding.</strong>
          </motion.p>
          <motion.p className="hero__description" variants={reveal}>
            PCS-SignAI 融合多模态手语解析、中文知识、用户长期记忆与情绪线索，将动作信息转化为更准确、更具个性化的真实意图。
          </motion.p>
          <motion.div className="hero__actions" variants={reveal}>
            <button className="button" type="button" onClick={onExperience}>
              进入智能体验<ArrowRight size={18} />
            </button>
            <a className="button button--ghost" href="#journey">
              探索理解过程<ArrowDown size={17} />
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className="hero__visual-wrap"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroVisual />
        </motion.div>
      </div>

      <motion.div className="hero__bottom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
        <div className="hero__input-rail" aria-label="支持的上游输入">
          <span>INPUT AGNOSTIC</span>
          <span><Camera />摄像头</span>
          <span><Smartphone />移动设备</span>
          <span><Video />视频文件</span>
          <span><Glasses />智能眼镜</span>
        </div>
        <a className="scroll-cue" href="#layer" aria-label="向下浏览">
          <span>Scroll to understand</span><i><ArrowDown size={15} /></i>
        </a>
      </motion.div>
    </section>
  )
}
