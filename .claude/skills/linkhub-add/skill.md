---
name: linkhub-add
description: korea-linkhub에 새 전화번호 또는 링크를 추가하는 워크플로우. 사용자가 "전화번호 추가", "링크 추가", "새 카테고리 항목", "X를 카탈로그에 넣어", "추가해줘" 같은 요청을 하면 반드시 이 스킬을 사용한다. URL이나 전화번호 문자열을 받으면 자동 트리거. curator → verifier → translator 순으로 처리하며 phones.json/links.json/메시지 파일을 모두 일관되게 갱신한다.
---

# /linkhub-add — Add Phone or Link to Catalog

## 트리거 예시
- "1330 추가해"
- "https://visitkorea.or.kr 링크통에 넣어줘"
- "한국 응급 약국 핫라인 추가"
- "이 사이트 카탈로그에 등록"

## 워크플로우

### Step 1 — 분류 (curator)
입력에서 다음을 결정한다:
- **종류**: phone | link
- **카테고리**: 11개 허용 키 중 하나 (`emergency` ~ `esim`)
- **우선순위**: 0~100 (curator 에이전트 정의의 기준 표 참조)
- **ID**: kebab-case slug, 중복 확인

추측이 어려우면 사용자에게 묻기보다 합리적 default로 진행.

### Step 2 — 항목 작성 (curator)
스키마에 맞춰 새 항목 객체 생성:

**phone 스키마:**
```json
{
  "id": "kebab-slug",
  "category": "emergency|tourist_help|...",
  "priority": 0-100,
  "number": "112 | 1599-7777 | +82-2-...",
  "name": { "en": "Required" },
  "description": { "en": "Required for priority >= 80" },
  "languages": ["en", "ja", "zh"],
  "hours": "24/7 | Mon-Fri 09-18",
  "free": true|false,
  "source": { "url": "...", "verifiedAt": "YYYY-MM-DD" }
}
```

**link 스키마:**
```json
{
  "id": "kebab-slug",
  "category": "official|transport|...",
  "priority": 0-100,
  "url": "https://...",
  "name": { "en": "Required" },
  "description": { "en": "Required" },
  "languages": ["en", "ja", "zh"],
  "verifiedAt": "YYYY-MM-DD"
}
```

`src/data/{phones,links}.json`의 `items` 배열에 삽입 후 `priority desc` 정렬, `updatedAt` 갱신.

### Step 3 — 검증 (verifier)
- link면 `curl -sS -I -L --max-time 10 URL`로 HTTP 200 확인
- phone이면 포맷 검증 (단축번호 3자리 / 국내 하이픈 / 국제 `+82-`)
- `verifiedAt`을 오늘 날짜로 셋

### Step 4 — 다국어 보강 (translator)
새 항목의 `name`·`description`을 MVP 4개 언어(en/ja/zh-CN/ko)에 채운다.
17개 언어 풀세트는 별도 `/linkhub-translate` 트리거.

### Step 5 — 빌드 점검 (frontend가 호출되지 않음)
스킬 마지막에 `npx next build`를 한번 돌려 데이터 변경이 빌드를 깨지 않는지 확인. 실패 시 curator에게 롤백 지시.

## 출력

- `src/data/{phones,links}.json` 변경
- `_workspace/linkhub-add_{date}_{id}.md` — 추가 근거 + 검증 결과 요약 (2~3줄)

## 에러 핸들링

- URL 200 실패 → 추가 보류, `_workspace`에 사유 기록, 사용자에게 알림
- 중복 ID → 기존 항목 업데이트 모드로 전환 (사용자 확인 후)
- 카테고리 모호 → curator가 가장 유사한 키 선택 + `_workspace`에 사유 기록
