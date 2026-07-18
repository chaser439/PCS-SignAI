import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { authService } from '../services/authService'
import type { AuthUser, LoginInput, RegisterInput } from '../services/serviceTypes'

interface AuthContextValue {
  user: AuthUser | null
  login: (input: LoginInput) => Promise<AuthUser>
  register: (input: RegisterInput) => Promise<AuthUser>
  logout: () => void
  updateUser: (user: AuthUser) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => authService.getSession())

  const value = useMemo<AuthContextValue>(() => ({
    user,
    async login(input) {
      const next = await authService.login(input)
      setUser(next)
      return next
    },
    async register(input) {
      const next = await authService.register(input)
      setUser(next)
      return next
    },
    logout() {
      authService.logout()
      setUser(null)
    },
    updateUser(next) {
      setUser(authService.updateProfile(next))
    },
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
