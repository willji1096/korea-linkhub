# korea-linkhub — Product Spec

## 한 줄
외국인이 한국에서 가장 많이 찾는 **전화번호 + 공식 사이트 링크**를 한 페이지에 모은 Linktree-스타일 허브.

## Why
외국인 관광객/거주자는 응급 상황·민원·예약·교통·환전·이심·관광 정보 등을 검색할 때마다 흩어진 정부/민간 사이트를 헤맨다. 번호 하나, 링크 하나가 안 잡혀도 여행이 막힌다. korea-linkhub는 **"전화 한 통이면 되는 일"과 "사이트 한 번이면 되는 일"의 최단 경로**를 제공한다.

## Who — 10 페르소나 (`docs/PERSONAS.md`)

**Type A 시간 축 (lifecycle):**
1. **Aiko** JP 31 — 출국 전 사전 준비
2. **Lucas** BR 26 — 도착 직후 공항 → 시내
3. **Maya** US 28 — 여행 중 부상/분실
4. **Hassan** EG 42 — 비상 (3초 SOS)
5. **Linh** VN 24 — 장기 거주, 비자·생활

**Type B 목적/상황 축:**
6. **Yuki** JP 18 — K-pop 콘서트, 첫 해외
7. **Carlos** MX 50 — 의료관광 (강남 시술 2주)
8. **Fatima** AE 38 — 가족 관광, 할랄·소아과·기도공간
9. **Min-jun** US 35 — 한국계 입양인, 친가족 찾기·행정 서류
10. **Diego** AR 30 — 인천공항 18시간 환승

안티 타깃: 국내 한국인 (한국어 검색이 더 빠름).

카테고리 매트릭스(10×11), 다국어 우선순위, walk-through 10개 시나리오는 `docs/PERSONAS.md`.

**Type C — 내부 평가관 (사용자 아님):** **Rene** (DE 71) — Rams 후예 시니어 디자이너. 모든 디자인은 Rene의 16 휴리스틱(Rams 10 + Norman 8 + HIG)을 통과해야 사용자 앞에 나간다. `critic` 에이전트 + `/linkhub-design-review` 스킬.

## What — 핵심 콘텐츠

### 1. 전화번호 카탈로그 (`phones.json`)
| 분류 | 예시 |
|---|---|
| Emergency | 112 경찰, 119 소방/응급, 1339 의료상담 |
| Tourist Help | 1330 관광통역안내 (24/7, 20개 언어) |
| Embassy | 주요국 대사관 영사과 |
| Transport | 1577-1234 KTX, 공항버스/택시콜 |
| Visa/Immigration | 1345 외국인종합안내 |
| Living | 120 다산콜, 지역 외국인 지원센터 |
| Health | 응급 통역, 24시 약국 라인 |

### 2. 링크 카탈로그 (`links.json`)
| 분류 | 예시 |
|---|---|
| Official | visitkorea.or.kr, hikorea.go.kr, 1330KoreaTravel |
| Transport | tmoney, korail.com, t.go.kr (Tmap) |
| eSIM/SIM | airalo, kt-roaming |
| Money | wise, weexchange (인천공항) |
| Medical | 의료기관 영문 포털, 보건복지부 외국인 |
| Booking | klook 대체로 자체 큐레이션 |

## 데이터 수집 전략 (3축 병행)
1. **수동 큐레이션** — 정부 공식 채널 골든리스트 시드 (~30개)
2. **공공 API + 정기 크롤링** — 한국관광공사 TourAPI, 외교부 영사 콜센터 페이지, Hi Korea 공지
3. **커뮤니티 수요 분석** — r/korea, r/seoul, r/livinginkorea에서 "어떤 번호 필요했나" 빈도 추출 → 우선순위 보정

수집 결과는 모두 `src/data/*.json`으로 직렬화 (정적 빌드 친화).

## 다국어 (17개 언어 목표, MVP는 영어)
- 라우팅: `next-intl` segment-based (`/en`, `/ja`, `/zh-CN`, ...)
- 영어 기본, 한국어는 운영자용 시안
- 카탈로그 자체는 다국어 필드 객체 (`name: { en, ja, zh, ... }`)

## 비기능
- 정적 export 우선, 서버 의존성 최소
- 모바일 first (외국인은 모바일에서 검색)
- 오프라인 즐겨찾기 (PWA, MVP 후)

## 비범위
- 예약·결제 (외부 링크만)
- 자체 상담/통역 (1330으로 대체)
- 광고/어필리에이트 (MVP에서는 X)
