import { useState, type FormEvent } from 'react'
import { Check, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import { authService } from '../../services/authService'
import { Dialog } from '../../components/ui/Dialog'

interface ForgotPasswordDialogProps {
  open: boolean
  onClose: () => void
}

export function ForgotPasswordDialog({ open, onClose }: ForgotPasswordDialogProps) {
  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!account.trim() || !password) { setError('请完整填写账号和新密码'); return }
    if (password.length < 6) { setError('密码至少需要 6 个字符'); return }
    if (password !== confirm) { setError('两次输入的密码不一致'); return }
    setLoading(true)
    await authService.resetPassword(account, password)
    setLoading(false)
    setComplete(true)
  }

  const close = () => {
    onClose()
    window.setTimeout(() => { setAccount(''); setPassword(''); setConfirm(''); setError(''); setComplete(false) }, 250)
  }

  return (
    <Dialog open={open} onClose={close} title={complete ? '密码已更新' : '重设账号密码'} description={complete ? '现在可以使用新密码返回登录。' : '输入账号并设置一组新的登录密码。'} size="small">
      {complete ? (
        <div className="auth-success"><span><Check /></span><p>密码设置完成，新的登录凭据已生效。</p><button className="button" type="button" onClick={close}>返回登录</button></div>
      ) : (
        <form className="auth-dialog-form" onSubmit={submit}>
          <label><span>账号</span><input value={account} onChange={(event) => { setAccount(event.target.value); setError('') }} placeholder="邮箱或用户账号" autoComplete="username" /></label>
          <label><span>新密码</span><div className="password-field"><input type={visible ? 'text' : 'password'} value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} placeholder="至少 6 个字符" autoComplete="new-password" /><button type="button" aria-label={visible ? '隐藏密码' : '显示密码'} onClick={() => setVisible((value) => !value)}>{visible ? <EyeOff /> : <Eye />}</button></div></label>
          <label><span>确认新密码</span><input type={visible ? 'text' : 'password'} value={confirm} onChange={(event) => { setConfirm(event.target.value); setError('') }} placeholder="再次输入新密码" autoComplete="new-password" /></label>
          {error && <p className="auth-field-error" role="alert">{error}</p>}
          <button className="button auth-submit" type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" />正在更新</> : '确认更新密码'}</button>
        </form>
      )}
    </Dialog>
  )
}
