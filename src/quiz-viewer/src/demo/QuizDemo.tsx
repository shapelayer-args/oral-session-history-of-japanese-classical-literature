// Direct module imports rather than the kit's index, so the brand artwork
// and parts this demo doesn't use stay out of the bundle
import { Stage } from '../../vendor/stageshow/kit/stage'
import { Bar, Text, Window } from '../../vendor/stageshow/kit/window'
import { Check } from '../../vendor/stageshow/kit/parts/Check'
import { Collapse } from '../../vendor/stageshow/kit/motion/Collapse'
import type { Act } from '../../vendor/stageshow/kit/act'
import './demo.css'

// The welcome screen's illustration: how the viewer is used, in one question.
// Built on the Stageshow kit (SKILLS/stageshow), starting from the ai-cards
// gold: a choice picked and kept as the record, the answer opening in place
// with its own height, the action confirming on its own button.
//
// Beats: the question waits with 다음 disabled; a choice is picked; it turns
// to 정답 with its check; the explanation drops in under the choices and
// everything below moves with it; 다음 becomes the primary action and the
// cursor rests on it. Plays once; the poster is the payoff.
//
// Real strings: the menu, the prompt, the four choices, the verdict and the
// explanation's first line, the button. The quiz title and progress are
// filler: the eye lands on the question.

type S = { pick: number | null; reveal: boolean }

const CHOICES = [
  '다이고 천황의 명으로 편찬된 칙찬집이다',
  '현존하는 일본 최고(最古)의 가집이다',
  '히라가나만으로 표기되어 있다',
  '천황과 귀족의 노래만 실려 있다',
]
const ANSWER = 1
const LETTERS = ['①', '②', '③', '④']

const initial: S = { pick: null, reveal: false }
const poster: S = { pick: ANSWER, reveal: true }

async function script(a: Act<S>) {
  await a.wait(1000)
  a.mark('pick')
  await a.click({ at: `choice-${ANSWER}`, x: 0.3, y: 0.55 })
  a.put({ pick: ANSWER })
  await a.wait(550)
  a.mark('reveal')
  a.put({ reveal: true })
  await a.wait(900)
  a.mark('next')
  await a.move({ at: 'next', x: 0.6, y: 0.62 })
  await a.wait(2600)
}

export default function QuizDemo() {
  return (
    <Stage
      width={620}
      height={500}
      initial={initial}
      poster={poster}
      script={script}
      play="once"
      cursor={{ at: { x: 560, y: 480 } }}
      className="qd"
    >
      {(s) => {
        const answered = s.pick !== null
        return (
          <Window title="Quiz Viewer" className="qd-win" lead={<span className="qd-menu"><span data-on>파일</span><span>퀴즈</span><span>도움말</span></span>}>
            <div className="qd-body">
              <div className="qd-head">
                <Bar w={150} h={8} r={4} tone={3} />
                <span className="qd-progress"><span className="qd-progress__fill" data-on={s.reveal || undefined} /></span>
              </div>
              <div className="qd-card">
                <Text className="qd-kicker">문항 1 · 옳은 것을 고르시오</Text>
                <Text className="qd-prompt" wrap>『만요슈』에 대한 설명으로 옳은 것은?</Text>
                <div className="qd-choices" data-answered={answered || undefined}>
                  {CHOICES.map((c, i) => (
                    <span key={i} className="qd-choice" data-target={`choice-${i}`} data-cursor="pointer" data-on={s.pick === i || undefined}>
                      {/* The letter and the check share one cell: the pick
                          turns ① into its check, so the row keeps one inset */}
                      <span className="qd-lead">
                        <span className="qd-letter">{LETTERS[i]}</span>
                        <span className="qd-mark"><Check on={s.pick === i} size={14} /></span>
                      </span>
                      <Text className="qd-choice__text">{c}</Text>
                    </span>
                  ))}
                </div>
                <Collapse open={s.reveal} reveal="drop">
                  <div className="qd-why">
                    <Text className="qd-verdict">정답입니다</Text>
                    <Text className="qd-why__text" wrap>8세기 후반에 성립한 현존 최고의 가집으로, 약 4,500수를 싣고 있습니다.</Text>
                  </div>
                </Collapse>
                <div className="qd-foot">
                  <Bar w={120} h={6} r={3} tone={2} />
                  <span className="qd-next" data-target="next" data-cursor="pointer" data-ready={s.reveal || undefined}>다음</span>
                </div>
              </div>
              {/* The next question, as filler: it fills the window's foot
                  and runs off the stage, so the card never floats on a void */}
              <div className="qd-card qd-ghost" aria-hidden data-crop>
                <Bar w={70} h={6} r={3} tone={2} />
                <Bar w={260} h={9} r={4} tone={3} />
                <Bar w="100%" h={36} r={9} tone={1} />
                <Bar w="100%" h={36} r={9} tone={1} />
                <Bar w="100%" h={36} r={9} tone={1} />
                <Bar w="100%" h={36} r={9} tone={1} />
              </div>
            </div>
          </Window>
        )
      }}
    </Stage>
  )
}
