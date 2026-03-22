create table affiliate_links (
  id uuid primary key default gen_random_uuid(),
  keyword text not null,
  affiliate_url text not null,
  source text not null, -- e.g., "brave-search", "internal"
);

-- Enable row level security
alter table affiliate_links enable row level security;

-- Policy: allow any authenticated user to read
create policy "allow read for authenticated" on affiliate_links
  for select using (auth.role() = 'authenticated');

-- Optional: allow service role to insert/upsert
create policy "allow upsert for service" on affiliate_links
  for insert, update using (auth.role() = 'service_role');
