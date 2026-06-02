alter table public.profiles
add column if not exists username text;

with generated_usernames as (
  select
    id,
    lower(trim(both '_' from regexp_replace(full_name, '[^a-zA-Z0-9_]+', '_', 'g'))) as base_username,
    row_number() over (
      partition by lower(trim(both '_' from regexp_replace(full_name, '[^a-zA-Z0-9_]+', '_', 'g')))
      order by created_at, id
    ) as duplicate_number
  from public.profiles
  where username is null
)
update public.profiles
set username = case
  when generated_usernames.duplicate_number = 1 then generated_usernames.base_username
  else generated_usernames.base_username || '_' || left(public.profiles.id::text, 8)
end
from generated_usernames
where public.profiles.id = generated_usernames.id;

alter table public.profiles
alter column username set not null;

create unique index if not exists profiles_username_key
on public.profiles(username);
