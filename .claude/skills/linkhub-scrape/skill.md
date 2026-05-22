---
name: linkhub-scrape
description: korea-linkhub 데이터 수집. 공공 API(한국관광공사 TourAPI, 외교부 영사 콜센터, Hi Korea)와 커뮤니티 빈도 분석(Reddit r/korea, r/seoul, r/livinginkorea)에서 외국인이 찾는 전화번호·링크를 발굴한다. "수집해", "스크래핑", "TourAPI에서 긁어", "Reddit 빈도 분석", "새 소스 발굴" 같은 요청이면 반드시 이 스킬을 사용한다. 정기 갱신 또는 신규 카테고리 부트스트랩 시 트리거.
---

# /linkhub-scrape — Source Discovery & Ingest

## 트리거 예시
- "TourAPI 영문 콜센터 다 긁어와"
- "r/livinginkorea 최근 100개에서 자주 나온 전화번호 추출"
- "외교부 영사콜센터 새 번호 있나"
- "응급 약국 핫라인 수집"

## 수집 소스

| 소스 | 종류 | 메서드 |
|---|---|---|
| TourAPI (한국관광공사) | 공공 API | REST + JSON |
| Hi Korea (출입국) | 정부 사이트 | HTML 파싱 |
| 외교부 영사콜센터 | 정부 사이트 | HTML 파싱 |
| Reddit r/korea·r/seoul·r/livinginkorea | 커뮤니티 | Reddit JSON API |
| 주한 외국대사관 디렉토리 | 외교부 사이트 | HTML 파싱 |

## 워크플로우

### Step 1 — 소스 선택 (curator)
사용자 요청에서 소스 1개 또는 다중 선택.

### Step 2 — 데이터 가져오기

**TourAPI 예시:**
```bash
# 영문 콜센터 정보 (예시 endpoint, 실제 키 필요)
curl -sS "https://apis.data.go.kr/B551011/EngService1/areaCode1?serviceKey=$KEY&MobileOS=ETC&MobileApp=korea-linkhub&_type=json" \
  | jq '.response.body.items.item[]'
```

**Reddit 빈도 분석:**
```bash
# 최근 100개 게시물 본문 + 댓글 다운로드
curl -sS -A "korea-linkhub/0.1" \
  "https://www.reddit.com/r/livinginkorea/new.json?limit=100" \
  > _workspace/scrape_reddit_$(date +%F).json

# 전화번호/URL 패턴 추출
node -e "
const d=require('./_workspace/scrape_reddit_$(date +%F).json');
const text=d.data.children.map(c=>c.data.selftext+' '+c.data.title).join(' ');
const phones=[...text.matchAll(/(\\+82-)?[0-9]{2,4}-?[0-9]{3,4}-?[0-9]{4}/g)];
const counts={};
phones.forEach(m=>{ counts[m[0]]=(counts[m[0]]||0)+1 });
Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,20).forEach(([n,c])=>console.log(c,n));
"
```

**HTML 파싱:**
- 정적 페이지면 `curl`로 받아서 텍스트 후처리
- 동적 페이지(JS 렌더)면 사용자에게 수동 큐레이션 권고 (Playwright는 이 프로젝트에서 미사용)

### Step 3 — 정규화 (curator)
수집된 raw 데이터를 `phones.json`/`links.json` 스키마로 변환:
- ID slugify
- 카테고리 추론 (키워드 매칭: "police"→emergency, "visa"→visa 등)
- priority는 빈도 기반 (Reddit 빈도 10+ = 80, 5+ = 60, 1+ = 40)
- 출처 URL을 `source.url`에 기록

### Step 4 — 중복 머지
기존 ID와 충돌하면 `/linkhub-add`의 Step 3 머지 로직 호출.

### Step 5 — 검증
새 항목들에 대해 `/linkhub-verify` 트리거.

### Step 6 — 번역
`/linkhub-translate`로 MVP 4개 언어 채움.

## 출력
- `_workspace/scrape_{source}_{date}.json` — raw 수집 데이터 (감사 추적)
- `_workspace/scrape_{source}_{date}.md` — 정규화 결정 + 신규 항목 요약
- `src/data/{phones,links}.json` — 신규 항목 추가

## 에러 핸들링
- API 키 누락 → 사용자에게 알리고 수동 큐레이션으로 전환
- Rate limit (429) → 1분 대기 후 1회 재시도
- robots.txt 차단 → 보고서에 명시, 해당 소스 스킵
- 빈도 분석에서 같은 번호 여러 포맷 등장(`02-1234-5678` vs `+82-2-1234-5678`) → 국제 포맷으로 통일

## 윤리 / Rate Limiting
- User-Agent에 프로젝트명 명시 (`korea-linkhub/0.1`)
- 요청 간 200ms 이상 간격
- 본문 텍스트만 추출, 개인정보(닉네임/계정명) 저장 금지
