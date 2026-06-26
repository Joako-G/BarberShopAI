alter table public.appointments
  alter column customer_id set not null,
  alter column service_id set not null,
  alter column appointment_date set not null,
  alter column start_time set not null,
  alter column end_time set not null,
  alter column status set not null,
  alter column status set default 'pending',
  alter column updated_at set default now();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_status_check'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_status_check
      check (
        status in (
          'pending',
          'confirmed',
          'completed',
          'cancelled',
          'no_show'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_time_range_check'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_time_range_check
      check (end_time > start_time);
  end if;
end
$$;

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
    coalesce(buffer_minutes, 0),
    is_active
  into
    v_duration_minutes,
    v_buffer_minutes,
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
    coalesce(buffer_minutes, 0),
    is_active
  into
    v_duration_minutes,
    v_buffer_minutes,
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
