revoke all privileges
on table public.appointments, public.customers, public.profiles
from anon, authenticated;

revoke all privileges
on table public.services
from anon, authenticated;

grant select
on table public.services
to anon, authenticated;

drop policy if exists "Todos pueden ver profile"
on public.profiles;

drop policy if exists "Authenticated users can view own profile"
on public.profiles;

drop policy if exists "Todos pueden ver los servicios"
on public.services;

drop policy if exists "Public can view active services"
on public.services;

create policy "Public can view active services"
on public.services
for select
to anon, authenticated
using (is_active = true);
