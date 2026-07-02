create table if not exists public.appointment_settings (
  id uuid primary key default gen_random_uuid(),
  slot_interval_minutes integer not null default 15,
  default_buffer_minutes integer not null default 15,
  min_booking_notice_minutes integer not null default 0,
  max_booking_days_ahead integer not null default 30,
  auto_confirm_appointments boolean not null default false,
  allow_pending_appointments boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointment_settings_slot_interval_check check (
    slot_interval_minutes in (5, 10, 15, 20, 30, 60)
  ),
  constraint appointment_settings_default_buffer_check check (
    default_buffer_minutes between 0 and 120
  ),
  constraint appointment_settings_min_notice_check check (
    min_booking_notice_minutes between 0 and 10080
  ),
  constraint appointment_settings_max_days_check check (
    max_booking_days_ahead between 1 and 365
  )
);

create unique index if not exists appointment_settings_singleton_idx
on public.appointment_settings ((true));

alter table public.appointment_settings enable row level security;

revoke all on table public.appointment_settings from anon;
revoke all on table public.appointment_settings from authenticated;
grant all on table public.appointment_settings to service_role;

insert into public.appointment_settings (
  slot_interval_minutes,
  default_buffer_minutes,
  min_booking_notice_minutes,
  max_booking_days_ahead,
  auto_confirm_appointments,
  allow_pending_appointments
)
select
  15,
  15,
  0,
  30,
  false,
  true
where not exists (
  select 1 from public.appointment_settings
);

comment on table public.appointment_settings is 'Configuración general de reglas de turnos y disponibilidad.';

create or replace function public.create_appointment_atomic(
  p_customer_id uuid,
  p_barber_id uuid,
  p_service_id uuid,
  p_appointment_date date,
  p_start_time time without time zone,
  p_status text,
  p_notes text default null
)
returns public.appointments
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_duration_minutes bigint;
  v_buffer_minutes bigint;
  v_is_active boolean;
  v_end_time time without time zone;
  v_appointment public.appointments;
begin
  if p_status not in ('pending', 'confirmed') then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_INITIAL_STATUS';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_appointment_date::text, 0)
  );

  select
    duration_minutes,
    is_active
  into
    v_duration_minutes,
    v_is_active
  from public.services
  where id = p_service_id
  for share;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'SERVICE_NOT_FOUND';
  end if;

  if v_is_active is not true then
    raise exception using
      errcode = 'P0001',
      message = 'SERVICE_INACTIVE';
  end if;

  select coalesce(default_buffer_minutes, 15)
  into v_buffer_minutes
  from public.appointment_settings
  limit 1;

  v_buffer_minutes := coalesce(v_buffer_minutes, 15);

  v_end_time := (
    p_start_time
    + make_interval(
        mins => (v_duration_minutes + v_buffer_minutes)::integer
      )
  )::time;

  if v_end_time <= p_start_time then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_TIME_RANGE';
  end if;

  if exists (
    select 1
    from public.appointments existing
    where existing.appointment_date = p_appointment_date
      and existing.status in ('pending', 'confirmed')
      and existing.start_time < v_end_time
      and existing.end_time > p_start_time
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'APPOINTMENT_CONFLICT';
  end if;

  insert into public.appointments (
    customer_id,
    barber_id,
    service_id,
    appointment_date,
    start_time,
    end_time,
    status,
    notes,
    updated_at
  )
  values (
    p_customer_id,
    p_barber_id,
    p_service_id,
    p_appointment_date,
    p_start_time,
    v_end_time,
    p_status,
    p_notes,
    now()
  )
  returning *
  into v_appointment;

  return v_appointment;
end;
$$;

create or replace function public.create_appointment_with_customer_atomic(
  p_customer_id uuid,
  p_full_name text,
  p_phone text,
  p_email text,
  p_barber_id uuid,
  p_service_id uuid,
  p_appointment_date date,
  p_start_time time without time zone,
  p_status text,
  p_notes text default null
)
returns public.appointments
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_customer_id uuid;
  v_normalized_phone text;
  v_duration_minutes bigint;
  v_buffer_minutes bigint;
  v_is_active boolean;
  v_end_time time without time zone;
  v_appointment public.appointments;
begin
  if p_status not in ('pending', 'confirmed') then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_INITIAL_STATUS';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_appointment_date::text, 0)
  );

  select
    duration_minutes,
    is_active
  into
    v_duration_minutes,
    v_is_active
  from public.services
  where id = p_service_id
  for share;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'SERVICE_NOT_FOUND';
  end if;

  if v_is_active is not true then
    raise exception using
      errcode = 'P0001',
      message = 'SERVICE_INACTIVE';
  end if;

  select coalesce(default_buffer_minutes, 15)
  into v_buffer_minutes
  from public.appointment_settings
  limit 1;

  v_buffer_minutes := coalesce(v_buffer_minutes, 15);

  v_end_time := (
    p_start_time
    + make_interval(
        mins => (v_duration_minutes + v_buffer_minutes)::integer
      )
  )::time;

  if v_end_time <= p_start_time then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_TIME_RANGE';
  end if;

  if exists (
    select 1
    from public.appointments existing
    where existing.appointment_date = p_appointment_date
      and existing.status in ('pending', 'confirmed')
      and existing.start_time < v_end_time
      and existing.end_time > p_start_time
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'APPOINTMENT_CONFLICT';
  end if;

  if p_customer_id is not null then
    select id
    into v_customer_id
    from public.customers
    where id = p_customer_id;

    if not found then
      raise exception using
        errcode = 'P0001',
        message = 'CUSTOMER_NOT_FOUND';
    end if;
  else
    if p_full_name is null or btrim(p_full_name) = '' then
      raise exception using
        errcode = 'P0001',
        message = 'INVALID_CUSTOMER_NAME';
    end if;

    v_normalized_phone := regexp_replace(
      coalesce(p_phone, ''),
      '[^0-9]',
      '',
      'g'
    );

    if char_length(v_normalized_phone) not between 7 and 20 then
      raise exception using
        errcode = 'P0001',
        message = 'INVALID_CUSTOMER_PHONE';
    end if;

    select id
    into v_customer_id
    from public.customers
    where phone = v_normalized_phone;

    if not found then
      insert into public.customers (
        full_name,
        phone,
        email,
        updated_at
      )
      values (
        btrim(p_full_name),
        v_normalized_phone,
        nullif(btrim(p_email), ''),
        now()
      )
      on conflict (phone) do nothing
      returning id
      into v_customer_id;

      if v_customer_id is null then
        select id
        into v_customer_id
        from public.customers
        where phone = v_normalized_phone;
      end if;
    end if;

    if v_customer_id is null then
      raise exception using
        errcode = 'P0001',
        message = 'CUSTOMER_CREATION_FAILED';
    end if;
  end if;

  insert into public.appointments (
    customer_id,
    barber_id,
    service_id,
    appointment_date,
    start_time,
    end_time,
    status,
    notes,
    updated_at
  )
  values (
    v_customer_id,
    p_barber_id,
    p_service_id,
    p_appointment_date,
    p_start_time,
    v_end_time,
    p_status,
    p_notes,
    now()
  )
  returning *
  into v_appointment;

  return v_appointment;
end;
$$;

create or replace function public.create_public_appointment_atomic(
  p_full_name text,
  p_phone text,
  p_email text,
  p_barber_id uuid,
  p_service_id uuid,
  p_appointment_date date,
  p_start_time time without time zone,
  p_status text default 'pending',
  p_notes text default null
)
returns public.appointments
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_customer_id uuid;
  v_normalized_phone text;
  v_duration_minutes bigint;
  v_buffer_minutes bigint;
  v_is_active boolean;
  v_end_time time without time zone;
  v_appointment public.appointments;
begin
  if p_status not in ('pending', 'confirmed') then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_INITIAL_STATUS';
  end if;

  if p_full_name is null or btrim(p_full_name) = '' then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_CUSTOMER_NAME';
  end if;

  v_normalized_phone := regexp_replace(
    coalesce(p_phone, ''),
    '[^0-9]',
    '',
    'g'
  );

  if char_length(v_normalized_phone) not between 7 and 20 then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_CUSTOMER_PHONE';
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(p_appointment_date::text, 0)
  );

  select
    duration_minutes,
    is_active
  into
    v_duration_minutes,
    v_is_active
  from public.services
  where id = p_service_id
  for share;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'SERVICE_NOT_FOUND';
  end if;

  if v_is_active is not true then
    raise exception using
      errcode = 'P0001',
      message = 'SERVICE_INACTIVE';
  end if;

  select coalesce(default_buffer_minutes, 15)
  into v_buffer_minutes
  from public.appointment_settings
  limit 1;

  v_buffer_minutes := coalesce(v_buffer_minutes, 15);

  v_end_time := (
    p_start_time
    + make_interval(
        mins => (v_duration_minutes + v_buffer_minutes)::integer
      )
  )::time;

  if v_end_time <= p_start_time then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_TIME_RANGE';
  end if;

  if exists (
    select 1
    from public.appointments existing
    where existing.appointment_date = p_appointment_date
      and existing.status in ('pending', 'confirmed')
      and existing.start_time < v_end_time
      and existing.end_time > p_start_time
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'APPOINTMENT_CONFLICT';
  end if;

  if p_status = 'confirmed' then
    select id
    into v_customer_id
    from public.customers
    where phone = v_normalized_phone;

    if not found then
      insert into public.customers (
        full_name,
        phone,
        email,
        updated_at
      )
      values (
        btrim(p_full_name),
        v_normalized_phone,
        nullif(btrim(p_email), ''),
        now()
      )
      on conflict (phone) do nothing
      returning id
      into v_customer_id;

      if v_customer_id is null then
        select id
        into v_customer_id
        from public.customers
        where phone = v_normalized_phone;
      end if;
    end if;

    if v_customer_id is null then
      raise exception using
        errcode = 'P0001',
        message = 'CUSTOMER_CREATION_FAILED';
    end if;
  end if;

  insert into public.appointments (
    customer_id,
    guest_full_name,
    guest_phone,
    guest_email,
    barber_id,
    service_id,
    appointment_date,
    start_time,
    end_time,
    status,
    notes,
    updated_at
  )
  values (
    case when p_status = 'confirmed' then v_customer_id else null end,
    case when p_status = 'pending' then btrim(p_full_name) else null end,
    case when p_status = 'pending' then v_normalized_phone else null end,
    case when p_status = 'pending' then nullif(btrim(p_email), '') else null end,
    p_barber_id,
    p_service_id,
    p_appointment_date,
    p_start_time,
    v_end_time,
    p_status,
    p_notes,
    now()
  )
  returning *
  into v_appointment;

  return v_appointment;
end;
$$;

create or replace function public.update_appointment_atomic(
  p_appointment_id uuid,
  p_service_id uuid,
  p_appointment_date date,
  p_start_time time without time zone,
  p_notes text
)
returns public.appointments
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_current public.appointments;
  v_duration_minutes bigint;
  v_buffer_minutes bigint;
  v_is_active boolean;
  v_end_time time without time zone;
  v_updated public.appointments;
  v_first_date date;
  v_second_date date;
  v_schedule_changed boolean;
begin
  select *
  into v_current
  from public.appointments
  where id = p_appointment_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'APPOINTMENT_NOT_FOUND';
  end if;

  if v_current.status in ('completed', 'cancelled', 'no_show') then
    raise exception using
      errcode = 'P0001',
      message = 'FINAL_APPOINTMENT_NOT_EDITABLE';
  end if;

  v_schedule_changed :=
    p_service_id <> v_current.service_id
    or p_appointment_date <> v_current.appointment_date
    or p_start_time <> v_current.start_time;

  v_first_date := least(
    v_current.appointment_date,
    p_appointment_date
  );

  v_second_date := greatest(
    v_current.appointment_date,
    p_appointment_date
  );

  perform pg_advisory_xact_lock(
    hashtextextended(v_first_date::text, 0)
  );

  if v_second_date <> v_first_date then
    perform pg_advisory_xact_lock(
      hashtextextended(v_second_date::text, 0)
    );
  end if;

  select
    duration_minutes,
    is_active
  into
    v_duration_minutes,
    v_is_active
  from public.services
  where id = p_service_id
  for share;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'SERVICE_NOT_FOUND';
  end if;

  if v_schedule_changed and v_is_active is not true then
    raise exception using
      errcode = 'P0001',
      message = 'SERVICE_INACTIVE';
  end if;

  select coalesce(default_buffer_minutes, 15)
  into v_buffer_minutes
  from public.appointment_settings
  limit 1;

  v_buffer_minutes := coalesce(v_buffer_minutes, 15);

  v_end_time := (
    p_start_time
    + make_interval(
        mins => (v_duration_minutes + v_buffer_minutes)::integer
      )
  )::time;

  if v_end_time <= p_start_time then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_TIME_RANGE';
  end if;

  if v_schedule_changed and exists (
    select 1
    from public.appointments existing
    where existing.id <> p_appointment_id
      and existing.appointment_date = p_appointment_date
      and existing.status in ('pending', 'confirmed')
      and existing.start_time < v_end_time
      and existing.end_time > p_start_time
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'APPOINTMENT_CONFLICT';
  end if;

  update public.appointments
  set
    service_id = p_service_id,
    appointment_date = p_appointment_date,
    start_time = p_start_time,
    end_time = v_end_time,
    notes = p_notes,
    updated_at = now()
  where id = p_appointment_id
  returning *
  into v_updated;

  return v_updated;
end;
$$;

revoke all on function public.create_public_appointment_atomic(
  text,
  text,
  text,
  uuid,
  uuid,
  date,
  time without time zone,
  text,
  text
) from public, anon, authenticated;

grant execute on function public.create_public_appointment_atomic(
  text,
  text,
  text,
  uuid,
  uuid,
  date,
  time without time zone,
  text,
  text
) to service_role;

revoke all on function public.create_appointment_atomic(
  uuid,
  uuid,
  uuid,
  date,
  time without time zone,
  text,
  text
) from public, anon, authenticated;

grant execute on function public.create_appointment_atomic(
  uuid,
  uuid,
  uuid,
  date,
  time without time zone,
  text,
  text
) to service_role;

revoke all on function public.create_appointment_with_customer_atomic(
  uuid,
  text,
  text,
  text,
  uuid,
  uuid,
  date,
  time without time zone,
  text,
  text
) from public, anon, authenticated;

grant execute on function public.create_appointment_with_customer_atomic(
  uuid,
  text,
  text,
  text,
  uuid,
  uuid,
  date,
  time without time zone,
  text,
  text
) to service_role;

revoke all on function public.update_appointment_atomic(
  uuid,
  uuid,
  date,
  time without time zone,
  text
) from public, anon, authenticated;

grant execute on function public.update_appointment_atomic(
  uuid,
  uuid,
  date,
  time without time zone,
  text
) to service_role;
