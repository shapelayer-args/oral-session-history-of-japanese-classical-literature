`/SKILLS`의 `stageshow` skill을 사용하여 퀴즈 뷰어를 생성하여라.

퀴즈 뷰어는 다음과 같이 구성되어야 한다.
- 객관식 문항에 대해
  - 질문과 선택 가능한 답변 항목을 표시
  - 답변 선택 시 정답 여부를 표시
  - 답변 선택 시 정답에 대한 설명을 표시
  - 답변 선택 시 다음 문항으로 이동("다음" 버튼) clickable (평소에는 disabled 상태)

퀴즈 뷰어의 UI 구성은 데스크톱 애플리케이션과 같이 상단 메뉴 탭과 본문 콘텐츠로 구성되어야 한다. 이러한 UI 구성은 다음 경로에서도 참고할 수 있다.
- https://github.com/ShapeLayer/cellular/tree/main/viewer
  - https://cellular-codemetrics.pages.dev/
- https://github.com/ShapeLayer/wg-studio
  - https://shapelayer.github.io/wg-studio/
- https://github.com/shapelayer-args/compass-ammeter-theoretical-graph-utils
  - https://shapelayer-args.github.io/compass-ammeter-theoretical-graph-utils/

메뉴 탭에는 파일 메뉴가 존재하고, 여기에는 "열기"(open) 항목이 존재하여야 한다.
열기 항목에는 로컬 폴더 뿐 아니라 이 리포지토리의 프리셋으로부터 퀴즈를 선택할 수 있어야 한다. 프리셋은 `/GENERATED/QUIZ` 경로에 존재하는 JSON 파일을 대상으로 하고, Deploy시 포함되도록 CI를 구성하여라.  

이 JSON은 `/AGNETS/GENERATE_QUIZ.md` 와 `/AGENTS/DEVELOP_QUIZ_VIEWER.md`(이 문서) 에서 정의된 스펙을 만족하도록 구성되어야 한다. JSON 스펙을 정의하고 `/DOCS/APU_QUIZ_VIEWER.md`에 문서화, JSON Schema를 `/src/quiz-viewer/schema` 경로에 정의하여라.    

CI는 GitHub Pages를 사용하여 배포되도록 구성하고, 배포된 URL은 다음과 같이 구성되어야 한다.
- https://shapelayer-args.github.io/oral-session-history-of-japanese-classical-literature/quiz-viewer/

소스코드는 `/src/quiz-viewer` 경로에 존재하도록 구성하고, TypeScript, WebComponents까지 사용하는 것을 허용한다.  
