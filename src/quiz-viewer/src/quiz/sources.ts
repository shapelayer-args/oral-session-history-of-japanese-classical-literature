/**
 * Where quizzes come from: the presets shipped with the build
 * (presets/index.json, generated from GENERATED/QUIZ), a local file, or a
 * local folder of JSON files.
 */

import type { PresetEntry, PresetIndex, Quiz } from './types.ts'
import { parseQuiz, QuizValidationError } from './validate.ts'

/** Resolved against the page, so it works at any deploy base. */
const presetsBase = () => new URL('presets/', document.baseURI)

export async function fetchPresetIndex(): Promise<PresetIndex> {
  const response = await fetch(new URL('index.json', presetsBase()), { cache: 'no-cache' })
  if (!response.ok) throw new Error(`프리셋 목록을 불러오지 못했습니다 (HTTP ${response.status})`)
  return (await response.json()) as PresetIndex
}

export async function fetchPreset(entry: Pick<PresetEntry, 'file'>): Promise<Quiz> {
  const response = await fetch(new URL(encodeURIComponent(entry.file), presetsBase()), { cache: 'no-cache' })
  if (!response.ok) throw new Error(`프리셋 "${entry.file}" 을(를) 불러오지 못했습니다 (HTTP ${response.status})`)
  return parseQuiz(await response.text())
}

/** A quiz at any URL (the `?src=` query parameter). */
export async function fetchQuizUrl(url: string): Promise<Quiz> {
  const response = await fetch(new URL(url, document.baseURI))
  if (!response.ok) throw new Error(`퀴즈를 불러오지 못했습니다 (HTTP ${response.status})`)
  return parseQuiz(await response.text())
}

export async function readQuizFile(file: File): Promise<Quiz> {
  return parseQuiz(await file.text())
}

export interface LocalEntry {
  name: string
  quiz?: Quiz
  error?: string
}

/** Every *.json in a folder (picked with a directory input), parsed and validated. */
export async function readQuizFolder(files: Iterable<File>): Promise<LocalEntry[]> {
  const json = [...files].filter((f) => f.name.toLowerCase().endsWith('.json'))
  const entries = await Promise.all(
    json.map(async (file): Promise<LocalEntry> => {
      const name = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name
      try {
        return { name, quiz: await readQuizFile(file) }
      } catch (error) {
        const message = error instanceof QuizValidationError ? error.problems.slice(0, 3).join(' / ') : (error as Error).message
        return { name, error: message }
      }
    }),
  )
  return entries.sort((a, b) => a.name.localeCompare(b.name))
}
