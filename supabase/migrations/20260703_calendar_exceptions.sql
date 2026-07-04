create table if not exists public.calendar_exceptions (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  start_date date not null,
  end_date date not null,
  is_closed boolean not null default true,
  special_start_time time null,
  special_end_time time null,
  notes text null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint calendar_exceptions_type_check check (type in ('CLOSED_DAY', 'SPECIAL_HOURS', 'VACATION')),
  constraint calendar_exceptions_title_check check (char_length(title) between 1 and 80),
  constraint calendar_exceptions_date_range_check check (end_date >= start_date),
  constraint calendar_exceptions_special_hours_check check (
    (
      type = 'SPECIAL_HOURS'
      and special_start_time is not null
      and special_end_time is not null
      and special_start_time < special_end_time
      and is_closed = false
    )
    or
    (
      type in ('CLOSED_DAY', 'VACATION')
      and special_start_time is null
      and special_end_time is null
      and is_closed = true
    )
  )
);

create index if not exists idx_calendar_exceptions_range
  on public.calendar_exceptions (start_date, end_date);

alter table public.calendar_exceptions enable row level security;
