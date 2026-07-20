import { seedHistory } from './localData'
import type { AnalysisTask, HistoryRecord } from './serviceTypes'
import { readStorage, writeStorage } from './storage'

const KEY = 'pcs-history-records'

function records() {
  return readStorage<HistoryRecord[]>(KEY, seedHistory).map((item) => ({
    ...item,
    inputType: item.inputType === ('内置案例' as HistoryRecord['inputType']) ? '视频文件' : item.inputType,
    direction: item.direction ?? 'sign-to-language',
    quality: item.quality ?? 'standard',
    output: item.output ?? item.intent,
    processingMs: item.processingMs ?? 4000,
  }))
}

export const historyService = {
  list: records,
  find(id: string) {
    return records().find((item) => item.id === id) ?? null
  },
  add(task: AnalysisTask) {
    const record: HistoryRecord = { id: task.id, createdAt: task.createdAt, inputName: task.inputName, inputType: task.inputType, direction: task.direction, quality: task.quality, output: task.polishedText, processingMs: task.processingMs, tokens: task.signResult?.sign_sequence ?? [], intent: task.polishedText, confidence: task.semanticResult?.overall_confidence ?? 0.9, status: '已完成', task }
    writeStorage(KEY, [record, ...records()])
    return record
  },
  setFeedback(id: string, feedback: HistoryRecord['feedback']) {
    writeStorage(KEY, records().map((item) => item.id === id ? { ...item, feedback } : item))
  },
  remove(id: string) {
    writeStorage(KEY, records().filter((item) => item.id !== id))
  },
  clear() {
    writeStorage(KEY, [])
  },
}
