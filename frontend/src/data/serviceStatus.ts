export interface ServiceStatus {
  label: string
  value: string
  status: 'ready' | 'local' | 'schema' | 'available' | 'count'
}

export const serviceStatuses: ServiceStatus[] = [
  { label: '多模态解析服务', value: 'Ready', status: 'ready' },
  { label: '中文知识检索', value: 'Ready', status: 'ready' },
  { label: '用户记忆服务', value: 'Ready', status: 'ready' },
  { label: '语义推理服务', value: 'Local', status: 'local' },
  { label: '统一接口协议', value: 'Schema v1.0', status: 'schema' },
  { label: '离线运行支持', value: 'Available', status: 'available' },
  { label: '当前内置案例', value: '3', status: 'count' },
]
