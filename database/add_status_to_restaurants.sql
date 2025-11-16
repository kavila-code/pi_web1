-- Add a status column to restaurants to track application lifecycle
-- Values: 'pending' | 'active' | 'rejected' | 'inactive'
ALTER TABLE restaurants
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

-- Backfill existing rows based on is_active flag
UPDATE restaurants SET status = 'active' WHERE is_active = true;
UPDATE restaurants SET status = 'pending' WHERE is_active = false AND status NOT IN ('rejected','inactive');

-- Optional: simple index to filter by status quickly
CREATE INDEX IF NOT EXISTS idx_restaurants_status ON restaurants(status);
