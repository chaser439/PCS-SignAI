import { builtInCases } from './localData'
import type { BuiltInCase, SemanticResult, SignResult } from './serviceTypes'

export const semanticService = {
  async understand(signResult: SignResult, caseId?: BuiltInCase['id']): Promise<SemanticResult> {
    await new Promise((resolve) => window.setTimeout(resolve, 420))
    const source = builtInCases.find((item) => item.id === caseId) ?? builtInCases[0]
    return { ...source.semanticResult, video_id: signResult.video_id, user_id: signResult.user_id, input_sign_sequence: signResult.sign_sequence }
  },
}
