/**
 * Collects the preset quizzes from GENERATED/QUIZ: every *.json there is
 * checked against schema/quiz.schema.json and the viewer's own rules, then
 * listed in presets/index.json. Used by the Vite plugin (dev server and build)
 * and by scripts/check-presets.ts.
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020Module from 'ajv/dist/2020.js'
import addFormatsModule from 'ajv-formats'
import { validateQuiz, QuizValidationError } from '../src/quiz/validate.ts'
import { SPEC_VERSION, type PresetIndex, type Quiz } from '../src/quiz/types.ts'

const here = dirname(fileURLToPath(import.meta.url))
export const VIEWER_ROOT = resolve(here, '..')
export const REPO_ROOT = resolve(VIEWER_ROOT, '../..')
export const PRESET_DIR = process.env.QUIZ_PRESET_DIR ? resolve(process.env.QUIZ_PRESET_DIR) : join(REPO_ROOT, 'GENERATED/QUIZ')
export const SCHEMA_DIR = join(VIEWER_ROOT, 'schema')

export interface Preset {
  file: string
  quiz: Quiz
  /** The file's text as written, served unchanged. */
  source: string
}

// ajv is CommonJS; under Node's ESM loader the default import is the module
// object, under a bundler it is the class. Accept both.
type AjvLike = { compile(schema: object): ((data: unknown) => boolean) & { errors?: { instancePath: string; message?: string }[] | null } }
const pick = <T>(m: unknown): T => ((m as { default?: T }).default ?? m) as T
const Ajv2020 = pick<new (opts: object) => AjvLike>(Ajv2020Module)
const addFormats = pick<(ajv: AjvLike) => void>(addFormatsModule)

let schemaCheck: ReturnType<AjvLike['compile']> | null = null
function checkSchema(data: unknown): string[] {
  if (!schemaCheck) {
    const ajv = new Ajv2020({ allErrors: true, strict: false })
    addFormats(ajv)
    schemaCheck = ajv.compile(JSON.parse(readFileSync(join(SCHEMA_DIR, 'quiz.schema.json'), 'utf8')))
  }
  if (schemaCheck(data)) return []
  return (schemaCheck.errors ?? []).map((e) => `schema ${e.instancePath || '/'}: ${e.message ?? 'invalid'}`)
}

/** Reads and validates every preset. Throws with every problem in every file. */
export function loadPresets(dir = PRESET_DIR): Preset[] {
  if (!existsSync(dir)) return []
  const files = readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.json'))
    .sort((a, b) => a.localeCompare(b))
  const presets: Preset[] = []
  const problems: string[] = []
  const ids = new Map<string, string>()
  for (const file of files) {
    const source = readFileSync(join(dir, file), 'utf8')
    try {
      const data = JSON.parse(source) as unknown
      // Both checks always run, so one pass reports every problem in the file
      const schemaProblems = checkSchema(data)
      let quiz: Quiz
      try {
        quiz = validateQuiz(data)
      } catch (error) {
        if (!(error instanceof QuizValidationError)) throw error
        throw new QuizValidationError([...schemaProblems, ...error.problems])
      }
      if (schemaProblems.length) throw new QuizValidationError(schemaProblems)
      const seen = ids.get(quiz.id)
      if (seen) throw new QuizValidationError([`id "${quiz.id}" 가 ${seen} 와 중복됩니다`])
      ids.set(quiz.id, file)
      presets.push({ file, quiz, source })
    } catch (error) {
      const list = error instanceof QuizValidationError ? error.problems : [(error as Error).message]
      problems.push(`${file}\n    ${list.join('\n    ')}`)
    }
  }
  if (problems.length) throw new Error(`GENERATED/QUIZ 프리셋 검증 실패:\n  ${problems.join('\n  ')}`)
  return presets
}

export function presetIndex(presets: Preset[]): PresetIndex {
  return {
    specVersion: SPEC_VERSION,
    generatedAt: new Date().toISOString(),
    presets: presets.map(({ file, quiz }) => ({
      id: quiz.id,
      file,
      title: quiz.title,
      ...(quiz.description ? { description: quiz.description } : {}),
      difficulty: quiz.difficulty,
      questionCount: quiz.questions.length,
      ...(quiz.createdAt ? { createdAt: quiz.createdAt } : {}),
    })),
  }
}
