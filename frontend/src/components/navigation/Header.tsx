import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, LogOut, Menu, Sparkles, X } from 'lucide-react'
import type { AuthUser } from '../../services/serviceTypes'
import { BrandMark } from '../ui/BrandMark'

interface HeaderProps {
  user: AuthUser | null
  onLogin: () => void
  onLogout: () => void
  onExperience: () => void
}

const navItems = [
  { label: '首页', href: '#home' },
  { label: '核心能力', href: '#capabilities' },
  { label: '应用场景', href: '#scenarios' },
  { label: '服务状态', href: '#status' },
  { label: '理解历程', href: '#journey' },
  { label: '联系反馈', href: '#contact' },
]

export function Header({ user, onLogin, onLogout, onExperience }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('nav-open', menuOpen)
    return () => document.body.classList.remove('nav-open')
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={`site-header ${scrolled ? 'site-header--scrolled' : ''}`}>
      <div className="site-header__inner">
        <a href="#home" className="site-header__brand" aria-label="PCS-SignAI 首页" onClick={closeMenu}>
          <BrandMark />
        </a>

        <nav className="site-nav" aria-label="主导航">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="site-header__actions">
          {user ? (
            <div className="user-control">
              <button
                className="user-chip"
                type="button"
                aria-expanded={userOpen}
                aria-haspopup="menu"
                onClick={() => setUserOpen((open) => !open)}
              >
                <span className="user-chip__avatar">{user.name.slice(0, 1).toUpperCase()}</span>
                <span className="user-chip__label">{user.name}<small>理解空间已连接</small></span>
              </button>
              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    className="user-menu"
                    role="menu"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    <span><Sparkles size={14} />个性化理解已启用</span>
                    <button type="button" role="menuitem" onClick={() => { setUserOpen(false); onLogout() }}>
                      <LogOut size={16} />退出登录
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button className="text-button site-header__login" type="button" onClick={onLogin}>登录</button>
          )}
          <button className="button button--compact site-header__cta" type="button" onClick={onExperience}>
            <span>进入体验</span><ArrowUpRight size={16} />
          </button>
          <button
            className="icon-button site-header__menu-button"
            type="button"
            aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            className="mobile-nav"
            aria-label="移动端导航"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
          >
            <span className="mobile-nav__label">Navigation / 导航</span>
            {navItems.map((item, index) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                <small>0{index + 1}</small>{item.label}<ArrowUpRight size={18} />
              </a>
            ))}
            {!user && <button type="button" onClick={() => { closeMenu(); onLogin() }}>登录账号</button>}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
