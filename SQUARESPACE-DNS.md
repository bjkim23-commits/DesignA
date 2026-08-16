# njfirstchurch.org → Vercel (메일 유지)

도메인은 이미 Vercel 프로젝트 `design-a`에 추가되어 있습니다. **Squarespace 네임서버는 바꾸지 마세요.** MX/TXT(메일)도 그대로 둡니다.

## Squarespace에서 할 일

1. Squarespace 로그인 → **Domains** → `njfirstchurch.org` → **DNS Settings** (또는 DNS / Custom records).
2. Squarespace 웹사이트로 가는 **웹용 A / CNAME**만 바꾸거나 지웁니다. 메일용 **MX**, **TXT**(SPF/DKIM)는 손대지 않습니다.
3. 아래 레코드를 넣습니다.

| Type | Host | Value |
|---|---|---|
| A | `@` (또는 비움) | `76.76.21.21` |
| A | `www` | `76.76.21.21` |

Squarespace가 Host에 `@` 대신 빈 칸이나 `njfirstchurch.org`를 쓰는 경우도 있습니다. 루트(도메인 자체)와 `www` 두 개만 Vercel IP로 맞추면 됩니다.

4. 저장 후 10분~수시간 뒤 확인:
   - https://njfirstchurch.org
   - https://www.njfirstchurch.org
   - https://njfirstchurch.org/admin/

기존 메일(`info@njfirstchurch.org` 등)이 그대로인지 함께 확인하세요.
