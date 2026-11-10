/**
 * Validates every quiz in GENERATED/QUIZ (or the files given as arguments)
 * against schema/quiz.schema.json and the viewer's rules.
 *
 *   npm run check:presets
 *   node scripts/check-presets.ts path/to/quiz.json ...
 */

import { mkdtempSync, copyFileSync, rmSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { loadPresets, PRESET_DIR } from './presets.ts'

const args = process.argv.slice(2)
let dir = PRESET_DIR
let scratch: string | null = null
if (args.length) {
  scratch = mkdtempSync(join(tmpdir(), 'quiz-check-'))
  for (const file of args) copyFileSync(resolve(file), join(scratch, basename(file)))
  dir = scratch
}

try {
  const presets = loadPresets(dir)
  for (const p of presets) {
    console.log(`ok  ${p.file}  (${p.quiz.id}, ${p.quiz.questions.length}문항, ${p.quiz.difficulty})`)
  }
  console.log(presets.length ? `${presets.length}개 퀴즈 검증 완료` : `검증할 퀴즈가 없습니다 (${dir})`)
} catch (error) {
  console.error((error as Error).message)
  process.exitCode = 1
} finally {
  if (scratch) rmSync(scratch, { recursive: true, force: true })
}
