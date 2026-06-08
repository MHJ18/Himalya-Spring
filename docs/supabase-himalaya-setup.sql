create table if not exists public.himalaya_snapshots (
  snapshot_key text primary key,
  payload jsonb not null default '{}'::jsonb,
  customers_csv text not null default '',
  sales_csv text not null default '',
  updated_at timestamptz not null default now()
);

alter table public.himalaya_snapshots enable row level security;

drop policy if exists "Allow anon snapshot reads" on public.himalaya_snapshots;
create policy "Allow anon snapshot reads"
on public.himalaya_snapshots
for select
to anon
using (true);

drop policy if exists "Allow anon snapshot writes" on public.himalaya_snapshots;
create policy "Allow anon snapshot writes"
on public.himalaya_snapshots
for insert
to anon
with check (true);

drop policy if exists "Allow anon snapshot updates" on public.himalaya_snapshots;
create policy "Allow anon snapshot updates"
on public.himalaya_snapshots
for update
to anon
using (true)
with check (true);
