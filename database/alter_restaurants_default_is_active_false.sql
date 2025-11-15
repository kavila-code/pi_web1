-- Set default of restaurants.is_active to false for manual approval
ALTER TABLE restaurants
  ALTER COLUMN is_active SET DEFAULT FALSE;