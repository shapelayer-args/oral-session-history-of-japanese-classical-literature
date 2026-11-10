/**
 * Runtime validation for quiz documents. The JSON Schema
 * (schema/quiz.schema.json) checks shape; this also checks the rules a schema
 * cannot express (unique ids, `answer` naming a choice whose validity matches
 * the question's mode). Shared by the viewer and scripts/build-presets.ts, so
 * it stays dependency-free.
 */

import { SPEC_VERSION, type Choice, type Difficulty, type Question, type Quiz } from './types.ts'

export class QuizValidationError extends Error {
  // A plain field, not a parameter property: scripts run this file through
  // Node's type stripping, which does not support them
  readonly problems: string[]
  constructor(problems: string[]) {
    super(`퀴즈 형식이 올바르지 않습니다 (${problems.length}건):\n- ${problems.join('\n- ')}`)
    this.problems = problems
    this.name = 'QuizValidationError'
  }
}

const SLUG = /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/
const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard']

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0

function checkSlug(v: unknown, where: string, problems: string[]): void {
  if (typeof v !== 'string' || !SLUG.test(v) || v.length > 64) problems.push(`${where}: 소문자·숫자·-·_ 로 된 식별자여야 합니다 (받은 값: ${JSON.stringify(v)})`)
}

function checkChoice(c: unknown, where: string, problems: string[]): c is Choice {
  if (!isObject(c)) {
    problems.push(`${where}: 객체여야 합니다`)
    return false
  }
  checkSlug(c.id, `${where}.id`, problems)
  if (!isText(c.text)) problems.push(`${where}.text: 비어 있지 않은 문자열이어야 합니다`)
  if (typeof c.valid !== 'boolean') problems.push(`${where}.valid: true 또는 false 여야 합니다`)
  if (!isText(c.explanation)) problems.push(`${where}.explanation: 각 항목이 타당한/타당하지 않은 이유가 필요합니다`)
  return true
}

function checkQuestion(q: unknown, where: string, problems: string[]): void {
  if (!isObject(q)) {
    problems.push(`${where}: 객체여야 합니다`)
    return
  }
  checkSlug(q.id, `${where}.id`, problems)
  if (q.type !== 'single-choice') problems.push(`${where}.type: "single-choice" 여야 합니다`)
  if (q.mode !== 'pick-valid' && q.mode !== 'pick-invalid') problems.push(`${where}.mode: "pick-valid" 또는 "pick-invalid" 여야 합니다`)
  if (!isText(q.prompt)) problems.push(`${where}.prompt: 질문이 비어 있습니다`)
  if (q.difficulty !== undefined && !DIFFICULTIES.includes(q.difficulty as Difficulty)) problems.push(`${where}.difficulty: easy, normal, hard 중 하나여야 합니다`)
  if (!Array.isArray(q.choices) || q.choices.length !== 4) {
    problems.push(`${where}.choices: 정확히 4개의 선택지가 필요합니다 (4지선다)`)
    return
  }
  const choices = q.choices.filter((c, i) => checkChoice(c, `${where}.choices[${i}]`, problems)) as Choice[]
  const ids = new Set<string>()
  for (const c of choices) {
    if (ids.has(c.id)) problems.push(`${where}.choices: 선택지 id "${c.id}" 가 중복됩니다`)
    ids.add(c.id)
  }
  if (choices.length !== 4 || !choices.every((c) => typeof c.valid === 'boolean')) return
  const target = q.mode === 'pick-valid'
  const matching = choices.filter((c) => c.valid === target)
  if (matching.length !== 1) {
    problems.push(
      `${where}: mode "${String(q.mode)}" 에서는 valid=${target} 인 선택지가 정확히 1개여야 합니다 (현재 ${matching.length}개)`,
    )
  }
  const answer = choices.find((c) => c.id === q.answer)
  if (!answer) problems.push(`${where}.answer: 선택지 id 중 하나여야 합니다 (받은 값: ${JSON.stringify(q.answer)})`)
  else if (answer.valid !== target) problems.push(`${where}.answer: "${answer.id}" 의 valid 값이 mode "${String(q.mode)}" 와 맞지 않습니다`)
}

/** Throws QuizValidationError listing every problem; returns the document typed. */
export function validateQuiz(data: unknown): Quiz {
  const problems: string[] = []
  if (!isObject(data)) throw new QuizValidationError(['최상위 값은 JSON 객체여야 합니다'])
  if (data.specVersion !== SPEC_VERSION) problems.push(`specVersion: "${SPEC_VERSION}" 이어야 합니다 (받은 값: ${JSON.stringify(data.specVersion)})`)
  checkSlug(data.id, 'id', problems)
  if (!isText(data.title)) problems.push('title: 비어 있지 않은 문자열이어야 합니다')
  if (!DIFFICULTIES.includes(data.difficulty as Difficulty)) problems.push('difficulty: easy, normal, hard 중 하나여야 합니다')
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    problems.push('questions: 1개 이상의 문항이 필요합니다')
  } else {
    const ids = new Set<string>()
    data.questions.forEach((q, i) => {
      checkQuestion(q, `questions[${i}]`, problems)
      if (isObject(q) && typeof q.id === 'string') {
        if (ids.has(q.id)) problems.push(`questions[${i}].id: 문항 id "${q.id}" 가 중복됩니다`)
        ids.add(q.id)
      }
    })
  }
  if (problems.length) throw new QuizValidationError(problems)
  return data as unknown as Quiz
}

/** Parses text as JSON and validates it, with a readable error for bad JSON. */
export function parseQuiz(text: string): Quiz {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch (error) {
    throw new QuizValidationError([`JSON 구문 오류: ${(error as Error).message}`])
  }
  return validateQuiz(data)
}

export type { Question }

/** The choice that answers a question. validateQuiz guarantees it exists. */
export function answerOf(q: Question): Choice {
  return q.choices.find((c) => c.id === q.answer)!
}
