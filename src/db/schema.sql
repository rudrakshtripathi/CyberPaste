drop table if exists stored_tabs;
drop table if exists stored_pastes;

create table stored_pastes (
  id text primary key, -- shortid instead of uuid
  created_at timestamptz not null default now(),
  ttl integer not null default 0,
  views integer not null default 0,
  encrypted boolean not null default false,
  expires_at timestamptz,
  constraint expires_ck check (ttl >= 0)
);

create table stored_tabs (
  id uuid primary key default gen_random_uuid(),
  paste_id text not null references stored_pastes(id) on delete cascade,
  name text not null,
  lang text not null,
  content text not null
);

create index on stored_pastes (expires_at);
create index on stored_tabs (paste_id);

-- Optional: atomic view counter
create or replace function increment_views(paste_id text)
returns void as $$
begin
  update stored_pastes
  set views = views + 1
  where id = paste_id;
end;
$$ language plpgsql;
