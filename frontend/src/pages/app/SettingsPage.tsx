import { useState, type FormEvent } from 'react'
import { Database, LogOut, MonitorCog, Save, SlidersHorizontal, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { settingsService } from '../../services/settingsService'
import { historyService } from '../../services/historyService'
import { PageHeader } from '../../components/ui/PageHeader'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

export function SettingsPage() {
  const { user, updateUser, logout } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [profile, setProfile] = useState({ name: user?.name ?? '', account: user?.account ?? '' })
  const [preferences, setPreferences] = useState(() => settingsService.get())
  const [clearOpen, setClearOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const saveProfile = (event: FormEvent) => { event.preventDefault(); if (!user || !profile.name.trim() || !profile.account.trim()) { notify('请完整填写用户资料', undefined, 'error'); return }; updateUser({ ...user, ...profile }); notify('用户资料已更新') }
  const savePreferences = () => { settingsService.save(preferences); document.documentElement.classList.toggle('user-reduced-visuals', preferences.reducedVisuals); notify('默认交互设置已保存') }
  const signOut = () => { logout(); navigate('/login', { replace: true }) }

  return (
    <div className="settings-page settings-page--focused">
      <PageHeader eyebrow="System Preferences" title="系统设置" description="管理用户资料、默认交互方式、界面偏好和本地数据。" actions={<button className="button" type="button" onClick={savePreferences}><Save />保存设置</button>} />
      <div className="settings-layout">
        <nav className="settings-index"><a href="#profile"><UserRound />用户资料</a><a href="#defaults"><SlidersHorizontal />交互默认值</a><a href="#interface"><MonitorCog />界面设置</a><a href="#data"><Database />数据管理</a></nav>
        <div className="settings-sections">
          <section id="profile" className="product-panel settings-section"><header><UserRound /><div><span>PROFILE</span><h2>用户资料</h2><p>用于任务记录、个性化记忆与结果反馈。</p></div></header><form onSubmit={saveProfile}><div className="form-row"><label><span>用户名称</span><input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label><label><span>登录账号</span><input value={profile.account} onChange={(event) => setProfile({ ...profile, account: event.target.value })} /></label></div><div className="settings-readonly"><span>用户编号<strong>{user?.id}</strong></span><span>账号角色<strong>{user?.role}</strong></span><span>创建时间<strong>{user && new Date(user.createdAt).toLocaleDateString('zh-CN')}</strong></span></div><button className="button button--ghost" type="submit">更新资料</button></form></section>

          <section id="defaults" className="product-panel settings-section"><header><SlidersHorizontal /><div><span>INTERACTION DEFAULTS</span><h2>默认交互设置</h2><p>新建任务时会自动使用这些选项，仍可在工作台随时调整。</p></div></header><div className="settings-fields settings-fields--three"><label><span>默认转换方向</span><select value={preferences.defaultDirection} onChange={(event) => setPreferences({ ...preferences, defaultDirection: event.target.value as typeof preferences.defaultDirection })}><option value="sign-to-language">手语 → 文字 / 语音</option><option value="language-to-sign">文字 / 语音 → 手语</option></select></label><label><span>默认质量模式</span><select value={preferences.defaultQuality} onChange={(event) => setPreferences({ ...preferences, defaultQuality: event.target.value as typeof preferences.defaultQuality })}><option value="fast">快速</option><option value="standard">标准</option><option value="high">高质</option></select></label><label><span>默认虚拟人</span><select value={preferences.defaultAvatar} onChange={(event) => setPreferences({ ...preferences, defaultAvatar: event.target.value as typeof preferences.defaultAvatar })}><option value="qinghe">清和 · 自然亲和</option><option value="mingyu">明屿 · 清晰稳重</option><option value="anran">安然 · 柔和细腻</option></select></label></div></section>

          <section id="interface" className="product-panel settings-section"><header><MonitorCog /><div><span>INTERFACE</span><h2>界面设置</h2><p>调整默认输入入口和页面动态效果。</p></div></header><div className="settings-fields"><label><span>默认视频入口</span><select value={preferences.defaultInput} onChange={(event) => setPreferences({ ...preferences, defaultInput: event.target.value as typeof preferences.defaultInput })}><option value="upload">上传视频</option><option value="record">实时录制</option></select></label><label><span>侧边栏状态</span><select value={preferences.compactSidebar ? 'compact' : 'expanded'} onChange={(event) => setPreferences({ ...preferences, compactSidebar: event.target.value === 'compact' })}><option value="expanded">显示文字</option><option value="compact">仅显示图标</option></select></label></div><div className="settings-options"><label><p><strong>减少视觉运动</strong><span>弱化页面切换、处理阶段和虚拟人动作。</span></p><input type="checkbox" checked={preferences.reducedVisuals} onChange={(event) => setPreferences({ ...preferences, reducedVisuals: event.target.checked })} /><i /></label></div></section>

          <section id="data" className="product-panel settings-section"><header><Database /><div><span>LOCAL DATA</span><h2>数据管理</h2><p>控制本地历史保留周期和当前登录状态。</p></div></header><div className="settings-fields"><label><span>历史记录保留</span><select value={preferences.retentionDays} onChange={(event) => setPreferences({ ...preferences, retentionDays: Number(event.target.value) as typeof preferences.retentionDays })}><option value="30">30 天</option><option value="90">90 天</option><option value="180">180 天</option><option value="365">365 天</option></select></label></div><div className="settings-danger"><div><strong>清除历史记录</strong><span>移除本地保存的交互任务，不影响记忆中心和结果反馈。</span></div><button className="button button--ghost" type="button" onClick={() => setClearOpen(true)}>清除记录</button></div><div className="settings-danger"><div><strong>退出当前账号</strong><span>结束本次登录状态，保留当前设备中的个性化数据。</span></div><button className="button button--danger" type="button" onClick={() => setLogoutOpen(true)}><LogOut />退出登录</button></div></section>
        </div>
      </div>
      <ConfirmDialog open={clearOpen} title="清除全部历史记录？" description="理解任务将从当前浏览器移除，记忆中心和结果反馈不会受到影响。" confirmLabel="清除记录" tone="danger" onClose={() => setClearOpen(false)} onConfirm={() => { historyService.clear(); setClearOpen(false); notify('历史记录已清除') }} />
      <ConfirmDialog open={logoutOpen} title="退出当前账号？" description="退出后需要重新登录才能进入智能手语交互平台。" confirmLabel="退出登录" onClose={() => setLogoutOpen(false)} onConfirm={signOut} />
    </div>
  )
}
