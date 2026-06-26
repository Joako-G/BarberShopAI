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
        p_next_status in ('confirmed', 'cancelled', 'completed')
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

revoke all on function public.transition_appointment_status_atomic(
  uuid,
  text
) from public, anon, authenticated;

grant execute on function public.transition_appointment_status_atomic(
  uuid,
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
