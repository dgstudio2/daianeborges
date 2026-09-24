-- ============================================================
-- DAIANE GOMES STUDIO — Setup Completo
-- Cole este script inteiro no Supabase Dashboard
-- SQL Editor → New Query → Cole → Run
-- ============================================================

-- 1. Extensão de criptografia (necessária para criar o usuário)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 2. TABELAS
-- ============================================================

CREATE TABLE IF NOT EXISTS services (
  id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  title       TEXT    NOT NULL DEFAULT '',
  subtitle    TEXT,
  description TEXT    NOT NULL DEFAULT '',
  duration    TEXT    NOT NULL DEFAULT '',
  price       TEXT    NOT NULL DEFAULT '',
  old_price   TEXT,
  image_url   TEXT,
  featured    BOOLEAN DEFAULT false,
  sort_order  INT     DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opening_hours (
  id         UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  day        TEXT    NOT NULL DEFAULT '',
  hours      TEXT    NOT NULL DEFAULT '',
  muted      BOOLEAN DEFAULT false,
  sort_order INT     DEFAULT 0
);

CREATE TABLE IF NOT EXISTS site_settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- ============================================================
-- 3. SEGURANÇA (RLS)
-- ============================================================

ALTER TABLE services       ENABLE ROW LEVEL SECURITY;
ALTER TABLE opening_hours  ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings  ENABLE ROW LEVEL SECURITY;

-- Remove políticas antigas para evitar conflito
DROP POLICY IF EXISTS "public_read_services"  ON services;
DROP POLICY IF EXISTS "public_read_hours"     ON opening_hours;
DROP POLICY IF EXISTS "public_read_settings"  ON site_settings;
DROP POLICY IF EXISTS "auth_all_services"     ON services;
DROP POLICY IF EXISTS "auth_all_hours"        ON opening_hours;
DROP POLICY IF EXISTS "auth_all_settings"     ON site_settings;

-- Leitura pública
CREATE POLICY "public_read_services"  ON services       FOR SELECT TO anon        USING (true);
CREATE POLICY "public_read_hours"     ON opening_hours  FOR SELECT TO anon        USING (true);
CREATE POLICY "public_read_settings"  ON site_settings  FOR SELECT TO anon        USING (true);

-- Escrita somente para o admin logado
CREATE POLICY "auth_all_services"  ON services      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_hours"     ON opening_hours FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all_settings"  ON site_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- 4. DADOS PADRÃO
-- ============================================================

-- Serviços
INSERT INTO services (title, subtitle, description, duration, price, old_price, image_url, featured, sort_order)
VALUES
  ('Microblading fio a fio', NULL,
   'Micropigmentação de sobrancelhas com efeito fio a fio natural e realista.',
   '~1h', 'R$ 380', NULL,
   'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=600&auto=format&fit=crop',
   false, 0),
  ('Micropigmentação labial', NULL,
   'Realce de cor, contorno e beleza natural dos lábios com resultado duradouro.',
   '~2h – 2h30', 'R$ 400', NULL,
   'https://images.unsplash.com/photo-1588514981143-6c845b59740a?q=80&w=600&auto=format&fit=crop',
   false, 1),
  ('Combo Especial', 'Microblading + Labial',
   'Os dois procedimentos em um único pacote. Economia de R$ 130,00 em relação ao valor separado.',
   'até 3h30', 'R$ 650', 'R$ 780',
   'https://images.unsplash.com/photo-1512496015851-a1dc8a474665?q=80&w=600&auto=format&fit=crop',
   true, 2),
  ('Limpeza de pele', NULL,
   'Limpeza facial profunda para uma pele saudável, purificada e iluminada.',
   '~1h', 'R$ 200', NULL,
   'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop',
   false, 3)
ON CONFLICT DO NOTHING;

-- Horários
INSERT INTO opening_hours (day, hours, muted, sort_order)
VALUES
  ('Segunda a Sexta', '08h às 10h | 17h30 em diante', false, 0),
  ('Intervalo (Seg–Sex)', '13h–17h (reservado)', true, 1),
  ('Sábado', '07h às 15h30', false, 2),
  ('Domingo', 'Fechado', true, 3)
ON CONFLICT DO NOTHING;

-- Configurações gerais
INSERT INTO site_settings (key, value)
VALUES
  ('hero_title',       'A harmonia e a elegância de traços desenhados para você.'),
  ('hero_subtitle',    'Realçamos sua beleza autêntica através da micropigmentação e estética facial de alto padrão, com resultados naturais e sofisticados.'),
  ('hero_image_url',   ''),
  ('whatsapp_number',  '5566984165461'),
  ('whatsapp_label',   '(66) 98416-5461'),
  ('instagram_handle', '@daianegomesstudio'),
  ('instagram_url',    'https://instagram.com/daianegomesstudio'),
  ('footer_tagline',   'Micropigmentação e estética facial de alto padrão com exclusividade e sofisticação.')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 5. STORAGE — bucket de imagens
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_media"  ON storage.objects;
DROP POLICY IF EXISTS "auth_insert_media"  ON storage.objects;
DROP POLICY IF EXISTS "auth_update_media"  ON storage.objects;
DROP POLICY IF EXISTS "auth_delete_media"  ON storage.objects;

CREATE POLICY "public_read_media"  ON storage.objects FOR SELECT           USING  (bucket_id = 'media');
CREATE POLICY "auth_insert_media"  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media');
CREATE POLICY "auth_update_media"  ON storage.objects FOR UPDATE TO authenticated USING  (bucket_id = 'media');
CREATE POLICY "auth_delete_media"  ON storage.objects FOR DELETE TO authenticated USING  (bucket_id = 'media');

-- ============================================================
-- 6. USUÁRIO ADMIN
--    E-mail : daiane@daianegomesstudio.com
--    Senha  : Studio@2026
-- ============================================================

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Verifica se o usuário já existe
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'daiane@daianegomesstudio.com';

  IF v_user_id IS NULL THEN
    -- Cria o usuário do zero
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role,
      email, encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at, updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'daiane@daianegomesstudio.com',
      crypt('Studio@2026', gen_salt('bf')),
      NOW(), NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(), NOW(),
      '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id,
      identity_data,
      provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      'daiane@daianegomesstudio.com',
      format('{"sub":"%s","email":"%s"}',
             v_user_id::text,
             'daiane@daianegomesstudio.com')::jsonb,
      'email',
      NOW(), NOW(), NOW()
    );

    RAISE NOTICE 'Usuário admin criado com sucesso!';
  ELSE
    -- Atualiza a senha se o usuário já existia
    UPDATE auth.users
    SET encrypted_password = crypt('Studio@2026', gen_salt('bf')),
        updated_at = NOW()
    WHERE id = v_user_id;

    RAISE NOTICE 'Senha do usuário admin atualizada para Studio@2026';
  END IF;
END;
$$;

-- ============================================================
-- Pronto! Acesse /admin e entre com:
--   E-mail : daiane@daianegomesstudio.com  (pré-preenchido)
--   Senha  : Studio@2026
-- ============================================================
