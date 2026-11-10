/**
 * The application menu bar, desktop style: top-level menus that open on
 * click, then follow the pointer while one is open, with keyboard support.
 *
 * Emits `menu-action` with `{ action }`. The app decides what each action
 * does and reports which ones are available through `setEnabled`.
 */

export interface MenuActionDetail {
  action: MenuAction
}

export type MenuAction = 'open' | 'open-file' | 'open-folder' | 'restart' | 'close' | 'toggle-shuffle' | 'spec' | 'about'

interface Item {
  label: string
  action?: MenuAction
  shortcut?: string
  divider?: boolean
}

const MENUS: Array<{ label: string; items: Item[] }> = [
  {
    label: '파일',
    items: [
      { label: '열기…', action: 'open', shortcut: 'Ctrl O' },
      { label: '파일에서 열기…', action: 'open-file' },
      { label: '폴더에서 열기…', action: 'open-folder' },
      { label: '', divider: true },
      { label: '닫기', action: 'close' },
    ],
  },
  {
    label: '퀴즈',
    items: [
      { label: '처음부터 다시 풀기', action: 'restart', shortcut: 'Ctrl R' },
      { label: '선택지 섞기', action: 'toggle-shuffle' },
    ],
  },
  {
    label: '도움말',
    items: [
      { label: 'JSON 스펙 문서', action: 'spec' },
      { label: '퀴즈 뷰어 정보', action: 'about' },
    ],
  },
]

export class QuizMenuBar extends HTMLElement {
  private openIndex: number | null = null
  private disabled = new Set<MenuAction>()
  private checked = new Set<MenuAction>()

  connectedCallback(): void {
    this.setAttribute('role', 'menubar')
    this.classList.add('qv-menubar')
    document.addEventListener('pointerdown', this.onDocumentPointerDown, true)
    document.addEventListener('keydown', this.onKeyDown)
    this.render()
  }

  disconnectedCallback(): void {
    document.removeEventListener('pointerdown', this.onDocumentPointerDown, true)
    document.removeEventListener('keydown', this.onKeyDown)
  }

  /** Grey out actions that need something the app doesn't have (a loaded quiz). */
  setEnabled(action: MenuAction, enabled: boolean): void {
    if (enabled) this.disabled.delete(action)
    else this.disabled.add(action)
    this.render()
  }

  setChecked(action: MenuAction, checked: boolean): void {
    if (checked) this.checked.add(action)
    else this.checked.delete(action)
    this.render()
  }

  private onDocumentPointerDown = (event: Event): void => {
    if (this.openIndex === null || event.composedPath().includes(this)) return
    this.close()
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (this.openIndex === null) return
    if (event.key === 'Escape') {
      const index = this.openIndex
      this.close()
      this.querySelectorAll<HTMLButtonElement>('.qv-menubar__top')[index]?.focus()
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      const step = event.key === 'ArrowRight' ? 1 : -1
      this.openMenu((this.openIndex + step + MENUS.length) % MENUS.length, true)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const items = [...this.querySelectorAll<HTMLButtonElement>('.qv-menu[data-open] .qv-menu__item:not([disabled])')]
      if (!items.length) return
      const at = items.indexOf(document.activeElement as HTMLButtonElement)
      const next = at < 0 ? (event.key === 'ArrowDown' ? 0 : items.length - 1) : (at + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
      items[next]!.focus()
    }
  }

  private openMenu(index: number, focusFirst = false): void {
    this.openIndex = index
    this.render()
    if (focusFirst) this.querySelector<HTMLButtonElement>('.qv-menu[data-open] .qv-menu__item:not([disabled])')?.focus()
  }

  private close(): void {
    this.openIndex = null
    this.render()
  }

  private emit(action: MenuAction): void {
    this.close()
    this.dispatchEvent(new CustomEvent<MenuActionDetail>('menu-action', { detail: { action }, bubbles: true }))
  }

  private render(): void {
    this.replaceChildren()
    const brand = document.createElement('span')
    brand.className = 'qv-menubar__brand'
    brand.textContent = 'Quiz Viewer'
    this.append(brand)

    MENUS.forEach((menu, index) => {
      const holder = document.createElement('div')
      holder.className = 'qv-menubar__holder'

      const top = document.createElement('button')
      top.type = 'button'
      top.className = 'qv-menubar__top'
      top.textContent = menu.label
      top.setAttribute('aria-haspopup', 'menu')
      top.setAttribute('aria-expanded', String(this.openIndex === index))
      top.addEventListener('click', () => (this.openIndex === index ? this.close() : this.openMenu(index)))
      // Desktop menus: once one is open, hovering another opens it instead
      top.addEventListener('pointerenter', () => {
        if (this.openIndex !== null && this.openIndex !== index) this.openMenu(index)
      })
      top.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          this.openMenu(index, true)
        }
      })

      const panel = document.createElement('div')
      panel.className = 'qv-menu'
      panel.setAttribute('role', 'menu')
      if (this.openIndex === index) panel.dataset.open = ''
      for (const item of menu.items) panel.append(this.renderItem(item))

      holder.append(top, panel)
      this.append(holder)
    })
  }

  private renderItem(item: Item): HTMLElement {
    if (item.divider) {
      const divider = document.createElement('div')
      divider.className = 'qv-menu__divider'
      divider.setAttribute('role', 'separator')
      return divider
    }
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'qv-menu__item'
    const action = item.action!
    const checkable = action === 'toggle-shuffle'
    button.setAttribute('role', checkable ? 'menuitemcheckbox' : 'menuitem')
    if (checkable) button.setAttribute('aria-checked', String(this.checked.has(action)))
    button.dataset.action = action

    const check = document.createElement('span')
    check.className = 'qv-menu__check'
    check.textContent = this.checked.has(action) ? '✓' : ''
    const label = document.createElement('span')
    label.className = 'qv-menu__label'
    label.textContent = item.label
    button.append(check, label)
    if (item.shortcut) {
      const hint = document.createElement('span')
      hint.className = 'qv-menu__shortcut'
      hint.textContent = item.shortcut
      button.append(hint)
    }
    if (this.disabled.has(action)) button.disabled = true
    else button.addEventListener('click', () => this.emit(action))
    return button
  }
}

customElements.define('quiz-menu-bar', QuizMenuBar)
