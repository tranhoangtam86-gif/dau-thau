-- Run this once in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run.

create table if not exists kv_store (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

alter table kv_store enable row level security;

-- NOTE: these policies make the table publicly readable and writable by
-- anyone holding the "anon" public API key (the same key that ships inside
-- your built frontend). That matches the trust model of the app itself
-- (no passwords, "display name" is self-reported) — anyone with the link
-- and the key can read/write the shared data. If you need real access
-- control, you would add Supabase Auth and rewrite these policies to check
-- auth.uid() instead of allowing everyone; that is a larger follow-up task.

drop policy if exists "public read" on kv_store;
create policy "public read" on kv_store for select using (true);

drop policy if exists "public insert" on kv_store;
create policy "public insert" on kv_store for insert with check (true);

drop policy if exists "public update" on kv_store;
create policy "public update" on kv_store for update using (true);

drop policy if exists "public delete" on kv_store;
create policy "public delete" on kv_store for delete using (true);
