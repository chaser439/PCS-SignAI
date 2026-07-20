import { useMemo, useState } from 'react'
import { ArrowRight, CalendarClock, CheckCircle2, Eye, FileVideo, History, RotateCcw, Search, Trash2 } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useToast } from '../../contexts/ToastContext'
import { historyService } from '../../services/historyService'
import type { HistoryRecord, QualityMode, TaskFeedbackRating } from '../../services/serviceTypes'
import { PageHeader } from '../../components/ui/PageHeader'
import { Dialog } from '../../components/ui/Dialog'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/ProductState'

const directionLabels = { 'sign-to-language': '手语 → 文字 / 语音', 'language-to-sign': '文字 / 语音 → 手语' }
const qualityLabels: Record<QualityMode, string> = { fast: '快速', standard: '标准', high: '高质' }
const feedbackLabels: Record<TaskFeedbackRating, string> = { correct: '结果正确', partial: '部分正确', wrong: '结果有误' }

export function HistoryPage() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const [records, setRecords] = useState(() => historyService.list())
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<HistoryRecord | null>(() => records.find((item) => item.id === searchParams.get('record')) ?? null)
  const [deleting, setDeleting] = useState<HistoryRecord | null>(null)
  const filtered = useMemo(() => records.filter((item) => `${item.inputName}${item.output}${item.intent}`.toLowerCase().includes(query.trim().toLowerCase())), [query, records])

  const open = (item: HistoryRecord) => { setSelected(item); setSearchParams({ record: item.id }) }
  const close = () => { setSelected(null); setSearchParams({}) }
  const repeat = (item: HistoryRecord) => navigate(`/app/workspace?repeat=${item.id}&direction=${item.direction}&quality=${item.quality}`)
  const remove = (item: HistoryRecord) => { historyService.remove(item.id); setRecords(historyService.list()); setDeleting(null); notify('历史记录已删除', item.inputName) }

  return (
    <div className="history-page history-page--simple">
      <PageHeader eyebrow="Interaction History" title="历史记录" description="回看每一次输入、转换方向和输出结果，也可以使用相同配置再次处理。" />
      <div className="history-controls"><label className="product-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索输入文件或输出内容" /></label><span>{filtered.length} 次交互</span></div>
      {filtered.length ? <div className="history-stream">{filtered.map((item) => <article key={item.id}>
        <div className="history-stream__leading"><span><FileVideo /></span><p><small>{item.inputType} · {new Date(item.createdAt).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</small><strong>{item.inputName}</strong><em>{directionLabels[item.direction]}</em></p></div>
        <div className="history-stream__output"><small>输出结果</small><p>{item.output}</p></div>
        <div className="history-stream__meta"><span><strong>{qualityLabels[item.quality]}</strong>质量模式</span><span><strong>{(item.processingMs / 1000).toFixed(1)} 秒</strong>处理时间</span><span><strong>{item.feedback ? feedbackLabels[item.feedback] : '等待确认'}</strong>用户反馈</span></div>
        <div className="history-stream__actions"><button className="button button--ghost" type="button" onClick={() => open(item)}><Eye />查看详情</button><button className="button" type="button" onClick={() => repeat(item)}><RotateCcw />再次处理</button><button className="icon-button" type="button" aria-label="删除记录" onClick={() => setDeleting(item)}><Trash2 /></button></div>
      </article>)}</div> : <EmptyState icon={History} title="没有找到相关记录" description="调整搜索内容，或从智能理解开始一次新的交互。" />}

      <Dialog open={Boolean(selected)} onClose={close} title="交互详情" description={selected?.id} size="large">{selected && <div className="history-detail history-detail--simple">
        <div className="history-detail__result"><span>FINAL OUTPUT</span><h3>{selected.output}</h3><p><CheckCircle2 />{directionLabels[selected.direction]} · {qualityLabels[selected.quality]}模式</p></div>
        <div className="history-detail__facts"><div><FileVideo /><span>输入文件<strong>{selected.inputName}</strong></span></div><div><CalendarClock /><span>处理时间<strong>{new Date(selected.createdAt).toLocaleString('zh-CN')}</strong></span></div><div><History /><span>用户反馈<strong>{selected.feedback ? feedbackLabels[selected.feedback] : '尚未提交'}</strong></span></div></div>
        {selected.tokens.length > 0 && <div className="history-detail__tokens"><small>原始识别 Token</small>{selected.tokens.map((token) => <span key={token}>{token}</span>)}</div>}
        {selected.task?.sourceText && <div className="history-detail__source"><small>输入内容</small><p>{selected.task.sourceText}</p></div>}
        <div className="dialog-actions"><button className="button button--ghost" type="button" onClick={close}>关闭</button><button className="button" type="button" onClick={() => repeat(selected)}>使用相同配置<ArrowRight /></button></div>
      </div>}</Dialog>
      <ConfirmDialog open={Boolean(deleting)} title="删除这条历史记录？" description="该操作不会删除已经保存的个性化记忆。" confirmLabel="删除记录" tone="danger" onClose={() => setDeleting(null)} onConfirm={() => deleting && remove(deleting)} />
    </div>
  )
}
