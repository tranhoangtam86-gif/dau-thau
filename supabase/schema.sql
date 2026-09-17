-- ============================================================
-- MIGRATION: chuyển từ hệ thống role đơn giản sang mô hình
-- phân quyền theo dự án (admin toàn hệ thống / editor / viewer)
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- dọn dẹp phần cũ (nếu đã chạy SQL trước đó) ----------
drop trigger if exists on_auth_user_created on auth.users;
drop policy if exists "Users can view all profiles" on profiles;
drop policy if exists "Only admin can update roles" on profiles;
alter table if exists profiles drop column if exists role;

-- ---------- profiles ----------
-- (bảng đã tồn tại từ trước, chỉ thêm cột is_admin)
alter table profiles add column if not exists is_admin boolean not null default false;

alter table profiles enable row level security;

drop policy if exists "Anyone can view profiles" on profiles;
create policy "Anyone can view profiles"
  on profiles for select using (true);

-- function kiểm tra quyền admin, dùng lại nhiều nơi, tránh đệ quy RLS
create or replace function public.is_admin(uid uuid)
returns boolean language sql stable security definer as $$
  select coalesce((select is_admin from profiles where id = uid), false);
$$;

drop policy if exists "Self or admin can update profile" on profiles;
create policy "Self or admin can update profile"
  on profiles for update using (
    auth.uid() = id or public.is_admin(auth.uid())
  );

-- Trigger tự tạo profile khi có tài khoản mới (kể cả tạo qua Edge Function)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, is_admin)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), false)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------- projects ----------
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  ten text not null,
  ma_du_an text,
  mo_ta text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

alter table projects enable row level security;

drop policy if exists "View projects if admin or member" on projects;
create policy "View projects if admin or member"
  on projects for select using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from project_members pm
      where pm.project_id = projects.id and pm.user_id = auth.uid()
    )
  );

drop policy if exists "Admin inserts projects" on projects;
create policy "Admin inserts projects"
  on projects for insert with check (public.is_admin(auth.uid()));

drop policy if exists "Admin updates projects" on projects;
create policy "Admin updates projects"
  on projects for update using (public.is_admin(auth.uid()));

drop policy if exists "Admin deletes projects" on projects;
create policy "Admin deletes projects"
  on projects for delete using (public.is_admin(auth.uid()));

-- ---------- project_members ----------
create table if not exists project_members (
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check (role in ('editor', 'viewer')),
  primary key (project_id, user_id)
);

alter table project_members enable row level security;

drop policy if exists "View own membership or admin views all" on project_members;
create policy "View own membership or admin views all"
  on project_members for select using (
    public.is_admin(auth.uid()) or user_id = auth.uid()
  );

drop policy if exists "Admin inserts members" on project_members;
create policy "Admin inserts members"
  on project_members for insert with check (public.is_admin(auth.uid()));

drop policy if exists "Admin updates members" on project_members;
create policy "Admin updates members"
  on project_members for update using (public.is_admin(auth.uid()));

drop policy if exists "Admin deletes members" on project_members;
create policy "Admin deletes members"
  on project_members for delete using (public.is_admin(auth.uid()));

-- ---------- documents (4 loại hồ sơ dùng chung 1 bảng, dữ liệu chi tiết ở cột data) ----------
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('bao_gia', 'ho_so_yeu_cau', 'bien_ban', 'hop_dong')),
  du_an_id uuid references projects(id) on delete set null,
  data jsonb not null default '{}'::jsonb,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table documents enable row level security;

drop policy if exists "View documents if admin or project member" on documents;
create policy "View documents if admin or project member"
  on documents for select using (
    public.is_admin(auth.uid())
    or (
      du_an_id is not null and exists (
        select 1 from project_members pm
        where pm.project_id = documents.du_an_id and pm.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Editors insert documents" on documents;
create policy "Editors insert documents"
  on documents for insert with check (
    public.is_admin(auth.uid())
    or exists (
      select 1 from project_members pm
      where pm.project_id = du_an_id and pm.user_id = auth.uid() and pm.role = 'editor'
    )
  );

drop policy if exists "Editors update documents" on documents;
create policy "Editors update documents"
  on documents for update using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from project_members pm
      where pm.project_id = du_an_id and pm.user_id = auth.uid() and pm.role = 'editor'
    )
  );

drop policy if exists "Editors delete documents" on documents;
create policy "Editors delete documents"
  on documents for delete using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from project_members pm
      where pm.project_id = du_an_id and pm.user_id = auth.uid() and pm.role = 'editor'
    )
  );

-- ---------- audit_log ----------
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  actor_name text,
  action text,
  summary text,
  created_at timestamptz not null default now()
);

alter table audit_log enable row level security;

drop policy if exists "Admin views audit log" on audit_log;
create policy "Admin views audit log"
  on audit_log for select using (public.is_admin(auth.uid()));

drop policy if exists "Any signed-in user can write audit log" on audit_log;
create policy "Any signed-in user can write audit log"
  on audit_log for insert with check (auth.uid() is not null);
