# 로그인 웹사이트 (GitHub Pages + Supabase Auth)

- 호스팅: GitHub Pages (무료, 정적 페이지)
- 인증 서버: Supabase Auth (무료 플랜, 비밀번호는 서버에서 해시 저장)
- 로그인 방식: 이메일/비밀번호, GitHub 계정 로그인
- 기능: 로그인, 회원가입(이메일 인증), 비밀번호 재설정, 로그인 상태 유지, 로그아웃

## 파일 구성
| 파일 | 역할 |
|---|---|
| index.html | 로그인 / 회원가입 / 비밀번호 재설정 요청 |
| dashboard.html | 로그인한 사용자만 볼 수 있는 페이지 |
| reset.html | 메일 링크로 들어와 새 비밀번호 설정 |
| config.js | Supabase URL과 공개 키 설정 |
| auth.js, style.css | 공통 스크립트와 스타일 |

## 1단계. GitHub 저장소 만들고 Pages 켜기
1. GitHub에서 새 저장소를 만듭니다. 예: `login-site` (Public)
2. 이 폴더의 파일을 모두 업로드합니다. (Add file > Upload files)
3. 저장소 Settings > Pages > Build and deployment에서
   Source = `Deploy from a branch`, Branch = `main` / `/(root)`로 저장합니다.
4. 1~2분 뒤 주소가 생깁니다: `https://<GitHub아이디>.github.io/login-site/`

## 2단계. Supabase 프로젝트 만들기
1. https://supabase.com 에 GitHub 계정으로 가입하고 New project를 만듭니다.
2. Project Settings > API(API Keys)에서 아래 두 값을 복사합니다.
   - Project URL → `SUPABASE_URL`
   - anon(publishable) key → `SUPABASE_ANON_KEY`
3. `config.js`에 붙여 넣고 GitHub에 다시 커밋합니다.
   (service_role / secret 키는 절대 넣지 마세요.)
4. Authentication > URL Configuration에서
   - Site URL: `https://<GitHub아이디>.github.io/login-site/`
   - Redirect URLs에 추가: `https://<GitHub아이디>.github.io/login-site/**`

## 3단계. GitHub 로그인 연결 (선택)
1. GitHub > Settings > Developer settings > OAuth Apps > New OAuth App
   - Homepage URL: `https://<GitHub아이디>.github.io/login-site/`
   - Authorization callback URL: `https://<프로젝트ID>.supabase.co/auth/v1/callback`
2. 생성 후 Client ID를 복사하고 Generate a new client secret으로 Secret을 발급합니다.
3. Supabase > Authentication > Sign In / Providers > GitHub를 켜고 Client ID와 Secret을 입력해 저장합니다.

## 4단계. 확인
- `https://<GitHub아이디>.github.io/login-site/` 접속 → 회원가입 → 인증 메일 확인 → 로그인 → dashboard 표시
- "GitHub로 로그인" 버튼 → GitHub 승인 → dashboard 표시

## 참고
- Supabase 기본 메일 발송은 시간당 발송 수가 적게 제한됩니다. 실제 운영 시 Authentication > Emails(SMTP Settings)에서 자체 SMTP를 연결하세요.
- 테스트 중 이메일 인증을 생략하려면 Authentication > Sign In / Providers > Email에서 Confirm email을 끌 수 있습니다.
- 로컬에서 테스트할 때는 파일을 더블클릭하지 말고 `python -m http.server 8000`으로 실행한 뒤 `http://localhost:8000`을 Redirect URLs에 추가하세요.
