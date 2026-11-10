/**
 * The quiz document format. Mirrors schema/quiz.schema.json; the prose spec is
 * DOCS/API_QUIZ_VIEWER.md. Keep all three in step.
 */

export const SPEC_VERSION = '1.0'

export type Difficulty = 'easy' | 'normal' | 'hard'

/**
 * pick-valid (GENERATE_QUIZ 경우 1): one valid statement among refuted ones; the
 * valid one is the answer. pick-invalid (경우 2): one refuted statement among
 * valid ones; the refuted one is the answer.
 */
export type QuestionMode = 'pick-valid' | 'pick-invalid'

export interface Reference {
  label: string
  path?: string
  slide?: number
  page?: string
  url?: string
}

export interface Choice {
  id: string
  text: string
  /** Whether the statement itself is valid (타당), not whether it is the pick. */
  valid: boolean
  explanation: string
  references?: Reference[]
}

export interface Question {
  id: string
  type: 'single-choice'
  mode: QuestionMode
  prompt: string
  choices: Choice[]
  /** id of the correct choice. */
  answer: string
  explanation?: string
  difficulty?: Difficulty
  references?: Reference[]
  tags?: string[]
}

export interface Quiz {
  $schema?: string
  specVersion: typeof SPEC_VERSION
  id: string
  title: string
  description?: string
  language?: string
  difficulty: Difficulty
  createdAt?: string
  authors?: string[]
  sources?: Reference[]
  questions: Question[]
}

export interface PresetEntry {
  id: string
  file: string
  title: string
  description?: string
  difficulty: Difficulty
  questionCount: number
  createdAt?: string
}

export interface PresetIndex {
  specVersion: typeof SPEC_VERSION
  generatedAt: string
  presets: PresetEntry[]
}

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
}

export const MODE_LABEL: Record<QuestionMode, string> = {
  'pick-valid': '옳은 것을 고르시오',
  'pick-invalid': '옳지 않은 것을 고르시오',
}
