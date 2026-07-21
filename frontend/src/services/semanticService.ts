import type {
  ConfidenceBreakdown,
  MemoryHit,
  RagHit,
  ResultStatus,
  SemanticResult,
  ServiceError,
  SignResult,
} from './serviceTypes'

const SEMANTIC_API_URL = 'http://127.0.0.1:9002/semantic/analyze'

type JsonObject = Record<string, unknown>

function asObject(value: unknown): JsonObject | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as JsonObject
    : null
}

function firstString(source: JsonObject, ...keys: string[]) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function firstNumber(source: JsonObject, ...keys: string[]) {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
  }
  return undefined
}

function confidence(value: number | undefined, fallback = 0) {
  const resolved = value ?? fallback
  return Math.min(1, Math.max(0, resolved > 1 ? resolved / 100 : resolved))
}

function stringArray(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => typeof item === 'string' && item.trim() ? [item.trim()] : [])
}

function normalizeRagHits(data: JsonObject): RagHit[] {
  const source = Array.isArray(data.rag_hits)
    ? data.rag_hits
    : Array.isArray(data.rag_evidence) ? data.rag_evidence : []

  return source.flatMap((item, index) => {
    if (typeof item === 'string') {
      const title = item.trim()
      return title ? [{
        id: `rag-${index + 1}`,
        title,
        score: 0,
        domain: '中文文化知识',
      }] : []
    }

    const record = asObject(item)
    if (!record) return []
    const title = firstString(record, 'title', 'content', 'meaning')
    if (!title) return []

    return [{
      id: firstString(record, 'id') || `rag-${index + 1}`,
      title,
      score: confidence(firstNumber(record, 'score', 'confidence')),
      domain: firstString(record, 'domain', 'category') || '中文文化知识',
    }]
  })
}

function normalizeMemoryHits(data: JsonObject): MemoryHit[] {
  const source = Array.isArray(data.memory_hits)
    ? data.memory_hits
    : Array.isArray(data.memory_evidence) ? data.memory_evidence : []

  return source.flatMap((item, index) => {
    if (typeof item === 'string') {
      const meaning = item.trim()
      return meaning ? [{ id: `memory-${index + 1}`, score: 0, meaning }] : []
    }

    const record = asObject(item)
    if (!record) return []
    const meaning = firstString(record, 'meaning', 'content', 'title')
    if (!meaning) return []

    return [{
      id: firstString(record, 'id', 'sign_pattern') || `memory-${index + 1}`,
      score: confidence(firstNumber(record, 'score', 'confidence')),
      meaning,
    }]
  })
}

function normalizeStatus(value: unknown): ResultStatus {
  return value === 'timeout' || value === 'error' ? value : 'ok'
}

function normalizeError(value: unknown): ServiceError | null {
  const error = asObject(value)
  if (!error) return null
  const message = firstString(error, 'message')
  if (!message) return null
  return {
    code: firstString(error, 'code') || 'MODULE_B_ERROR',
    message,
    stage: firstString(error, 'stage') || undefined,
  }
}

function normalizeConfidenceBreakdown(
  data: JsonObject,
  signResult: SignResult,
  semanticConfidence: number,
  ragHits: RagHit[],
  memoryHits: MemoryHit[],
): ConfidenceBreakdown {
  const raw = asObject(data.confidence_breakdown)
  if (raw) {
    return {
      sign_conf: confidence(firstNumber(raw, 'sign_conf'), signResult.overall_confidence),
      rag_conf: confidence(firstNumber(raw, 'rag_conf')),
      memory_conf: confidence(firstNumber(raw, 'memory_conf')),
      llm_conf: confidence(firstNumber(raw, 'llm_conf'), semanticConfidence),
    }
  }

  return {
    sign_conf: confidence(signResult.overall_confidence),
    rag_conf: ragHits.length ? semanticConfidence : 0,
    memory_conf: memoryHits.reduce((highest, hit) => Math.max(highest, hit.score), 0),
    llm_conf: semanticConfidence,
  }
}

function normalizeResponse(data: unknown, signResult: SignResult): SemanticResult {
  const payload = asObject(data)
  if (!payload) throw new Error('Module B 返回了无效的数据格式')

  const semantic = asObject(payload.semantic_result) ?? payload
  const semanticConfidence = confidence(
    firstNumber(semantic, 'confidence', 'confidence_score', 'overall_confidence'),
  )
  const overallConfidence = confidence(
    firstNumber(payload, 'overall_confidence'),
    semanticConfidence,
  )
  const ragHits = normalizeRagHits(payload)
  const memoryHits = normalizeMemoryHits(payload)
  const rawEmotion = asObject(semantic.emotion)
  const emotionLabel = rawEmotion
    ? firstString(rawEmotion, 'label', 'type')
    : firstString(semantic, 'emotion', 'emotion_label')
  const emotionScore = rawEmotion
    ? firstNumber(rawEmotion, 'score', 'confidence')
    : firstNumber(semantic, 'emotion_score')
  const evidence = stringArray(payload.evidence)

  return {
    schema_version: '1.0',
    video_id: firstString(payload, 'video_id') || signResult.video_id,
    user_id: typeof payload.user_id === 'string' ? payload.user_id : signResult.user_id,
    status: normalizeStatus(payload.status),
    input_sign_sequence: stringArray(payload.input_sign_sequence).length
      ? stringArray(payload.input_sign_sequence)
      : signResult.sign_sequence,
    rag_hits: ragHits,
    memory_hits: memoryHits,
    emotion: {
      label: emotionLabel || 'unknown',
      score: emotionScore === undefined ? undefined : confidence(emotionScore),
    },
    normalized_text: firstString(semantic, 'expression', 'normalized_text'),
    inferred_intent: firstString(semantic, 'intent', 'inferred_intent') || 'unknown',
    evidence: evidence.length ? evidence : ragHits.map((hit) => hit.title),
    confidence_breakdown: normalizeConfidenceBreakdown(
      payload,
      signResult,
      semanticConfidence,
      ragHits,
      memoryHits,
    ),
    overall_confidence: overallConfidence,
    error: normalizeError(payload.error),
  }
}

function failedResult(signResult: SignResult, error: unknown): SemanticResult {
  return {
    schema_version: '1.0',
    video_id: signResult.video_id,
    user_id: signResult.user_id,
    status: 'error',
    input_sign_sequence: signResult.sign_sequence,
    rag_hits: [],
    memory_hits: [],
    emotion: { label: 'unknown' },
    normalized_text: '',
    inferred_intent: 'unknown',
    evidence: [],
    confidence_breakdown: {
      sign_conf: confidence(signResult.overall_confidence),
      rag_conf: 0,
      memory_conf: 0,
      llm_conf: 0,
    },
    overall_confidence: 0,
    error: {
      code: 'MODULE_B_ERROR',
      message: error instanceof Error ? error.message : String(error),
      stage: 'semantic-analysis',
    },
  }
}

export const semanticService = {
  async understand(signResult: SignResult): Promise<SemanticResult> {
    try {
      const response = await fetch(SEMANTIC_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          schema_version: '1.0',
          video_id: signResult.video_id,
          user_id: signResult.user_id,
          status: signResult.status,
          source_path: signResult.source_path,
          sign_sequence: signResult.sign_sequence,
          overall_confidence: signResult.overall_confidence,
        }),
      })

      if (!response.ok) throw new Error(`Module B error: ${response.status}`)
      return normalizeResponse(await response.json(), signResult)
    } catch (error) {
      console.error('Module B 调用失败', error)
      return failedResult(signResult, error)
    }
  },
}
