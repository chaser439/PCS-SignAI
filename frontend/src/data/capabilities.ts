export type CapabilityVisual = 'multimodal' | 'knowledge' | 'memory' | 'intent'

export interface Capability {
  id: string
  index: string
  title: string
  english: string
  description: string
  keywords: string[]
  visual: CapabilityVisual
}

export const capabilities: Capability[] = [
  {
    id: 'multimodal',
    index: '01',
    title: '多模态手语解析',
    english: 'Multimodal Sign Parsing',
    description: '联合分析手部动作、面部表情、身体姿态和运动强度，将原始输入转化为结构化手语信息。',
    keywords: ['Hand', 'Face', 'Pose', 'Motion'],
    visual: 'multimodal',
  },
  {
    id: 'knowledge',
    index: '02',
    title: '中文知识增强',
    english: 'Chinese Knowledge',
    description: '结合中文日常、医疗与文化知识，减少机械直译与文化语义缺失。',
    keywords: ['Chinese Context', 'Knowledge Retrieval', 'Semantic Disambiguation'],
    visual: 'knowledge',
  },
  {
    id: 'memory',
    index: '03',
    title: '用户长期记忆',
    english: 'Long-term Memory',
    description: '学习不同用户长期形成的表达习惯，使相同动作在不同用户身上获得更准确的解释。',
    keywords: ['User Memory', 'Personalization', 'Historical Context'],
    visual: 'memory',
  },
  {
    id: 'intent',
    index: '04',
    title: '真实意图推理',
    english: 'Intent Reasoning',
    description: '综合手语 Token、知识、记忆、场景和情绪，生成规范化中文与真实意图。',
    keywords: ['Intent', 'Evidence', 'Confidence', 'LLM Reasoning'],
    visual: 'intent',
  },
]
