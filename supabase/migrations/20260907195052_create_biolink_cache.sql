/*
# Create biolink_api_cache table for caching Monarch API responses

1. New Tables
- `biolink_api_cache`: Stores cached responses from the Monarch Initiative API
  - `cache_key` (text, primary key): Deterministic key (e.g. "search:ALS", "entity:MONDO:0007253", "neighborhood:MONDO:0007253:1")
  - `response_body` (jsonb): The full JSON response from the API
  - `created_at` (timestamptz): When the cache entry was written
  - `expires_at` (timestamptz): When the cache entry becomes stale (24 hours from creation)

2. Security
- Enable RLS on biolink_api_cache.
- Allow anon + authenticated full CRUD — this is a shared public cache, no sensitive data.
  All cached data comes from the public Monarch Initiative API and is intentionally shared across users.

3. Notes
- The edge function uses the service role key to read/write cache, bypassing RLS.
- This table acts as a durable cross-instance cache since edge function instances don't share memory.
- Cache entries auto-expire after 24 hours; the edge function checks expires_at before returning cached data.
*/

CREATE TABLE IF NOT EXISTS biolink_api_cache (
  cache_key text PRIMARY KEY,
  response_body jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '24 hours'
);

ALTER TABLE biolink_api_cache ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_read_cache" ON biolink_api_cache;
CREATE POLICY "anon_read_cache"
ON biolink_api_cache FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_write_cache" ON biolink_api_cache;
CREATE POLICY "anon_write_cache"
ON biolink_api_cache FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cache" ON biolink_api_cache;
CREATE POLICY "anon_update_cache"
ON biolink_api_cache FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cache" ON biolink_api_cache;
CREATE POLICY "anon_delete_cache"
ON biolink_api_cache FOR DELETE
TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_biolink_cache_expires ON biolink_api_cache (expires_at);
