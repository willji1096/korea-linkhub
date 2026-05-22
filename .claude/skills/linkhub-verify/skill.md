---
name: linkhub-verify
description: korea-linkhub 카탈로그 헬스체크. 모든 phones.json/links.json 항목의 링크 200 응답, 전화번호 포맷, 다국어 필드 무결성을 일괄 검사하고 verifiedAt을 갱신한다. "헬스체크", "전체 검증", "링크 확인", "verifiedAt 갱신", "오래된 항목 점검" 같은 요청이면 반드시 이 스킬을 사용한다. 정기 점검 또는 dead-link 의심 시 트리거.
---

# /linkhub-verify — Catalog Health Check

## 트리거 예시
- "전체 헬스체크"
- "오래된 링크 verifiedAt 갱신"
- "지난주 추가한 것만 검증"
- "1330 잘 살아있어?"

## 워크플로우

### Step 1 — 스코프 결정 (verifier)
- 전체: `items` 모두
- 부분: 사용자 지정 ID 목록 또는 `verifiedAt < today - 30d` 필터
- 신규: `_workspace/linkhub-add_*`의 최근 7일 기록 기준

### Step 2 — 일괄 점검

**링크 (`links.json`):**
```bash
for URL in $(node -e "const d=require('./src/data/links.json'); d.items.forEach(i=>console.log(i.id+'|'+i.url))"); do
  ID="${URL%%|*}"
  HREF="${URL#*|}"
  CODE=$(curl -sS -o /dev/null -w "%{http_code}" -I -L --max-time 10 "$HREF")
  echo "$ID $CODE $HREF"
done
```

**전화번호 (`phones.json`):**
포맷 정규식 검사만 (실제 콜 X):
- 단축: `^[0-9]{3,4}$`
- 국내: `^[0-9]{4}-[0-9]{3,4}$` 또는 `^[0-9]{2,4}-[0-9]{3,4}-[0-9]{4}$`
- 국제: `^\+82-[0-9]{1,2}-[0-9]{3,4}-[0-9]{4}$`

**다국어:**
- `name.en` 누락 → MISSING
- priority ≥ 80인데 `description.en` 누락 → MISSING
- 빈 문자열 값 → EMPTY

### Step 3 — 분류
- **PASS** (200) → 해당 항목 `verifiedAt = 오늘`
- **REDIRECT** (3xx 다른 도메인) → REPORT, verifiedAt 보존
- **DEAD** (4xx/5xx/timeout 2회) → REPORT, verifiedAt 보존, curator에 교체 권고
- **MANUAL** (robots/cloudflare 차단) → REPORT, 사용자 확인 요청

### Step 4 — 보고서 생성

`_workspace/verify_{YYYY-MM-DD}.md`:

```markdown
# Verify Report — 2026-05-22

## Summary
- Links: 12 total | 11 pass | 1 dead | 0 manual
- Phones: 10 total | 10 pass | 0 invalid
- Missing en fields: 0
- Updated verifiedAt: 11 items

## Dead
| id | url | code | suggested |
|----|-----|------|-----------|
| weexchange | https://... | 404 | check kr.weexchange.com |

## Manual
(none)

## Missing
(none)
```

### Step 5 — 데이터 갱신
- PASS 항목만 `verifiedAt` 일괄 갱신
- DEAD/REDIRECT는 데이터 변경 없이 보고만

## 출력
- `src/data/*.json`에서 `verifiedAt` 필드 in-place 업데이트
- `_workspace/verify_{date}.md`

## 에러 핸들링
- 네트워크 일시 장애 → 1회 재시도. 2회 실패해야 DEAD.
- robots 차단 → MANUAL로 보고. DEAD 처리 금지 (페이지 존재 가능).
- 자체 변경한 줄이 없으면 빈 commit 만들지 않음.
