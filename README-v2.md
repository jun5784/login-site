# 혁신과 소통을 위한 익명 토론회 v2 (의왕도시공사)

## 설치 순서
1. Supabase > SQL Editor > New query 에 `upgrade-v2.sql` 전체를 붙여 넣고 Run
   - 결과에 `v2 upgrade applied` 가 나오면 완료 (기존 데이터 유지)
   - "destructive operation" 경고가 뜨면 Run this query 를 누르세요 (topic_summary 뷰를 다시 만드는 과정입니다)
2. GitHub 저장소 > Add file > Upload files 에 이 폴더 안의 파일과 `img` 폴더를 모두 올리고 Commit changes
   - config.js 는 들어 있지 않습니다. 저장소에 있는 기존 config.js 를 그대로 두세요.
3. (선택) 의왕도시공사 공식 로고 파일을 `img/logo.png` 이름으로 올리면 모든 페이지 왼쪽 위에 표시됩니다.
   - 파일이 없으면 글자 로고(의왕도시공사)가 대신 표시됩니다. 가로형 로고, 높이 100px 이상 PNG(투명 배경)를 권장합니다.
4. 1~2분 뒤 Ctrl+F5 로 새로고침

## 페이지
- index.html : 로그인 / 회원가입 / 비밀번호 찾기
- dashboard.html : 홈 (익명 보장 약속, Voice → Action 절차, 토론 테마)
- discussion.html : 토론 로비 (테마·상태 필터, 관리자 토론 열기, 혁신과제 현황판)
- room.html : 실시간 익명 토론방
- report.html : 토론 분석 대시보드 (키워드, 자동 분류, 감정, TOP 10 상정, 과제 관리, CSV/PDF)

## 욕설 차단 단어 관리
- Supabase > Table Editor > profanity_words : 막을 단어 추가
- profanity_allow : 정상 단어가 잘못 막힐 때 예외 단어 추가 (예: 시발점, 도시발전)
- 화면에서 바로 안내하는 목록은 profanity.js 에 있습니다. 표에 추가한 단어도 저장 단계에서 차단됩니다.
