/**
 * The viewer shell: a desktop-style menu bar over the content. Owns which
 * quiz is loaded and wires the menu, the open dialog and the player.
 */

import './menu-bar.ts'
import './open-dialog.ts'
import './quiz-player.ts'
import './welcome-demo.ts'

import type { MenuActionDetail, QuizMenuBar } from './menu-bar.ts'
import type { QuizOpenDetail, QuizOpenDialog } from './open-dialog.ts'
import type { QuizPlayer } from './quiz-player.ts'
import { fetchQuizUrl } from '../quiz/sources.ts'
import type { Quiz } from '../quiz/types.ts'

const REPO = 'https://github.com/shapelayer-args/oral-session-history-of-japanese-classical-literature'
const SPEC_URL = `${REPO}/blob/main/DOCS/API_QUIZ_VIEWER.md`
const SHUFFLE_KEY = 'quiz-viewer:shuffle'

const TEMPLATE = `
  <quiz-menu-bar></quiz-menu-bar>
  <main class="qv-content">
    <section class="qv-welcome">
      <div class="qv-welcome__copy">
        <h1>일본 고전문학사 퀴즈</h1>
        <p>발표 내용을 확인하는 4지선다 퀴즈입니다. 답을 고르면 정답 여부와 각 선택지의 해설이 표시되고, 다음 문항으로 넘어갈 수 있습니다.</p>
        <div class="qv-welcome__actions">
          <button type="button" class="qv-button qv-button--primary" data-open="presets">프리셋 열기…</button>
          <button type="button" class="qv-button" data-open="file">로컬 파일 열기…</button>
        </div>
        <p class="qv-muted">파일 → 열기 에서도 열 수 있고, JSON 파일을 창에 끌어다 놓아도 됩니다.</p>
      </div>
      <quiz-welcome-demo class="qv-welcome__demo" aria-hidden="true"></quiz-welcome-demo>
    </section>
    <quiz-player tabindex="-1" hidden></quiz-player>
  </main>
  <quiz-open-dialog></quiz-open-dialog>
  <dialog class="qv-dialog qv-about" aria-labelledby="qv-about-title">
    <form method="dialog" class="qv-dialog__frame">
      <header class="qv-dialog__head"><h2 id="qv-about-title">퀴즈 뷰어 정보</h2><button class="qv-icon-button" aria-label="닫기">×</button></header>
      <section class="qv-dialog__body">
        <p>Oral Session: 일본 고전문학사 의 퀴즈 뷰어입니다.</p>
        <p class="qv-muted">퀴즈 형식: <a href="${SPEC_URL}" target="_blank" rel="noopener">DOCS/API_QUIZ_VIEWER.md</a> · JSON Schema: <a href="schema/quiz.schema.json" target="_blank">schema/quiz.schema.json</a></p>
        <p class="qv-muted">일러스트: <a href="https://github.com/benjitaylor/skills" target="_blank" rel="noopener">Stageshow</a> kit (MIT).</p>
      </section>
    </form>
  </dialog>
  <div class="qv-drop-overlay"><div>JSON 퀴즈 파일을 놓아 열기</div></div>
  <div class="qv-toast" role="status" aria-live="polite" hidden></div>
`

export class QuizApp extends HTMLElement {
  private menu!: QuizMenuBar
  private dialog!: QuizOpenDialog
  private player!: QuizPlayer
  private welcome!: HTMLElement
  private dragDepth = 0
  private shuffle = localStorage.getItem(SHUFFLE_KEY) === '1'

  connectedCallback(): void {
    if (this.menu) return
    this.innerHTML = TEMPLATE
    this.menu = this.querySelector('quiz-menu-bar')!
    this.dialog = this.querySelector('quiz-open-dialog')!
    this.player = this.querySelector('quiz-player')!
    this.welcome = this.querySelector('.qv-welcome')!

    this.addEventListener('menu-action', (e) => this.onMenu((e as CustomEvent<MenuActionDetail>).detail))
    this.addEventListener('quiz-open', (e) => this.open((e as CustomEvent<QuizOpenDetail>).detail))
    this.querySelector('[data-open=presets]')!.addEventListener('click', () => this.dialog.show('presets'))
    this.querySelector('[data-open=file]')!.addEventListener('click', () => this.dialog.show('local', 'file'))

    document.addEventListener('keydown', this.onShortcut)
    window.addEventListener('dragenter', this.onDragEnter)
    window.addEventListener('dragover', (e) => e.preventDefault())
    window.addEventListener('dragleave', this.onDragLeave)
    window.addEventListener('drop', this.onDrop)

    this.menu.setChecked('toggle-shuffle', this.shuffle)
    this.syncMenu()
    void this.openFromQuery()
  }

  private syncMenu(): void {
    this.menu.setEnabled('restart', this.player.loaded)
    this.menu.setEnabled('close', this.player.loaded)
  }

  private onMenu({ action }: MenuActionDetail): void {
    switch (action) {
      case 'open':
        return this.dialog.show('presets')
      case 'open-file':
        return this.dialog.show('local', 'file')
      case 'open-folder':
        return this.dialog.show('local', 'folder')
      case 'close':
        return this.close()
      case 'restart':
        return this.player.restart()
      case 'toggle-shuffle':
        this.shuffle = !this.shuffle
        localStorage.setItem(SHUFFLE_KEY, this.shuffle ? '1' : '0')
        this.menu.setChecked('toggle-shuffle', this.shuffle)
        this.player.setShuffle(this.shuffle)
        return this.toast(this.shuffle ? '선택지를 섞어서 출제합니다' : '선택지를 원래 순서로 출제합니다')
      case 'spec':
        window.open(SPEC_URL, '_blank', 'noopener')
        return
      case 'about':
        this.querySelector<HTMLDialogElement>('.qv-about')!.showModal()
        return
    }
  }

  private onShortcut = (e: KeyboardEvent): void => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey) return
    if (e.key === 'o') {
      e.preventDefault()
      this.dialog.show('presets')
    } else if (e.key === 'r' && this.player.loaded) {
      e.preventDefault()
      this.player.restart()
    }
  }

  private open({ quiz, origin }: QuizOpenDetail): void {
    this.show(quiz)
    document.title = `${quiz.title} — Quiz Viewer`
    this.toast(`${origin} 을(를) 열었습니다`)
  }

  private show(quiz: Quiz): void {
    this.welcome.hidden = true
    this.player.hidden = false
    this.player.load(quiz, this.shuffle)
    this.syncMenu()
  }

  private close(): void {
    this.player.clear()
    this.player.hidden = true
    this.welcome.hidden = false
    document.title = 'Quiz Viewer'
    this.syncMenu()
  }

  /** ?preset=<file> opens a shipped preset; ?src=<url> any quiz URL. */
  private async openFromQuery(): Promise<void> {
    const params = new URLSearchParams(location.search)
    const preset = params.get('preset')
    const src = params.get('src') ?? (preset ? `presets/${encodeURIComponent(preset.endsWith('.json') ? preset : `${preset}.json`)}` : null)
    if (!src) return
    try {
      const quiz = await fetchQuizUrl(src)
      this.open({ quiz, origin: preset ?? src })
    } catch (error) {
      this.toast((error as Error).message, true)
    }
  }

  private onDragEnter = (e: DragEvent): void => {
    if (!e.dataTransfer?.types.includes('Files')) return
    this.dragDepth++
    this.dataset.dropping = ''
  }

  private onDragLeave = (): void => {
    this.dragDepth = Math.max(0, this.dragDepth - 1)
    if (!this.dragDepth) delete this.dataset.dropping
  }

  private onDrop = (e: DragEvent): void => {
    e.preventDefault()
    this.dragDepth = 0
    delete this.dataset.dropping
    // The dialog's own drop zone handles drops inside it
    if ((e.target as Element | null)?.closest?.('quiz-open-dialog')) return
    const file = e.dataTransfer?.files[0]
    if (file) void this.dialog.openFile(file)
  }

  private toastTimer = 0
  private toast(message: string, error = false): void {
    const box = this.querySelector<HTMLElement>('.qv-toast')!
    box.textContent = message
    box.dataset.tone = error ? 'danger' : ''
    box.hidden = false
    clearTimeout(this.toastTimer)
    this.toastTimer = window.setTimeout(() => (box.hidden = true), error ? 6000 : 2400)
  }
}

customElements.define('quiz-app', QuizApp)
