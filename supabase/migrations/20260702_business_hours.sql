create table if not exists public.business_hours (
  id uuid primary key default gen_random_uuid(),
  day_of_week integer not null,
  is_open boolean not null default true,
  start_time time without time zone,
  end_time time without time zone,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_hours_day_of_week_check check (day_of_week between 0 and 6),
  constraint business_hours_open_time_check check (
    (
      is_open = false
      and start_time is null
      and end_time is null
    )
    or
    (
      is_open = true
      and start_time is not null
      and end_time is not null
      and start_time < end_time
    )
  )
);

create unique index if not exists business_hours_day_of_week_key
on public.business_hours (day_of_week);

alter table public.business_hours enable row level security;

revoke all on table public.business_hours from anon;
revoke all on table public.business_hours from authenticated;
grant all on table public.business_hours to service_role;

insert into public.business_hours (day_of_week, is_open, start_time, end_time)
values
  (0, false, null, null),
  (1, true, '09:00', '22:00'),
  (2, true, '09:00', '22:00'),
  (3, true, '09:00', '22:00'),
  (4, true, '09:00', '22:00'),
  (5, true, '09:00', '22:00'),
  (6, true, '09:00', '22:00')
on conflict (day_of_week) do nothing;

comment on table public.business_hours is 'Horarios laborales configurables del negocio para calcular disponibilidad.';
