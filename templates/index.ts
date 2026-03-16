import type { Template, SiteContent } from "@/lib/types";

// ─── Default Content Factory ───────────────────────────────────

function makeContent(overrides: Partial<SiteContent>): SiteContent {
  return {
    headline: "Welcome to Your Business",
    subheadline: "We help you achieve your goals",
    about: "We're passionate about delivering exceptional results with dedication and expertise.",
    services: [
      { title: "Consultation", description: "Personalized guidance", icon: "message-circle" },
      { title: "Execution", description: "Professional delivery", icon: "zap" },
      { title: "Support", description: "Ongoing assistance", icon: "heart" },
    ],
    testimonial: {
      quote: "Amazing experience! Highly recommended.",
      author: "Happy Client",
      role: "Customer",
    },
    cta: { text: "Get Started", subtext: "Free consultation" },
    colorScheme: {
      primary: "#4263eb",
      secondary: "#748ffc",
      accent: "#ff6b6b",
      background: "#ffffff",
      text: "#1a1a2e",
    },
    ...overrides,
  };
}

// ─── Template Library ──────────────────────────────────────────

export const templates: Template[] = [
  {
    id: "glassmorphism-portfolio",
    name: "Glassmorphism Portfolio",
    description: "Modern frosted glass effect with gradient backgrounds. Perfect for creative professionals.",
    category: "Portfolio",
    thumbnail: "/templates/glassmorphism.png",
    isPremium: false,
    defaultContent: makeContent({
      colorScheme: {
        primary: "#6366f1",
        secondary: "#8b5cf6",
        accent: "#f472b6",
        background: "#0f0f23",
        text: "#e2e8f0",
      },
    }),
    styles: { layout: "centered", effect: "glassmorphism" },
  },
  {
    id: "zen-minimal",
    name: "Zen Minimal",
    description: "Clean, peaceful design with generous whitespace. Ideal for wellness and yoga.",
    category: "Wellness",
    thumbnail: "/templates/zen.png",
    isPremium: false,
    defaultContent: makeContent({
      colorScheme: {
        primary: "#059669",
        secondary: "#34d399",
        accent: "#fbbf24",
        background: "#fefce8",
        text: "#1c1917",
      },
    }),
    styles: { layout: "centered", effect: "minimal" },
  },
  {
    id: "bold-showcase",
    name: "Bold Showcase",
    description: "High-contrast, impactful design. Great for restaurants, events, and entertainment.",
    category: "Restaurant",
    thumbnail: "/templates/bold.png",
    isPremium: false,
    defaultContent: makeContent({
      colorScheme: {
        primary: "#dc2626",
        secondary: "#f97316",
        accent: "#fbbf24",
        background: "#1c1917",
        text: "#fafaf9",
      },
    }),
    styles: { layout: "fullwidth", effect: "bold" },
  },
  {
    id: "professional-clean",
    name: "Professional Clean",
    description: "Trust-building corporate design. Perfect for coaches, consultants, and agencies.",
    category: "Business",
    thumbnail: "/templates/professional.png",
    isPremium: false,
    defaultContent: makeContent({
      colorScheme: {
        primary: "#1d4ed8",
        secondary: "#3b82f6",
        accent: "#06b6d4",
        background: "#ffffff",
        text: "#1e293b",
      },
    }),
    styles: { layout: "split", effect: "minimal" },
  },
  {
    id: "developer-dark",
    name: "Developer Dark",
    description: "Dark theme with code aesthetics. Built for developers and tech freelancers.",
    category: "Tech",
    thumbnail: "/templates/developer.png",
    isPremium: true,
    defaultContent: makeContent({
      colorScheme: {
        primary: "#22d3ee",
        secondary: "#818cf8",
        accent: "#a78bfa",
        background: "#0a0a0a",
        text: "#e5e5e5",
      },
    }),
    styles: { layout: "centered", effect: "dark" },
  },
  {
    id: "creative-gradient",
    name: "Creative Gradient",
    description: "Vibrant gradients with bold typography. Made for artists, musicians, and creators.",
    category: "Creative",
    thumbnail: "/templates/creative.png",
    isPremium: true,
    defaultContent: makeContent({
      colorScheme: {
        primary: "#ec4899",
        secondary: "#8b5cf6",
        accent: "#f59e0b",
        background: "#faf5ff",
        text: "#1e1b4b",
      },
    }),
    styles: { layout: "fullwidth", effect: "gradient" },
  },
  {
    id: "elegant-serif",
    name: "Elegant Serif",
    description: "Sophisticated serif typography with classic layout. For luxury brands and weddings.",
    category: "Luxury",
    thumbnail: "/templates/elegant.png",
    isPremium: true,
    defaultContent: makeContent({
      colorScheme: {
        primary: "#854d0e",
        secondary: "#a16207",
        accent: "#b45309",
        background: "#fffbeb",
        text: "#292524",
      },
    }),
    styles: { layout: "centered", effect: "minimal" },
  },
  {
    id: "neon-night",
    name: "Neon Night",
    description: "Cyberpunk-inspired with neon accents and dark backgrounds. For nightlife and gaming.",
    category: "Entertainment",
    thumbnail: "/templates/neon.png",
    isPremium: true,
    defaultContent: makeContent({
      colorScheme: {
        primary: "#06b6d4",
        secondary: "#d946ef",
        accent: "#22d3ee",
        background: "#020617",
        text: "#f1f5f9",
      },
    }),
    styles: { layout: "fullwidth", effect: "dark" },
  },
  {
    id: "nature-organic",
    name: "Nature Organic",
    description: "Earth tones with organic shapes. For eco-brands, farms, and outdoor businesses.",
    category: "Nature",
    thumbnail: "/templates/nature.png",
    isPremium: false,
    defaultContent: makeContent({
      colorScheme: {
        primary: "#166534",
        secondary: "#15803d",
        accent: "#ca8a04",
        background: "#f0fdf4",
        text: "#14532d",
      },
    }),
    styles: { layout: "centered", effect: "minimal" },
  },
  {
    id: "startup-launch",
    name: "Startup Launch",
    description: "High-conversion SaaS landing page style. For product launches and startups.",
    category: "Startup",
    thumbnail: "/templates/startup.png",
    isPremium: true,
    defaultContent: makeContent({
      colorScheme: {
        primary: "#7c3aed",
        secondary: "#a855f7",
        accent: "#f97316",
        background: "#ffffff",
        text: "#18181b",
      },
    }),
    styles: { layout: "centered", effect: "gradient" },
  },
  {
    id: "photography-grid",
    name: "Photography Grid",
    description: "Image-first layout with masonry grid. Perfect for photographers and visual artists.",
    category: "Photography",
    thumbnail: "/templates/photography.png",
    isPremium: true,
    defaultContent: makeContent({
      colorScheme: {
        primary: "#18181b",
        secondary: "#3f3f46",
        accent: "#f4f4f5",
        background: "#ffffff",
        text: "#18181b",
      },
    }),
    styles: { layout: "fullwidth", effect: "minimal" },
  },
  {
    id: "salon-beauty",
    name: "Salon & Beauty",
    description: "Soft, elegant design with rose accents. For salons, spas, and beauty businesses.",
    category: "Beauty",
    thumbnail: "/templates/salon.png",
    isPremium: false,
    defaultContent: makeContent({
      colorScheme: {
        primary: "#be185d",
        secondary: "#ec4899",
        accent: "#f9a8d4",
        background: "#fff1f2",
        text: "#1c1917",
      },
    }),
    styles: { layout: "centered", effect: "minimal" },
  },
];

export function getTemplate(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}

export function getTemplatesByCategory(category: string): Template[] {
  return templates.filter((t) => t.category.toLowerCase() === category.toLowerCase());
}

export function getFreeTemplates(): Template[] {
  return templates.filter((t) => !t.isPremium);
}

export function getPremiumTemplates(): Template[] {
  return templates.filter((t) => t.isPremium);
}
