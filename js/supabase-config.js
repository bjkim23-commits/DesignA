/* Public anon key only. Never put the service_role key here.
   Prefer Vercel env (SUPABASE_URL, SUPABASE_ANON_KEY) via /api/public-config.
   These values are a local/dev fallback. */
window.FKC_SUPABASE = {
  url: '',
  anonKey: ''
};
