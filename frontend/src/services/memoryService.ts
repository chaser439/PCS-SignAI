import { seedMemories } from './localData'
import type { MemoryEntry } from './serviceTypes'
import { createId, readStorage, writeStorage } from './storage'

const KEY = 'pcs-memory-entries'
const entries = () => readStorage<MemoryEntry[]>(KEY, seedMemories)

export const memoryService = {
  list: entries,
  save(input: Omit<MemoryEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) {
    const now = new Date().toISOString()
    const current = entries()
    if (input.id) {
      const next = current.map((item) => item.id === input.id ? { ...item, ...input, updatedAt: now } : item)
      writeStorage(KEY, next)
      return next.find((item) => item.id === input.id)!
    }
    const next: MemoryEntry = { ...input, id: createId('MEM'), createdAt: now, updatedAt: now }
    writeStorage(KEY, [next, ...current])
    return next
  },
  remove(id: string) {
    writeStorage(KEY, entries().filter((item) => item.id !== id))
  },
}
