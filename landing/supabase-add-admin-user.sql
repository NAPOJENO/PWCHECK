-- Přidání uživatele admin@napojeno.cz do pvcheck_purchases (přístup po přihlášení)
-- Spusť v Supabase Dashboard → SQL Editor

-- KROK 1: Nejdřív vytvoř uživatele v Supabase Auth:
-- Dashboard → Authentication → Users → Add user
-- Email: admin@napojeno.cz
-- Password: (nastav si heslo)
-- Klikni Save

-- KROK 2: Pak spusť tento SQL (přidá uživatele do pvcheck_purchases):
INSERT INTO pvcheck_purchases (user_id, email)
SELECT id, email
FROM auth.users
WHERE email = 'admin@napojeno.cz'
ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email;
