import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, UserRound } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { AuthLayout } from './AuthLayout'
import { ForgotPasswordDialog } from './ForgotPasswordDialog'

export function LoginPage() {
  const { user, login } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [visible, setVisible] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!account.trim() || !password.trim()) { setError('请输入账号和密码'); return }
    setLoading(true)
    try {
      const next = await login({ account, password, remember })
      notify(`欢迎回来，${next.name}`, '个性化理解服务已就绪')
      const target = (location.state as { from?: string } | null)?.from ?? '/app/workspace'
      navigate(target, { replace: true })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '登录未完成，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout mode="login">
      <span className="auth-panel__eyebrow">Secure access</span>
      <h1>{user ? `欢迎回来，${user.name}` : '登录 PCS-SignAI'}</h1>
      <p>进入你的个性化手语语义理解空间。</p>
      <form className="auth-form" onSubmit={submit} noValidate>
        <label><span>账号</span><div className="auth-input"><UserRound /><input value={account} onChange={(event) => { setAccount(event.target.value); setError('') }} placeholder="邮箱或用户账号" autoComplete="username" /></div></label>
        <label><span>密码</span><div className="auth-input password-field"><LockKeyhole /><input type={visible ? 'text' : 'password'} value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} placeholder="输入登录密码" autoComplete="current-password" /><button type="button" aria-label={visible ? '隐藏密码' : '显示密码'} onClick={() => setVisible((value) => !value)}>{visible ? <EyeOff /> : <Eye />}</button></div></label>
        <div className="auth-form__options"><label className="check-control"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} /><i><span /></i>保持登录状态</label><button className="text-button" type="button" onClick={() => setForgotOpen(true)}>忘记密码</button></div>
        {error && <p className="auth-field-error" role="alert">{error}</p>}
        <button className="button auth-submit" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" />正在登录</> : <>进入系统<ArrowRight /></>}</button>
      </form>
      <p className="auth-panel__switch">还没有账号？<Link to="/register">创建账号</Link></p>
      <div className="auth-panel__trust"><span><i />本地加密会话</span><span>Schema v1.0</span></div>
      <ForgotPasswordDialog open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </AuthLayout>
  )
}
