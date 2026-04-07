DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.first_aid_kits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE public.first_aid_kits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_select_kits" ON public.first_aid_kits;
CREATE POLICY "authenticated_select_kits" ON public.first_aid_kits FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_kits" ON public.first_aid_kits;
CREATE POLICY "authenticated_insert_kits" ON public.first_aid_kits FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_kits" ON public.first_aid_kits;
CREATE POLICY "authenticated_update_kits" ON public.first_aid_kits FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.first_aid_kit_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id UUID REFERENCES public.first_aid_kits(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    quantity INT NOT NULL,
    expiration_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE public.first_aid_kit_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_select_items" ON public.first_aid_kit_items;
CREATE POLICY "authenticated_select_items" ON public.first_aid_kit_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_items" ON public.first_aid_kit_items;
CREATE POLICY "authenticated_insert_items" ON public.first_aid_kit_items FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_items" ON public.first_aid_kit_items;
CREATE POLICY "authenticated_update_items" ON public.first_aid_kit_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.kit_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id UUID REFERENCES public.first_aid_kits(id) ON DELETE CASCADE,
    inspector_name TEXT NOT NULL,
    status TEXT NOT NULL,
    notes TEXT,
    inspected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE public.kit_inspections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_select_inspections" ON public.kit_inspections;
CREATE POLICY "authenticated_select_inspections" ON public.kit_inspections FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_inspections" ON public.kit_inspections;
CREATE POLICY "authenticated_insert_inspections" ON public.kit_inspections FOR INSERT TO authenticated WITH CHECK (true);

DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.replenishment_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kit_id UUID REFERENCES public.first_aid_kits(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    quantity_needed INT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

ALTER TABLE public.replenishment_drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "authenticated_select_drafts" ON public.replenishment_drafts;
CREATE POLICY "authenticated_select_drafts" ON public.replenishment_drafts FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "authenticated_insert_drafts" ON public.replenishment_drafts;
CREATE POLICY "authenticated_insert_drafts" ON public.replenishment_drafts FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "authenticated_update_drafts" ON public.replenishment_drafts;
CREATE POLICY "authenticated_update_drafts" ON public.replenishment_drafts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
