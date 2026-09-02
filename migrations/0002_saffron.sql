create table if not exists hidden_products (
  product_id text primary key
);

create table if not exists orders (
  id serial primary key,
  telegram_id text not null,
  client_name text not null,
  phone text not null,
  product_id text not null,
  product_name text not null,
  price integer not null,
  lead_days integer not null,
  pickup_date text not null,
  inscription text not null default '',
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists orders_telegram_id_idx on orders (telegram_id);
create index if not exists orders_status_idx on orders (status);
create index if not exists orders_pickup_idx on orders (pickup_date);
