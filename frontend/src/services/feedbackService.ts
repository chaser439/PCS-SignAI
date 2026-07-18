import type { TaskFeedbackRecord } from './serviceTypes'
import { createId, readStorage, writeStorage } from './storage'

const KEY = 'pcs-feedback-records'
const records = () => readStorage<TaskFeedbackRecord[]>(KEY, []).filter((item) => Boolean(item.taskId && item.userId && item.rating))

export const feedbackService = {
  list: records,
  forTask(taskId: string) {
    return records().find((item) => item.taskId === taskId) ?? null
  },
  async submit(input: Omit<TaskFeedbackRecord, 'id' | 'createdAt'>) {
    await new Promise((resolve) => window.setTimeout(resolve, 450))
    const item: TaskFeedbackRecord = { ...input, id: createId('FDB'), createdAt: new Date().toISOString() }
    writeStorage(KEY, [item, ...records().filter((record) => record.taskId !== input.taskId)])
    return item
  },
}
