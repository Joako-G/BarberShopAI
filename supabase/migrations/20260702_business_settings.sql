create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  system_name text not null,
  business_name text not null,
  business_type text,
  description text,
  phone text,
  whatsapp text,
  email text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_settings_system_name_length_check check (char_length(system_name) between 2 and 60),
  constraint business_settings_business_name_length_check check (char_length(business_name) between 2 and 80),
  constraint business_settings_business_type_length_check check (business_type is null or char_length(business_type) <= 60),
  constraint business_settings_description_length_check check (description is null or char_length(description) <= 300),
  constraint business_settings_phone_length_check check (phone is null or char_length(phone) <= 30),
  constraint business_settings_whatsapp_length_check check (whatsapp is null or char_length(whatsapp) <= 30),
  constraint business_settings_email_format_check check (email is null or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  constraint business_settings_address_length_check check (address is null or char_length(address) <= 150)
);

create unique index if not exists business_settings_singleton_idx
on public.business_settings ((true));

alter table public.business_settings enable row level security;

revoke all on table public.business_settings from anon;
revoke all on table public.business_settings from authenticated;
grant all on table public.business_settings to service_role;

insert into public.business_settings (
  system_name,
  business_name,
  business_type,
  description,
  phone,
  whatsapp,
  email,
  address
)
select
  'Sistema de Turnos',
  'Mi Negocio',
  'Barbería',
  'Sistema para gestionar turnos, clientes y servicios.',
  null,
  null,
  null,
  null
where not exists (
  select 1 from public.business_settings
);

comment on table public.business_settings is 'Configuración general del sistema y negocio para el panel admin.';

