-- Tabulka pvcheck_purchases – kdo má zakoupený přístup
-- Spusť v Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS pvcheck_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS: uživatel vidí jen svůj záznam
ALTER TABLE pvcheck_purchases ENABLE ROW LEVEL SECURITY;

-- Uživatel může číst jen svůj záznam
DROP POLICY IF EXISTS "Users can read own purchase" ON pvcheck_purchases;
CREATE POLICY "Users can read own purchase"
  ON pvcheck_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Service role může vkládat (pro Stripe webhook)
DROP POLICY IF EXISTS "Service can insert" ON pvcheck_purchases;
CREATE POLICY "Service can insert"
  ON pvcheck_purchases FOR INSERT
  WITH CHECK (true);

-- Index pro rychlé vyhledávání
CREATE INDEX IF NOT EXISTS idx_pvcheck_purchases_user_id ON pvcheck_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_pvcheck_purchases_email ON pvcheck_purchases(email);
