create extension if not exists pgcrypto;

create table if not exists public.customers (
  id text primary key,
  name text not null,
  phone text not null unique,
  email text,
  address text,
  photo text,
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id text primary key,
  customer_id text not null references public.customers(id) on delete cascade,
  bottle_type text not null,
  quantity numeric not null default 0,
  price_per_bottle numeric not null default 0,
  total_amount numeric not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role text not null default 'Admin',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bottle_prices (
  bottle_type text primary key,
  price numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.app_settings (
  id text primary key default 'main',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.himalaya_snapshots (
  snapshot_key text primary key,
  payload jsonb not null default '{}'::jsonb,
  customers_csv text not null default '',
  sales_csv text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.bottle_prices enable row level security;
alter table public.app_settings enable row level security;
alter table public.himalaya_snapshots enable row level security;

drop policy if exists "Authenticated customers access" on public.customers;
create policy "Authenticated customers access"
on public.customers
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated sales access" on public.sales;
create policy "Authenticated sales access"
on public.sales
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated admin profile access" on public.admin_profiles;
create policy "Authenticated admin profile access"
on public.admin_profiles
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated bottle price access" on public.bottle_prices;
create policy "Authenticated bottle price access"
on public.bottle_prices
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated settings access" on public.app_settings;
create policy "Authenticated settings access"
on public.app_settings
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated snapshot access" on public.himalaya_snapshots;
create policy "Authenticated snapshot access"
on public.himalaya_snapshots
for all
to authenticated
using (true)
with check (true);

insert into public.app_settings (id, payload)
values (
  'main',
  '{
    "darkMode": false,
    "businessName": "Himaliya Spring Water",
    "businessPhone": "+92 300 0000000",
    "businessAddress": "Karachi, Pakistan"
  }'::jsonb
)
on conflict (id) do nothing;

insert into public.bottle_prices (bottle_type, price)
values
  ('Small Bottle', 0),
  ('Medium Bottle', 0),
  ('Large Bottle', 0),
  ('Gallon', 0)
on conflict (bottle_type) do nothing;

-- First owner setup:
-- 1. In Supabase Dashboard > Authentication > Users, create your first owner user.
-- 2. Replace the email below, then run only this insert block.
--
-- insert into public.admin_profiles (auth_user_id, name, email, role, active)
-- select id, 'Himaliya Owner', email, 'Owner', true
-- from auth.users
-- where email = 'admin@himaliya.com'
-- on conflict (auth_user_id) do update set role = 'Owner', active = true;
