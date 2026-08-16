# Supabase 운영자 백엔드

1. [supabase.com](https://supabase.com)에서 프로젝트를 만듭니다.
2. **SQL Editor**에 [`schema.sql`](./schema.sql)을 붙여 넣고 Run 합니다.
3. **Authentication → Users → Add user**로 운영자 이메일을 만듭니다. 첫 사용자는 자동으로 `operators` 테이블에 들어갑니다.
4. **Project Settings → API**에서 Project URL과 `anon` `public` 키를 복사합니다.
5. Vercel 프로젝트 `design-a`에 환경 변수를 넣습니다.
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
6. 재배포한 뒤 https://njfirstchurch.org/admin/ 에서 로그인합니다.

로컬에서만 시험할 때는 운영자 페이지의 연결 설정에 URL과 키를 넣어도 됩니다.
