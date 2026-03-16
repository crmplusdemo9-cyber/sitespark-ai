import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ─── Website Content Generation ────────────────────────────────

export interface GeneratedContent {
  headline: string;
  subheadline: string;
  about: string;
  services: Array<{ title: string; description: string; icon: string }>;
  testimonial: { quote: string; author: string; role: string };
  cta: { text: string; subtext: string };
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  seoTitle: string;
  seoDescription: string;
}

export async function generateWebsiteContent(
  niche: string,
  businessName: string,
  tone: "professional" | "friendly" | "bold" | "minimal" = "professional"
): Promise<GeneratedContent> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini", // Cost-effective: ~$0.001 per generation
    messages: [
      {
        role: "system",
        content: `You are a world-class website copywriter. Generate compelling, conversion-optimized website content. Return ONLY valid JSON matching the exact schema requested. No markdown, no code blocks.`,
      },
      {
        role: "user",
        content: `Generate one-page website content for:
Business: "${businessName}"
Niche: "${niche}"
Tone: ${tone}

Return this exact JSON structure:
{
  "headline": "compelling hero headline (max 8 words)",
  "subheadline": "supporting text explaining value (max 20 words)",
  "about": "2-3 sentence about section",
  "services": [
    {"title": "service name", "description": "1 sentence", "icon": "lucide icon name"},
    {"title": "service name", "description": "1 sentence", "icon": "lucide icon name"},
    {"title": "service name", "description": "1 sentence", "icon": "lucide icon name"}
  ],
  "testimonial": {"quote": "realistic testimonial", "author": "name", "role": "role"},
  "cta": {"text": "CTA button text", "subtext": "below-button text"},
  "colorScheme": {
    "primary": "#hex", "secondary": "#hex", "accent": "#hex",
    "background": "#hex", "text": "#hex"
  },
  "seoTitle": "SEO title (50-60 chars)",
  "seoDescription": "meta description (150-160 chars)"
}

Use lucide icon names like: camera, heart, star, zap, shield, code, palette, music, briefcase, globe`,
      },
    ],
    temperature: 0.8,
    max_tokens: 1000,
  });

  const text = response.choices[0].message.content || "{}";

  // Parse response, strip any markdown code fences
  const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(cleaned) as GeneratedContent;
  } catch {
    // Fallback content if AI response is malformed
    return getDefaultContent(businessName, niche);
  }
}

// ─── Template Recommendation ───────────────────────────────────

export async function recommendTemplate(
  niche: string
): Promise<{ templateId: string; reason: string }> {
  const nicheTemplateMap: Record<string, string> = {
    photography: "glassmorphism-portfolio",
    yoga: "zen-minimal",
    restaurant: "bold-showcase",
    coaching: "professional-clean",
    freelance: "developer-dark",
    artist: "creative-gradient",
    default: "modern-starter",
  };

  const key = Object.keys(nicheTemplateMap).find((k) =>
    niche.toLowerCase().includes(k)
  );

  return {
    templateId: nicheTemplateMap[key || "default"],
    reason: key
      ? `Best template for ${key} businesses based on conversion data`
      : "Versatile starter template that works for any business",
  };
}

// ─── Fallback Content ──────────────────────────────────────────

function getDefaultContent(name: string, niche: string): GeneratedContent {
  return {
    headline: `Welcome to ${name}`,
    subheadline: `Your trusted ${niche} partner for exceptional results`,
    about: `${name} delivers outstanding ${niche} services with dedication and expertise. We're committed to helping you achieve your goals with personalized attention and proven methods.`,
    services: [
      {
        title: "Consultation",
        description: "Personalized guidance tailored to your needs",
        icon: "message-circle",
      },
      {
        title: "Execution",
        description: "Professional delivery with attention to detail",
        icon: "zap",
      },
      {
        title: "Support",
        description: "Ongoing assistance whenever you need it",
        icon: "heart",
      },
    ],
    testimonial: {
      quote: `Working with ${name} transformed my business. Highly recommended!`,
      author: "Sarah M.",
      role: "Happy Client",
    },
    cta: {
      text: "Get Started Today",
      subtext: "Free consultation • No commitment",
    },
    colorScheme: {
      primary: "#4263eb",
      secondary: "#748ffc",
      accent: "#ff6b6b",
      background: "#ffffff",
      text: "#1a1a2e",
    },
    seoTitle: `${name} — Professional ${niche} Services`,
    seoDescription: `${name} offers top-quality ${niche} services. Get started with a free consultation today.`,
  };
}

// ─── Image Prompt Generation (for future DALL-E integration) ───

export async function generateImagePrompts(
  niche: string,
  sections: string[]
): Promise<string[]> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Generate DALL-E 3 image prompts. Return a JSON array of prompt strings. No markdown.",
      },
      {
        role: "user",
        content: `Generate ${sections.length} DALL-E image prompts for a ${niche} website. Sections: ${sections.join(", ")}. Style: modern, professional, high-quality stock photo aesthetic. Return JSON array of strings.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  try {
    const text = response.choices[0].message.content || "[]";
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return sections.map(
      (s) =>
        `Professional ${niche} ${s} photo, modern aesthetic, high quality, warm lighting`
    );
  }
}
