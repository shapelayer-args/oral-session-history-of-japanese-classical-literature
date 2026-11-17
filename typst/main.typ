#import "@preview/furiruby:0.1.0": ruby, rt

#let sans = ("Noto Sans KR", "Noto Sans CJK KR", "Noto Sans JP", "Noto Sans CJK JP")
#let serif = ("Noto Serif KR", "Noto Serif CJK KR", "Noto Serif JP", "Noto Serif CJK JP")
#let mono = ("Noto Sans Mono", "D2Coding", "MonoplexKR")

// ═════════════════════════════════════════════════════════════
//  1. 팔레트 (원시 색상값, anthropic.com CSS 변수에서 발췌)
// ═════════════════════════════════════════════════════════════
#let palette = (
  // 슬레이트 — 따뜻한 회색 단계
  slate-950: rgb("#141413"), // 본문 글자, 다크 배경
  slate-900: rgb("#1a1918"),
  slate-800: rgb("#262624"),
  slate-700: rgb("#3d3d3a"),
  slate-600: rgb("#5e5d59"),
  slate-550: rgb("#73726c"),
  slate-500: rgb("#87867f"),
  slate-400: rgb("#b0aea5"),
  slate-300: rgb("#d1cfc5"),
  slate-250: rgb("#dedcd1"),
  // 아이보리 — 배경 단계
  ivory-light: rgb("#faf9f5"), // 페이지 배경
  ivory-medium: rgb("#f0eee6"), // 면(surface)
  ivory-dark: rgb("#e8e6dc"), // 눌린 면, 표 줄무늬
  oat: rgb("#e3dacc"),
  // 강조
  clay: rgb("#d97757"), // 시그니처 오렌지
  clay-deep: rgb("#c6613f"), // 글자에 쓰는 clay (대비 확보)
  // 보조 (도표·데이터 계열색, 의미 구분용)
  olive: rgb("#788c5d"),
  sky: rgb("#6a9bcc"),
  fig: rgb("#c46686"),
  cactus: rgb("#bcd1ca"),
  heather: rgb("#cbcadb"),
  coral: rgb("#ebcece"),
  error: rgb("#bf4d43"),
)

// ═════════════════════════════════════════════════════════════
//  2. 의미 색상 (컴포넌트는 이 이름만 참조한다)
// ═════════════════════════════════════════════════════════════
#let colors = (
  bg: palette.ivory-light,
  surface: palette.ivory-medium, // 콜아웃·카드 면
  surface-strong: palette.ivory-dark,
  text: palette.slate-950,
  sub: palette.slate-700, // 날짜·보조 정보
  muted: palette.slate-550, // 부연 설명, 인용 막대, 머리말
  faint: palette.slate-400, // 쪽 번호, 비활성
  border: palette.slate-300, // 헤어라인
  rule: palette.slate-950, // 표의 굵은 괘선
  accent: palette.clay,
  accent-text: palette.clay-deep,
  inverse-bg: palette.slate-950,
  inverse-text: palette.ivory-light,
  inverse-muted: palette.slate-400,
)

/// 콜아웃·배지 등에 쓰는 톤. (면, 라벨 글자색)
#let tones = (
  neutral: (fill: colors.surface, label: colors.text),
  accent: (fill: palette.clay.lighten(84%), label: colors.accent-text),
  olive: (fill: palette.olive.lighten(82%), label: palette.olive.darken(25%)),
  sky: (fill: palette.sky.lighten(82%), label: palette.sky.darken(30%)),
  fig: (fill: palette.fig.lighten(84%), label: palette.fig.darken(25%)),
)

// ═════════════════════════════════════════════════════════════
//  3. 글꼴 · 활자 크기
// ═════════════════════════════════════════════════════════════
#let fonts = (
  heading: ("Pretendard",),
  body: ("Noto Serif KR",),
  mono: ("JetBrains Mono",),
  math: ("New Computer Modern Math",),
)

/// 활자 크기 단계. 원본 PDF에서 쓰인 크기를 기준으로 이름을 붙였다.
#let sizes = (
  display: 60pt, // 섹션명
  title: 44pt, // 슬라이드 제목, 표지 제목
  eyebrow: 36pt, // "섹션 #n"
  lead: 28pt, // 표지 부제, 핵심 문장
  body: 20pt, // 본문
  small: 18pt, // 인용·콜아웃·표
  caption: 15pt, // 머리말, 캡션
  micro: 12pt, // 쪽 번호
)

/// 줄 간격 (anthropic.com: 제목 112–120%, 본문 145–150%)
#let leading = (
  tight: 0.25em, // 제목 여러 줄
  body: 0.83em, // 본문 (원본 PDF 실측, ≈ 150%)
)

/// 숫자는 라이닝·비례폭 (anthropic.com: "pnum", "lnum")
#let num-features = (lnum: 1, pnum: 1)

// ═════════════════════════════════════════════════════════════
//  4. 간격 · 라운드 · 선
// ═════════════════════════════════════════════════════════════
/// 4pt 기반 간격 단계 (anthropic.com --spacer-01 … 12)
#let space = (
  "1": 4pt,
  "2": 8pt,
  "3": 12pt,
  "4": 16pt,
  "5": 24pt,
  "6": 32pt,
  "7": 40pt,
  "8": 48pt,
  "9": 64pt,
  "10": 80pt,
)

#let radius = (xs: 4pt, sm: 8pt, md: 12pt, lg: 16pt, full: 999pt)

#let strokes = (
  hairline: 0.75pt + colors.border,
  rule: 1.2pt + colors.rule,
  rule-thin: 0.6pt + colors.rule,
  quote: 3pt + colors.muted,
)

// ====

#set text(font: serif, size: 10pt)


// 번호를 숨길 페이지의 본문에 #hide-page-counter()를 넣습니다.
#let hide-page-counter() = [#metadata(none) <hide-page-counter>]

#let page-counter = context {
  let total = counter(page).final().first()
  let page-number = here().page()
  let hidden = query(<hide-page-counter>).any(marker => marker.location().page() == page-number)
  if total > 1 and not hidden {
    let current = counter(page).get().first()
    let ink = palette.slate-950
    place(bottom + right, dx: -10mm, dy: -9pt, box(fill: white, grid(
      columns: (auto, auto),
      align: horizon,
      column-gutter: 4pt,
      box(width: 18pt, height: 18pt, fill: ink, align(center + horizon, text(
        size: 10.5pt,
        weight: 700,
        fill: white,
        top-edge: "cap-height",
        bottom-edge: "baseline",
        str(current),
      ))),
      box(inset: (right: 4pt), text(size: 10pt, fill: ink, "/ " + str(total))),
    )))
  }
}

// Required End

#set page(
  paper: "presentation-4-3",
  margin: (
    top: 10mm,
    bottom: 10mm,
    left: 10mm,
    right: 10mm,
  ),
  foreground: page-counter,
)

#let quote(body, indent: 10pt, size: sizes.small) = pad(left: indent, block(
  stroke: (left: strokes.quote),
  inset: (left: 28pt, y: 3pt),
  {
    set text(size: size, fill: colors.muted, weight: "regular")
    set par(leading: leading.body, justify: true)
    body
  },
))

// #show raw: it => text(font: mono)[#it]

#set text(font: serif, size: 10pt)
#show heading.where(
  level: 1
): it => block(width: 100%)[
  // #set align(center)
  #text(weight: "regular", size: 1.3em)[
    #it.body
  ]
]

#show heading.where(level: 2): set text(size: 1.5em, weight: "semibold")
// #show heading.where(level: 2): set align(center)
#show heading.where(level: 3): set text(size: 1.3em, weight: "regular")

#let img(path, size: 100%) = {
  align(center)[
    #image(path, width: size)
  ]
}

#show raw.where(block: false): it => box(fill: rgb("f5f5f5"), outset: (y: 5pt), inset: (x: 5pt), text(fill: red, it))
#show raw.where(block: true): it => block(fill: rgb("f5f5f5"), outset: (y: 10pt), inset: (x: 10pt), width: 100%, it)

#let ruby = ruby.with(layout: (
  inline-mode: "float",
))

#let mononoke-ruby(description) = context {
  let left-ruby = rt(align(center, description), [物])
  let right-ruby = rt[기운・기척 #v(.5em)][怪]
  // 양쪽 열의 폭을 같게 두어 の를 기준으로 글자 간격을 맞춥니다.
  let side-width = calc.max(measure(left-ruby).width, measure(right-ruby).width)
  grid(
    columns: (side-width, auto, side-width),
    align: center + bottom,
    left-ruby,
    ruby[の],
    right-ruby,
  )
}

#set footnote.entry(gap: 1em)
#show footnote.entry: set par(leading: 1em, spacing: 1em)

#let fontset-textcontent = ("Arita Buri KR", "Noto Serif KR", "Noto Serif CJK KR", "Noto Serif JP", "Noto Serif CJK JP")
#let dark00 = color.rgb("263032")

// #set list(marker: [#text(font: "inter", fill: dark00)[✓]])
#set list(marker: move(dy: -0.15em, text(font: "inter", fill: dark00)[»]))
// #show list.item: set text(font: sans)

#let quote-src(content) = text(font: sans, size: 0.8em)[#v(.6em)#content]

#let quote-linegap = 0.8em

#let quote-content(content) = {
  set par(leading: quote-linegap)
  set align(center)
  content
}

#let genji = "『겐지모노가타리』"
#let heike = "『헤이케모노가타리』"

// Content Start

#hide-page-counter()

#page(margin: 0pt)[

  #align(center + horizon)[#pad(x: 20pt)[
    #v(40mm)
    #text(size: 36pt)[#par(leading: 1em)[
      산실에서 드러나는 모노노케의 정체
    ]]
    \
    #text(size: 18pt)[
      『겐지모노가타리』와 『헤이케모노가타리』에서 출산 과정에 등장하는 모노노케들
    ]

    #text(size: 18pt)[
      모노노케 서사는 왜 출산에 자주 사용되었는가?
    ]

    #v(50pt)

    #align(right)[#pad(x: 20pt)[
      #text(size: 16pt)[#par(leading: 1em)[
        박종현\
        전남대학교 컴퓨터정보통신공학과
      ]]]
    ]
    #v(100mm)
  ]]
  #place(bottom, layout(size => {
    let image-height = size.width * 807 / 2000

    // 위 28%, 아래 5%를 잘라내고 가운데 67%만 보여주기
    let crop-top = image-height * 0.28
    let crop-bottom = image-height * 0.05

    block(width: 100%, height: image-height - crop-top - crop-bottom, clip: true)[
      #place(top + left, dy: -crop-top, image(
        "assets/Shinnyodoo_engi.jpg",
        width: size.width,
        height: image-height,
      ))
    ]
  }))
]

#pagebreak()

#counter(page).update(1)

#set page(margin: 20mm)
#set par(justify: true)
#set align(horizon)
#set text(size: 24pt, fill: dark00, font: fontset-textcontent)


== 物の怪

\

#quote[
  白髪なる老僧の錫杖を持つて常は皇子の御枕に佇むと人々の夢にも見え現にも立ちけり ・ 恐ろしなどもおろかなり

  백발의 노승이 석장을 들고 늘 황자의 머리맡에 서 있는 모습이 사람들의 꿈에도 보였고, 현실에도 나타났다. 무섭다는 말로도 모자랐다.

  #v(.6em)
  #text(font: sans, size: 0.8em)[헤이케모노가타리, 권3 「頼豪」(라이고)]
]

#quote[
  怨霊はかく昔も恐ろしかりし事共なり

  원령은 옛날에도 이처럼 무서운 것이었다

  #v(.6em)
  #text(font: sans, size: 0.8em)[헤이케모노가타리, 권3 「頼豪」(라이고)]
]

#pagebreak()

#text(size: 1.3em)[#align(center)[= #mononoke-ruby[정체가 불분명한 \ 무언가 #v(.5em)]]]

\
\
#place(
  bottom,
  dy: 30pt,
)[
  #grid(
    align: auto,
    columns: (10fr, 3fr, 3fr),
    gutter: -1em,
    [],
    [],
    //[#image("assets/char-shadow.png", width: 100%)]
  )
]


#pagebreak()

#text(size: 1.3em)[#align(center)[= #mononoke-ruby[정체가 불분명한 \ 무언가 #v(.5em)]]]

\
\

- 🇰🇷 : 살(煞), 객귀(客鬼)
- 🇨🇳 : 사기(邪氣), 고독(蠱毒)
- 🇪🇺 : 몽마(Incubus/Succubus), 악마 빙의(Possession)
- ☪️ : 진(Jinn), 사악한 눈(Evil Eye)

#place(
  bottom,
  dy: 30pt,
)[
  #grid(
    align: auto,
    columns: (10fr, 3fr, 3fr),
    gutter: -1em,
    [],
    [],
    //[#image("assets/char-shadow.png", width: 100%)]
  )
]

#pagebreak()


#text(size: 1.3em)[#align(center)[= #mononoke-ruby[정체가 불분명한 \ 무언가 #v(.5em)]]]

\
\
#place(
  bottom,
  dy: 30pt,
)[
  #grid(
    align: auto,
    columns: (10fr, 3fr, 3fr),
    gutter: -1em,
    [],
    [],
    //[#image("assets/char-shadow.png", width: 100%)]
  )
]


#align(horizon)[
  1. 신보다 열등한 초자연적 존재 --- \
    곧 사람의 영혼이나 오니, 텐구, 여우 따위가 내는 기운

  2. 그 기운이 사람에게 작용하여 생기는 심신의 부조
  3. 그 원인이 되는 존재 자체
]

#pagebreak()

#text(size: 1.3em)[#align(center)[= #mononoke-ruby[정체가 *불분명한* \ 무언가 #v(.5em)]]]

\
\

#align(center)[
  怨霊はかく昔も恐ろしかりし事共なり

  원령은 옛날에도 이처럼 무서운 것이었다

  #v(.6em)
  #text(font: sans, size: 0.8em)[헤이케모노가타리, 권3 「頼豪」(라이고)]
]

#pagebreak()

#text(size: 1.3em)[#align(center)[= #mononoke-ruby[정체가 *불분명한* \ 무언가 #v(.5em)]]]

// 불분명해서 오히려 더욱 무서움

\
\

#align(center)[
  빙의한 것의 정체가 밝혀지지 않은 동안에 쓰이는 총칭

  정체가 드러난 뒤에는 ○○의 '영(霊)'이라 불림
]

#pagebreak()

#{
  set page(margin: 0mm)
  set page(margin: (bottom: 10mm))
  align(center)[
  모노노케 같은 것도 \ 사람이 이처럼 약해진 틈을 타 기세를 얻는 법이어서...
  #v(.6em)
  #text(font: sans, size: 0.8em)[겐지모노가타리, 「유기리」 제39첩]
  ]

  [\ ]
  
  align(center)[
    학질이나 노환, 난산 같은 몸의 병

    질투에서 온 발작 ・ 짝사랑으로 인한 우울 ・ 갑작스러운 출가의 뜻

    #quote-src[이미숙(2015)]
]

  /*align(center)[
  #place(center + bottom, float: true)[#image("assets/char-escape.png", width: 45%)]
  ]*/
}

#pagebreak()

#hide-page-counter()

#pagebreak()

// 겐지모노가타리

#quote-content[
  ひとだまひの奥におしやられて、物も見えず。心やましきをばさるものにて、かかるやつれをそれと知られぬるが、いみじうねたきこと、限りなし。

  #v(.6em)

  ... 미야스도코로의 수레는 아오이노우에가 탄 몇 대의 수레 때문에 안으로 들이밀려 아무것도 보이지 않게 되었다.

  그것도 유감스러웠지만, 그보다도 자신의 누구인지 드러난 채 이렇게 미련스레 욕먹고 있다는 사실이 분해서 견딜 수 없었다.

  #quote-src[#genji 「아오이」권]
]

#pagebreak()

#quote-content[
  大殿には、御もののけいたう起こりて、いみじうわづらひたまふ。「この御生きすだま、...
  
  아오이노우에의 상태는 점점 더 나빠졌다. 로쿠죠의 생령이라고도...(소문이 들려 왔을 때)...

  #v(1em)

  夢には、かの姫君とおぼしき人の、… 所に行きて、… たけくいかきひたぶる心出で来て、… うちかなぐるなど見えたまふ。

  꿈에서 아오이노우에로 ... 가서, 그 사람 앞에서는 난폭한 자신이 되어 ... 아오이노우에를 괴롭히기도 했다.

  #quote-src[#genji 「아오이」권]
]

#pagebreak()


#quote-content[
  ほのめかしたまへるけしきを、心の鬼にしるく見たまひて、「さればよ」と思すも、いといみじ。

  겐지의 편지를 읽고 자신이 생령이 되었던 일을 알고 있음을, 편지에 내비치고 있다는 것을 깨달았다. 이것도 모두 자신의 박명 때문이라며 슬퍼했다.

  #quote-src[#genji 「아오이」권]
]

#pagebreak()


#quote-content[
  「生くべうもおぼえはべらぬを、かくおはしまいたるついでに、尼になさせたまひてよ」

  "저는 오래 살 것 같지 않으니, 이렇게 오신 기회에 저를 비구니로 만들어 주십시오."

  #v(1em)

  「さは、このもののけのここにも、離れざりけるにやあらむ」

  "그럼. #rt[로쿠조노 미야스도코로 #v(.3em)][무라사키 부인을 괴롭혔던 악령]이 떠나지 않고 있었던가?"

  #quote-src[#genji 「가시와기」권]
]

#pagebreak()

#quote-content[
  「かうぞあるよ。いとかしこう取り返しつと、一人をば思したりしが、いとねたかりしかば、このわたりに、さりげなくてなむ、日ごろさぶらひつる。今は帰りなむ」とて、うち笑ふ。

  "그것 보십시오. 능숙하게 한 사람을 되찾았다고 생각하고 있는 모습이 분했기 때문에, 그 사람 다음에는 눈치채지 못하게 하고 이리로 와 있었던 것입니다. 이제 돌아가겠습니다."

  #quote-src[#genji 「가시와기」권]
]

#pagebreak()

#hide-page-counter()

#pagebreak()

#quote-content[
  保元の秋掘り起して捨てられし後は、死骸道の辺の土となりて、年々にただ春の草のみ茂れり。

  호겐의 난이 일어난 해 가을, 시신#super[요리나가]은 파헤쳐져 버려진 뒤 길가의 흙이 되었고, 해마다 봄풀만 무성하게 자랐다.

  #quote-src[#heike 「사문」]
]

#pagebreak()

#quote-content[
  新大納言は死罪に行はるべかりし人の流罪に宥められける事は、小松殿のやうやうに申されけるによつてなり。

  신다이나곤#super[나리치카]은 사형에 처해질 사람이었으나, 고마쓰도노#super[시게모리]가 여러모로 간청하여 유배로 감형되었다.

  #quote-src[#heike 「신다이나곤의 유배」]

  #v(1em)

  吉備の中山有木の別所にてぞつひに失ひ奉る。

  기비의 나카야마에 있는 아리키노 벳쇼에서 끝내 나리치카를 죽였다.

  #quote-src[#heike 「신다이나곤의 죽음」]
]

#pagebreak()

#quote-content[
  口を裂かれ、五条西の朱雀にして遂に斬られにけり。

  사이코는 입이 찢긴 뒤, 고조 서쪽의 스자쿠에서 끝내 목이 베였다.

  #quote-src[#heike 「사이코가 참수되다」]

  #v(1em)

  俊寛僧都、丹波少将成経、平判官康頼、この三人をばまた薩摩潟鬼界島へぞ流されける。

  슌칸 승도, 단바 소장 나리쓰네, 다이라 판관 야스요리, 이 세 사람도 사쓰마 앞바다의 기카이가시마로 유배되었다.

  #quote-src[#heike 「신다이나곤의 죽음」]
]
#pagebreak()

#quote-content[
  御懐妊とぞ聞えし。... 怖き御物怪共数多取り入り奉る。
  
  중궁께서 임신하셨다고 전해졌다. ... 무서운 모노노케들이 여럿 중궁에게 달라붙었다.

  #v(1em)

  神子明王の縛にかけて霊現れたり。殊に讃岐院の御霊、宇治悪左府の御憶念、新大納言成親の死霊、西光法師が悪霊、鬼界島の流人共の生霊などぞ申しける。

  요리마시에게 옮겨 붙은 영들을 명왕의 속박에 걸자 그 정체가 드러났다. ...사누키인의 영, 후지와라노 요리나가의 원념, 신다이나곤 나리치카의 사령, 사이코 법사의 악령, 기카이가시마 유배자들의 생령 등...

  #quote-src[#heike 「사문」]
]

#pagebreak()

#quote-content[
  讃岐院御追号あつて崇徳天皇と号し、... \ 太政大臣正一位を贈らる。
  
  사누키인에게 추호를 올려 스토쿠 천황이라 하고, ... \  (요리나가에게는) 태정대신과 정일위를 추증하였다.

  #v(.6em)

  大納言が死霊を宥めんと思し召さんにつけては、生きて候ふ少将を召しこそ帰され候はめ。

  다이나곤#super[나리치카]의 사령을 달래고자 하신다면, 살아 있는 소장#super[나리쓰네]을 불러 돌아오게 하셔야 합니다.

  #quote-src[#heike 「사문」]
]

#pagebreak()

#quote-content[
  かかりしかども、中宮は隙なく頻らせ給ふばかりにて、御産も頓になりやらず。

  그렇게 (여러 의식을 올렸는데도) 중궁은 쉴 새 없이 진통을 겪으셨고, 출산은 좀처럼 이루어지지 않았다.

  #quote-src[#heike 「어산」]
]

#pagebreak()

#quote-content[

  千手経を打ち上げ遊ばされけるにこそ、... さしも踊り狂ひける御神子共が縛も暫くうち静めけり。
  
  (법황이) 『천수경』을 소리 내어 읽으시자, ... 그토록 날뛰던 요리마시들의 소동도 잠시 가라앉았다.

  #v(.6em)

  今現るるところの怨霊は皆我が朝恩を以て人となりたるし者ぞかし。... 速やかに罷り退き候へ。

  지금 나타난 원령들은 모두 내가 베푼 은혜로 한 사람 몫을 하게 된 자들이다. ... 어서 물러가라.

  #quote-src[#heike 「어산」]
]

#pagebreak()

#hide-page-counter()

#pagebreak()

#set align(center)

#{
  set text(size: 1.6em)
  [
    원인 미상의 병세\
    #sym.arrow.double 기도, 독경, 수법, 조복
  ]
}

#pagebreak()

#set align(center)

#{
  set text(size: 1.6em)
  [
    원인 미상의 병세\
    #sym.arrow.double 기도, 독경, 수법, 조복

    #v(.8em)
    
    #align(left)[
      #quote(size: .6em)[
        다이나곤#super[나리치카]의 사령을 달래고자 하신다면, 살아 있는 소장#super[나리쓰네]을 불러 돌아오게 하셔야 합니다.

        #quote-src[#heike 「사문」]
      ]

      #quote(size: .6em)[
        かかりしかども...

        그렇게 (여러 의식을 올렸는데도)...

        #quote-src[#heike 「어산」]
      ]
    ]
  ]
}

#pagebreak()

#grid(
  columns: (1fr, 1fr),
  [
    로쿠조노미야스도코로, 생령화\
    #sym.arrow.b\
    겐지로부터 멀리 이사\
    #sym.arrow.b\
    로쿠조노미야스도코로, 사령화\
    #sym.arrow.b\
    무라사키노우에에 붙음\
    #sym.arrow.b\
    겐지의 공양\
    #sym.arrow.b\
    온나산노미야에 붙음\
    #sym.arrow.b\
    미야스도코로의 딸, 추선공양\
    #sym.arrow.b\
    성불
  ],
  [
    호겐의 난, 시시가타니 사건\
    #sym.arrow.b\
    · 스토쿠 상왕, 유배지에서 사망\
    · 요리나가, 화살에 맞아 사망\
    · 나리치카, 유배지에서 살해됨\
    · 사이코 처형\
    · 나리쓰네·야스요리·슌칸, 유배\
    #sym.arrow.b\
    패자들의 원령, 산실에 등장\
    #sym.arrow.b\
    스토쿠 추호, 요리나가 추증\
    나리쓰네·야스요리 사면
  ]
)

#pagebreak()

#hide-page-counter()

#pagebreak()

#quote-content[
  亡き人に かごとをかけて わづらふも \
  おのが心の 鬼にやはあらぬ

  세상을 떠난 사람에게 핑계(원망)를 돌리며 괴로워하는 것도, 결국 자기 자신의 마음속에 있는 귀신 때문이 아니겠는가.

  #quote-src[『紫式部集』, 「物の怪」]
  // https://www.shikibunosato.com/f/monogatari47
]

#pagebreak()

#quote-content[
  #grid(
    columns: 2,
    inset: (x: 0.5em, y: 1em),
    align: left,
    text(size: 1.2em, weight: "bold")[모노노케],
    [출처 미상의 질환과 그 원인],
    text(size: 1.2em, weight: "bold")[출산],
    [목숨을 담보로 출처 미상의 질환을 감수해야 하는 중대한 생물학적 도전]
  )
]

#pagebreak()


#quote-content[
  #grid(
    columns: 2,
    inset: (x: 0.5em, y: 1em),
    align: left,
    text(size: 1.2em, weight: "bold")[모노노케],
    [출처 미상의 질환과 그 원인],
    text(size: 1.2em, weight: "bold")[출산],
    [목숨을 담보로 출처 미상의 질환을 감수해야 하는 중대한 생물학적 도전]
  )
]

\

#{
  set align(left)
  box(inset: (left: 1em))[
    - 모노노케 서사를 여성의 출산기에서 쉽게 확인 가능한 것

      #sym.arrow.double 출산이 그만큼 위험을 수반했기 때문

    - 의학이 발달하지 않아 굿과 제사, 기도 외에는 마땅한 수단이 없었을 것
  ]
}

#pagebreak()

#quote-content[
  亡き人に かごとをかけて わづらふも \
  おのが心の 鬼にやはあらぬ

  세상을 떠난 사람에게 핑계(원망)를 돌리며 괴로워하는 것도, 결국 자기 자신의 마음속에 있는 귀신 때문이 아니겠는가.

  #quote-src[『紫式部集』, 「物の怪」]
  // https://www.shikibunosato.com/f/monogatari47
]

#v(20mm)

#{
  set align(left)
  box(inset: (left: 1em))[
    - 원인 미상의 병세가 낫기를 그저 비는 것보다

    - 병세의 원인을 모노노케로 상정하고, 이 원인을 진혼을 통해 제거하려는 시도가... \
      - 더욱 적절한 것으로 받아들여졌을것
      - 유가족에게 위안이 되었을 것
  ]
}

#pagebreak()

// 모노노아와레... 그럼에도 우리는 슬픔을 안고서 계속해서 살아가므로

#hide-page-counter()
#page(margin: 0pt)[

  #align(center + horizon)[#pad(x: 20pt)[
    #v(40mm)
    #text(size: 36pt)[#par(leading: 1em)[
      산실에서 드러나는 모노노케의 정체
    ]]
    \
    #text(size: 18pt)[
      『겐지모노가타리』와 『헤이케모노가타리』에서 출산 과정에 등장하는 모노노케들
    ]

    #text(size: 18pt)[
      모노노케 서사는 왜 출산에 자주 사용되었는가?
    ]

    #v(50pt)

    #align(right)[#pad(x: 20pt)[
      #text(size: 16pt)[#par(leading: 1em)[
        박종현\
        전남대학교 컴퓨터정보통신공학과
      ]]]
    ]
    #v(100mm)
  ]]
  #place(bottom, layout(size => {
    let image-height = size.width * 807 / 2000

    // 위 28%, 아래 5%를 잘라내고 가운데 67%만 보여주기
    let crop-top = image-height * 0.28
    let crop-bottom = image-height * 0.05

    block(width: 100%, height: image-height - crop-top - crop-bottom, clip: true)[
      #place(top + left, dy: -crop-top, image(
        "assets/Shinnyodoo_engi.jpg",
        width: size.width,
        height: image-height,
      ))
    ]
  }))
]

#pagebreak()

#quote-content[
  亡き人に かごとをかけて わづらふも \
  おのが心の 鬼にやはあらぬ

  세상을 떠난 사람에게 핑계(원망)를 돌리며 괴로워하는 것도, 결국 자기 자신의 마음속에 있는 귀신 때문이 아니겠는가.

  #quote-src[『紫式部集』, 「物の怪」]
  // https://www.shikibunosato.com/f/monogatari47
]

\
\

현재를 살아가는 남겨진 이들에게도

계속해서 삶을 이어나가기 위한 위안은 필요하므로

#pagebreak()

#{
  set text(size: 12pt)
  set align(left)
  bibliography("refs.bib", full: true, title: text(size: 30pt)[#align(center)[References #v(1em)]])
}
