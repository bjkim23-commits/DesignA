# First Korean Church of NJ — Design A

Theme: **Deep Navy & Warm Gold**. Live: [design-a-ochre.vercel.app](https://design-a-ochre.vercel.app/). Domain: `njfirstchurch.org` (Squarespace DNS, Vercel hosting).

## 운영자

- 관리 페이지: `/admin/`
- 백엔드: Supabase. 스키마는 [`supabase/schema.sql`](supabase/schema.sql), 연결 방법은 [`supabase/README.md`](supabase/README.md).
- 도메인 DNS: [`SQUARESPACE-DNS.md`](SQUARESPACE-DNS.md) — **네임서버와 메일 MX는 바꾸지 않습니다.**

## Files

- `index.html` — landing
- `admin/` — 설교·소식·주보 관리
- `js/` — Supabase 클라이언트와 공개 콘텐츠 로더
- `support.js` — landing runtime
- `videos/` — hero clips
