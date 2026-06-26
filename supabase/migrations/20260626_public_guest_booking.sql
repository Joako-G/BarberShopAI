alter table public.appointments
  alter column customer_id drop not null;

alter table public.appointments
  add column if not exists guest_full_name text,
  add column if not exists guest_phone varchar,
  add column if not exists guest_email text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'appointments_customer_required_after_confirmation_check'
      and conrelid = 'public.appointments'::regclass
  ) then
    alter table public.appointments
      add constraint appointments_customer_required_after_confirmation_check
      check (
        status in ('pending', 'cancelled')
        or customer_id is not null
      );
  end if;
end
$$;

create or replace function public.create_public_appointment_atomic(
  p_full_name text,
  p_phone text,
  p_email text,
  p_barber_id uuid,
  p_service_id uuid,
  p_appointment_date date,
  p_start_time time without time zone,
  p_notes text default null
)
returns public.appointments
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_normalized_phone text;
  v_duration_minutes bigint;
  v_buffer_minutes bigint;
  v_is_active boolean;
  v_end_time time without time zone;
  v_appointment public.appointments;
begin
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
    null,
    btrim(p_full_name),
    v_normalized_phone,
    nullif(btrim(p_email), ''),
    p_barber_id,
    p_service_id,
    p_appointment_date,
    p_start_time,
    v_end_time,
    'pending',
    p_notes,
    now()
  )
  returning *
  into v_appointment;

  return v_appointment;
end;
$$;

create or replace function public.confirm_appointment_atomic(
  p_appointment_id uuid
)
returns public.appointments
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_current public.appointments;
  v_customer_id uuid;
  v_normalized_phone text;
  v_updated public.appointments;
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

  if v_current.status <> 'pending' then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_STATUS_TRANSITION',
      detail = format(
        'Cannot change appointment status from %s to confirmed',
        v_current.status
      );
  end if;

  if v_current.customer_id is not null then
    v_customer_id := v_current.customer_id;
  else
    if v_current.guest_full_name is null or btrim(v_current.guest_full_name) = '' then
      raise exception using
        errcode = 'P0001',
        message = 'INVALID_CUSTOMER_NAME';
    end if;

    v_normalized_phone := regexp_replace(
      coalesce(v_current.guest_phone, ''),
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
        btrim(v_current.guest_full_name),
        v_normalized_phone,
        nullif(btrim(v_current.guest_email), ''),
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

  update public.appointments
  set
    customer_id = v_customer_id,
    status = 'confirmed',
    updated_at = now()
  where id = p_appointment_id
  returning *
  into v_updated;

  return v_updated;
end;
$$;

create or replace function public.transition_appointment_status_atomic(
  p_appointment_id uuid,
  p_next_status text
)
returns public.appointments
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_current public.appointments;
  v_updated public.appointments;
  v_transition_allowed boolean;
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

  v_transition_allowed :=
    case v_current.status
      when 'pending' then
        p_next_status in ('cancelled')
      when 'confirmed' then
        p_next_status in ('cancelled', 'completed', 'no_show')
      else
        false
    end;

  if not v_transition_allowed then
    raise exception using
      errcode = 'P0001',
      message = 'INVALID_STATUS_TRANSITION',
      detail = format(
        'Cannot change appointment status from %s to %s',
        v_current.status,
        p_next_status
      );
  end if;

  update public.appointments
  set
    status = p_next_status,
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
  text
) to service_role;

revoke all on function public.confirm_appointment_atomic(
  uuid
) from public, anon, authenticated;

grant execute on function public.confirm_appointment_atomic(
  uuid
) to service_role;

revoke all on function public.transition_appointment_status_atomic(
  uuid,
  text
) from public, anon, authenticated;

grant execute on function public.transition_appointment_status_atomic(
  uuid,
  text
) to service_role;
