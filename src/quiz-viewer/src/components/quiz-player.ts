/**
 * The quiz itself: one question at a time with its four choices. Picking a
 * choice locks the question, marks the pick right or wrong, reveals the
 * answer and every choice's explanation, and enables 다음 (disabled until
 * then). After the last question it shows the score.
 */

import { DIFFICULTY_LABEL, MODE_LABEL, type Choice, type Question, type Quiz, type Reference } from '../quiz/types.ts'
import { answerOf } from '../quiz/validate.ts'

interface Attempt {
  questionId: string
  choiceId: string
  correct: boolean
}

const LETTERS = ['①', '②', '③', '④']

function shuffled<T>(items: T[]): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

function referenceText(r: Reference): string {
  const where = [r.path, r.slide ? `슬라이드 ${r.slide}` : '', r.page ? `p.${r.page}` : ''].filter(Boolean).join(', ')
  return where ? `${r.label} (${where})` : r.label
}

export class QuizPlayer extends HTMLElement {
  private quiz: Quiz | null = null
  private order: Choice[][] = []
  private index = 0
  private attempts: Attempt[] = []
  private shuffle = false

  connectedCallback(): void {
    this.classList.add('qv-player')
    this.addEventListener('keydown', this.onKey)
    this.render()
  }

  get loaded(): boolean {
    return this.quiz !== null
  }

  load(quiz: Quiz, shuffle = this.shuffle): void {
    this.quiz = quiz
    this.shuffle = shuffle
    this.restart()
  }

  setShuffle(shuffle: boolean): void {
    this.shuffle = shuffle
    if (this.quiz) this.restart()
  }

  restart(): void {
    if (!this.quiz) return
    this.order = this.quiz.questions.map((q) => (this.shuffle ? shuffled(q.choices) : [...q.choices]))
    this.index = 0
    this.attempts = []
    this.render()
    this.focusFirst()
  }

  clear(): void {
    this.quiz = null
    this.render()
  }

  private get question(): Question | null {
    return this.quiz?.questions[this.index] ?? null
  }

  private get attempt(): Attempt | undefined {
    const q = this.question
    return q ? this.attempts.find((a) => a.questionId === q.id) : undefined
  }

  private onKey = (event: KeyboardEvent): void => {
    if (event.target instanceof HTMLInputElement || event.metaKey || event.ctrlKey || event.altKey) return
    const n = Number(event.key)
    if (n >= 1 && n <= 4 && !this.attempt) {
      const choice = this.order[this.index]?.[n - 1]
      if (choice) this.pick(choice)
    } else if (event.key === 'Enter' && this.attempt && event.target === this) {
      this.next()
    }
  }

  private pick(choice: Choice): void {
    const q = this.question
    if (!q || this.attempt) return
    this.attempts.push({ questionId: q.id, choiceId: choice.id, correct: choice.id === q.answer })
    this.render()
    this.querySelector<HTMLButtonElement>('[data-next]')?.focus()
  }

  private next(): void {
    if (!this.quiz || !this.attempt) return
    this.index++
    this.render()
    this.focusFirst()
  }

  private focusFirst(): void {
    this.querySelector<HTMLButtonElement>('.qv-choice')?.focus({ preventScroll: true })
  }

  private render(): void {
    this.replaceChildren()
    if (!this.quiz) return
    if (this.index >= this.quiz.questions.length) this.renderSummary(this.quiz)
    else this.renderQuestion(this.quiz, this.question!)
  }

  private renderHeader(quiz: Quiz): HTMLElement {
    const head = el('header', 'qv-quiz-head')
    const title = el('div', 'qv-quiz-head__title')
    title.append(el('h1', undefined, quiz.title), el('span', 'qv-badge', DIFFICULTY_LABEL[quiz.difficulty]))
    const total = quiz.questions.length
    const done = Math.min(this.index, total)
    const correct = this.attempts.filter((a) => a.correct).length
    const progress = el('div', 'qv-progress')
    const meter = el('div', 'qv-progress__track')
    const fill = el('div', 'qv-progress__fill')
    fill.style.width = `${(Math.min(this.attempts.length, total) / total) * 100}%`
    meter.append(fill)
    meter.setAttribute('role', 'progressbar')
    meter.setAttribute('aria-valuemin', '0')
    meter.setAttribute('aria-valuemax', String(total))
    meter.setAttribute('aria-valuenow', String(this.attempts.length))
    progress.append(meter, el('span', 'qv-progress__label', done < total ? `${done + 1} / ${total}` : `${total} / ${total}`), el('span', 'qv-progress__score', `정답 ${correct}`))
    head.append(title, progress)
    return head
  }

  private renderQuestion(quiz: Quiz, q: Question): void {
    const attempt = this.attempt
    const answer = answerOf(q)
    const card = el('article', 'qv-question')
    card.dataset.answered = attempt ? (attempt.correct ? 'correct' : 'wrong') : ''

    const kicker = el('div', 'qv-question__kicker')
    kicker.append(el('span', 'qv-question__number', `문항 ${this.index + 1}`), el('span', 'qv-question__mode', MODE_LABEL[q.mode]))
    if (q.difficulty && q.difficulty !== quiz.difficulty) kicker.append(el('span', 'qv-badge', DIFFICULTY_LABEL[q.difficulty]))
    const prompt = el('h2', 'qv-question__prompt', q.prompt)
    prompt.id = `qv-prompt-${q.id}`

    const list = el('div', 'qv-choices')
    list.setAttribute('role', 'radiogroup')
    list.setAttribute('aria-labelledby', prompt.id)
    this.order[this.index]!.forEach((choice, i) => {
      const button = el('button', 'qv-choice')
      button.type = 'button'
      button.setAttribute('role', 'radio')
      button.setAttribute('aria-checked', String(attempt?.choiceId === choice.id))
      const picked = attempt?.choiceId === choice.id
      const isAnswer = choice.id === q.answer
      if (attempt) {
        button.setAttribute('aria-disabled', 'true')
        button.dataset.state = isAnswer ? 'answer' : picked ? 'wrong' : 'other'
        if (picked) button.dataset.picked = ''
      }
      const row = el('span', 'qv-choice__row')
      row.append(el('span', 'qv-choice__letter', LETTERS[i]), el('span', 'qv-choice__text', choice.text))
      if (attempt && (isAnswer || picked)) row.append(el('span', 'qv-choice__mark', isAnswer ? '정답' : '오답'))
      button.append(row)
      if (attempt) {
        const why = el('span', 'qv-choice__why')
        why.append(el('span', 'qv-choice__verdict', choice.valid ? '타당함' : '타당하지 않음'), el('span', undefined, choice.explanation))
        if (choice.references?.length) why.append(el('span', 'qv-refs', choice.references.map(referenceText).join(' · ')))
        button.append(why)
      }
      button.addEventListener('click', () => this.pick(choice))
      list.append(button)
    })

    const feedback = el('div', 'qv-feedback')
    feedback.setAttribute('aria-live', 'polite')
    if (attempt) {
      const verdict = el('strong', 'qv-feedback__verdict', attempt.correct ? '정답입니다' : '오답입니다')
      const answerLine = el('p', 'qv-feedback__answer', `정답: ${LETTERS[this.order[this.index]!.indexOf(answer)]} ${answer.text}`)
      feedback.append(verdict, answerLine)
      if (q.explanation) feedback.append(el('p', 'qv-feedback__text', q.explanation))
      if (q.references?.length) feedback.append(el('p', 'qv-refs', `참고: ${q.references.map(referenceText).join(' · ')}`))
    }

    const footer = el('footer', 'qv-question__foot')
    footer.append(el('span', 'qv-muted', attempt ? '' : '선택지를 고르면 정답과 해설이 표시됩니다. (키보드 1–4)'))
    const last = this.index === quiz.questions.length - 1
    const next = el('button', 'qv-button qv-button--primary', last ? '결과 보기' : '다음')
    next.type = 'button'
    next.dataset.next = ''
    next.disabled = !attempt
    next.addEventListener('click', () => this.next())
    footer.append(next)

    card.append(kicker, prompt, list, feedback, footer)
    this.append(this.renderHeader(quiz), card)
  }

  private renderSummary(quiz: Quiz): void {
    const total = quiz.questions.length
    const correct = this.attempts.filter((a) => a.correct).length
    const card = el('article', 'qv-question qv-summary')
    card.append(el('div', 'qv-question__kicker', '결과'), el('h2', 'qv-summary__score', `${total}문항 중 ${correct}문항 정답`))
    const list = el('ol', 'qv-summary__list')
    quiz.questions.forEach((q) => {
      const a = this.attempts.find((x) => x.questionId === q.id)
      const li = el('li')
      li.dataset.state = a?.correct ? 'correct' : 'wrong'
      li.append(el('span', 'qv-summary__mark', a?.correct ? '○' : '×'), el('span', undefined, q.prompt))
      list.append(li)
    })
    const footer = el('footer', 'qv-question__foot')
    const again = el('button', 'qv-button qv-button--primary', '처음부터 다시 풀기')
    again.type = 'button'
    again.addEventListener('click', () => this.restart())
    footer.append(el('span'), again)
    card.append(list, footer)
    this.append(this.renderHeader(quiz), card)
    again.focus()
  }
}

customElements.define('quiz-player', QuizPlayer)
