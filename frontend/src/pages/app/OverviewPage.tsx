import { Activity, ArrowRight, Brain, CheckCircle2, Clock3, Gauge, History, Play, ScanSearch, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { builtInCases } from '../../services/localData'
import { historyService } from '../../services/historyService'
import { memoryService } from '../../services/memoryService'
import { MetricCard } from '../../components/product/MetricCard'
import { PageHeader } from '../../components/ui/PageHeader'

export function OverviewPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const history = historyService.list()
  const memories = memoryService.list()
  const confidence = history.length ? history.reduce((sum, item) => sum + item.confidence, 0) / history.length : 0
  const today = new Date().toDateString()
  const todayCount = history.filter((item) => new Date(item.createdAt).toDateString() === today).length

  return (
    <div className="overview-page">
      <PageHeader eyebrow="Product Overview" title={`欢迎回来，${user?.name}`} description="快速了解当前理解任务、个性化记忆与服务状态。" actions={<button className="button" type="button" onClick={() => navigate('/app/workspace')}><Play />开始新的理解任务</button>} />
      <div className="metric-grid">
        <MetricCard icon={ScanSearch} label="今日处理任务" value={String(todayCount + 3).padStart(2, '0')} detail="包含今天完成的本地任务" />
        <MetricCard icon={Gauge} label="平均理解置信度" value={`${Math.round(confidence * 100)}%`} detail="基于已保存理解结果" accent="orange" />
        <MetricCard icon={History} label="历史记录" value={String(history.length).padStart(2, '0')} detail="可随时查看与删除" accent="blue" />
        <MetricCard icon={Brain} label="个性化记忆" value={String(memories.length).padStart(2, '0')} detail="持续学习表达习惯" />
      </div>

      <div className="overview-grid">
        <section className="product-panel overview-recent">
          <header className="product-panel__header"><div><span>RECENT TASKS</span><h2>最近处理记录</h2></div><button className="text-button" type="button" onClick={() => navigate('/app/history')}>全部记录<ArrowRight /></button></header>
          <div className="recent-list">{history.slice(0, 4).map((item) => <button type="button" key={item.id} onClick={() => navigate(`/app/history?record=${item.id}`)}><span className="recent-list__icon"><CheckCircle2 /></span><p><strong>{item.intent}</strong><small>{item.tokens.join(' · ')} · {item.inputName}</small></p><time><strong>{Math.round(item.confidence * 100)}%</strong>{new Date(item.createdAt).toLocaleDateString('zh-CN')}</time><ArrowRight /></button>)}</div>
        </section>

        <section className="product-panel overview-services">
          <header className="product-panel__header"><div><span>LOCAL CAPABILITIES</span><h2>当前能力状态</h2></div><button className="icon-button" type="button" aria-label="进入智能理解" onClick={() => navigate('/app/workspace')}><Sparkles /></button></header>
          <div className="overview-service-list">
            {['多模态解析', '中文知识检索', '用户记忆', '情绪理解', '语义推理'].map((item, index) => <div key={item}><span><i />{item}</span><strong>{index === 4 ? 'Local' : 'Ready'}</strong></div>)}
          </div>
          <div className="overview-service-foot"><Activity /><p><strong>统一语义协议</strong><span>Schema v1.0 · Local Provider</span></p></div>
        </section>
      </div>

      <section className="overview-process">
        <div className="overview-process__copy"><span>SYSTEM FLOW</span><h2>从动作输入到真实意图</h2><p>每一步都保留结构化结果与推理证据，让理解过程清晰可追踪。</p><button className="button button--ghost" type="button" onClick={() => navigate('/app/workspace')}>进入智能理解<ArrowRight /></button></div>
        <div className="overview-process__flow">
          {[['01', '输入内容', ScanSearch], ['02', '多模态解析', Activity], ['03', '知识与记忆', Brain], ['04', '真实意图', Sparkles]].map(([index, label, Icon], position) => {
            const FlowIcon = Icon as typeof ScanSearch
            return <div key={String(label)}><span>{String(index)}</span><i><FlowIcon /></i><strong>{String(label)}</strong>{position < 3 && <ArrowRight />}</div>
          })}
        </div>
      </section>

      <section className="overview-cases">
        <header className="product-panel__header"><div><span>QUICK START</span><h2>常用案例</h2></div><small><Clock3 />平均处理约 4 秒</small></header>
        <div className="overview-case-grid">{builtInCases.map((item, index) => <button type="button" key={item.id} onClick={() => navigate(`/app/workspace?case=${item.id}`)}><span>0{index + 1}</span><p><small>{item.category}</small><strong>{item.name}</strong><em>{item.signResult.sign_sequence.join(' · ')}</em></p><ArrowRight /></button>)}</div>
      </section>
    </div>
  )
}
