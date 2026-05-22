---
name: linkhub-orchestrate
description: korea-linkhub 멀티 에이전트 워크플로우 오케스트레이터. 5명 전문 팀(curator·verifier·translator·frontend·ux)을 구성·조율하여 큰 작업(신규 카테고리 부트스트랩, 정기 카탈로그 갱신, 새 locale 추가, 전체 리뉴얼 등)을 수행한다. "팀 돌려", "전체 워크플로우", "신규 카테고리 부트스트랩", "월간 카탈로그 갱신", "locale 추가 풀스택" 같은 요청이면 반드시 이 스킬을 사용한다. 단일 작업은 개별 스킬(linkhub-add 등) 직접 호출.
---

# /linkhub-orchestrate — Multi-Agent Workflow

## 트리거 예시
- "응급의료 카테고리 전체 부트스트랩 (스크래핑 + 큐레이션 + 검증 + 번역 + UI)"
- "월간 정기 갱신 돌려"
- "vi locale 풀스택 추가"
- "전체 카탈로그 헬스 + 번역 갱신"

## 실행 모드
**에이전트 팀 모드 (기본)**. `TeamCreate`로 팀 구성 후 `TaskCreate`로 작업 분배, 팀원이 `SendMessage`로 자체 조율.

## 팀 구성

```
TeamCreate({
  team_name: "linkhub-team",
  members: ["curator", "verifier", "translator", "frontend", "ux"]
})
```

모든 Agent 호출에 `model: "opus"` 명시.

## 표준 워크플로우 패턴

### Pattern A: 신규 카테고리 부트스트랩 (파이프라인)
입력: 카테고리명, 시드 키워드/소스

```
[curator/scraper 역할]
  Task#1: linkhub-scrape로 소스 발굴 → _workspace/scrape_*.json
       │
       ▼
[curator]
  Task#2: 정규화 + phones/links.json 추가 (linkhub-add 내부 로직)
       │
       ▼
[verifier]
  Task#3: 신규 추가분 헬스체크 (linkhub-verify)
       │
       ▼
[translator]
  Task#4: MVP 4개 언어 다국어 보강 (linkhub-translate)
       │
       ▼
[ux]
  Task#5: 카테고리 추가로 카드 패턴 깨지지 않는지 시각 점검
       │
       ▼
[frontend]
  Task#6: 카테고리 라벨 messages 키 추가 + npx next build 통과
```

### Pattern B: 월간 정기 갱신 (팬아웃/팬인)
```
                ┌──[verifier] linkhub-verify
TeamCreate ─────┼──[curator]  linkhub-scrape (최근 1개월 새 항목)
                └──[translator] 누락 다국어 필드 보강
                          │
                          ▼ (모두 완료 후)
                 [오케스트레이터]
                 _workspace/monthly_{YYYY-MM}.md 종합
```

### Pattern C: 새 locale 추가 (감독자)
입력: locale 코드 (예: `vi`)

```
[오케스트레이터/감독자]
  ├─ frontend: src/i18n/locales.ts에 'vi' 추가 + 빌드 통과 확인
  ├─ translator: src/messages/vi.json 생성 (en 기준 17개 키 번역)
  ├─ translator: 모든 phones/links의 name.vi, description.vi 채우기
  ├─ verifier: vi 필드 무결성 확인
  └─ ux: vi 텍스트 길이로 카드 깨지는지 시각 점검
```

## 데이터 전달 프로토콜

| 종류 | 위치 | 형식 |
|---|---|---|
| 중간 산출물 | `_workspace/{phase}_{agent}_{slug}.{ext}` | MD 또는 JSON |
| 최종 데이터 | `src/data/*.json`, `src/messages/*.json` | JSON |
| 팀 메시지 | SendMessage | 짧은 자연어 |
| 작업 추적 | TaskCreate/TaskUpdate | 표준 status |

`_workspace/`는 절대 삭제하지 않음 (감사 추적).

## 에러 핸들링

| 상황 | 대응 |
|---|---|
| 단일 에이전트 실패 | 1회 재시도, 재실패 시 해당 산출물 없이 진행 + 보고서 명시 |
| 데이터 충돌 (스크래핑 결과 vs 기존 항목) | 삭제 X, 두 항목 모두 보존 + curator에게 머지 의사결정 위임 |
| 빌드 실패 | frontend가 root cause 분석, ts-ignore 금지 |
| API 키 누락 | 사용자에게 즉시 알리고 해당 소스 스킵, 나머지 계속 |
| 17개 언어 중 일부 실패 | 나머지 계속, 보고서에 실패 언어만 명시 |

## 종료 시 산출물 체크리스트
- [ ] `_workspace/orchestrate_{date}.md` — 워크플로우 요약 (어떤 패턴, 몇 명, 결과)
- [ ] 각 에이전트의 `_workspace/{agent}_*.md` 보고서
- [ ] `src/data/*.json`, `src/messages/*.json` 변경분
- [ ] `npx next build` 통과
- [ ] 팀 해체 (`TeamDelete`)

## 테스트 시나리오

### 정상 흐름
**입력:** "한국 응급 약국 핫라인 카테고리 부트스트랩"
1. linkhub-scrape: Reddit r/livinginkorea에서 "24h pharmacy" 검색
2. curator: 3개 신규 phone 항목 정규화 (priority 75)
3. verifier: 전화 포맷 PASS
4. translator: en/ja/zh-CN/ko description 채움
5. ux: 새 항목이 카드 디자인 안에 fit
6. frontend: 빌드 통과
7. 결과: 3개 phone 추가, 보고서 작성

### 에러 흐름
**입력:** "TourAPI에서 갱신" (API 키 없음)
1. linkhub-scrape: 키 없음 감지
2. 오케스트레이터: 사용자에게 즉시 알림, 해당 작업 스킵
3. Reddit 빈도 분석 등 다른 소스로 fallback 제안
4. 사용자 선택 시 계속, 아니면 종료
