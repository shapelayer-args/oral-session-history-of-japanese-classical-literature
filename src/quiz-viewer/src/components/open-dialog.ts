/**
 * File → 열기: a modal with two sources, the repository's presets
 * (GENERATED/QUIZ, shipped with the build) and the local disk (a JSON file
 * or a folder of them). Emits `quiz-open` with the chosen quiz.
 */

import { fetchPreset, fetchPresetIndex, readQuizFile, readQuizFolder, type LocalEntry } from '../quiz/sources.ts'
import { DIFFICULTY_LABEL, type PresetEntry, type Quiz } from '../quiz/types.ts'
import { QuizValidationError } from '../quiz/validate.ts'

export interface QuizOpenDetail {
  quiz: Quiz
  /** Where it came from, for the window title: a preset file or a local path. */
  origin: string
}

type Tab = 'presets' | 'local'

const TEMPLATE = `
  <dialog class="qv-dialog" aria-labelledby="qv-open-title">
    <form method="dialog" class="qv-dialog__frame">
      <header class="qv-dialog__head">
        <h2 id="qv-open-title">퀴즈 열기</h2>
        <button class="qv-icon-button" value="cancel" aria-label="닫기">×</button>
      </header>
      <div class="qv-tabs" role="tablist">
        <button type="button" role="tab" class="qv-tab" data-tab="presets">프리셋</button>
        <button type="button" role="tab" class="qv-tab" data-tab="local">로컬</button>
      </div>
      <section class="qv-dialog__body" data-pane="presets" role="tabpanel">
        <p class="qv-muted">이 리포지토리의 <code>GENERATED/QUIZ</code> 에 포함된 퀴즈입니다.</p>
        <ul class="qv-list" data-list="presets"></ul>
      </section>
      <section class="qv-dialog__body" data-pane="local" role="tabpanel" hidden>
        <div class="qv-drop" data-drop>
          <strong>JSON 파일을 여기에 놓거나</strong>
          <div class="qv-drop__actions">
            <button type="button" class="qv-button" data-pick="file">파일 선택…</button>
            <button type="button" class="qv-button" data-pick="folder">폴더 선택…</button>
          </div>
          <span class="qv-muted">폴더를 선택하면 안의 <code>*.json</code> 퀴즈를 모두 찾습니다.</span>
        </div>
        <ul class="qv-list" data-list="local"></ul>
      </section>
      <p class="qv-dialog__error" role="alert" hidden></p>
      <input type="file" accept=".json,application/json" data-input="file" hidden />
      <input type="file" webkitdirectory multiple data-input="folder" hidden />
    </form>
  </dialog>
`

export class QuizOpenDialog extends HTMLElement {
  private dialog!: HTMLDialogElement
  private tab: Tab = 'presets'
  private presets: PresetEntry[] | null = null
  private local: LocalEntry[] = []

  connectedCallback(): void {
    if (this.dialog) return
    this.innerHTML = TEMPLATE
    this.dialog = this.querySelector('dialog')!
    this.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) => b.addEventListener('click', () => this.select(b.dataset.tab as Tab)))
    const fileInput = this.querySelector<HTMLInputElement>('[data-input=file]')!
    const folderInput = this.querySelector<HTMLInputElement>('[data-input=folder]')!
    this.querySelector('[data-pick=file]')!.addEventListener('click', () => fileInput.click())
    this.querySelector('[data-pick=folder]')!.addEventListener('click', () => folderInput.click())
    fileInput.addEventListener('change', () => {
      const file = fileInput.files?.[0]
      fileInput.value = ''
      if (file) void this.openFile(file)
    })
    folderInput.addEventListener('change', () => {
      const files = [...(folderInput.files ?? [])]
      folderInput.value = ''
      if (files.length) void this.openFolder(files)
    })
    const drop = this.querySelector<HTMLElement>('[data-drop]')!
    drop.addEventListener('dragover', (e) => {
      e.preventDefault()
      drop.dataset.over = ''
    })
    drop.addEventListener('dragleave', () => delete drop.dataset.over)
    drop.addEventListener('drop', (e) => {
      e.preventDefault()
      delete drop.dataset.over
      const files = [...(e.dataTransfer?.files ?? [])]
      if (files.length === 1) void this.openFile(files[0]!)
      else if (files.length > 1) void this.openFolder(files)
    })
    // A click on the backdrop closes it, as a desktop sheet does
    this.dialog.addEventListener('click', (e) => {
      if (e.target === this.dialog) this.dialog.close()
    })
    this.select('presets')
  }

  /** Opens the dialog on a tab. `pick` goes straight to the system picker. */
  show(tab: Tab = 'presets', pick?: 'file' | 'folder'): void {
    this.showError(null)
    this.select(tab)
    if (!this.dialog.open) this.dialog.showModal()
    if (pick) this.querySelector<HTMLInputElement>(`[data-input=${pick}]`)!.click()
    if (tab === 'presets' && this.presets === null) void this.loadPresets()
  }

  /** Opens a dropped or picked file without showing the dialog first. */
  async openFile(file: File): Promise<void> {
    try {
      const quiz = await readQuizFile(file)
      this.done({ quiz, origin: file.name })
    } catch (error) {
      if (!this.dialog.open) this.show('local')
      this.showError(error)
    }
  }

  private async openFolder(files: File[]): Promise<void> {
    this.local = await readQuizFolder(files)
    if (!this.dialog.open) this.show('local')
    this.renderLocal()
    if (!this.local.length) this.showError(new Error('선택한 폴더에 JSON 파일이 없습니다.'))
  }

  private select(tab: Tab): void {
    this.tab = tab
    this.querySelectorAll<HTMLButtonElement>('[data-tab]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)))
    this.querySelectorAll<HTMLElement>('[data-pane]').forEach((p) => (p.hidden = p.dataset.pane !== tab))
    if (tab === 'presets' && this.presets === null && this.dialog?.open) void this.loadPresets()
  }

  private async loadPresets(): Promise<void> {
    const list = this.querySelector('[data-list=presets]')!
    list.innerHTML = '<li class="qv-muted qv-list__empty">불러오는 중…</li>'
    try {
      this.presets = (await fetchPresetIndex()).presets
      this.renderPresets()
    } catch (error) {
      list.innerHTML = ''
      this.showError(error)
    }
  }

  private renderPresets(): void {
    const list = this.querySelector('[data-list=presets]')!
    list.replaceChildren()
    if (!this.presets?.length) {
      list.innerHTML = '<li class="qv-muted qv-list__empty">포함된 프리셋이 없습니다.</li>'
      return
    }
    for (const p of this.presets) {
      list.append(
        this.row(p.title, `${p.file} · ${p.questionCount}문항`, DIFFICULTY_LABEL[p.difficulty], p.description, async () => {
          try {
            this.done({ quiz: await fetchPreset(p), origin: p.file })
          } catch (error) {
            this.showError(error)
          }
        }),
      )
    }
  }

  private renderLocal(): void {
    const list = this.querySelector('[data-list=local]')!
    list.replaceChildren()
    for (const entry of this.local) {
      const quiz = entry.quiz
      const row = quiz
        ? this.row(quiz.title, `${entry.name} · ${quiz.questions.length}문항`, DIFFICULTY_LABEL[quiz.difficulty], quiz.description, () => this.done({ quiz, origin: entry.name }))
        : this.row(entry.name, entry.error ?? '', '오류', undefined)
      list.append(row)
    }
  }

  private row(title: string, meta: string, badge: string, description: string | undefined, open?: () => void): HTMLLIElement {
    const li = document.createElement('li')
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'qv-list__row'
    if (!open) button.disabled = true
    button.innerHTML = `<span class="qv-list__main"><span class="qv-list__title"></span><span class="qv-list__meta"></span></span><span class="qv-badge"></span>`
    button.querySelector('.qv-list__title')!.textContent = title
    button.querySelector('.qv-list__meta')!.textContent = meta
    const b = button.querySelector<HTMLElement>('.qv-badge')!
    b.textContent = badge
    if (!open) b.dataset.tone = 'danger'
    if (description) button.title = description
    if (open) button.addEventListener('click', open)
    li.append(button)
    return li
  }

  private showError(error: unknown): void {
    const box = this.querySelector<HTMLElement>('.qv-dialog__error')!
    if (!error) {
      box.hidden = true
      return
    }
    box.textContent = error instanceof QuizValidationError ? error.message : (error as Error).message
    box.hidden = false
  }

  private done(detail: QuizOpenDetail): void {
    this.dialog.close()
    this.dispatchEvent(new CustomEvent<QuizOpenDetail>('quiz-open', { detail, bubbles: true }))
  }
}

customElements.define('quiz-open-dialog', QuizOpenDialog)
