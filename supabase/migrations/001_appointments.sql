-- Create appointments table
create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  property_type text not null, -- 'residential' | 'commercial'
  address text not null,
  city text,
  state text,
  zip text,
  bedrooms text,
  bathrooms text,
  office_size text,
  floors text,
  service_type text not null,
  frequency text not null,
  addons text[],
  preferred_date date not null,
  preferred_time text not null,
  alternate_date date,
  access_method text,
  pets text,
  product_preference text,
  notes text,
  status text default 'pending'
);

-- Enable RLS
alter table appointments enable row level security;

-- Policies
create policy "Anyone can insert appointments" 
  on appointments for insert 
  with check (true);

create policy "Authenticated admins can select appointments" 
  on appointments for select 
  using (auth.role() = 'authenticated');

create policy "Authenticated admins can update appointments" 
  on appointments for update 
  using (auth.role() = 'authenticated');
