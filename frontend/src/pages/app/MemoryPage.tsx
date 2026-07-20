import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { ArrowRight, Brain, CalendarClock, CheckCircle2, Edit3, FileText, FileVideo, Plus, Search, Sparkles, Trash2, UploadCloud, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { memoryService } from '../../services/memoryService'
import type { MemoryEntry } from '../../services/serviceTypes'
import { PageHeader } from '../../components/ui/PageHeader'
import { Dialog } from '../../components/ui/Dialog'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'

const blank = { topic: '', expression: '', meaning: '', confidence: 0.85, source: '用户补充', scene: '日常交流', notes: '', fileNames: [] as string[], userId: '' }

export function MemoryPage() {
  const { user } = useAuth()
  const { notify } = useToast()
  const [entries, setEntries] = useState(() => memoryService.list())
  const [tab, setTab] = useState<'existing' | 'upload'>('existing')
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<MemoryEntry | null>(null)
  const [deleting, setDeleting] = useState<MemoryEntry | null>(null)
  const [form, setForm] = useState(blank)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [upload, setUpload] = useState({ explanation: '', meaning: '', scene: '日常交流', notes: '' })
  const filtered = useMemo(() => entries.filter((item) => `${item.topic}${item.expression}${item.meaning}${item.scene ?? ''}`.toLowerCase().includes(query.trim().toLowerCase())), [entries, query])

  const edit = (item: MemoryEntry) => {
    setEditing(item)
    setForm({ topic: item.topic, expression: item.expression, meaning: item.meaning, confidence: item.confidence, source: item.source, scene: item.scene ?? '日常交流', notes: item.notes ?? '', fileNames: item.fileNames ?? [], userId: item.userId ?? user?.id ?? '' })
  }
  const saveEdit = (event: FormEvent) => {
    event.preventDefault()
    if (!editing || !form.expression.trim() || !form.meaning.trim()) { notify('请完整填写表达和含义', undefined, 'error'); return }
    memoryService.save({ ...form, id: editing.id })
    setEntries(memoryService.list())
    setEditing(null)
    notify('个性化记忆已更新', form.meaning)
  }
  const remove = (item: MemoryEntry) => { memoryService.remove(item.id); setEntries(memoryService.list()); setDeleting(null); notify('记忆已删除', item.expression) }
  const selectFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const next = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name))
    setUploadFiles((current) => [...current, ...next].filter((file, index, all) => all.findIndex((item) => item.name === file.name && item.size === file.size) === index))
    event.target.value = ''
  }
  const submitUpload = (event: FormEvent) => {
    event.preventDefault()
    if (!upload.meaning.trim() || (!upload.explanation.trim() && !uploadFiles.length)) { notify('请提供手势内容和含义', '可以上传视频或填写文字说明', 'error'); return }
    memoryService.save({
      topic: '主动上传',
      expression: upload.explanation.trim() || uploadFiles.map((file) => file.name).join('、'),
      meaning: upload.meaning.trim(),
      confidence: 0.85,
      source: '主动上传',
      scene: upload.scene,
      notes: upload.notes.trim(),
      fileNames: uploadFiles.map((file) => file.name),
      userId: user?.id,
    })
    setEntries(memoryService.list())
    setUploadFiles([])
    setUpload({ explanation: '', meaning: '', scene: '日常交流', notes: '' })
    setTab('existing')
    notify('手语习惯已加入记忆中心', '新的记忆将用于初始个性化')
  }

  return (
    <div className="memory-center-page">
      <PageHeader eyebrow="Personal Memory Center" title="记忆中心" description="管理已经形成的表达记忆，或主动提供个人手语习惯，让首次使用也具备更贴近你的理解能力。" />
      <section className="memory-paths"><div><span><UploadCloud /></span><p><strong>主动上传用于初始个性化</strong><small>提供视频、文字含义和使用场景，建立第一批个人表达记忆。</small></p></div><i /><div><span><Sparkles /></span><p><strong>结果反馈用于持续个性化</strong><small>每次交互后的确认和修正，会不断补充特殊手势与表达习惯。</small></p></div></section>
      <div className="memory-center-tabs" role="tablist"><button className={tab === 'existing' ? 'active' : ''} type="button" onClick={() => setTab('existing')}><Brain />现有记忆<span>{entries.length}</span></button><button className={tab === 'upload' ? 'active' : ''} type="button" onClick={() => setTab('upload')}><UploadCloud />记忆上传</button></div>

      {tab === 'existing' ? <section className="memory-existing">
        <header><label className="product-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索手语表达、个性化词义或使用场景" /></label><p>{filtered.length} 条个性化记忆</p></header>
        <div className="memory-list">{filtered.map((item) => <article key={item.id}><div className="memory-list__icon"><Brain /></div><div className="memory-list__content"><header><span>{item.topic}</span><small><CalendarClock />最近更新 {new Date(item.updatedAt).toLocaleDateString('zh-CN')}</small></header><h2>{item.expression}</h2><p>{item.meaning}</p><footer><span>{item.scene ?? '日常交流'}</span><span>{item.source}</span>{item.fileNames?.length ? <span><FileVideo />{item.fileNames.length} 个视频</span> : null}</footer></div><div className="memory-list__confidence"><strong>{Math.round(item.confidence * 100)}%</strong><span>可信度</span></div><div className="memory-list__actions"><button className="icon-button" type="button" aria-label="编辑记忆" onClick={() => edit(item)}><Edit3 /></button><button className="icon-button" type="button" aria-label="删除记忆" onClick={() => setDeleting(item)}><Trash2 /></button></div></article>)}</div>
      </section> : <section className="memory-upload"><div className="memory-upload__intro"><span><Plus /></span><h2>添加你的手语习惯</h2><p>视频和说明只保存在当前浏览器。这里记录的是个人表达差异，不会触发训练或远程上传。</p><div><CheckCircle2 />支持一次选择多个手语视频</div><div><CheckCircle2 />可仅用文字描述特殊手势</div><div><CheckCircle2 />保存后立即进入现有记忆列表</div></div><form onSubmit={submitUpload}>
        <label className="memory-file-drop"><input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-m4v" multiple onChange={selectFiles} /><UploadCloud /><strong>上传手语视频</strong><span>点击选择或一次加入多个文件</span><small>MP4、WebM、MOV、M4V</small></label>
        {uploadFiles.length > 0 && <div className="memory-upload-files">{uploadFiles.map((file) => <div key={`${file.name}-${file.size}`}><FileVideo /><p><strong>{file.name}</strong><span>{(file.size / 1024 / 1024).toFixed(2)} MB</span></p><button className="icon-button" type="button" aria-label="移除文件" onClick={() => setUploadFiles((current) => current.filter((item) => item !== file))}><X /></button></div>)}</div>}
        <label><span>文字说明</span><textarea rows={3} value={upload.explanation} onChange={(event) => setUpload({ ...upload, explanation: event.target.value })} placeholder="描述动作方式、幅度或与常见表达的差异" /></label>
        <div className="form-row"><label><span>手势含义</span><input value={upload.meaning} onChange={(event) => setUpload({ ...upload, meaning: event.target.value })} placeholder="这组手势实际表达什么" /></label><label><span>使用场景</span><select value={upload.scene} onChange={(event) => setUpload({ ...upload, scene: event.target.value })}><option>日常交流</option><option>家庭沟通</option><option>工作学习</option><option>医疗沟通</option><option>紧急求助</option><option>其他场景</option></select></label></div>
        <label><span>补充备注</span><textarea rows={3} value={upload.notes} onChange={(event) => setUpload({ ...upload, notes: event.target.value })} placeholder="可以补充表情习惯、动作节奏或需要注意的细节" /></label>
        <div className="memory-upload__footer"><p><FileText />当前选择 {uploadFiles.length} 个文件</p><button className="button" type="submit">保存到记忆中心<ArrowRight /></button></div>
      </form></section>}

      <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} title="编辑个性化记忆" description="更新后的内容会用于后续交互结果。" size="medium"><form className="memory-form memory-edit-form" onSubmit={saveEdit}><div className="form-row"><label><span>记忆类型</span><input value={form.topic} onChange={(event) => setForm({ ...form, topic: event.target.value })} /></label><label><span>使用场景</span><input value={form.scene} onChange={(event) => setForm({ ...form, scene: event.target.value })} /></label></div><label><span>手语表达</span><input value={form.expression} onChange={(event) => setForm({ ...form, expression: event.target.value })} /></label><label><span>个性化含义</span><textarea rows={4} value={form.meaning} onChange={(event) => setForm({ ...form, meaning: event.target.value })} /></label><label><span>备注</span><textarea rows={3} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} /></label><div className="dialog-actions"><button className="button button--ghost" type="button" onClick={() => setEditing(null)}>取消</button><button className="button" type="submit">保存修改</button></div></form></Dialog>
      <ConfirmDialog open={Boolean(deleting)} title="删除这条个性化记忆？" description="删除后，后续交互将不再使用这条表达习惯。" confirmLabel="删除记忆" tone="danger" onClose={() => setDeleting(null)} onConfirm={() => deleting && remove(deleting)} />
    </div>
  )
}
