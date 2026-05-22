# korea-linkhub

외국인이 한국에서 가장 많이 찾는 **전화번호 + 공식 사이트 링크**를 한 페이지에 모은 Linktree-스타일 허브.

상세 제품 정의는 `docs/PRODUCT.md`, 5명 페르소나(Aiko/Lucas/Maya/Hassan/Linh)는 `docs/PERSONAS.md` 참조.

---

## 1. 스택

| 영역 | 선택 | 비고 |
|---|---|---|
| Framework | **Next.js 16** | Proxy 컨벤션 (middleware 아님) |
| Language | TypeScript (strict) | |
| Style | Tailwind v4 | `@import "tailwindcss"` |
| i18n | **자체 구현** | `src/i18n/locales.ts`, `src/proxy.ts` (next-intl 미사용) |
| Data | Static JSON | `src/data/{phones,links}.json` |
| Runtime | Node 22+ | 23 OK |

### 1.1 Next.js 16 Iron Rules
**`AGENTS.md` 경고: This is NOT the Next.js you know.**

작업 시작 전 매번 확인:
- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` — middleware는 더 이상 없음 (`src/proxy.ts`)
- `node_modules/next/dist/docs/01-app/02-guides/internationalization.md` — i18n 라우팅
- `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` — `params`는 Promise

금지:
- `middleware.ts` 파일 작성
- `params: { lang: string }` 타입 (대신 `PageProps<'/[lang]'>`)
- ts-ignore / `as any` 우회

## 2. 디렉토리

```
src/
  app/[lang]/
    layout.tsx     html/body, generateMetadata
    page.tsx       홈 (phones + links 리스트)
  proxy.ts         locale 협상 + 리다이렉트
  i18n/locales.ts  LOCALES, getMessages
  messages/
    en.json        source (other locales merge en as fallback)
  data/
    phones.json    items[]: id, category, priority, number, name{lang}, ...
    links.json     items[]: id, category, priority, url, name{lang}, ...
  components/      재사용 UI (ux 에이전트 영역)
docs/PRODUCT.md
_workspace/        에이전트 중간 산출물 (삭제 X)
.claude/
  agents/          5명 (curator, verifier, translator, frontend, ux)
  skills/          5개 (linkhub-{add,verify,translate,scrape,orchestrate})
```

## 3. 데이터 모델

### phones.json item
```ts
{
  id: string;              // kebab-case
  category: "emergency" | "tourist_help" | "embassy" | "transport" |
            "visa" | "living" | "health";
  priority: number;        // 0-100, emergency 95+
  number: string;          // "112" | "1599-7777" | "+82-2-..."
  name: { en: string; ja?: string; "zh-CN"?: string; ko?: string; ... };
  description?: { en: string; ... };
  languages?: string[];    // 응대 가능 언어
  hours?: string;
  free?: boolean;
  source?: { url: string; verifiedAt: string };
}
```

### links.json item
```ts
{
  id, category: "official" | "transport" | "tools" | "money" | "esim" | ...,
  priority, url,
  name: { en, ja, zh-CN, ko, ... },
  description: { en, ... },
  languages,
  verifiedAt: "YYYY-MM-DD"
}
```

**SoT 규칙:** 데이터 파일은 `curator` 에이전트만 편집. UI 에이전트(frontend·ux)는 직접 수정 금지, `curator`에 위임.

## 4. 에이전트 팀

6명 전문 팀, 기본 실행 모드. 모든 호출에 `model: "opus"`.

| 에이전트 | 영역 | 주 도구 |
|---|---|---|
| **curator** | phones/links 큐레이션, 카테고리·priority 결정 | Edit, Write, WebFetch |
| **verifier** | 링크 200 헬스체크, 포맷 검증, verifiedAt 갱신 | Bash (curl) |
| **translator** | 17개 언어 UI 메시지 + 데이터 다국어 필드 | Edit, Write |
| **frontend** | Next.js 16 라우팅/RSC/Proxy/i18n 구현 | Edit, Bash (build) |
| **ux** | Linktree 톤 모바일 first UI, Tailwind v4 | Edit, Write |
| **critic** (Rene) | 시니어 디자인 평가 — Rams 10 + Norman 8 + Apple HIG | Read, Grep, Bash (정적 분석) |

상세 역할/프로토콜: `.claude/agents/{name}.md`. critic은 **읽기·평가·위임만**, 직접 수정 금지.

## 5. 스킬 (트리거 가이드)

| 스킬 | 트리거 표현 | 워크플로우 |
|---|---|---|
| `/linkhub-add` | "추가해", "넣어줘", URL/번호 문자열 | curator → verifier → translator → build |
| `/linkhub-verify` | "헬스체크", "검증", "verifiedAt 갱신" | verifier 일괄 점검 + 보고서 |
| `/linkhub-translate` | "번역해", "다국어 채워", "locale 부트스트랩" | translator + build |
| `/linkhub-scrape` | "수집해", "TourAPI", "Reddit 분석" | curator(scraper 역할) → 정규화 |
| `/linkhub-orchestrate` | "팀 돌려", "전체 워크플로우", "월간 갱신" | TeamCreate 6명 → 패턴 A/B/C |
| `/linkhub-design-review` | "디자인 리뷰", "Rene한테 보여줘", "Rams 체크", "시각 감사" | critic이 16개 휴리스틱 평가 → 보고서 + 위임 |

단일 작업은 개별 스킬을, 멀티 에이전트 작업은 orchestrate를 사용.

## 6. 페르소나 가이드 (curator·ux·frontend 필독)

10명 사용자 페르소나 + 1명 내부 평가관 (`docs/PERSONAS.md`). 세 축으로 분류:

**Type A — 시간 축 (lifecycle stage)**
| 단계 | 페르소나 | 핵심 카테고리 |
|---|---|---|
| 출국 전 | **Aiko** (JP 31) | esim, tools, transport |
| 도착 직후 | **Lucas** (BR 26) | transport, money, tools |
| 여행 중 | **Maya** (US 28) | tourist_help, health |
| 비상 | **Hassan** (EG 42) | emergency, health |
| 거주 | **Linh** (VN 24) | visa, living, health |

**Type B — 목적/상황 축 (use case)**
| 케이스 | 페르소나 | 핵심 카테고리 |
|---|---|---|
| K-pop 콘서트 | **Yuki** (JP 18) | transport, tourist_help, emergency |
| 의료관광 | **Carlos** (MX 50) | health, emergency |
| 가족·할랄 | **Fatima** (AE 38) | health, tourist_help, official |
| 입양인 heritage | **Min-jun** (US 35) | official, tourist_help |
| 환승 18시간 | **Diego** (AR 30) | transport, tourist_help |

### 의사결정 룰

- **새 항목 추가 (curator):** 페르소나 1명 이상 지정 필수. 매트릭스(`docs/PERSONAS.md`)의 카테고리 값 = priority 시작점, 겹치는 페르소나 ≥3명이면 +10.
- **UX 변경 (ux+frontend):** Hassan의 3탭/5초 SOS 도달 깨면 reject. SOS 바는 sticky 유지, priority ≥95 항목은 검색 0건일 때도 fallback 노출. Yuki(10대)·Min-jun(한국어 0)을 위한 가독성/언어 의존성 점검.
- **다국어 (translator):** 페르소나 모국어부터 → ja(Aiko+Yuki), vi(Linh), pt-BR(Lucas), es(Carlos+Diego), ar 데이터만(Hassan+Fatima, UI 보류).

**Type C — Internal Evaluator** (사용자 아님)
| 평가관 | 역할 |
|---|---|
| **Rene** (DE 71) | 시니어 디자인 평가관. Rams 10 + Norman 8 + HIG → 16 휴리스틱. 통과해야 사용자(10명) 앞에 나감. `critic` 에이전트 + `/linkhub-design-review` 스킬 운영. |

### 검증
주요 변경 후 (1) 10개 페르소나 walk-through (`docs/PERSONAS.md` 마지막) → 실패 시 `_workspace/persona_walkthrough_{date}.md`, (2) `/linkhub-design-review` → `_workspace/design_review_{date}.md`.

**릴리스 게이트:** 사용자 페르소나 walk-through 통과 + Rene 평가 FAIL 0개.

## 7. 작업 규율

- **컴포넌트 단위** UI 변경. 중복/신규 능동 지적.
- **자체 시각 검증 필수** — 새 CSS 추가 시 grep 점검 + Chrome 새 탭 렌더 확인.
- **이모지 금지** — UI/응답/문서 모두. SVG·텍스트 라벨로 대체. dingbat(★ → ·) OK.
- **외부 여행 서비스 레퍼런스 언급 금지** — 특히 에어비엔비. "Linktree 톤"은 OK (UI 패턴 한정).
- **다크 모드 미지원** — 라이트 단일. 다크 토큰 추가 금지.
- **응답 간결성** — 결론 1~2줄. 옵션 비교/반복 정리 최소화.
- **확인 질문 최소화** — 작업 순서/이어서할지 묻지 말고 진행. 파괴적 작업만 확인.

## 8. 빌드 / 실행

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드 (작업 완료 조건)
npx next start -p 3091  # 빌드 결과 확인
```

브라우저 확인:
```bash
osascript -e 'tell application "Google Chrome"
  if (count of windows) > 0 then
    tell front window to make new tab with properties {URL:"http://localhost:3091/"}
  else
    make new window
    set URL of active tab of front window to "http://localhost:3091/"
  end if
  activate
end tell'
```

Chrome 새 탭 강제, 새 창 금지.

## 9. 핸드오프

코드(HTML/CSS/TSX)가 **Source of Truth**. Figma는 보조 참고만.

@AGENTS.md
