/*
# Create core tables for WandrAI travel platform

## Summary
Creates the data layer for a multi-user AI trip planner. The app has a sign-in/sign-up
screen, so all tables are owner-scoped with auth.uid() and RLS policies.

## New Tables

1. **trips** — Stores user-planned trips
   - id (uuid PK)
   - user_id (uuid, defaults to auth.uid(), FK to auth.users)
   - destination_id (text)
   - destination_name (text)
   - country (text)
   - start_date (date)
   - end_date (date)
   - budget (numeric)
   - currency (text)
   - status (text: upcoming, completed, planning)
   - travelers (int)
   - cover_image (text)
   - itinerary (jsonb, nullable — stores the full generated itinerary)
   - created_at (timestamptz)

2. **saved_destinations** — Stores user's favorited destinations
   - id (uuid PK)
   - user_id (uuid, defaults to auth.uid(), FK to auth.users)
   - destination_id (text)
   - created_at (timestamptz)

3. **safety_alerts** — Stores safety alerts (shared, read-only for all authenticated users)
   - id (uuid PK)
   - country (text)
   - type (text: weather, natural-disaster, political, health)
   - severity (text: low, moderate, high, extreme)
   - title (text)
   - message (text)
   - created_at (timestamptz)

## Security
- RLS enabled on all tables.
- trips + saved_destinations: owner-scoped CRUD (auth.uid() = user_id).
- safety_alerts: read-only for authenticated users (shared data, inserts not needed from frontend).
*/

-- 1. trips table
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id text NOT NULL,
  destination_name text NOT NULL,
  country text NOT NULL,
  start_date date,
  end_date date,
  budget numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  status text DEFAULT 'planning',
  travelers int DEFAULT 1,
  cover_image text,
  itinerary jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_trips" ON trips;
CREATE POLICY "select_own_trips" ON trips FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_trips" ON trips;
CREATE POLICY "insert_own_trips" ON trips FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_trips" ON trips;
CREATE POLICY "update_own_trips" ON trips FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_trips" ON trips;
CREATE POLICY "delete_own_trips" ON trips FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- 2. saved_destinations table
CREATE TABLE IF NOT EXISTS saved_destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  destination_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, destination_id)
);

ALTER TABLE saved_destinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_saved_destinations" ON saved_destinations;
CREATE POLICY "select_own_saved_destinations" ON saved_destinations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_saved_destinations" ON saved_destinations;
CREATE POLICY "insert_own_saved_destinations" ON saved_destinations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_saved_destinations" ON saved_destinations;
CREATE POLICY "delete_own_saved_destinations" ON saved_destinations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- 3. safety_alerts table (shared, read-only)
CREATE TABLE IF NOT EXISTS safety_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country text NOT NULL,
  type text NOT NULL,
  severity text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE safety_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_safety_alerts" ON safety_alerts;
CREATE POLICY "select_safety_alerts" ON safety_alerts FOR SELECT
  TO authenticated USING (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_saved_destinations_user_id ON saved_destinations(user_id);
CREATE INDEX IF NOT EXISTS idx_safety_alerts_country ON safety_alerts(country);
