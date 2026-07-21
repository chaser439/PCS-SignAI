import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight, BookOpen, Bot, BrainCircuit, Camera, Check, CheckCircle2, Clipboard, Download, FileAudio, FileText,
  FileVideo, FolderOpen, Gauge, Hand, HeartPulse, LoaderCircle, Pause, Play,
  RotateCcw, Sparkles, Square, UploadCloud, UserRound, Video, Volume2, WandSparkles, X,
} from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { builtInCases } from '../../services/localData'
import { feedbackService } from '../../services/feedbackService'
import { historyService } from '../../services/historyService'
import { interactionService } from '../../services/interactionService'
import { settingsService } from '../../services/settingsService'
import type {
  AnalysisTask, AvatarId, ConversionDirection, InteractionResult, QualityMode, SemanticResult, TaskFeedbackRating,
} from '../../services/serviceTypes'
import { createId } from '../../services/storage'
import { PageHeader } from '../../components/ui/PageHeader'

const qualityOptions: Array<{ id: QualityMode; label: string; detail: string; timing: string }> = [
  { id: 'fast', label: '快速', detail: '优先响应速度，适合即时沟通', timing: '约 2 秒' },
  { id: 'standard', label: '标准', detail: '兼顾语义精度与自然表达', timing: '约 4 秒' },
  { id: 'high', label: '高质', detail: '强化语境、表情与动作细节', timing: '约 7 秒' },
]

const avatars: Array<{ id: AvatarId; name: string; role: string; tone: string }> = [
  { id: 'qinghe', name: '清和', role: '自然亲和', tone: 'jade' },
  { id: 'mingyu', name: '明屿', role: '清晰稳重', tone: 'blue' },
  { id: 'anran', name: '安然', role: '柔和细腻', tone: 'warm' },
]

const signSteps = [
  ['文件解析', '检查画面、帧率与动作完整度'],
  ['手语识别', '提取手部动作、表情和身体姿态'],
  ['语义理解', '结合中文知识与个人表达记忆'],
  ['AI 文本梳理', '调整语序并补充必要上下文'],
  ['结果生成', '整理文字、语音与可下载内容'],
]

const avatarSteps = [
  ['内容解析', '读取文字或语音中的关键信息'],
  ['AI 语义梳理', '压缩冗余并保持原始表达意图'],
  ['手语表达规划', '生成自然的手语语序与动作序列'],
  ['虚拟人编排', '同步手势、面部表情和身体姿态'],
  ['结果生成', '准备虚拟人播放与视频输出'],
]

const differenceOptions = ['特殊手势', '表达习惯', '特定词义', '动作幅度', '表情习惯']

function formatDuration(seconds: number) {
  const minute = Math.floor(seconds / 60)
  const second = Math.floor(seconds % 60)
  return `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`
}

function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 500)
}

function AvatarFigure({ avatar, playing }: { avatar: AvatarId; playing: boolean }) {
  return (
    <div className={`virtual-avatar virtual-avatar--${avatar} ${playing ? 'is-playing' : ''}`} aria-label="虚拟人手语播放画面">
      <div className="virtual-avatar__halo" />
      <div className="virtual-avatar__person">
        <span className="virtual-avatar__head"><i /><i /><em /></span>
        <span className="virtual-avatar__body" />
        <span className="virtual-avatar__arm virtual-avatar__arm--left"><i /></span>
        <span className="virtual-avatar__arm virtual-avatar__arm--right"><i /></span>
      </div>
      <div className="virtual-avatar__floor" />
    </div>
  )
}

function SemanticEvidence({ semantic }: { semantic: SemanticResult }) {
  return (
    <section className="result-evidence" aria-label="语义增强证据">
      <article className="evidence-card">
        <header className="evidence-card__header">
          <span><BookOpen /></span>
          <div>
            <strong>中文文化知识检索</strong>
            <p>RAG 为本次语义理解提供的中文文化和场景依据</p>
          </div>
        </header>
        {semantic.rag_hits.length > 0 ? (
          <ul>
            {semantic.rag_hits.map((hit, index) => (
              <li key={hit.id || `rag-${index}`}>
                <span>{hit.title}</span>
                <small>
                  {hit.domain}
                  {hit.score > 0 ? ` · 匹配度 ${Math.round(hit.score * 100)}%` : ''}
                </small>
              </li>
            ))}
          </ul>
        ) : <p className="evidence-card__empty">本次没有检索到额外的文化知识。</p>}
      </article>

      <article className="evidence-card">
        <header className="evidence-card__header">
          <span><BrainCircuit /></span>
          <div>
            <strong>个性化记忆</strong>
            <p>当前用户的历史表达对本次语义判断提供的补充</p>
          </div>
        </header>
        {semantic.memory_hits.length > 0 ? (
          <ul>
            {semantic.memory_hits.map((hit, index) => (
              <li key={`${hit.id || 'memory'}-${index}`}>
                <span>{hit.meaning}</span>
                <small>
                  {hit.id}
                  {hit.score > 0 ? ` · 可信度 ${Math.round(hit.score * 100)}%` : ''}
                </small>
              </li>
            ))}
          </ul>
        ) : <p className="evidence-card__empty">本次没有命中该用户的历史表达记忆。</p>}
      </article>
    </section>
  )
}

interface FeedbackPanelProps {
  task: AnalysisTask
  onSubmitted: (rating: TaskFeedbackRating) => void
}

function FeedbackPanel({ task, onSubmitted }: FeedbackPanelProps) {
  const { notify } = useToast()
  const [rating, setRating] = useState<TaskFeedbackRating | null>(() => feedbackService.forTask(task.id)?.rating ?? null)
  const [correction, setCorrection] = useState(() => feedbackService.forTask(task.id)?.correction ?? '')
  const [differences, setDifferences] = useState<string[]>(() => feedbackService.forTask(task.id)?.differences ?? [])
  const [submitting, setSubmitting] = useState(false)
  const [complete, setComplete] = useState(Boolean(feedbackService.forTask(task.id)))

  const toggleDifference = (value: string) => setDifferences((current) => current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  const submit = async () => {
    if (!rating) { notify('请选择结果评价', '选择正确程度后即可提交', 'error'); return }
    setSubmitting(true)
    await feedbackService.submit({ taskId: task.id, userId: task.userId, rating, correction: correction.trim(), differences })
    historyService.setFeedback(task.id, rating)
    setSubmitting(false)
    setComplete(true)
    onSubmitted(rating)
    notify('反馈已用于更新个性化记录', '后续结果会参考本次修正')
  }

  if (complete) {
    return <div className="result-feedback result-feedback--complete"><CheckCircle2 /><div><strong>感谢你的确认</strong><p>本次反馈已与当前任务和用户关联，并保存到个性化记录中。</p></div><button className="text-button" type="button" onClick={() => setComplete(false)}>继续补充</button></div>
  }

  return (
    <section className="result-feedback">
      <header><div><span>RESULT FEEDBACK</span><h3>这个结果符合你的表达吗？</h3></div><p>你的修正会帮助系统理解个人手势和语义差异。</p></header>
      <div className="feedback-rating" role="group" aria-label="结果评价">
        {([['correct', '结果正确'], ['partial', '部分正确'], ['wrong', '结果有误']] as const).map(([value, label]) => <button className={rating === value ? 'active' : ''} type="button" key={value} onClick={() => setRating(value)}><span>{rating === value && <Check />}</span>{label}</button>)}
      </div>
      <div className="feedback-differences"><span>本次差异涉及</span><div>{differenceOptions.map((item) => <button className={differences.includes(item) ? 'active' : ''} type="button" key={item} onClick={() => toggleDifference(item)}>{item}</button>)}</div></div>
      <label className="feedback-correction"><span>补充正确表达</span><textarea rows={3} value={correction} onChange={(event) => setCorrection(event.target.value)} placeholder="例如：这组动作在我的表达习惯中表示……" /></label>
      <div className="result-feedback__footer"><p>反馈仅保存在当前浏览器，并用于你的持续个性化。</p><button className="button" type="button" disabled={submitting} onClick={submit}>{submitting ? <><LoaderCircle className="spin" />正在保存</> : <>提交反馈<ArrowRight /></>}</button></div>
    </section>
  )
}

export function WorkspacePage() {
  const { user } = useAuth()
  const { notify } = useToast()
  const [searchParams] = useSearchParams()
  const preferences = settingsService.get()
  const repeated = historyService.find(searchParams.get('repeat') ?? '')
  const requestedCase = builtInCases.find((item) => item.id === searchParams.get('case')) ?? builtInCases[0]
  const requestedDirection = searchParams.get('direction') as ConversionDirection | null
  const requestedQuality = searchParams.get('quality') as QualityMode | null
  const [direction, setDirection] = useState<ConversionDirection>(requestedDirection ?? repeated?.direction ?? preferences.defaultDirection)
  const [quality, setQuality] = useState<QualityMode>(requestedQuality ?? repeated?.quality ?? preferences.defaultQuality)
  const [sourceMode, setSourceMode] = useState<'record' | 'upload'>(preferences.defaultInput)
  const [avatar, setAvatar] = useState<AvatarId>(repeated?.task?.avatarId ?? preferences.defaultAvatar)
  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [videoDuration, setVideoDuration] = useState(0)
  const [voiceFile, setVoiceFile] = useState<File | null>(null)
  const [sourceText, setSourceText] = useState(repeated?.task?.sourceText ?? '')
  const [dragging, setDragging] = useState(false)
  const [sampleLoaded, setSampleLoaded] = useState(Boolean(searchParams.get('case')))
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'ready'>('idle')
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [cameraNote, setCameraNote] = useState('摄像头将在开始录制后启用')
  const cameraRef = useRef<HTMLVideoElement>(null)
  const cameraStreamRef = useRef<MediaStream | null>(null)
  const [processing, setProcessing] = useState(false)
  const [activeStep, setActiveStep] = useState(-1)
  const [result, setResult] = useState<InteractionResult | null>(null)
  const [task, setTask] = useState<AnalysisTask | null>(null)
  const [speaking, setSpeaking] = useState(false)
  const [avatarPlaying, setAvatarPlaying] = useState(false)
  const [downloadingVideo, setDownloadingVideo] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState<TaskFeedbackRating | null>(null)

  const steps = direction === 'sign-to-language' ? signSteps : avatarSteps
  const selectedAvatar = avatars.find((item) => item.id === avatar) ?? avatars[0]
  const inputReady = direction === 'sign-to-language'
    ? Boolean(file || sampleLoaded || recordingState === 'ready')
    : Boolean(sourceText.trim() || voiceFile)

  const inputSummary = useMemo(() => {
    if (direction === 'language-to-sign') return sourceText.trim() || voiceFile?.name || '等待文字或语音输入'
    if (file) return file.name
    if (sampleLoaded) return `${requestedCase.name}素材.mp4`
    if (recordingState === 'ready') return `实时录制 · ${formatDuration(recordingSeconds)}`
    return '等待视频输入'
  }, [direction, file, recordingSeconds, recordingState, requestedCase.name, sampleLoaded, sourceText, voiceFile])

  useEffect(() => {
    if (recordingState !== 'recording') return
    const timer = window.setInterval(() => setRecordingSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [recordingState])

  useEffect(() => () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop())
    if (videoUrl) URL.revokeObjectURL(videoUrl)
  }, [videoUrl])

  const resetOutput = () => { setResult(null); setTask(null); setActiveStep(-1); setFeedbackRating(null) }
  const changeDirection = (next: ConversionDirection) => { setDirection(next); resetOutput() }

  const selectVideo = (next: File) => {
    const extension = next.name.split('.').pop()?.toLowerCase()
    if (!['mp4', 'webm', 'mov', 'm4v'].includes(extension ?? '')) { notify('无法读取这个视频格式', '请选择 MP4、WebM、MOV 或 M4V 文件', 'error'); return }
    if (videoUrl) URL.revokeObjectURL(videoUrl)
    setFile(next)
    setVideoUrl(URL.createObjectURL(next))
    setVideoDuration(0)
    setSampleLoaded(false)
    resetOutput()
    notify('视频已准备', `${next.name} · ${(next.size / 1024 / 1024).toFixed(2)} MB`)
  }

  const onVideoInput = (event: ChangeEvent<HTMLInputElement>) => { const next = event.target.files?.[0]; if (next) selectVideo(next); event.target.value = '' }
  const onDrop = (event: DragEvent) => { event.preventDefault(); setDragging(false); const next = event.dataTransfer.files[0]; if (next) selectVideo(next) }
  const removeVideo = () => { if (videoUrl) URL.revokeObjectURL(videoUrl); setVideoUrl(null); setFile(null); setVideoDuration(0); resetOutput() }

  const startRecording = async () => {
    if (recordingState === 'paused') { setRecordingState('recording'); setCameraNote('录制进行中'); return }
    setRecordingSeconds(0)
    setRecordingState('recording')
    setCameraNote('正在连接摄像头')
    resetOutput()
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
      cameraStreamRef.current = stream
      if (cameraRef.current) cameraRef.current.srcObject = stream
      setCameraNote('录制进行中，请保持上半身位于画面中央')
    } catch {
      setCameraNote('摄像头权限未开启，当前录制仍可用于页面交互')
      notify('未获得摄像头权限', '可以继续体验录制流程，或切换到视频上传', 'info')
    }
  }

  const finishRecording = () => {
    setRecordingState('ready')
    setCameraNote('录制内容已准备，可以开始分析')
    notify('录制已完成', `${formatDuration(recordingSeconds)} · 已保存到当前任务`)
  }

  const runInteraction = async () => {
    if (!inputReady || !user) { notify('请先准备输入内容', direction === 'sign-to-language' ? '完成录制或选择视频文件' : '输入文字或选择语音文件', 'error'); return }
    const semanticUserId = user.account.trim()
      ? `account:${user.account.trim().toLowerCase()}`
      : user.id
    resetOutput()
    setProcessing(true)
    setActiveStep(0)
    const started = performance.now()
    for (let index = 0; index < steps.length; index += 1) {
      setActiveStep(index)
      await new Promise((resolve) => window.setTimeout(resolve, quality === 'fast' ? 300 : quality === 'high' ? 520 : 400))
    }
    try {
      const nextResult = await interactionService.process({
        userId: semanticUserId,
        direction,
        quality,
        inputName: inputSummary,
        inputType: direction === 'sign-to-language' ? (sourceMode === 'record' ? '实时录制' : '视频文件') : (voiceFile && !sourceText.trim() ? '语音文件' : '文字输入'),
        caseId: requestedCase.id,
        file: file ?? undefined,
        sourceText: sourceText || (voiceFile ? `请将语音文件 ${voiceFile.name} 转换为自然手语表达` : undefined),
        avatarId: avatar,
      })
      const nextTask: AnalysisTask = {
        id: createId('TSK'),
        createdAt: new Date().toISOString(),
        inputName: inputSummary,
        inputType: direction === 'sign-to-language' ? (sourceMode === 'record' ? '实时录制' : '视频文件') : (voiceFile && !sourceText.trim() ? '语音文件' : '文字输入'),
        caseId: requestedCase.id,
        userId: user.id,
        direction,
        quality,
        processingMs: Math.round(performance.now() - started),
        sourceText: direction === 'language-to-sign' ? nextResult.baselineText : undefined,
        polishedText: nextResult.polishedText,
        avatarId: direction === 'language-to-sign' ? avatar : undefined,
        avatarGloss: nextResult.avatarGloss,
        signResult: nextResult.signResult,
        semanticResult: nextResult.semanticResult,
      }
      historyService.add(nextTask)
      setResult(nextResult)
      setTask(nextTask)
      setActiveStep(steps.length)
      notify('交互结果已生成', direction === 'sign-to-language' ? 'AI 语义助手已完成文字梳理' : `${selectedAvatar.name}已准备手语表达`)
    } catch {
      notify('本次处理没有完成', '输入内容已保留，可以重新开始', 'error')
    } finally {
      setProcessing(false)
    }
  }

  const copyResult = async () => {
    if (!result) return
    try { await navigator.clipboard.writeText(result.polishedText); notify('结果已复制') }
    catch { notify('无法访问剪贴板', '请检查浏览器权限后重试', 'error') }
  }

  const playSpeech = () => {
    if (!result || !('speechSynthesis' in window)) { notify('当前浏览器无法播放语音', undefined, 'error'); return }
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(result.polishedText)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.95
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const playAvatar = () => {
    setAvatarPlaying(false)
    window.requestAnimationFrame(() => setAvatarPlaying(true))
    window.setTimeout(() => setAvatarPlaying(false), 4600)
  }

  const downloadAvatar = async () => {
    if (!result) return
    setDownloadingVideo(true)
    notify('正在生成虚拟人视频', '视频将在当前设备完成整理', 'info')
    const artifact = await interactionService.createAvatarVideo(result, selectedAvatar.name)
    saveBlob(artifact.blob, `PCS-SignAI-${selectedAvatar.name}-result.${artifact.extension}`)
    setDownloadingVideo(false)
    notify('虚拟人视频已下载')
  }

  return (
    <div className="interaction-page">
      <PageHeader eyebrow="Multimodal AI Interaction" title="智能手语交互" description="在手语、文字与语音之间自然转换，AI 语义助手会整理上下文，并把清晰结果回传给你。" actions={result && <button className="button button--ghost" type="button" onClick={resetOutput}><RotateCcw />新建交互</button>} />

      <section className="interaction-config">
        <div className="direction-picker" role="group" aria-label="转换方向">
          <button className={direction === 'sign-to-language' ? 'active' : ''} type="button" onClick={() => changeDirection('sign-to-language')}><span><Hand /></span><p><strong>手语 → 文字 / 语音</strong><small>识别动作并由 AI 整理为自然中文</small></p><Check /></button>
          <button className={direction === 'language-to-sign' ? 'active' : ''} type="button" onClick={() => changeDirection('language-to-sign')}><span><FileText /></span><p><strong>文字 / 语音 → 手语</strong><small>梳理内容并生成虚拟人手语表达</small></p><Check /></button>
        </div>
        <div className="quality-picker"><div><Gauge /><p><strong>质量模式</strong><span>选择本次交互的速度与细节层级</span></p></div><div>{qualityOptions.map((item) => <button className={quality === item.id ? 'active' : ''} type="button" key={item.id} onClick={() => setQuality(item.id)}><strong>{item.label}</strong><span>{item.detail}</span><small>{item.timing}</small></button>)}</div></div>
      </section>

      <section className="interaction-composer">
        <header><div><span>INPUT</span><h2>{direction === 'sign-to-language' ? '准备一段手语视频' : '输入需要转换的内容'}</h2></div>{direction === 'sign-to-language' && <div className="segmented-control interaction-source-tabs"><button className={sourceMode === 'record' ? 'active' : ''} type="button" onClick={() => setSourceMode('record')}><Camera />实时录制</button><button className={sourceMode === 'upload' ? 'active' : ''} type="button" onClick={() => setSourceMode('upload')}><UploadCloud />上传视频</button></div>}</header>

        <AnimatePresence mode="wait">
          {direction === 'sign-to-language' ? (
            <motion.div key={`sign-${sourceMode}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {sourceMode === 'record' ? <div className="camera-input"><div className="camera-preview"><video ref={cameraRef} autoPlay muted playsInline /><div className="camera-frame"><i /><i /><i /><i /></div><div className="camera-status"><span className={recordingState === 'recording' ? 'recording' : ''}><i />{recordingState === 'recording' ? '正在录制' : recordingState === 'paused' ? '录制已暂停' : recordingState === 'ready' ? '录制已完成' : '摄像头预览'}</span><strong>{formatDuration(recordingSeconds)}</strong></div><p><Video />{cameraNote}</p></div><div className="recording-controls"><button className="button" type="button" disabled={recordingState === 'recording'} onClick={startRecording}><Play />{recordingState === 'paused' ? '继续录制' : recordingState === 'ready' ? '重新录制' : '开始录制'}</button><button className="icon-command" type="button" disabled={recordingState !== 'recording'} onClick={() => { setRecordingState('paused'); setCameraNote('录制已暂停') }}><Pause /><span>暂停</span></button><button className="icon-command" type="button" disabled={!['recording', 'paused'].includes(recordingState)} onClick={finishRecording}><Square /><span>结束</span></button></div></div> : <div className="video-upload-area">{videoUrl ? <div className="uploaded-video"><video src={videoUrl} controls onLoadedMetadata={(event) => setVideoDuration(event.currentTarget.duration)} /><div><FileVideo /><p><strong>{file?.name}</strong><span>{file && (file.size / 1024 / 1024).toFixed(2)} MB · {videoDuration ? formatDuration(videoDuration) : '正在读取时长'}</span></p><label className="button button--ghost"><input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-m4v" onChange={onVideoInput} />重新选择</label><button className="icon-button" type="button" aria-label="移除视频" onClick={removeVideo}><X /></button></div></div> : sampleLoaded ? <div className="sample-video-ready"><span><FileVideo /></span><div><small>已载入内容</small><h3>{requestedCase.name}素材.mp4</h3><p>{requestedCase.description}</p></div><button className="button button--ghost" type="button" onClick={() => setSampleLoaded(false)}>更换视频</button></div> : <label className={`interaction-dropzone ${dragging ? 'active' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={onDrop}><input type="file" accept="video/mp4,video/webm,video/quicktime,video/x-m4v" onChange={onVideoInput} /><span><UploadCloud /></span><h3>拖拽手语视频到这里</h3><p>也可以点击选择本地文件</p><small>MP4、WebM、MOV、M4V · 建议画面包含完整上半身</small><em><FolderOpen />选择视频</em></label>}</div>}
            </motion.div>
          ) : (
            <motion.div className="language-input" key="language" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <label className="language-textarea"><span><WandSparkles />文字内容</span><textarea rows={5} value={sourceText} onChange={(event) => { setSourceText(event.target.value); resetOutput() }} placeholder="输入希望转换为手语的内容，AI 会先整理语序和上下文……" /><small>{sourceText.length} / 500</small></label>
              <div className="voice-upload"><div><FileAudio /><p><strong>也可以上传语音文件</strong><span>{voiceFile ? voiceFile.name : '支持 MP3、WAV、M4A'}</span></p></div><label className="button button--ghost"><input type="file" accept="audio/mpeg,audio/wav,audio/mp4,audio/x-m4a" onChange={(event) => { setVoiceFile(event.target.files?.[0] ?? null); event.target.value = ''; resetOutput() }} />{voiceFile ? '重新选择' : '选择语音'}</label>{voiceFile && <button className="icon-button" type="button" aria-label="移除语音" onClick={() => setVoiceFile(null)}><X /></button>}</div>
              <div className="avatar-picker"><header><div><UserRound /><p><strong>选择虚拟人</strong><span>动作、表情和姿态会随表达同步</span></p></div></header><div>{avatars.map((item) => <button className={avatar === item.id ? 'active' : ''} type="button" key={item.id} onClick={() => setAvatar(item.id)}><span className={`avatar-portrait avatar-portrait--${item.tone}`}><i /><em /></span><p><strong>{item.name}</strong><small>{item.role}</small></p><Check /></button>)}</div></div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="composer-footer"><div><span><i />Local Provider</span><p>{inputReady ? <><CheckCircle2 />输入已准备：{inputSummary}</> : direction === 'sign-to-language' ? '完成录制或选择视频后即可开始' : '输入文字或上传语音后即可开始'}</p></div><button className="button interaction-start" type="button" disabled={processing || !inputReady} onClick={runInteraction}>{processing ? <><LoaderCircle className="spin" />AI 正在理解</> : <>开始处理<Sparkles /></>}</button></footer>
      </section>

      {(processing || result) && <section className="ai-conversation"><header><span><Bot /></span><div><small>AI SEMANTIC ASSISTANT</small><h2>AI 语义助手</h2><p>正在把输入整理成更清晰、更自然的表达。</p></div></header><div className="conversation-message conversation-message--user"><span>{user?.name.slice(0, 1)}</span><div><small>你的输入</small><p>{inputSummary}</p></div></div><div className="conversation-thread">{steps.map(([title, detail], index) => { const completed = Boolean(result) || index < activeStep; const active = processing && index === activeStep; return <motion.div className={`${completed ? 'complete' : ''} ${active ? 'active' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: index <= activeStep || result ? 1 : .35, y: 0 }} key={title}><span>{completed ? <Check /> : active ? <LoaderCircle className="spin" /> : index + 1}</span><p><strong>{title}</strong><small>{detail}</small></p>{active && <em>处理中</em>}{completed && <em>已完成</em>}</motion.div> })}</div></section>}

      <AnimatePresence>
        {result && task && <motion.section className="interaction-result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <header className="interaction-result__header"><div><span><Sparkles />FINAL RESULT</span><h2>{direction === 'sign-to-language' ? '理解结果已准备' : '虚拟人手语已准备'}</h2><p>{qualityOptions.find((item) => item.id === quality)?.label}模式 · 用时 {(task.processingMs / 1000).toFixed(1)} 秒</p></div><strong>{Math.round((result.semanticResult?.overall_confidence ?? .92) * 100)}<small>% 结果可信度</small></strong></header>

          {direction === 'sign-to-language' ? (
            <div className="sign-language-result">
              <div className="result-tokens">
                <span>原始识别 Token</span>
                <div>{result.tokens.map((token, index) => <strong key={`${token}-${index}`}><small>{String(index + 1).padStart(2, '0')}</small>{token}</strong>)}</div>
              </div>
              <div className="ai-polish-result">
                <div><span><FileText />初始识别文字</span><p>{result.baselineText}</p></div>
                <ArrowRight />
                <div>
                  <span><Bot />AI 语义梳理</span>
                  <h3>{result.polishedText}</h3>
                  <p>{result.semanticResult?.inferred_intent && result.semanticResult.inferred_intent !== 'unknown' ? `推理意图：${result.semanticResult.inferred_intent}` : '已结合上下文调整语序，并保留原始表达意图。'}</p>
                </div>
              </div>
              {result.semanticResult && <SemanticEvidence semantic={result.semanticResult} />}
              <div className="result-cues">
                <div>
                  <HeartPulse />
                  <p>
                    <span>情绪与表情线索</span>
                    <strong>{result.emotion.label}</strong>
                    <small>{typeof result.emotion.score === 'number' ? `证据强度 ${Math.round(result.emotion.score * 100)}%` : 'Module B 未提供独立的情绪置信度'}</small>
                  </p>
                </div>
                <div className="result-actions">
                  <button className="button button--ghost" type="button" onClick={playSpeech}>{speaking ? <Pause /> : <Volume2 />}{speaking ? '停止后可重播' : '播放最终语音'}</button>
                  <button className="icon-command" type="button" onClick={copyResult}><Clipboard /><span>复制文本</span></button>
                  <button className="icon-command" type="button" onClick={() => saveBlob(interactionService.downloadText(result), 'PCS-SignAI-result.txt')}><Download /><span>下载结果</span></button>
                </div>
              </div>
            </div>
          ) : <div className="avatar-result"><div className="avatar-result__copy"><span>输入内容</span><p>{result.baselineText}</p><div><Bot /><p><small>AI 梳理后的手语表达</small><strong>{result.avatarGloss}</strong><em>{result.polishedText}</em></p></div><ul>{result.avatarStates?.map((state) => <li key={state}><CheckCircle2 />{state}</li>)}</ul></div><div className="avatar-player"><AvatarFigure avatar={avatar} playing={avatarPlaying} /><div className="avatar-player__caption"><span><i />{avatarPlaying ? '正在播放手语动作' : '虚拟人视频结果'}</span><strong>{result.avatarGloss}</strong></div><div className="avatar-player__controls"><button className="button" type="button" onClick={playAvatar}>{avatarPlaying ? <Pause /> : <Play />}{avatarPlaying ? '播放中' : '播放视频'}</button><button className="icon-command" type="button" onClick={playAvatar}><RotateCcw /><span>重播</span></button><button className="icon-command" type="button" disabled={downloadingVideo} onClick={downloadAvatar}>{downloadingVideo ? <LoaderCircle className="spin" /> : <Download />}<span>{downloadingVideo ? '生成中' : '下载视频'}</span></button></div></div></div>}

          <FeedbackPanel task={task} onSubmitted={setFeedbackRating} />
          {feedbackRating && <span className="sr-only">当前反馈：{feedbackRating}</span>}
        </motion.section>}
      </AnimatePresence>
    </div>
  )
}
