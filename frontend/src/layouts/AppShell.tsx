import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Brain, ChevronDown, History, House, LogOut, Menu, PanelLeftClose, PanelLeftOpen, ScanSearch, Settings, UserRound, Wifi, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { settingsService } from '../services/settingsService'
import { BrandMark } from '../components/ui/BrandMark'

const navItems = [
  { path: '/app/workspace', label: '智能理解', english: 'Understanding', icon: ScanSearch },
  { path: '/app/history', label: '历史记录', english: 'History', icon: History },
  { path: '/app/memory', label: '记忆中心', english: 'Memory', icon: Brain },
  { path: '/app/settings', label: '系统设置', english: 'Settings', icon: Settings },
]

const titles: Record<string, string> = { ...Object.fromEntries(navItems.map((item) => [item.path, item.label])), '/app/overview': '总览' }

export function AppShell() {
  const { user, logout } = useAuth()
  const { notify } = useToast()
  const location = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => settingsService.get().compactSidebar)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  useEffect(() => setMobileOpen(false), [location.pathname])
  useEffect(() => {
    document.body.classList.toggle('product-nav-open', mobileOpen)
    return () => document.body.classList.remove('product-nav-open')
  }, [mobileOpen])

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value
      settingsService.save({ ...settingsService.get(), compactSidebar: next })
      return next
    })
  }

  const signOut = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={`product-shell ${collapsed ? 'product-shell--collapsed' : ''}`}>
      <aside className={`product-sidebar ${mobileOpen ? 'product-sidebar--open' : ''}`}>
        <div className="product-sidebar__brand">
          <button type="button" onClick={() => navigate('/app/overview')} aria-label="进入总览"><BrandMark compact={collapsed} /></button>
          <button className="icon-button product-sidebar__close" type="button" aria-label="关闭导航" onClick={() => setMobileOpen(false)}><X /></button>
        </div>
        <div className="product-sidebar__context"><span>INTERACTION SPACE</span>{!collapsed && <strong>智能手语交互平台</strong>}</div>
        <nav className="product-sidebar__nav" aria-label="产品导航">
          {navItems.map(({ path, label, english, icon: Icon }) => (
            <NavLink key={path} to={path} className={({ isActive }) => isActive ? 'active' : ''} title={collapsed ? label : undefined}>
              <Icon /><span><strong>{label}</strong><small>{english}</small></span><i />
            </NavLink>
          ))}
        </nav>
        <div className="product-sidebar__footer">
          <div className="product-sidebar__service"><Wifi /><span><strong>服务连接正常</strong><small>Schema v1.0</small></span></div>
          <button className="product-sidebar__collapse" type="button" onClick={toggleCollapsed} aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}{!collapsed && <span>收起导航</span>}</button>
        </div>
      </aside>

      <div className="product-main">
        <header className="product-topbar">
          <div className="product-topbar__title">
            <button className="icon-button product-topbar__menu" type="button" aria-label="打开导航" onClick={() => setMobileOpen(true)}><Menu /></button>
            <div><span>PCS-SignAI / Product</span><strong>{titles[location.pathname] ?? '语义理解空间'}</strong></div>
          </div>
          <div className="product-topbar__actions">
            <button className="product-topbar__service" type="button" onClick={() => notify('本地能力已就绪', '视频、语义、虚拟人和记忆服务可用', 'info')}><i />本地能力就绪</button>
            <button className="icon-button" type="button" aria-label="通知" onClick={() => notify('当前没有未读通知', '新的处理结果与服务变化会显示在这里', 'info')}><Bell /></button>
            <div className="product-user">
              <button type="button" className="product-user__button" aria-haspopup="menu" aria-expanded={userOpen} onClick={() => setUserOpen((value) => !value)}>
                <span>{user?.name.slice(0, 1).toUpperCase()}</span><p><strong>{user?.name}</strong><small>{user?.role}</small></p><ChevronDown />
              </button>
              <AnimatePresence>
                {userOpen && <motion.div className="product-user__menu" role="menu" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                  <button type="button" role="menuitem" onClick={() => { setUserOpen(false); navigate('/app/settings') }}><UserRound />账号资料</button>
                  <button type="button" role="menuitem" onClick={() => { setUserOpen(false); navigate('/') }}><House />品牌首页</button>
                  <button type="button" role="menuitem" onClick={signOut}><LogOut />退出登录</button>
                </motion.div>}
              </AnimatePresence>
            </div>
          </div>
        </header>
        <main className="product-content" id="product-content">
          <AnimatePresence mode="wait">
            <motion.div className="product-route" key={location.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: .25 }}>
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      {mobileOpen && <button className="product-sidebar-scrim" type="button" aria-label="关闭导航" onClick={() => setMobileOpen(false)} />}
    </div>
  )
}
