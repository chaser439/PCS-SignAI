export interface SemanticCase {
  id: string
  index: string
  category: string
  recognition: string
  baseline: string
  understanding: string
  tags: string[]
  tone: 'care' | 'culture' | 'urgent'
}

export const semanticCases: SemanticCase[] = [
  {
    id: 'family-care',
    index: '01',
    category: '家庭照护',
    recognition: '妈妈 · 药',
    baseline: '用户提到了妈妈和药。',
    understanding: '用户可能正在提醒妈妈按时服药。',
    tags: ['User Memory', 'Family Care'],
    tone: 'care',
  },
  {
    id: 'culture',
    index: '02',
    category: '中文文化',
    recognition: '吃席',
    baseline: '吃饭。',
    understanding: '用户可能准备参加婚宴或宴席。',
    tags: ['Chinese Knowledge', 'Cultural Context'],
    tone: 'culture',
  },
  {
    id: 'emergency',
    index: '03',
    category: '紧急辅助',
    recognition: '帮助',
    baseline: '用户正在请求帮助。',
    understanding: '用户当前情绪焦虑，可能正在请求紧急帮助。',
    tags: ['Emotion', 'Urgency Understanding'],
    tone: 'urgent',
  },
]
