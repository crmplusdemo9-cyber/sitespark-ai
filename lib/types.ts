// ─── Database Types ────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: "free" | "pro";
  role: "user" | "admin" | "moderator";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  sites_count: number;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  niche: string;
  template_id: string;
  content: SiteContent;
  custom_domain: string | null;
  domain_status: "none" | "pending" | "active" | "error";
  published: boolean;
  published_at: string | null;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface SiteContent {
  headline: string;
  subheadline: string;
  about: string;
  services: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
  cta: {
    text: string;
    subtext: string;
  };
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  customCss?: string;
  sections?: SiteSection[];
}

export interface SiteSection {
  id: string;
  type: "hero" | "about" | "services" | "testimonial" | "cta" | "gallery" | "contact" | "custom";
  order: number;
  visible: boolean;
  content: Record<string, unknown>;
  style: Record<string, string>;
}

export interface DomainRecord {
  id: string;
  site_id: string;
  domain: string;
  registrar: "porkbun" | "namecheap" | "external";
  status: "checking" | "available" | "registered" | "dns_pending" | "active" | "error";
  auto_renew: boolean;
  expires_at: string | null;
  cost_cents: number | null;
  created_at: string;
}

// ─── Builder Types ─────────────────────────────────────────────

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: string;
  isPremium: boolean;
  defaultContent: SiteContent;
  styles: {
    layout: "centered" | "split" | "fullwidth";
    effect: "glassmorphism" | "gradient" | "minimal" | "bold" | "dark";
  };
}

export interface BuilderBlock {
  id: string;
  type: string;
  label: string;
  icon: string;
  defaultProps: Record<string, unknown>;
}

// ─── API Types ─────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface GenerateRequest {
  businessName: string;
  niche: string;
  tone?: "professional" | "friendly" | "bold" | "minimal";
  templateId?: string;
}

export interface DomainSearchResult {
  domain: string;
  available: boolean;
  price: string | null;
  tld: string;
}

// ─── Admin Types ───────────────────────────────────────────────

export interface AdminAuditLog {
  id: string;
  admin_id: string;
  action: string;
  entity_type: "user" | "site" | "domain" | "setting";
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  rollout_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface AdminNotification {
  id: string;
  type: "info" | "warning" | "error" | "success" | "approval";
  title: string;
  message: string;
  action_url: string | null;
  action_label: string | null;
  read: boolean;
  dismissed: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DomainApproval {
  id: string;
  domain: string;
  site_id: string | null;
  user_id: string | null;
  cost_cents: number;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  proUsers: number;
  freeUsers: number;
  totalSites: number;
  publishedSites: number;
  totalViews: number;
  totalDomains: number;
  activeDomains: number;
  waitlistCount: number;
  mrr: number;
  newUsersToday: number;
  newSitesToday: number;
  conversionRate: number;
}
