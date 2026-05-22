# Rams 10 Principles — korea-linkhub 적용 체크리스트

각 원칙에 대해 PASS/WARN/FAIL 평가. 측정 가능한 지표로만 판단.

---

## 1. Good design is innovative
**원칙:** 새로운 기술적/기능적 가능성을 시각적으로 표현.
**프로젝트 적용:** 외국인 비상연락망 + Linktree 디렉토리. SOS 바·검색·카테고리 칩이 본질을 시각화하는가?
**측정:** 메인 진입 후 3초 안에 "이게 어떤 사이트인지" 인지 가능한가?
**FAIL 기준:** 사이트 본질이 첫 화면에서 보이지 않음.

## 2. Good design makes a product useful
**원칙:** 기능을 강조, 장식 최소화.
**측정:**
- 사용성 방해 애니메이션 0개 (loading skeleton 제외)
- 클릭/탭 → 대상 호출(전화/링크) 최대 2탭
- 검색 입력 → 결과 갱신 latency < 100ms

## 3. Good design is aesthetic
**원칙:** 정직한 비례, 일관 간격 시스템.
**측정:**
- Tailwind 간격 토큰 8px 그리드 (0/1/2/3/4/5/6/8/10/12/16/20/24/32) 외 사용 0%
- 모든 카드 같은 padding, 같은 border-radius
- font scale 6단계 이내 (text-xs/sm/base/lg/xl/2xl)

## 4. Good design makes a product understandable
**원칙:** 시각 위계 = 정보 위계.
**측정:**
- emergency 카테고리 = 가장 큰 시각 강조 (SOS 바)
- priority 100 항목 = 첫 스크롤에 노출
- 카테고리 라벨 → 항목 이름 → 메타 순으로 시각 무게

## 5. Good design is unobtrusive
**원칙:** UI는 도구, 자신을 드러내지 않음.
**측정:**
- 배경색 zinc-50 또는 white 단일
- 액센트 색 ≤ 3종 (red/blue/emerald)
- 그림자/그라데이션 / "feature" 컬러 블록 ≤ 2종

## 6. Good design is honest
**원칙:** 가짜 기능·과장 X.
**측정:**
- 가짜 그라데이션·가짜 깊이·가짜 진행률 0개
- 호버 효과는 실제 인터랙션 가능한 요소에만
- "verified" 같은 메타는 실제 검증 결과여야 함 (verifiedAt)

## 7. Good design is long-lasting
**원칙:** 유행 의존 X.
**측정:**
- 시스템 폰트 우선 (Geist 같은 중립 sans 허용)
- 컬러: 단색 + 기능적 액센트만, 트렌디 컬러 (Coral, Periwinkle 등) X
- 라운드: 4/8/12px 단순 토큰만

## 8. Good design is thorough down to the last detail
**원칙:** 디테일 완성.
**측정:**
- 1px 어긋남 0개 (gap 일관)
- 카드 호버/액티브/포커스 상태 모두 정의됨
- 빈 상태·로딩·에러 메시지 모두 존재

## 9. Good design is environmentally friendly
**원칙:** 리소스 절약.
**측정:**
- 이미지 사용 최소 (현재 0개, OK)
- 폰트 weight ≤ 4종
- 클라이언트 JS bundle < 100KB
- 외부 폰트 ≤ 2종

## 10. Good design is as little design as possible
**원칙:** 의심스러우면 제거.
**측정:**
- 카드 안 요소 ≤ 5개 (제목/카테고리/설명/메타/액션)
- 메뉴 항목 ≤ 7개
- 페이지당 섹션 ≤ 4개

---

## 16-heuristic Scoring Table

| # | 원칙 | 측정 | PASS | WARN | FAIL |
|---|---|---|---|---|---|
| 1 | Innovative | 본질 인지 3초 | 가능 | 5초 | 인지 불가 |
| 2 | Useful | 탭 수 | ≤2 | 3 | ≥4 |
| 3 | Aesthetic | 토큰 외 사용 | 0% | ≤5% | >5% |
| 4 | Understandable | 위계 = 정보 | 일치 | 1개 불일치 | ≥2개 |
| 5 | Unobtrusive | 액센트 색 | ≤3 | 4 | ≥5 |
| 6 | Honest | 가짜 요소 | 0 | 1 | ≥2 |
| 7 | Long-lasting | 트렌드 의존 | 0 | 1 | ≥2 |
| 8 | Thorough | 1px 어긋남 | 0 | ≤2 | ≥3 |
| 9 | Environmentally | JS bundle | <100KB | 100-200 | >200KB |
| 10 | As little as | 카드 요소 | ≤5 | 6 | ≥7 |

(+ Norman 8 — `norman-heuristics.md` 참조 → 총 16개)
