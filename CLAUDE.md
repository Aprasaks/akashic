@AGENTS.md

---

# Akashic 프로젝트 가이드라인

## 1. 이슈 작성 규칙

- 제목: `[feat]`, `[fix]`, `[refactor]`, `[chore]` 중 하나로 시작
- 본문: **한국어**로 작성
- 형식:

```
#### 목적
(이슈의 목적과 배경)

#### 할 일
- [ ] 항목1
- [ ] 항목2

#### 변경 사항
- 변경 내역

#### 스크린샷
(스크린샷 또는 해당 없음)
```

## 2. 코드 원칙

- **Zero Any** — `any` 타입 절대 금지. 타입을 모르면 추론하거나 인터페이스를 직접 설계한다
- **Single Responsibility** — 컴포넌트 하나는 역할 하나만. 복잡해지면 쪼갠다
- **컴포넌트 분류 구조** — 종류별로 폴더를 나눠 관리:
  ```
  src/components/
  ├── ui/       ← 버튼, 인풋, 모달 등 재사용 기본 요소
  ├── layout/   ← Sidebar, Header 등 레이아웃 구조
  ├── notes/    ← Notes 모듈 전용 컴포넌트
  └── (모듈명)/ ← 새 모듈 추가 시 폴더 신설
  ```
- 모든 타입 정의는 `src/types/` 에서 관리

## 3. Tailwind V4 규칙

- **arbitrary value 금지** — `[125px]`, `[#fff]`, `[1.5rem]` 같은 `[]` 형태 절대 사용 금지
- Tailwind 스케일값으로 대체 가능한지 먼저 확인
- 주요 V4 유틸리티: `size-*`, `bg-linear-to-r/l/t/b`, `shrink-0`, `backdrop-blur-xs`

## 3. 커밋 규칙

이슈 제목과 동일한 prefix 사용:

```
[feat] 설명
[fix] 설명
[refactor] 설명
[chore] 설명
```

## 3. 이슈 → 커밋 → 푸시 순서 불변

```
gh issue create → 코드 작성 → git commit → git push
```

이 순서를 절대 바꾸지 않는다.
