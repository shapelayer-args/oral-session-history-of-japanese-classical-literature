# Quiz Viewer

JSON 파일, URL 또는 배포에 포함된 프리셋으로 4지선다 퀴즈를 풀 수 있는 웹 뷰어입니다.
답을 고르면 정답 여부와 각 선택지의 해설을 확인할 수 있습니다.

## 로컬에서 실행

Node.js 22.18 이상이 필요합니다.

```sh
cd src/quiz-viewer
npm ci
npm run dev
```

기본 프리셋 폴더는 `src/quiz-viewer/presets/`입니다. 다른 폴더를 사용하려면
`QUIZ_PRESET_DIR`를 지정하세요. 프리셋 없이 실행해도 로컬 JSON 파일이나 URL로 퀴즈를 열 수 있습니다.
퀴즈 작성과 배포 방법은 [Quiz Viewer API](DOCS/API_QUIZ_VIEWER.md)를 참고하세요.

## 데모 — 일본 고전문학사 (JLL3005)

이 저장소의 GitHub Pages 배포에는 `GENERATED/QUIZ`의 일본 고전문학사 퀴즈가 포함됩니다.
로컬에서도 `src/quiz-viewer`에서 `QUIZ_PRESET_DIR=../../GENERATED/QUIZ npm run dev`로
같은 프리셋을 열 수 있습니다.

[일본 고전문학사 샘플 퀴즈 열기](https://shapelayer-args.github.io/oral-session-history-of-japanese-classical-literature/quiz-viewer/?preset=sample-japanese-classics-easy)

### 발표 과제 안내

> 발표방법은 자율입니다만 반드시 아래와 같은 방법으로 AI를 활용합니다.
> 
> 1. 자료를 꼼꼼하게 만들기(PPT)
> 
> 2. 만든 자료를 노트북 LM으로 활용하기(완벽함을 요구한 것이 아니라 만들어가는 과정을 중요하게 볼 것임)
> 
>    ex) 노트북lm의 스튜디오 활용(다양한 포맷 하나 선택하고 마무리는 퀴즈로)
> 
> 문의 사항은 강의 시간에 말해주길 바랍니다.

> [!NOTE]  
> - 노트북 LM을 사용하여 AI 작업 과제를 수행하기
>     - 작성한 PPT 전체를 AI 생성물로 작성(슬라이드, 동영상 등으로 생성)
>     - 작성한 PPT와 생성물 자료를 함께 제출
>     - 노트북 LM의 퀴즈 기능을 사용하여 퀴즈를 생성할 것
> - 단 같은 기능을 수행한다면, 다른 AI 스택을 사용해도 됨

### 발표용 비공개 자료 가져오기

```sh
# Set Credentials

# Fetch
git submodule init
git submodule update
```
