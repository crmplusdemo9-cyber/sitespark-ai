-- ═══════════════════════════════════════════════════════
-- SiteSpark AI — Database Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users Profile (extends Supabase Auth) ─────────────
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  sites_count INTEGER NOT NULL DEFAULT 0,
  referral_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(4), 'hex'),
  referred_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Sites ─────────────────────────────────────────────
CREATE TABLE public.sites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  niche TEXT NOT NULL DEFAULT '',
  template_id TEXT NOT NULL DEFAULT 'modern-starter',
  content JSONB NOT NULL DEFAULT '{}',
  custom_domain TEXT UNIQUE,
  domain_status TEXT NOT NULL DEFAULT 'none' CHECK (
    domain_status IN ('none', 'pending', 'active', 'error')
  ),
  published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Domain Records ───────────────────────────────────
CREATE TABLE public.domains (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  registrar TEXT NOT NULL DEFAULT 'porkbun' CHECK (
    registrar IN ('porkbun', 'namecheap', 'external')
  ),
  status TEXT NOT NULL DEFAULT 'checking' CHECK (
    status IN ('checking', 'available', 'registered', 'dns_pending', 'active', 'error')
  ),
  auto_renew BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  cost_cents INTEGER,
  dns_records JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Analytics ─────────────────────────────────────────
CREATE TABLE public.site_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE NOT NULL,
  visitor_id TEXT, -- anonymous fingerprint
  referrer TEXT,
  country TEXT,
  device TEXT CHECK (device IN ('desktop', 'mobile', 'tablet')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Waitlist (pre-launch) ─────────────────────────────
CREATE TABLE public.waitlist (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- Indexes for Performance
-- ═══════════════════════════════════════════════════════

CREATE INDEX idx_sites_user_id ON public.sites(user_id);
CREATE INDEX idx_sites_slug ON public.sites(slug);
CREATE INDEX idx_sites_custom_domain ON public.sites(custom_domain);
CREATE INDEX idx_sites_published ON public.sites(published) WHERE published = TRUE;
CREATE INDEX idx_site_views_site_id ON public.site_views(site_id);
CREATE INDEX idx_site_views_created ON public.site_views(created_at);
CREATE INDEX idx_domains_site_id ON public.domains(site_id);
CREATE INDEX idx_profiles_stripe ON public.profiles(stripe_customer_id);

-- ═══════════════════════════════════════════════════════
-- Row Level Security (RLS)
-- ═══════════════════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Sites: users manage their own, public can read published
CREATE POLICY "Users can CRUD own sites"
  ON public.sites FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Public can read published sites"
  ON public.sites FOR SELECT
  USING (published = TRUE);

-- Domains: users manage their own
CREATE POLICY "Users can manage own domains"
  ON public.domains FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = domains.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- Views: anyone can insert, users read their own sites
CREATE POLICY "Anyone can record views"
  ON public.site_views FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Users can read own site views"
  ON public.site_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sites
      WHERE sites.id = site_views.site_id
      AND sites.user_id = auth.uid()
    )
  );

-- Waitlist: anyone can insert
CREATE POLICY "Anyone can join waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (TRUE);

-- ═══════════════════════════════════════════════════════
-- Triggers
-- ═══════════════════════════════════════════════════════

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-count sites per user
CREATE OR REPLACE FUNCTION public.update_sites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles SET sites_count = sites_count + 1 WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles SET sites_count = sites_count - 1 WHERE id = OLD.user_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_user_sites_count
  AFTER INSERT OR DELETE ON public.sites
  FOR EACH ROW EXECUTE FUNCTION public.update_sites_count();

-- Increment view counter
CREATE OR REPLACE FUNCTION public.increment_site_views()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.sites SET views = views + 1 WHERE id = NEW.site_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_site_view_recorded
  AFTER INSERT ON public.site_views
  FOR EACH ROW EXECUTE FUNCTION public.increment_site_views();
