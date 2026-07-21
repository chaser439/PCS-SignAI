export type ResultStatus = 'ok' | 'timeout' | 'error'

export interface ServiceError {
  code: string
  message: string
  stage?: string
}

export interface SignTokenDetail {
  token: string
  start_sec: number
  end_sec: number
  confidence: number
  modalities: string[]
}

export interface NonManualCues {
  motion_intensity: number
  brow_raise: number
  mouth_open: number
  face_tension: number
}

export interface SignResult {
  schema_version: '1.0'
  video_id: string
  user_id: string | null
  status: ResultStatus
  source_path: string
  fps: number
  frame_count: number
  sign_sequence: string[]
  token_details: SignTokenDetail[]
  non_manual_cues: NonManualCues
  overall_confidence: number
  error: ServiceError | null
}

export interface RagHit {
  id: string
  title: string
  score: number
  domain: string
}

export interface MemoryHit {
  id: string
  score: number
  meaning: string
}

export interface EmotionResult {
  label: string
  score?: number
}

export interface ConfidenceBreakdown {
  sign_conf: number
  rag_conf: number
  memory_conf: number
  llm_conf: number
}

export interface SemanticResult {
  schema_version: '1.0'
  video_id: string
  user_id: string | null
  status: ResultStatus
  input_sign_sequence: string[]
  rag_hits: RagHit[]
  memory_hits: MemoryHit[]
  emotion: EmotionResult
  normalized_text: string
  inferred_intent: string
  evidence: string[]
  confidence_breakdown: ConfidenceBreakdown
  overall_confidence: number
  error: ServiceError | null
}

export interface BuiltInCase {
  id: 'family' | 'culture' | 'emergency'
  name: string
  category: string
  description: string
  duration: string
  accent: 'care' | 'culture' | 'urgent'
  baseline: string
  signResult: SignResult
  semanticResult: SemanticResult
}

export interface AuthUser {
  id: string
  name: string
  account: string
  role: string
  createdAt: string
}

export interface LoginInput {
  account: string
  password: string
  remember: boolean
}

export interface RegisterInput {
  name: string
  account: string
  password: string
}

export type ConversionDirection = 'sign-to-language' | 'language-to-sign'
export type QualityMode = 'fast' | 'standard' | 'high'
export type AvatarId = 'qinghe' | 'mingyu' | 'anran'
export type TaskFeedbackRating = 'correct' | 'partial' | 'wrong'
export type InteractionInputType = '实时录制' | '视频文件' | '文字输入' | '语音文件'

export interface InteractionRequest {
  userId: string
  direction: ConversionDirection
  quality: QualityMode
  inputName: string
  inputType: InteractionInputType
  caseId?: BuiltInCase['id']
  file?: File
  sourceText?: string
  avatarId?: AvatarId
}

export interface InteractionResult {
  baselineText: string
  polishedText: string
  emotion: EmotionResult
  tokens: string[]
  avatarGloss?: string
  avatarStates?: string[]
  signResult?: SignResult
  semanticResult?: SemanticResult
}

export interface AnalysisTask {
  id: string
  createdAt: string
  inputName: string
  inputType: InteractionInputType
  caseId?: BuiltInCase['id']
  userId: string
  direction: ConversionDirection
  quality: QualityMode
  processingMs: number
  sourceText?: string
  polishedText: string
  avatarId?: AvatarId
  avatarGloss?: string
  signResult?: SignResult
  semanticResult?: SemanticResult
}

export interface HistoryRecord {
  id: string
  createdAt: string
  inputName: string
  inputType: InteractionInputType
  direction: ConversionDirection
  quality: QualityMode
  output: string
  processingMs: number
  tokens: string[]
  intent: string
  confidence: number
  status: '已完成' | '部分完成' | '已中止'
  feedback?: TaskFeedbackRating
  task?: AnalysisTask
}

export interface MemoryEntry {
  id: string
  topic: string
  expression: string
  meaning: string
  confidence: number
  createdAt: string
  updatedAt: string
  source: string
  scene?: string
  notes?: string
  fileNames?: string[]
  userId?: string
}

export interface TaskFeedbackRecord {
  id: string
  taskId: string
  userId: string
  rating: TaskFeedbackRating
  correction: string
  differences: string[]
  createdAt: string
}

export interface UserPreferences {
  defaultInput: 'upload' | 'record'
  defaultDirection: ConversionDirection
  defaultQuality: QualityMode
  defaultAvatar: AvatarId
  reducedVisuals: boolean
  compactSidebar: boolean
  retentionDays: 30 | 90 | 180 | 365
}

export type RecoveryScenario = 'missing-file' | 'unsupported' | 'failed' | 'timeout' | 'missing-upstream' | 'invalid-data' | 'offline' | 'partial'
