# Norman Heuristics — korea-linkhub 적용 (Nielsen-Norman 10개를 8개로 압축)

## 1. Visibility of system status
**적용:** 검색 결과 개수, 필터 활성 표시, 로딩 인디케이터.
**측정:** 검색 입력 시 카운트 변화 즉시 보임. 필터 활성 칩은 시각적으로 구분.
**현재 상태:** 섹션 헤더에 `· N` 카운트 표시 ✓

## 2. Match between system and real world
**적용:** 외국인 멘탈 모델. "Police"=112가 한국 표준이라 명시.
**측정:** Maya·Hassan·Yuki가 라벨만 보고 즉시 이해 가능한가.
**FAIL 기준:** 한국 행정 용어를 영어로 직역해서 의미 손실.

## 3. User control and freedom
**적용:** 검색 클리어 버튼, 필터 해제 ("All" 칩), 뒤로가기.
**측정:** 잘못 누른 액션 1탭 안에 취소 가능.

## 4. Consistency and standards
**적용:** 카드 패턴 통일, 색 의미 일관.
**측정:**
- 모든 카드 = 같은 padding/radius/border
- red = emergency/danger, blue = info/transport, emerald = free/safe — 다른 의미로 같은 색 사용 금지

## 5. Error prevention
**적용:** dead-link, 잘못된 번호 사전 차단.
**측정:** verifier 통과 + 어드민 폼 검증.

## 6. Recognition rather than recall
**적용:** 카테고리 칩, 시각 아이콘 라벨.
**측정:** 메모 없이 다시 와도 같은 액션 가능. 메뉴 위치 일관.

## 7. Aesthetic and minimalist design
**적용:** 노이즈 제거.
**측정:**
- 정보가 아닌 시각 요소 ≤ 10%
- 텍스트/UI 비율 적정 (텍스트 우세)

## 8. Help users recognize, diagnose, recover from errors
**적용:** 빈 상태 메시지, 검색 결과 0건 안내.
**측정:** 모든 에러 상황에 "다음에 뭘 하면 되는지" 메시지 존재.
**현재 상태:** `search.empty: "Nothing matches. Try another word."` ✓

---

## Scoring (PASS/WARN/FAIL 기준)

| # | 휴리스틱 | PASS | WARN | FAIL |
|---|---|---|---|---|
| 1 | Status visibility | 즉시 갱신 | 200ms+ | 갱신 X |
| 2 | Real world | 직관 라벨 | 1개 모호 | ≥2개 모호 |
| 3 | Control/freedom | 1탭 취소 | 2탭 | ≥3탭 |
| 4 | Consistency | 100% | 1개 위반 | ≥2개 위반 |
| 5 | Error prevention | 검증 통과 | 1개 dead | ≥2개 dead |
| 6 | Recognition | 라벨 보임 | 호버에만 | 없음 |
| 7 | Minimalist | 텍스트 우세 | 균형 | 장식 우세 |
| 8 | Error recovery | 모든 상황 메시지 | 1개 누락 | ≥2개 누락 |
