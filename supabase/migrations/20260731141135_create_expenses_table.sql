/*
# Create expenses table for Smart Expense Tracker

## Summary
Creates the expenses table for the Smart Expense Tracker feature. The app has
existing sign-in/sign-up screens, so this table is owner-scoped with auth.uid()
and RLS policies matching the existing trips table pattern.

## New Table

**expenses** — Stores user travel expenses
- id (uuid PK)
- user_id (uuid, defaults to auth.uid(), FK to auth.users ON DELETE CASCADE)
- category (text: flights, hotels, food, transport, shopping, activities, other)
- description (text, not null)
- amount (numeric, not null)
- currency (text, default 'USD')
- date (date, not null)
- created_at (timestamptz, default now())

## Security
- RLS enabled on expenses.
- Owner-scoped CRUD (auth.uid() = user_id), 4 separate policies.
- Index on user_id and date for performance.
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'other',
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_expenses" ON expenses;
CREATE POLICY "select_own_expenses" ON expenses FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_expenses" ON expenses;
CREATE POLICY "insert_own_expenses" ON expenses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_expenses" ON expenses;
CREATE POLICY "update_own_expenses" ON expenses FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_expenses" ON expenses;
CREATE POLICY "delete_own_expenses" ON expenses FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
