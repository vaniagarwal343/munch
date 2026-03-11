-- Users who take the quiz
create table users (
  id uuid default gen_random_uuid() primary key,
  nickname text not null,
  avatar_color text not null,
  dietary text[] default '{}',
  created_at timestamp with time zone default now()
);

-- When a user picks a restaurant
create table check_ins (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  restaurant_id text not null,
  nickname text not null,
  avatar_color text not null,
  dietary text[] default '{}',
  created_at timestamp with time zone default now()
);

-- Enable realtime on check_ins
alter publication supabase_realtime add table check_ins;

-- Allow anonymous inserts and reads (for the demo)
create policy "Anyone can insert" on users for insert with check (true);
create policy "Anyone can read" on users for select using (true);
create policy "Anyone can insert" on check_ins for insert with check (true);
create policy "Anyone can read" on check_ins for select using (true);
