import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './routing/ProtectedRoute'
import { MarketingHome } from './pages/MarketingHome'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { AppShell } from './layouts/AppShell'
import { OverviewPage } from './pages/app/OverviewPage'
import { WorkspacePage } from './pages/app/WorkspacePage'
import { HistoryPage } from './pages/app/HistoryPage'
import { MemoryPage } from './pages/app/MemoryPage'
import { SettingsPage } from './pages/app/SettingsPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<MarketingHome />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="workspace" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="workspace" element={<WorkspacePage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="memory" element={<MemoryPage />} />
          <Route path="cases" element={<Navigate to="../workspace" replace />} />
          <Route path="services" element={<Navigate to="../workspace" replace />} />
          <Route path="feedback" element={<Navigate to="../workspace" replace />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
