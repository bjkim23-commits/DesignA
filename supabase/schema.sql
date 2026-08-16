-- Run this in the Supabase SQL editor (once per project).
-- Dashboard: SQL Editor → New query → paste → Run.

create table if not exists public.operators (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sermons (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text not null default '',
  scripture text not null default '',
  scripture_en text not null default '',
  preacher text not null default '',
  sermon_date date not null,
  youtube_id text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text not null default '',
  date_label text not null,
  sort_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.bulletins (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  bulletin_date date not null,
  url text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists sermons_date_idx on public.sermons (sermon_date desc);
create index if not exists news_sort_idx on public.news (sort_date desc nulls last, created_at desc);
create index if not exists bulletins_date_idx on public.bulletins (bulletin_date desc);

alter table public.operators enable row level security;
alter table public.sermons enable row level security;
alter table public.news enable row level security;
alter table public.bulletins enable row level security;

create or replace function public.is_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.operators
    where user_id = auth.uid()
  );
$$;

drop policy if exists "operators_self_read" on public.operators;
create policy "operators_self_read" on public.operators
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "sermons_public_read" on public.sermons;
create policy "sermons_public_read" on public.sermons
  for select to anon, authenticated
  using (true);

drop policy if exists "sermons_operator_write" on public.sermons;
create policy "sermons_operator_write" on public.sermons
  for all to authenticated
  using (public.is_operator())
  with check (public.is_operator());

drop policy if exists "news_public_read" on public.news;
create policy "news_public_read" on public.news
  for select to anon, authenticated
  using (true);

drop policy if exists "news_operator_write" on public.news;
create policy "news_operator_write" on public.news
  for all to authenticated
  using (public.is_operator())
  with check (public.is_operator());

drop policy if exists "bulletins_public_read" on public.bulletins;
create policy "bulletins_public_read" on public.bulletins
  for select to anon, authenticated
  using (true);

drop policy if exists "bulletins_operator_write" on public.bulletins;
create policy "bulletins_operator_write" on public.bulletins
  for all to authenticated
  using (public.is_operator())
  with check (public.is_operator());

-- First signed-up auth user becomes an operator automatically.
create or replace function public.add_first_operator()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.operators) then
    insert into public.operators (user_id, email)
    values (new.id, coalesce(new.email, ''))
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_operator on auth.users;
create trigger on_auth_user_created_operator
  after insert on auth.users
  for each row execute procedure public.add_first_operator();

insert into public.operators (user_id, email)
select id, coalesce(email, '')
from auth.users
where not exists (select 1 from public.operators)
order by created_at
limit 1;

insert into public.sermons (title, title_en, scripture, scripture_en, preacher, sermon_date, youtube_id)
select
  '예수님을 위한 증거',
  'Witnesses to Jesus',
  '요한복음 5:31-47',
  'John 5:31-47',
  '강상석 담임목사',
  '2026-05-31',
  'Xzdsv4wX_20'
where not exists (select 1 from public.sermons);

insert into public.news (title, title_en, date_label, sort_date)
select * from (values
  ('성경암송대회 (요한복음 1:1-18)', 'Scripture Memory Contest (John 1:1-18)', '06.07', '2026-06-07'::date),
  ('찬양예배 — 주일 2부 예배', 'Praise Worship — Sunday 2nd Service', '06.07', '2026-06-07'::date),
  ('한글학교 — 2층 유초등부실', 'Korean School — 2nd floor children’s room', '매주 일요일', null),
  ('경로 선물 — 75세 이상 어르신', 'Gifts for seniors ages 75+', '진행 중', null)
) as v(title, title_en, date_label, sort_date)
where not exists (select 1 from public.news);

insert into public.bulletins (title, bulletin_date, url)
select * from (values
  ('2026년 6월 14일 주보', '2026-06-14'::date, ''),
  ('2026년 6월 7일 주보', '2026-06-07'::date, ''),
  ('2026년 5월 31일 주보', '2026-05-31'::date, ''),
  ('2026년 5월 24일 주보', '2026-05-24'::date, '')
) as v(title, bulletin_date, url)
where not exists (select 1 from public.bulletins);
