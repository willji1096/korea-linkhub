---
name: linkhub-design-review
description: korea-linkhub 디자인 품질 평가. 시니어 평가관 Rene가 Dieter Rams 10원칙·Don Norman 사용성 휴리스틱·Apple HIG로 시각·정보 디자인을 측정 가능한 지표(픽셀·간격·타이포·컬러·위계)로 평가하고 PASS/WARN/FAIL 보고서를 작성한다. "디자인 리뷰", "퀄리티 점검", "Rene한테 보여줘", "시각 검수", "design audit", "Rams 체크" 같은 요청이면 반드시 이 스킬을 사용한다. UI 변경 후, 새 컴포넌트 추가 후, 또는 정기 시각 감사 시 트리거.
---

# /linkhub-design-review — Senior Design Critique by Rene

## 트리거 예시
- "디자인 리뷰 돌려"
- "Rene한테 SOS 바 보여줘"
- "전체 시각 감사"
- "이 컴포넌트 Rams 통과해?"

## 워크플로우

### Step 1 — 스코프 결정 (critic)
- 전체: 메인 페이지 + 어드민 + 모든 컴포넌트
- 부분: 특정 컴포넌트 / 특정 화면

### Step 2 — 정적 분석

**간격 토큰 일관성:**
```bash
grep -rh -oE '\b(gap|p|m|space|px|py|mx|my)-[0-9]+' src/ | sort | uniq -c | sort -rn
```
8px 그리드(0/1/2/3/4/5/6/8/10/12/16/20/24/32) 외 토큰 발견 시 WARN.

**컬러 사용:**
```bash
grep -rh -oE '(text|bg|border)-(zinc|red|blue|emerald|amber|stone|slate)-[0-9]+' src/ | sort | uniq -c | sort -rn
```
계열 4개 초과면 WARN, 동일 의미 다른 색 (예: `text-red-700` vs `text-rose-700`) 발견 시 FAIL.

**폰트 크기 분포:**
```bash
grep -rh -oE 'text-(xs|sm|base|lg|xl|2xl|3xl|4xl)' src/ | sort | uniq -c | sort -rn
```
7개 이상 사이즈 동시 사용 시 WARN.

**터치 타깃 (Apple HIG):**
```bash
grep -rn -E 'py-[01](\b|\s|"|\.)' src/components/ src/app/
```
py-0/py-1 발견 + a/button이면 터치 영역 < 44pt 위험. WARN.

### Step 3 — 16개 휴리스틱 체크

`references/rams-10-principles.md` + `references/norman-heuristics.md` 로딩 (필요할 때만).

각 휴리스틱:
- **PASS**: 통과
- **WARN**: 권고 (배포 가능, 추후 개선)
- **FAIL**: 차단 (다음 릴리스 전 수정 필수)

### Step 4 — 페르소나 영향 평가

`docs/PERSONAS.md`의 10개 walk-through 중 시각 결함으로 막히는 시나리오 식별:
- Hassan 3탭/5초 SOS — SOS 바 가시성·터치 타깃
- Yuki 10대 가독성 — 본문 ≥ 15px, 컨트라스트 4.5:1
- Min-jun 한국어 0 — 한자/한글 의존 화면 점검
- Fatima 가족 — 아이도 누를 수 있는 큰 터치 영역

### Step 5 — 보고서 작성

`_workspace/design_review_{YYYY-MM-DD}.md` 형식:

```markdown
# Design Review — {date} (by Rene)

## Score
- 16 heuristics: PASS X | WARN Y | FAIL Z
- Overall grade: A/B/C/D/F
- Persona walk-through impact: {몇 개 시나리오에 영향}

## FAIL (must fix)
### {issue title}
- File: src/components/X.tsx L{nn}
- Current: {수치}
- Standard: {수치}
- Prescription: {Tailwind 클래스 단위 변경안}
- Owner: {ux | frontend | curator}
- Persona affected: {Hassan | Yuki | ...}

## WARN (should fix next iteration)
...

## PASS (what's working)
- {짧게 1~3개만}

## 권고 다음 작업 (우선순위순)
1. ux → ... (예상 30분)
2. frontend → ... (예상 1시간)
3. curator → ... (예상 15분)
```

### Step 6 — 위임
보고서 마지막의 "권고 다음 작업"을 SendMessage로 해당 에이전트에 전달. critic은 직접 수정하지 않는다.

## 출력
- `_workspace/design_review_{date}.md`
- 각 위임은 TaskCreate로 추적 (책임 에이전트 owner 지정)

## 에러 핸들링
- 빌드 실패 → 평가 거부, frontend에 빌드 복구 요청
- 컴포넌트가 동적 (런타임 데이터 의존) → 정적 분석 + 페르소나 walk-through 시나리오로 보완

## 사용 예

```
User: "헤더와 SOS 바 디자인 리뷰해줘"

critic:
- 정적 분석 결과 표 (간격/컬러/폰트)
- 16개 휴리스틱 체크
- FAIL 2개 (SOS 터치 44pt 미달, 헤더 폰트 위계 약함)
- WARN 3개
- 권고: ux → SOS 처방 / frontend → 헤더 typography scale 정리
```

## 트리거 검증

**Should-trigger:**
- "Rene 평가"
- "디자인 퀄리티 점검"
- "Rams 통과하는지 봐"
- "시각 감사"
- "Norman 휴리스틱 체크"
- "design audit"
- "이 컴포넌트 비례 맞나"
- "터치 타깃 OK?"

**Should-NOT-trigger:**
- "디자인 변경해" (→ ux 직접)
- "버튼 색 바꿔" (→ ux 직접)
- "새 컴포넌트 만들어" (→ frontend 직접)
- "디자인 시스템 처음 설계" (→ 별도 작업)
