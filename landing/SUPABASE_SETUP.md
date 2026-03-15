# Nastavení Supabase pro přihlášení

## Co od tebe potřebuju

### 1. Supabase projekt
- Vytvoř projekt na [supabase.com](https://supabase.com)
- V **Settings → API** zkopíruj:
  - **Project URL** → `PUBLIC_SUPABASE_URL`
  - **anon public** klíč → `PUBLIC_SUPABASE_ANON_KEY`

### 2. Proměnné prostředí (`.env` nebo Vercel)
```
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJ...
PUBLIC_APP_URL=https://tvoje-flask-app.cz   # URL Flask aplikace (kde má uživatel jít po přihlášení)
```

### 3. Authentication v Supabase
- **Authentication → Providers**:
  - **Email**: zapni „Enable Email Signup“
  - **Google**: zapni a nastav Client ID + Secret z Google Cloud Console

### 4. Google OAuth (pro přihlášení přes Gmail)
- Jdi do [Google Cloud Console](https://console.cloud.google.com)
- Vytvoř projekt (nebo použij existující)
- **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
- Typ: Web application
- Authorized redirect URIs: `https://tvoje-domena.supabase.co/auth/v1/callback` (zkontroluj v Supabase → Auth → URL Configuration)
- Zkopíruj Client ID a Client Secret do Supabase → Auth → Google

### 5. Tabulka pro zakoupené přístupy
V Supabase SQL Editor spusť:

```sql
CREATE TABLE pvcheck_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- RLS: uživatel vidí jen svůj záznam
ALTER TABLE pvcheck_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own purchase"
  ON pvcheck_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Service role může vkládat (pro Stripe webhook)
CREATE POLICY "Service can insert"
  ON pvcheck_purchases FOR INSERT
  WITH CHECK (true);
```

### 6. Redirect URL v Supabase
- **Authentication → URL Configuration**
- **Bez domény (lokální vývoj):**
  - Site URL: `http://localhost:4321`
  - Redirect URLs: přidej `http://localhost:4321/auth/callback`
- **S doménou (produkce):**
  - Site URL: `https://tvoje-landing.cz`
  - Redirect URLs: přidej `https://tvoje-landing.cz/auth/callback`

### 7. Stripe webhook → Supabase
Až budeš mít Stripe webhook, po úspěšné platbě vlož záznam do `pvcheck_purchases`:

```sql
INSERT INTO pvcheck_purchases (user_id, stripe_session_id)
VALUES ('uuid-zakaznika', 'stripe_session_id')
ON CONFLICT (user_id) DO NOTHING;
```

User ID získáš z Stripe metadata (pokud tam ukládáš email) nebo z vlastního systému propojení platby s emailem.
