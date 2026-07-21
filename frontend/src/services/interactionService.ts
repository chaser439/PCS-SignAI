import { semanticService } from './semanticService'
import { signService } from './signService'
import type { InteractionRequest, InteractionResult } from './serviceTypes'

export const futureInteractionEndpoints = {
  videoUpload: '/api/v1/media/video',
  liveStream: '/api/v1/streams/sign',
  signToLanguage: '/api/v1/interactions/sign-to-language',
  languageToSign: '/api/v1/interactions/language-to-sign',
  avatarGeneration: '/api/v1/avatars/generate',
  aiPolish: '/api/v1/language/polish',
  taskFeedback: '/api/v1/interactions/:taskId/feedback',
  memoryUpload: '/api/v1/users/:userId/memories',
} as const

function polishSourceText(value: string) {
  const compact = value.trim().replace(/\s+/g, ' ')
  if (!compact) return '你好，很高兴与你交流。'
  const punctuated = /[。！？.!?]$/.test(compact) ? compact : `${compact}。`
  return punctuated.replace('我想要请你', '想请你').replace('麻烦你可以', '请')
}

function toSignGloss(value: string) {
  return value
    .replace(/[，。！？,.!?]/g, ' ')
    .replace(/请|可以|一下|了/g, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(' · ') || '你好 · 交流'
}

export const interactionService = {
  provider: 'local' as const,
  async process(request: InteractionRequest): Promise<InteractionResult> {
    if (request.direction === 'sign-to-language') {


      const signResult = await signService.analyze({

        file: request.file,

        userId: request.userId

      })


      const semanticResult =
          await semanticService.understand(
            signResult
          )
      console.log(
        "Module B Result:",
        semanticResult
      )

      if (semanticResult.status !== 'ok') {
        throw new Error(
          semanticResult.error?.message ?? 'Module B 未能生成语义结果'
        )
      }


      return {

        baselineText:
          signResult.sign_sequence.join(' '),


        polishedText:
          semanticResult.normalized_text,


        emotion:
          semanticResult.emotion,


        tokens:
          signResult.sign_sequence,


        signResult,


        semanticResult

      }

    }

    const polishedText = polishSourceText(request.sourceText ?? '')
    const avatarGloss = toSignGloss(polishedText)
    return {
      baselineText: request.sourceText?.trim() || '你好，很高兴与你交流。',
      polishedText,
      emotion: { label: '自然', score: 0.9 },
      tokens: avatarGloss.split(' · '),
      avatarGloss,
      avatarStates: ['手语动作已对齐', '面部表情自然', '身体姿态稳定'],
    }
  },

  downloadText(result: InteractionResult) {
    return new Blob([
      `PCS-SignAI 智能理解结果\n\n原始内容：${result.baselineText}\nAI 语义梳理：${result.polishedText}\nToken：${result.tokens.join(' / ')}\n情绪线索：${result.emotion.label}`,
    ], { type: 'text/plain;charset=utf-8' })
  },

  downloadAvatarManifest(result: InteractionResult, avatarName: string) {
    return new Blob([JSON.stringify({
      schema_version: '1.0',
      avatar: avatarName,
      input_text: result.baselineText,
      polished_text: result.polishedText,
      sign_gloss: result.avatarGloss,
      states: result.avatarStates,
      generated_at: new Date().toISOString(),
      provider: 'local',
    }, null, 2)], { type: 'application/json;charset=utf-8' })
  },

  async createAvatarVideo(result: InteractionResult, avatarName: string) {
    const canvas = document.createElement('canvas')
    canvas.width = 960
    canvas.height = 540
    const context = canvas.getContext('2d')
    if (!context || typeof canvas.captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
      return { blob: this.downloadAvatarManifest(result, avatarName), extension: 'json' }
    }
    const stream = canvas.captureStream(24)
    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
    const recorder = new MediaRecorder(stream, { mimeType })
    const chunks: BlobPart[] = []
    recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data) }
    const completed = new Promise<Blob>((resolve) => { recorder.onstop = () => resolve(new Blob(chunks, { type: 'video/webm' })) })
    recorder.start()
    const started = performance.now()
    await new Promise<void>((resolve) => {
      const draw = (now: number) => {
        const elapsed = now - started
        const phase = elapsed / 230
        context.fillStyle = '#e9efeb'
        context.fillRect(0, 0, canvas.width, canvas.height)
        context.fillStyle = '#153f38'
        context.fillRect(0, 0, canvas.width, 72)
        context.fillStyle = '#ffffff'
        context.font = '600 23px sans-serif'
        context.fillText(`PCS-SignAI · ${avatarName}`, 38, 45)
        context.fillStyle = '#1d4f46'
        context.beginPath()
        context.arc(480, 190, 58, 0, Math.PI * 2)
        context.fill()
        context.fillStyle = '#efd8ca'
        context.beginPath()
        context.arc(480, 185, 48, 0, Math.PI * 2)
        context.fill()
        context.fillStyle = '#ffffff'
        context.beginPath()
        context.arc(463, 179, 4, 0, Math.PI * 2)
        context.arc(497, 179, 4, 0, Math.PI * 2)
        context.fill()
        context.strokeStyle = '#d87968'
        context.lineWidth = 4
        context.beginPath()
        context.arc(480, 196, 14, 0.15, Math.PI - 0.15)
        context.stroke()
        context.fillStyle = '#2e776b'
        context.fillRect(408, 238, 144, 190)
        context.strokeStyle = '#2e776b'
        context.lineWidth = 25
        context.lineCap = 'round'
        context.beginPath()
        context.moveTo(425, 265)
        context.lineTo(350 + Math.sin(phase) * 45, 318 - Math.cos(phase) * 22)
        context.moveTo(535, 265)
        context.lineTo(610 - Math.sin(phase) * 45, 318 + Math.cos(phase) * 22)
        context.stroke()
        context.fillStyle = '#183e37'
        context.font = '500 24px sans-serif'
        context.textAlign = 'center'
        context.fillText(result.avatarGloss ?? result.polishedText, 480, 486)
        context.textAlign = 'start'
        if (elapsed < 1800) requestAnimationFrame(draw)
        else resolve()
      }
      requestAnimationFrame(draw)
    })
    recorder.stop()
    const blob = await completed
    stream.getTracks().forEach((track) => track.stop())
    return { blob, extension: 'webm' }
  },
}
