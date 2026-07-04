create table if not exists public.appearance_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true,
  theme_mode text not null default 'dark',
  primary_color text not null default '#75CFFF',
  secondary_color text not null default '#94A3B8',
  accent_color text not null default '#D4AF37',
  background_color text not null default '#07111F',
  text_color text not null default '#F8FAFC',
  border_radius int not null default 12,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint appearance_settings_singleton_unique unique (singleton),
  constraint appearance_settings_singleton_true check (singleton),
  constraint appearance_settings_theme_mode_check check (theme_mode in ('dark', 'light')),
  constraint appearance_settings_primary_color_check check (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint appearance_settings_secondary_color_check check (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint appearance_settings_accent_color_check check (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint appearance_settings_background_color_check check (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint appearance_settings_text_color_check check (text_color ~ '^#[0-9A-Fa-f]{6}$'),
  constraint appearance_settings_border_radius_check check (border_radius between 0 and 32)
);

alter table public.appearance_settings enable row level security;

insert into public.appearance_settings (
  singleton,
  theme_mode,
  primary_color,
  secondary_color,
  accent_color,
  background_color,
  text_color,
  border_radius
)
values (
  true,
  'dark',
  '#75CFFF',
  '#94A3B8',
  '#D4AF37',
  '#07111F',
  '#F8FAFC',
  12
)
on conflict (singleton) do nothing;
