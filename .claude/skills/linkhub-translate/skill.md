---
name: linkhub-translate
description: korea-linkhub 다국어 채우기. src/messages/*.json UI 키 또는 src/data/*.json 항목의 name·description을 17개 언어로 번역한다. "번역해", "다국어 채워", "ja/zh-CN 추가", "새 locale 시드", "messages 키 다 채워" 같은 요청이면 반드시 이 스킬을 사용한다. 새 UI 키 추가 후, 새 데이터 항목 추가 후, 또는 새 locale 부트스트랩 시 트리거.
---

# /linkhub-translate — Multilingual Content Fill

## 트리거 예시
- "messages/en.json 새 키 ja/zh-CN로"
- "tourist-1330 description 4개 언어 다 채워"
- "vi locale 부트스트랩"
- "17개 언어 풀세트 번역"

## 워크플로우

### Step 1 — 스코프 결정 (translator)
사용자 요청에서 추출:
- **타깃 파일**: `src/messages/*.json` OR `src/data/{phones,links}.json`의 특정 항목 ID
- **타깃 언어**: MVP 4종 / Tier 1 (총 9종) / Tier 2 (총 17종)
- **source**: 항상 `en`

### Step 2 — 누락 키 추출

**messages 파일:**
```bash
# en.json에 있고 ja.json에 없는 키
node -e "
const en=require('./src/messages/en.json');
let ja={};
try { ja=require('./src/messages/ja.json'); } catch(e){}
Object.keys(en).filter(k=>!ja[k]).forEach(k=>console.log(k))
"
```

**data 파일:**
- `name.en`은 있는데 타깃 언어 키 없는 항목 추출
- priority ≥ 80인 항목의 `description.en` 우선

### Step 3 — 번역 작성

영어 source → 타깃 언어. 톤 규칙 (translator 에이전트 정의 참조):
- 사용자 안내체 / 짧은 라벨은 관용구
- 카테고리 라벨, 액션 라벨은 각 언어 표준 UI 표현 (`Visit` → `访问` / `アクセス`)
- 데이터 항목의 `description`은 자연스러운 문장체

### Step 4 — 파일 업데이트

**messages — 새 키 병합:**
```bash
node -e "
const fs=require('fs');
const en=require('./src/messages/en.json');
let ja={};
try { ja=require('./src/messages/ja.json'); } catch(e){}
const merged={...en, ...ja};
// 여기서 새 키 채워넣기
fs.writeFileSync('./src/messages/ja.json', JSON.stringify(merged, null, 2)+'\n');
"
```

**data — `name`/`description` 객체에 키 추가:**
다른 필드 절대 건드리지 않음. Edit 도구로 해당 객체만 교체.

### Step 5 — Reverse-glance 검수
번역한 텍스트를 영어로 다시 풀어 의미 보존 확인. 의역 결정은 `_workspace/translator_{date}.md`에 기록.

### Step 6 — 빌드 점검
`npx next build`로 JSON 파싱·렌더 오류 없음 확인.

## 출력
- `src/messages/{locale}.json`
- `src/data/{phones,links}.json`의 다국어 객체
- `_workspace/translator_{date}.md` — 의역 결정 요약

## 언어 코드 표준
ISO 639-1 + (필요 시) ISO 3166-1 alpha-2: `en`, `ja`, `zh-CN`, `zh-TW`, `ko`, `vi`, `th`, `ru`, `ar`, `id`, `ms`, `es`, `fr`, `de`, `pt`, `it`, `tr`, `pl`.

`src/i18n/locales.ts`의 `LOCALES` 배열이 정렬 기준. 새 locale 추가 시 `LOCALES`도 확장 (frontend 에이전트와 합의).

## 에러 핸들링
- source(en) 누락 → curator에 source 작성 요청, 번역 보류
- 키 의미 모호 → frontend에 키명 명확화 요청
- 17개 언어 일괄에서 1개 실패 → 나머지 진행, `_workspace`에 실패 명시
- ar 작업 요청 시: 데이터 필드 번역만 OK, CSS RTL 시스템 작업은 사용자 명시 요청 전까지 보류
