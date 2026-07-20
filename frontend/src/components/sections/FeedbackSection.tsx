import { useState, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Check, LoaderCircle, LockKeyhole } from 'lucide-react'
import { SectionHeading } from '../ui/SectionHeading'

interface FormData {
  name: string
  contact: string
  type: string
  message: string
}

const initialForm: FormData = { name: '', contact: '', type: '体验反馈', message: '' }

function createFeedbackId() {
  const now = new Date()
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const next = Number(sessionStorage.getItem('pcs-feedback-count') ?? '0') + 1
  sessionStorage.setItem('pcs-feedback-count', String(next))
  return `PCS-${date}-${String(next).padStart(3, '0')}`
}

export function FeedbackSection() {
  const [form, setForm] = useState<FormData>(initialForm)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [feedbackId, setFeedbackId] = useState<string | null>(null)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors: Partial<Record<keyof FormData, string>> = {}
    if (!form.name.trim()) nextErrors.name = '请输入姓名'
    if (!form.contact.trim()) nextErrors.contact = '请输入联系方式'
    if (!form.message.trim()) nextErrors.message = '请输入反馈内容'
    if (form.message.trim().length > 500) nextErrors.message = '反馈内容不能超过 500 字'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setSubmitting(true)
    window.setTimeout(() => {
      const id = createFeedbackId()
      const stored = JSON.parse(sessionStorage.getItem('pcs-feedback-session') ?? '[]') as FormData[]
      sessionStorage.setItem('pcs-feedback-session', JSON.stringify([...stored, form]))
      setFeedbackId(id)
      setForm(initialForm)
      setSubmitting(false)
    }, 850)
  }

  const update = (field: keyof FormData, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  return (
    <section id="contact" className="feedback-section section-shell">
      <div className="container feedback-layout">
        <div className="feedback-section__copy">
          <SectionHeading
            eyebrow="Contact & Feedback"
            title={<>每一条反馈，<br />都让理解更进一步。</>}
            description="体验反馈、问题报告与无障碍建议，将帮助 PCS-SignAI 更贴近真实表达。"
          />
          <div className="feedback-principles">
            <div><span>01</span><p><strong>真实场景</strong>告诉我们表达发生在哪里。</p></div>
            <div><span>02</span><p><strong>尊重差异</strong>个体习惯是理解的重要证据。</p></div>
            <div><span>03</span><p><strong>本地保存</strong>内容只保存在当前会话。</p></div>
          </div>
        </div>

        <div className="feedback-panel">
          <AnimatePresence mode="wait">
            {feedbackId ? (
              <motion.div
                className="feedback-success"
                key="success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                role="status"
              >
                <div className="feedback-success__mark"><Check /></div>
                <span>Feedback stored locally</span>
                <h3>感谢你让理解更进一步。</h3>
                <p>反馈已保存至当前浏览器会话，没有发送至服务器。</p>
                <div className="feedback-success__id"><small>LOCAL FEEDBACK ID</small><strong>{feedbackId}</strong></div>
                <button className="button button--ghost" type="button" onClick={() => setFeedbackId(null)}>继续提交反馈<ArrowRight /></button>
              </motion.div>
            ) : (
              <motion.form className="feedback-form" key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="feedback-form__header">
                  <span>Feedback channel</span><strong><i />LOCAL SESSION</strong>
                </div>
                <div className="form-row">
                  <label>
                    <span>姓名</span>
                    <input
                      value={form.name}
                      onChange={(event) => update('name', event.target.value)}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      placeholder="如何称呼你"
                    />
                    {errors.name && <small className="field-error" id="name-error">{errors.name}</small>}
                  </label>
                  <label>
                    <span>联系方式</span>
                    <input
                      value={form.contact}
                      onChange={(event) => update('contact', event.target.value)}
                      aria-invalid={Boolean(errors.contact)}
                      aria-describedby={errors.contact ? 'contact-error' : undefined}
                      placeholder="邮箱或手机号"
                    />
                    {errors.contact && <small className="field-error" id="contact-error">{errors.contact}</small>}
                  </label>
                </div>
                <label>
                  <span>反馈类型</span>
                  <select value={form.type} onChange={(event) => update('type', event.target.value)}>
                    <option>体验反馈</option>
                    <option>问题报告</option>
                    <option>合作咨询</option>
                    <option>无障碍建议</option>
                  </select>
                </label>
                <label>
                  <span>反馈内容</span>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={(event) => update('message', event.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    placeholder="请描述你的体验、场景或建议"
                  />
                  <span className="character-count">{form.message.length} / 500</span>
                  {errors.message && <small className="field-error" id="message-error">{errors.message}</small>}
                </label>
                <div className="feedback-form__footer">
                  <p><LockKeyhole />反馈内容仅保存在当前浏览器会话中。</p>
                  <button className="button" type="submit" disabled={submitting}>
                    {submitting ? <><LoaderCircle className="spin" />正在保存</> : <>提交反馈<ArrowRight /></>}
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
