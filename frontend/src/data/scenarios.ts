import type { LucideIcon } from 'lucide-react'
import { BookOpen, Building2, Headphones, Stethoscope } from 'lucide-react'

export interface Scenario {
  index: string
  title: string
  english: string
  description: string
  tags: string[]
  icon: LucideIcon
  visual: 'medical' | 'education' | 'service' | 'public'
}

export const scenarios: Scenario[] = [
  {
    index: '01',
    title: '医疗沟通',
    english: 'Medical Communication',
    description: '帮助医护人员理解患者的身体不适、表达习惯和紧急程度。',
    tags: ['HIS Interface', 'Care Context'],
    icon: Stethoscope,
    visual: 'medical',
  },
  {
    index: '02',
    title: '教育辅助',
    english: 'Accessible Education',
    description: '为课堂与远程教学提供结构化手语语义信息。',
    tags: ['Learning Platform', 'Live Class'],
    icon: BookOpen,
    visual: 'education',
  },
  {
    index: '03',
    title: '智能客服',
    english: 'Intelligent Service',
    description: '为客服平台提供可嵌入的手语理解接口。',
    tags: ['Service API', 'Intent Routing'],
    icon: Headphones,
    visual: 'service',
  },
  {
    index: '04',
    title: '会议与公共服务',
    english: 'Public Accessibility',
    description: '辅助会议、政务大厅和公共设施中的无障碍沟通。',
    tags: ['Meeting SDK', 'Public Service'],
    icon: Building2,
    visual: 'public',
  },
]
