import { builtInCases } from './localData'
import type { BuiltInCase, SignResult } from './serviceTypes'
import { createId } from './storage'

export const signService = {
  async analyze(input: { caseId?: BuiltInCase['id']; file?: File; userId: string }): Promise<SignResult> {
    await new Promise((resolve) => window.setTimeout(resolve, 420))
    const source = builtInCases.find((item) => item.id === input.caseId) ?? builtInCases[0]
    return {
      ...source.signResult,
      video_id: createId('VID'),
      user_id: input.userId,
      source_path: input.file ? `local://uploads/${input.file.name}` : source.signResult.source_path,
    }
  },
}
