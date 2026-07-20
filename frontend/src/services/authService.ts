import type { AuthUser, LoginInput, RegisterInput } from './serviceTypes'
import { createId, readStorage, writeStorage } from './storage'

const USERS_KEY = 'pcs-auth-users'
const SESSION_KEY = 'pcs-auth-session'

interface StoredUser extends AuthUser {
  password: string
}

function saveSession(user: AuthUser, remember: boolean) {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
  const storage = remember ? localStorage : sessionStorage
  storage.setItem(SESSION_KEY, JSON.stringify(user))
}

export const authService = {
  getSession(): AuthUser | null {
    try {
      const value = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY)
      return value ? JSON.parse(value) as AuthUser : null
    } catch {
      return null
    }
  },

  async login(input: LoginInput): Promise<AuthUser> {
    await new Promise((resolve) => window.setTimeout(resolve, 650))
    if (!input.account.trim() || !input.password.trim()) throw new Error('请输入账号和密码')
    const users = readStorage<StoredUser[]>(USERS_KEY, [])
    const existing = users.find((item) => item.account.toLowerCase() === input.account.trim().toLowerCase())
    if (existing && existing.password !== input.password) throw new Error('账号或密码不正确')
    const user: AuthUser = existing ?? {
      id: createId('USR'),
      name: input.account.includes('@') ? input.account.split('@')[0] : input.account,
      account: input.account.trim(),
      role: '语义理解用户',
      createdAt: new Date().toISOString(),
    }
    saveSession(user, input.remember)
    return user
  },

  async register(input: RegisterInput): Promise<AuthUser> {
    await new Promise((resolve) => window.setTimeout(resolve, 750))
    const users = readStorage<StoredUser[]>(USERS_KEY, [])
    if (users.some((item) => item.account.toLowerCase() === input.account.trim().toLowerCase())) throw new Error('该账号已经注册')
    const stored: StoredUser = { id: createId('USR'), name: input.name.trim(), account: input.account.trim(), role: '语义理解用户', createdAt: new Date().toISOString(), password: input.password }
    writeStorage(USERS_KEY, [...users, stored])
    const { password: _, ...user } = stored
    void _
    saveSession(user, true)
    return user
  },

  async resetPassword(account: string, password: string): Promise<void> {
    await new Promise((resolve) => window.setTimeout(resolve, 700))
    const users = readStorage<StoredUser[]>(USERS_KEY, [])
    const next = users.map((item) => item.account.toLowerCase() === account.trim().toLowerCase() ? { ...item, password } : item)
    writeStorage(USERS_KEY, next)
  },

  logout() {
    localStorage.removeItem(SESSION_KEY)
    sessionStorage.removeItem(SESSION_KEY)
  },

  updateProfile(user: AuthUser): AuthUser {
    const users = readStorage<StoredUser[]>(USERS_KEY, [])
    writeStorage(USERS_KEY, users.map((item) => item.id === user.id ? { ...item, ...user } : item))
    const persistent = Boolean(localStorage.getItem(SESSION_KEY))
    saveSession(user, persistent)
    return user
  },
}
