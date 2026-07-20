import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Dialog } from '../../components/ui/Dialog'
import { AuthLayout } from './AuthLayout'

export function RegisterPage() {
  const { register } = useAuth()
  const { notify } = useToast()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', account: '', password: '', confirm: '' })
  const [accepted, setAccepted] = useState(false)
  const [visible, setVisible] = useState(false)
  const [termsOpen, setTermsOpen] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (field: keyof typeof form, value: string) => { setForm((current) => ({ ...current, [field]: value })); setError('') }
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (Object.values(form).some((value) => !value.trim())) { setError('请完整填写注册信息'); return }
    if (form.password.length < 6) { setError('密码至少需要 6 个字符'); return }
    if (form.password !== form.confirm) { setError('两次输入的密码不一致'); return }
    if (!accepted) { setError('请先阅读并同意服务条款'); return }
    setLoading(true)
    try {
      const user = await register({ name: form.name, account: form.account, password: form.password })
      notify(`账号创建成功，${user.name}`, '正在进入语义理解空间')
      navigate('/app/workspace', { replace: true })
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '账号创建未完成')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout mode="register">
      <span className="auth-panel__eyebrow">Create your space</span>
      <h1>创建 PCS-SignAI 账号</h1>
      <p>建立属于你的长期表达记忆与理解记录。</p>
      <form className="auth-form auth-form--register" onSubmit={submit} noValidate>
        <div className="auth-form__row">
          <label><span>用户名称</span><input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="你的称呼" autoComplete="name" /></label>
          <label><span>账号</span><input value={form.account} onChange={(event) => update('account', event.target.value)} placeholder="邮箱或用户账号" autoComplete="username" /></label>
        </div>
        <label><span>密码</span><div className="password-field"><input type={visible ? 'text' : 'password'} value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="至少 6 个字符" autoComplete="new-password" /><button type="button" aria-label={visible ? '隐藏密码' : '显示密码'} onClick={() => setVisible((value) => !value)}>{visible ? <EyeOff /> : <Eye />}</button></div></label>
        <label><span>确认密码</span><input type={visible ? 'text' : 'password'} value={form.confirm} onChange={(event) => update('confirm', event.target.value)} placeholder="再次输入密码" autoComplete="new-password" /></label>
        <label className="check-control auth-terms"><input type="checkbox" checked={accepted} onChange={(event) => { setAccepted(event.target.checked); setError('') }} /><i><span /></i><span>我已阅读并同意 <button type="button" onClick={() => setTermsOpen(true)}>服务条款与隐私说明</button></span></label>
        {error && <p className="auth-field-error" role="alert">{error}</p>}
        <button className="button auth-submit" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" />正在创建</> : <>创建并进入<ArrowRight /></>}</button>
      </form>
      <p className="auth-panel__switch">已经拥有账号？<Link to="/login">返回登录</Link></p>
      <Dialog open={termsOpen} onClose={() => setTermsOpen(false)} title="服务条款与隐私说明" description="使用 PCS-SignAI 前请了解以下数据处理原则。" size="medium">
        <div className="terms-content"><h3>数据用途</h3><p>输入内容仅用于生成手语结构与语义理解结果，并用于你主动保存的历史与个性化记忆。</p><h3>本地数据</h3><p>当前账号、历史、记忆和设置保存在浏览器本地空间。你可以随时在系统设置中管理或清除。</p><h3>使用原则</h3><p>请勿上传未经授权的他人隐私内容。系统结果用于辅助理解，不替代医疗、法律或紧急服务判断。</p></div>
        <div className="dialog-actions"><button className="button" type="button" onClick={() => { setAccepted(true); setTermsOpen(false) }}>同意并继续</button></div>
      </Dialog>
    </AuthLayout>
  )
}
