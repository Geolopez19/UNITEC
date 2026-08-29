-- ==============================================================================
-- 1. TABLA: Perfiles de Usuario / Emprendimiento (Vinculado a auth.users)
-- ==============================================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  business_name text,
  current_level smallint default 1 check (current_level between 1 and 4),
  plan_type text default 'free' check (plan_type in ('free', 'pro_plus')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 2. TABLA: Diagnóstico Inicial de Madurez Digital (10 Preguntas)
-- ==============================================================================
create table public.diagnostic_responses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  answers jsonb not null,
  total_score numeric not null default 0,
  assigned_level smallint not null check (assigned_level between 1 and 4),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 3. TABLA: Módulo de Inventario y Control de Stock
-- ==============================================================================
create table public.inventory_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  sku text,
  name text not null,
  stock_quantity numeric default 0 not null,
  min_alert_stock numeric default 5 not null,
  cost_price numeric default 0 not null,
  sale_price numeric default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Historial de movimientos de inventario
create table public.inventory_movements (
  id uuid default gen_random_uuid() primary key,
  item_id uuid references public.inventory_items(id) on delete cascade not null,
  type text check (type in ('in', 'out', 'adjustment')) not null,
  quantity numeric not null,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 4. TABLA: Módulo de Facturación Simple
-- ==============================================================================
create table public.invoices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  invoice_number serial,
  client_name text not null,
  client_id_number text,
  subtotal numeric default 0 not null,
  tax_amount numeric default 0 not null,
  total_amount numeric default 0 not null,
  status text default 'issued' check (status in ('draft', 'issued', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.invoice_items (
  id uuid default gen_random_uuid() primary key,
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  item_id uuid references public.inventory_items(id) on delete set null,
  description text not null,
  quantity numeric default 1 not null,
  unit_price numeric default 0 not null,
  total_price numeric default 0 not null
);

-- ==============================================================================
-- 5. TABLA: Módulo de Recursos Humanos / Colaboradores
-- ==============================================================================
create table public.employees (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references public.profiles(id) on delete cascade not null,
  full_name text not null,
  position text not null,
  salary numeric default 0,
  hire_date date default current_date not null,
  status text default 'active' check (status in ('active', 'vacation', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.employee_requests (
  id uuid default gen_random_uuid() primary key,
  employee_id uuid references public.employees(id) on delete cascade not null,
  request_type text check (request_type in ('vacation', 'leave', 'advance')) not null,
  start_date date not null,
  end_date date,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 6. TABLA: Módulo de Impuestos y Fechas Clave
-- ==============================================================================
create table public.tax_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  period_month smallint not null check (period_month between 1 and 12),
  period_year smallint not null,
  total_sales numeric default 0 not null,
  estimated_tax numeric default 0 not null,
  due_date date not null,
  status text default 'pending' check (status in ('pending', 'paid')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 7. TABLA: Módulo de Capacitación Lean & Microlecciones
-- ==============================================================================
create table public.lean_lessons (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  duration_minutes smallint not null,
  video_url text not null,
  level_required smallint default 1,
  category_rubro text default 'general',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.lean_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id uuid references public.lean_lessons(id) on delete cascade not null,
  completed boolean default false,
  completed_at timestamp with time zone,
  unique (user_id, lesson_id)
);

-- ==============================================================================
-- 8. TABLA: Módulo de Mentorías (Plan Pro+)
-- ==============================================================================
create table public.mentorship_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mentor_name text not null,
  scheduled_at timestamp with time zone not null,
  notes text,
  status text default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 9. SEGURIDAD: Habilitar Row Level Security (RLS) en todas las tablas
-- ==============================================================================
alter table public.profiles enable row level security;
alter table public.diagnostic_responses enable row level security;
alter table public.inventory_items enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.employees enable row level security;
alter table public.employee_requests enable row level security;
alter table public.tax_records enable row level security;
alter table public.lean_lessons enable row level security;
alter table public.lean_progress enable row level security;
alter table public.mentorship_sessions enable row level security;

-- ==============================================================================
-- 10. POLÍTICAS RLS (Aislamiento por usuario autenticado)
-- ==============================================================================
create policy "Users manage own profile" on public.profiles for all using (auth.uid() = id);
create policy "Users manage own diagnostic" on public.diagnostic_responses for all using (auth.uid() = user_id);
create policy "Users manage own inventory" on public.inventory_items for all using (auth.uid() = user_id);
create policy "Users manage own inventory movements" on public.inventory_movements for all using (
  exists (select 1 from public.inventory_items i where i.id = inventory_movements.item_id and i.user_id = auth.uid())
);
create policy "Users manage own invoices" on public.invoices for all using (auth.uid() = user_id);
create policy "Users manage own invoice items" on public.invoice_items for all using (
  exists (select 1 from public.invoices inv where inv.id = invoice_items.invoice_id and inv.user_id = auth.uid())
);
create policy "Users manage own employees" on public.employees for all using (auth.uid() = business_id);
create policy "Users manage own employee requests" on public.employee_requests for all using (
  exists (select 1 from public.employees e where e.id = employee_requests.employee_id and e.business_id = auth.uid())
);
create policy "Users manage own tax records" on public.tax_records for all using (auth.uid() = user_id);
create policy "Users manage own lean progress" on public.lean_progress for all using (auth.uid() = user_id);
create policy "Users manage own mentorships" on public.mentorship_sessions for all using (auth.uid() = user_id);
create policy "Public read lean lessons" on public.lean_lessons for select using (true);

-- ==============================================================================
-- 11. TRIGGER: Creación automática de registro en profiles al registrarse
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, business_name, current_level, plan_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'business_name', 'Mi Emprendimiento'),
    1,
    'free'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();