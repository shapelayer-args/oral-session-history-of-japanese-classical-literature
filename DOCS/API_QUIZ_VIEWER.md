# Quiz Viewer API

퀴즈 뷰어(`src/quiz-viewer`)가 읽는 퀴즈 JSON의 형식과, 프리셋 배포 방식을 정의한다.
퀴즈의 내용 요건은 [`AGENTS/GENERATE_QUIZ.md`](../AGENTS/GENERATE_QUIZ.md), 뷰어 요건은 [`AGENTS/DEVELOP_QUIZ_VIEWER.md`](../AGENTS/DEVELOP_QUIZ_VIEWER.md)를 따른다.

- JSON Schema: [`src/quiz-viewer/schema/quiz.schema.json`](../src/quiz-viewer/schema/quiz.schema.json) (Draft 2020-12)
- 프리셋 목록 Schema: [`src/quiz-viewer/schema/presets.schema.json`](../src/quiz-viewer/schema/presets.schema.json)
- 배포 URL: <https://shapelayer-args.github.io/oral-session-history-of-japanese-classical-literature/quiz-viewer/>
- 현재 스펙 버전: `1.0`

## 1. 파일 위치

| 경로 | 설명 |
|---|---|
| `GENERATED/QUIZ/*.json` | 프리셋 퀴즈. 파일 하나에 퀴즈 세트 하나. 빌드할 때 모두 검증되고 함께 배포된다. |
| `src/quiz-viewer/schema/` | JSON Schema. 배포본에서는 `quiz-viewer/schema/` 경로로 제공된다. |

파일 이름은 자유롭게 정하되 `id`와 맞추는 것을 권장한다 (예: `heian-monogatari-normal.json`).
파일 첫 줄에 `"$schema": "../../src/quiz-viewer/schema/quiz.schema.json"`을 넣어 두면 편집기가 자동완성과 검증을 해 준다.

## 2. 퀴즈 문서 (`Quiz`)

```jsonc
{
  "$schema": "../../src/quiz-viewer/schema/quiz.schema.json",
  "specVersion": "1.0",
  "id": "heian-monogatari-normal",
  "title": "헤이안 모노가타리 문학",
  "description": "발표 2부(모노가타리의 성립)에 대한 이해도 확인",
  "language": "ko",
  "difficulty": "normal",
  "createdAt": "2026-11-10T00:00:00Z",
  "authors": ["Kilo"],
  "sources": [{ "label": "발표 슬라이드", "path": "typst/main.typ" }],
  "questions": [ /* Question[] */ ]
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `$schema` | string | | 편집기용 스키마 경로. 뷰어는 무시한다. |
| `specVersion` | `"1.0"` | ✓ | 이 문서 형식의 버전. |
| `id` | slug | ✓ | 퀴즈 세트 식별자. 프리셋끼리 겹치면 안 된다. |
| `title` | string | ✓ | 열기 대화상자와 뷰어 상단에 표시되는 제목. |
| `description` | string | | 요약. 열기 대화상자에서 툴팁으로 표시된다. |
| `language` | BCP 47 | | 기본값 `ko`. |
| `difficulty` | `easy` \| `normal` \| `hard` | ✓ | 세트 전체의 난이도 (§5). |
| `createdAt` | ISO 8601 date-time | | 생성 시각. |
| `authors` | string[] | | 생성한 사람 또는 에이전트. |
| `sources` | Reference[] | | 퀴즈를 생성할 때 참조한 슬라이드와 자료. |
| `questions` | Question[] | ✓ | 출제 순서대로 나열한 N개의 문항. 1개 이상. |

`slug`는 `^[a-z0-9]+(?:[-_][a-z0-9]+)*$` 형식이며 최대 64자다.

## 3. 문항 (`Question`)

```jsonc
{
  "id": "genji",
  "type": "single-choice",
  "mode": "pick-valid",
  "prompt": "『겐지 이야기』에 대한 설명으로 옳은 것은?",
  "choices": [ /* Choice × 4 */ ],
  "answer": "c",
  "explanation": "문항 전체에 대한 해설 (선택)",
  "difficulty": "hard",
  "references": [{ "label": "발표 슬라이드", "path": "typst/main.typ", "slide": 12 }],
  "tags": ["헤이안 시대"]
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | slug | ✓ | 퀴즈 안에서 고유해야 한다. |
| `type` | `"single-choice"` | ✓ | 객관식이며, 고를 답은 하나다. |
| `mode` | `pick-valid` \| `pick-invalid` | ✓ | 출제 유형 (§3.1). |
| `prompt` | string | ✓ | 질문. |
| `choices` | Choice[4] | ✓ | 정확히 4개다 (4지선다). |
| `answer` | slug | ✓ | 정답 선택지의 `id`. |
| `explanation` | string | | 답한 뒤 표시되는 문항 전체 해설. |
| `difficulty` | difficulty | | 이 문항에만 적용할 난이도. 세트의 값과 다를 때만 표시된다. |
| `references` | Reference[] | | 문항의 근거 자료. |
| `tags` | string[] | | 분류용 태그. 지금은 표시하지 않는다. |

### 3.1 `mode`: `GENERATE_QUIZ.md`의 두 가지 경우

| `mode` | GENERATE_QUIZ | 선택지 구성 | 정답 | 뷰어에 표시되는 지시문 |
|---|---|---|---|---|
| `pick-valid` | 경우 1 | 타당한 서술 1개, 타당하지 않은 서술 3개 | 타당한 서술 | 옳은 것을 고르시오 |
| `pick-invalid` | 경우 2 | 타당하지 않은 서술 1개, 타당한 서술 3개 | 타당하지 않은 서술 | 옳지 않은 것을 고르시오 |

`valid`는 **서술 자체가 타당한가**를 뜻한다. **정답인가**와는 다르다. `pick-invalid` 문항에서는 `valid: false`인 선택지가 정답이다.

## 4. 선택지 (`Choice`)

```jsonc
{
  "id": "c",
  "text": "무라사키 시키부가 11세기 초에 쓴 것으로 알려진 54첩의 장편 이야기이다.",
  "valid": true,
  "explanation": "이 서술이 타당한 이유, 또는 어느 부분이 틀렸고 왜 반박되는지",
  "references": [{ "label": "…", "path": "resources/…", "page": "12-14" }]
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `id` | slug | ✓ | 문항 안에서 고유해야 한다. `a`–`d`를 권장한다. |
| `text` | string | ✓ | 선택지로 표시되는 서술. 앞에 붙는 번호(①–④)는 뷰어가 매긴다. |
| `valid` | boolean | ✓ | 서술이 타당하면 `true`, 반박되면 `false`. |
| `explanation` | string | ✓ | 각 항목이 타당한 이유 또는 타당하지 않은 이유 (GENERATE_QUIZ 5단계). |
| `references` | Reference[] | | 근거 자료. |

## 5. 난이도 (`difficulty`)

| 값 | 표시 | GENERATE_QUIZ 기준 |
|---|---|---|
| `easy` | 쉬움 | 서술이 명확하고 단순하며, 오류를 찾기 쉽다. |
| `normal` | 보통 | 서술이 명확하지만 단순하지 않다. 오류를 찾으려면 발표 자료를 참조해야 한다. |
| `hard` | 어려움 | 서술이 명확하지 않다. 오류를 찾으려면 발표 자료와 그 Reference까지 참조해야 한다. |

## 6. 참조 (`Reference`)

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `label` | string | ✓ | 사람이 읽는 출처 표기. |
| `path` | string | | 워크스페이스 기준 상대 경로 (`typst/…`, `resources/…`). |
| `slide` | integer ≥ 1 | | 슬라이드 번호. |
| `page` | string | | 쪽 또는 쪽 범위 (`"12"`, `"12-14"`). |
| `url` | URI | | 외부 링크. |

뷰어에는 `label (path, 슬라이드 N, p.X)` 형식으로 표시된다.

## 7. 검증 규칙

JSON Schema 검증에 더해, 뷰어와 빌드는 스키마로 표현할 수 없는 규칙도 검사한다 (`src/quiz-viewer/src/quiz/validate.ts`).

1. 문항 `id`는 퀴즈 안에서, 선택지 `id`는 문항 안에서 고유해야 한다.
2. 선택지는 정확히 4개이고, 모든 선택지에 `explanation`이 있어야 한다.
3. `pick-valid` 문항은 `valid: true`인 선택지가 정확히 1개, `pick-invalid` 문항은 `valid: false`인 선택지가 정확히 1개여야 한다.
4. `answer`는 선택지 `id` 중 하나여야 하며, 3번에서 말한 그 선택지여야 한다.
5. 프리셋의 퀴즈 `id`는 서로 겹치면 안 된다.

검증 명령:

```sh
cd src/quiz-viewer
npm ci
npm run check:presets                          # GENERATED/QUIZ 전체
node scripts/check-presets.ts path/to/a.json   # 특정 파일
```

`npm run build`도 같은 검증을 거치므로, 규칙을 어긴 프리셋이 있으면 CI 빌드가 실패하고 배포되지 않는다.

## 8. 프리셋 목록 (`presets/index.json`)

빌드할 때 `GENERATED/QUIZ`로부터 생성되는 파일이다. 저장소에 커밋하지 않는다. 뷰어의 "파일 → 열기 → 프리셋" 탭이 이 파일을 읽는다.

```json
{
  "specVersion": "1.0",
  "generatedAt": "2026-11-10T03:00:00.000Z",
  "presets": [
    {
      "id": "sample-japanese-classics-easy",
      "file": "sample-japanese-classics-easy.json",
      "title": "[샘플] 일본 고전문학사 기초",
      "description": "…",
      "difficulty": "easy",
      "questionCount": 5,
      "createdAt": "2026-11-10T00:00:00Z"
    }
  ]
}
```

배포본의 구조:

```
quiz-viewer/
  index.html
  assets/…
  presets/index.json
  presets/<GENERATED/QUIZ 의 파일 이름>.json   (원본 그대로)
  schema/quiz.schema.json
  schema/presets.schema.json
```

## 9. 뷰어 동작

- **메뉴**
  - **파일**: 열기… (`Ctrl/⌘ O`, 프리셋과 로컬 탭), 파일에서 열기…, 폴더에서 열기…, 닫기
  - **퀴즈**: 처음부터 다시 풀기 (`Ctrl/⌘ R`), 선택지 섞기 (설정이 브라우저에 저장된다)
  - **도움말**: JSON 스펙 문서, 퀴즈 뷰어 정보
- **로컬에서 열기**: JSON 파일 하나를 고르거나, 폴더를 골라 그 안의 `*.json`을 모두 찾는다. 파일을 창에 끌어다 놓아도 열린다. 형식 오류가 있으면 문제 목록이 표시된다.
- **풀이**
  - 질문과 ①–④ 선택지가 표시된다. 키보드 `1`–`4`로도 고를 수 있다.
  - 답을 고르면 그 문항은 잠긴다. 정답 여부(정답입니다/오답입니다)와 정답 선택지가 표시되고, 네 선택지 각각에 타당 여부와 `explanation`이 펼쳐진다.
  - **다음** 버튼은 답하기 전에는 비활성이고, 답한 뒤에 눌러 다음 문항으로 넘어간다. 마지막 문항에서는 "결과 보기"로 바뀐다.
  - 결과 화면에는 점수와 문항별 정답·오답이 표시된다.
- **URL 파라미터**
  - `?preset=<file 또는 id>`: 배포된 프리셋을 바로 연다. 예: `quiz-viewer/?preset=sample-japanese-classics-easy`
  - `?src=<url>`: 임의 URL의 퀴즈 JSON을 연다. 다른 출처라면 CORS를 허용해야 한다.

## 10. 개발과 배포

```sh
cd src/quiz-viewer
npm ci
npm run dev       # http://127.0.0.1:5173, GENERATED/QUIZ 를 실시간으로 제공
npm run build     # typecheck + 프리셋 검증 + dist/ 생성
npm run preview
```

- 소스는 TypeScript와 Custom Elements(WebComponents)로 작성되어 있다. 시작 화면 일러스트만 Stageshow kit(React)을 쓰며, 지연 로드된다. kit은 `SKILLS/stageshow` 서브모듈에서 `src/quiz-viewer/vendor/stageshow/kit`으로 복사해 두었다 (MIT, `vendor/stageshow/LICENSE`). 서브모듈을 갱신하면 다시 복사해야 한다.
- CI: `.github/workflows/quiz-viewer-pages.yml`. `main`에 push되고 `src/quiz-viewer/**`, `GENERATED/QUIZ/**` 또는 워크플로가 바뀌면 빌드해 GitHub Pages에 배포한다. PR에서는 빌드와 검증만 한다. 사이트 루트(`/`)는 `/quiz-viewer/`로 리디렉션한다.
- 저장소의 **Settings → Pages → Source**를 **GitHub Actions**로 설정해야 배포된다.

## 11. 버전 정책

필드 의미가 바뀌거나 필수 필드가 추가되면 `specVersion`을 올린다. 선택 필드만 추가될 때는 올리지 않는다. 뷰어는 자기가 아는 `specVersion`이 아닌 문서를 거부한다.
