import type { BuiltInCase, HistoryRecord, MemoryEntry, UserPreferences } from './serviceTypes'

export const builtInCases: BuiltInCase[] = [
  {
    id: 'family',
    name: '家庭照护',
    category: '家庭与医疗',
    description: '结合家庭关系与长期表达习惯，理解服药提醒意图。',
    duration: '00:02.4',
    accent: 'care',
    baseline: '用户提到了妈妈和药。',
    signResult: {
      schema_version: '1.0', video_id: 'case-family-001', user_id: 'user001', status: 'ok', source_path: 'local://cases/family-care', fps: 24, frame_count: 58,
      sign_sequence: ['妈妈', '药'],
      token_details: [
        { token: '妈妈', start_sec: 0.12, end_sec: 0.88, confidence: 0.93, modalities: ['Hand', 'Face'] },
        { token: '药', start_sec: 1.02, end_sec: 1.82, confidence: 0.91, modalities: ['Hand', 'Pose'] },
      ],
      non_manual_cues: { motion_intensity: 0.41, brow_raise: 0.09, mouth_open: 0.08, face_tension: 0.52 }, overall_confidence: 0.92, error: null,
    },
    semanticResult: {
      schema_version: '1.0', video_id: 'case-family-001', user_id: 'user001', status: 'ok', input_sign_sequence: ['妈妈', '药'],
      rag_hits: [{ id: 'home_med_01', title: '家庭服药提醒', score: 0.86, domain: '家庭医疗' }],
      memory_hits: [{ id: 'mem_010', score: 0.91, meaning: '过去曾用“妈妈+药”表达提醒妈妈按时服药' }],
      emotion: { label: '关心', score: 0.82 }, normalized_text: '用户提到了妈妈和药。', inferred_intent: '提醒妈妈按时服药。',
      evidence: ['历史表达习惯高度匹配', '家庭医疗知识命中', '面部线索显示持续关注'],
      confidence_breakdown: { sign_conf: 0.92, rag_conf: 0.86, memory_conf: 0.91, llm_conf: 0.88 }, overall_confidence: 0.89, error: null,
    },
  },
  {
    id: 'culture',
    name: '中文文化',
    category: '文化与日常',
    description: '结合中文文化语境，区分字面吃饭与参加宴席的真实含义。',
    duration: '00:01.8',
    accent: 'culture',
    baseline: '用户正在吃饭。',
    signResult: {
      schema_version: '1.0', video_id: 'case-culture-002', user_id: 'user002', status: 'ok', source_path: 'local://cases/cultural-context', fps: 24, frame_count: 43,
      sign_sequence: ['吃席'], token_details: [{ token: '吃席', start_sec: 0.18, end_sec: 1.46, confidence: 0.89, modalities: ['Hand', 'Face', 'Pose'] }],
      non_manual_cues: { motion_intensity: 0.55, brow_raise: 0.18, mouth_open: 0.22, face_tension: 0.16 }, overall_confidence: 0.89, error: null,
    },
    semanticResult: {
      schema_version: '1.0', video_id: 'case-culture-002', user_id: 'user002', status: 'ok', input_sign_sequence: ['吃席'],
      rag_hits: [{ id: 'culture_023', title: '中文宴席表达', score: 0.94, domain: '文化语境' }],
      memory_hits: [{ id: 'mem_027', score: 0.72, meaning: '该表达常在婚宴与聚会话题中出现' }],
      emotion: { label: '期待', score: 0.68 }, normalized_text: '用户提到了“吃席”。', inferred_intent: '准备参加婚宴或宴席。',
      evidence: ['中文文化知识强命中', '近期话题包含聚会安排', '动作节奏呈积极倾向'],
      confidence_breakdown: { sign_conf: 0.89, rag_conf: 0.94, memory_conf: 0.72, llm_conf: 0.9 }, overall_confidence: 0.88, error: null,
    },
  },
  {
    id: 'emergency',
    name: '紧急辅助',
    category: '安全与辅助',
    description: '融合动作强度与面部紧张度，识别请求帮助的紧急程度。',
    duration: '00:02.1',
    accent: 'urgent',
    baseline: '用户正在请求帮助。',
    signResult: {
      schema_version: '1.0', video_id: 'case-emergency-003', user_id: 'user003', status: 'ok', source_path: 'local://cases/emergency-support', fps: 30, frame_count: 63,
      sign_sequence: ['帮助'], token_details: [{ token: '帮助', start_sec: 0.16, end_sec: 1.76, confidence: 0.96, modalities: ['Hand', 'Face', 'Pose', 'Motion'] }],
      non_manual_cues: { motion_intensity: 0.88, brow_raise: 0.74, mouth_open: 0.61, face_tension: 0.91 }, overall_confidence: 0.96, error: null,
    },
    semanticResult: {
      schema_version: '1.0', video_id: 'case-emergency-003', user_id: 'user003', status: 'ok', input_sign_sequence: ['帮助'],
      rag_hits: [{ id: 'safety_008', title: '紧急求助动作模式', score: 0.92, domain: '公共安全' }],
      memory_hits: [{ id: 'mem_041', score: 0.79, meaning: '快速重复动作通常对应高紧急程度' }],
      emotion: { label: '焦虑', score: 0.93 }, normalized_text: '用户正在请求帮助。', inferred_intent: '用户情绪焦虑，可能正在请求紧急帮助。',
      evidence: ['动作强度显著升高', '面部紧张度达到高位', '紧急求助知识条目命中'],
      confidence_breakdown: { sign_conf: 0.96, rag_conf: 0.92, memory_conf: 0.79, llm_conf: 0.93 }, overall_confidence: 0.92, error: null,
    },
  },
]

export const seedHistory: HistoryRecord[] = builtInCases.map((item, index) => ({
  id: `HST-2026-071${8 - index}-00${index + 1}`,
  createdAt: new Date(2026, 6, 18 - index, 14 - index, 20).toISOString(),
  inputName: item.name,
  inputType: '视频文件',
  direction: 'sign-to-language',
  quality: index === 0 ? 'high' : 'standard',
  output: item.semanticResult.inferred_intent,
  processingMs: 3280 + index * 420,
  tokens: item.signResult.sign_sequence,
  intent: item.semanticResult.inferred_intent,
  confidence: item.semanticResult.overall_confidence,
  status: '已完成',
}))

export const seedMemories: MemoryEntry[] = [
  { id: 'MEM-010', topic: '常用手语表达', expression: '妈妈 + 药', meaning: '提醒妈妈按时服药', confidence: 0.91, createdAt: '2026-06-12T08:20:00.000Z', updatedAt: '2026-07-18T09:30:00.000Z', source: '历史修正记录', scene: '家庭沟通', notes: '动作结束时会停顿并看向家人。' },
  { id: 'MEM-027', topic: '个性化词义', expression: '吃席', meaning: '准备参加婚宴或宴席', confidence: 0.82, createdAt: '2026-06-28T12:10:00.000Z', updatedAt: '2026-07-16T10:15:00.000Z', source: '用户反馈', scene: '日常交流' },
  { id: 'MEM-041', topic: '特殊动作习惯', expression: '快速重复“帮助”', meaning: '需要立即获得协助', confidence: 0.94, createdAt: '2026-07-03T15:42:00.000Z', updatedAt: '2026-07-17T16:45:00.000Z', source: '使用过程记录', scene: '紧急求助', notes: '紧急时动作幅度明显增大。' },
  { id: 'MEM-052', topic: '表情使用习惯', expression: '胸口 + 疼', meaning: '胸部存在明显不适', confidence: 0.87, createdAt: '2026-07-09T06:30:00.000Z', updatedAt: '2026-07-15T08:20:00.000Z', source: '用户确认', scene: '医疗沟通' },
]

export const defaultPreferences: UserPreferences = {
  defaultInput: 'upload',
  defaultDirection: 'sign-to-language',
  defaultQuality: 'standard',
  defaultAvatar: 'qinghe',
  reducedVisuals: false,
  compactSidebar: false,
  retentionDays: 90,
}
