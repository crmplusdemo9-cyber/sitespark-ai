-- ═══════════════════════════════════════════════════════
-- SiteSpark AI — Admin Schema Extension
-- Run this AFTER schema.sql in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- Add role column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('user', 'admin', 'moderator'));

-- Add moderation fields to sites
ALTER TABLE public.sites
  ADD COLUMN IF NOT EXISTS flagged BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS flag_reason TEXT,
  ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- ─── Admin Audit Log ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES public.profiles(id) NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL, -- 'user', 'site', 'domain', 'setting'
  entity_id TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_admin ON public.admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.admin_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.admin_audit_log(entity_type, entity_id);

-- ─── Feature Flags ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Default feature flags
INSERT INTO public.feature_flags (id, name, description, enabled) VALUES
  ('ai_generation', 'AI Content Generation', 'Enable OpenAI GPT-4o-mini content generation', true),
  ('domain_purchase', 'Domain Purchase', 'Enable one-click Porkbun domain registration', true),
  ('custom_css', 'Custom CSS Editor', 'Allow users to add custom CSS to sites', false),
  ('referral_program', 'Referral Program', 'Enable share-for-free-pro referral system', false),
  ('analytics_dashboard', 'Analytics Dashboard', 'Show analytics tab for pro users', true),
  ('image_generation', 'AI Image Generation', 'Enable DALL-E 3 image generation', false),
  ('3d_editor', '3D Block Editor', 'Enable Three.js 3D block drag editor', false),
  ('persona_simulator', 'Persona Simulator', 'Enable CEO/GenZ heatmap simulator', false)
ON CONFLICT (id) DO NOTHING;

-- ─── System Notifications ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'error', 'success', 'approval')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  action_label TEXT,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON public.admin_notifications(read, created_at DESC)
  WHERE read = FALSE;

-- ─── Domain Approval Queue ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.domain_approvals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  domain TEXT NOT NULL,
  site_id UUID REFERENCES public.sites(id),
  user_id UUID REFERENCES public.profiles(id),
  cost_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_domain_approvals_pending
  ON public.domain_approvals(status, created_at)
  WHERE status = 'pending';

-- ─── Admin RLS Policies ───────────────────────────────────────

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_approvals ENABLE ROW LEVEL SECURITY;

-- Admins can see everything
CREATE POLICY "Admins can manage audit log"
  ON public.admin_audit_log FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage feature flags"
  ON public.feature_flags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can manage notifications"
  ON public.admin_notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Admins can manage domain approvals"
  ON public.domain_approvals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Admin-level access to all profiles (read)
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles AS p
      WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'moderator')
    )
  );

-- Admin-level access to all sites
CREATE POLICY "Admins can manage all sites"
  ON public.sites FOR ALL
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Admin-level access to all domains
CREATE POLICY "Admins can manage all domains"
  ON public.domains FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Admin-level access to waitlist
CREATE POLICY "Admins can view waitlist"
  ON public.waitlist FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- Admin-level view access to all site_views
CREATE POLICY "Admins can view all site views"
  ON public.site_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'moderator')
    )
  );

-- ═══════════════════════════════════════════════════════
-- Helper function to make a user admin
-- Usage: SELECT make_admin('user@email.com');
-- ═══════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.make_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles SET role = 'admin' WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
