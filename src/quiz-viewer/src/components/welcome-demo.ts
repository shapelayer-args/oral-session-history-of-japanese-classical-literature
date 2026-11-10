/**
 * Hosts the Stageshow illustration (React) inside a custom element, so the
 * rest of the viewer stays plain WebComponents. React loads lazily: the quiz
 * itself never waits for it.
 */

import type { Root } from 'react-dom/client'

export class QuizWelcomeDemo extends HTMLElement {
  private root: Root | null = null
  private cancelled = false

  connectedCallback(): void {
    this.cancelled = false
    void this.mount()
  }

  disconnectedCallback(): void {
    this.cancelled = true
    this.root?.unmount()
    this.root = null
  }

  private async mount(): Promise<void> {
    const [{ createElement }, { createRoot }, { default: QuizDemo }] = await Promise.all([
      import('react'),
      import('react-dom/client'),
      import('../demo/QuizDemo.tsx'),
    ])
    if (this.cancelled || this.root) return
    this.root = createRoot(this)
    this.root.render(createElement(QuizDemo))
  }
}

customElements.define('quiz-welcome-demo', QuizWelcomeDemo)
