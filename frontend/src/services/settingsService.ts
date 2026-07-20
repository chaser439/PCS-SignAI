import { defaultPreferences } from './localData'
import type { UserPreferences } from './serviceTypes'
import { readStorage, writeStorage } from './storage'

const KEY = 'pcs-user-preferences'

export const settingsService = {
  get: () => ({ ...defaultPreferences, ...readStorage<Partial<UserPreferences>>(KEY, defaultPreferences) }),
  save(value: UserPreferences) {
    writeStorage(KEY, value)
    return value
  },
}
