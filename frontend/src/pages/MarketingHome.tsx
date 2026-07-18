import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Header } from '../components/navigation/Header'
import { HeroSection } from '../components/sections/HeroSection'
import { LayerSection } from '../components/sections/LayerSection'
import { CapabilitiesSection } from '../components/sections/CapabilitiesSection'
import { CasesSection } from '../components/sections/CasesSection'
import { StatusSection } from '../components/sections/StatusSection'
import { JourneySection } from '../components/sections/JourneySection'
import { ScenariosSection } from '../components/sections/ScenariosSection'
import { FeedbackSection } from '../components/sections/FeedbackSection'
import { ClosingSection } from '../components/sections/ClosingSection'

export function MarketingHome() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!window.location.hash) return
    const timer = window.setTimeout(() => {
      const target = document.querySelector(window.location.hash)
      if (!target) return
      const top = target.getBoundingClientRect().top + window.scrollY - 68
      document.documentElement.scrollTop = top
      document.body.scrollTop = top
    }, 80)
    return () => window.clearTimeout(timer)
  }, [])

  const enter = () => navigate(user ? '/app/overview' : '/login')

  return (
    <>
      <a className="skip-link" href="#main-content">跳到主要内容</a>
      <Header user={user} onLogin={() => navigate('/login')} onLogout={logout} onExperience={enter} />
      <main id="main-content">
        <HeroSection onExperience={enter} />
        <LayerSection />
        <CapabilitiesSection />
        <CasesSection />
        <StatusSection />
        <JourneySection />
        <ScenariosSection />
        <FeedbackSection />
      </main>
      <ClosingSection onExperience={enter} />
    </>
  )
}
