-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed authentication user (idempotent)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'vitorvargas@vvconsulting.com.br') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'vitorvargas@vvconsulting.com.br',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Vitor Vargas"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL,
      '', '', ''
    );
  END IF;
END $$;

DO $$
DECLARE
  kit1_id uuid := '11111111-1111-1111-1111-111111111111'::uuid;
  kit2_id uuid := '22222222-2222-2222-2222-222222222222'::uuid;
BEGIN
  -- Seed Initial First Aid Kits Data (idempotent via known UUIDs)
  IF NOT EXISTS (SELECT 1 FROM public.first_aid_kits WHERE id = kit1_id) THEN
    INSERT INTO public.first_aid_kits (id, name, location, status) VALUES
    (kit1_id, 'Kit Trauma Alpha', 'Ponte de Comando', 'Ativo');

    INSERT INTO public.first_aid_kit_items (kit_id, name, quantity, lot_number, expiration_date) VALUES
    (kit1_id, 'Atadura de Crepom 10cm', 5, 'L-1029', NOW() + INTERVAL '180 days'),
    (kit1_id, 'Gaze Estéril (Pacote)', 10, 'L-9921', NOW() + INTERVAL '300 days'),
    (kit1_id, 'Soro Fisiológico 0.9%', 2, 'L-4412', NOW() - INTERVAL '10 days'); -- Vencido para teste UI
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.first_aid_kits WHERE id = kit2_id) THEN
    INSERT INTO public.first_aid_kits (id, name, location, status) VALUES
    (kit2_id, 'Kit Queimaduras', 'Cozinha', 'Ativo');

    INSERT INTO public.first_aid_kit_items (kit_id, name, quantity, lot_number, expiration_date) VALUES
    (kit2_id, 'Pomada para Queimadura', 3, 'L-8822', NOW() + INTERVAL '20 days'), -- Atenção para teste UI
    (kit2_id, 'Atadura de Rayon', 4, 'L-1123', NOW() + INTERVAL '400 days');
  END IF;
END $$;
