import { notFound } from "next/navigation";
import { createServiceSupabase } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { Star, Zap, Heart, MessageCircle, Camera, Shield, Code, Palette, Music, Briefcase, Globe } from "lucide-react";

// Icon mapping for dynamic rendering
const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  star: Star,
  zap: Zap,
  heart: Heart,
  "message-circle": MessageCircle,
  camera: Camera,
  shield: Shield,
  code: Code,
  palette: Palette,
  music: Music,
  briefcase: Briefcase,
  globe: Globe,
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ─── Metadata ──────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServiceSupabase();

  const { data: site } = await supabase
    .from("sites")
    .select("name, content")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!site) return { title: "Site Not Found" };

  const content = site.content as any;
  return {
    title: content?.seoTitle || site.name,
    description: content?.seoDescription || content?.subheadline || "",
    openGraph: {
      title: content?.seoTitle || site.name,
      description: content?.seoDescription || content?.subheadline || "",
    },
  };
}

// ─── Published Site Page ───────────────────────────────────────

export default async function PublishedSitePage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createServiceSupabase();

  const { data: site } = await supabase
    .from("sites")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!site) notFound();

  // Record view (non-blocking)
  supabase
    .from("site_views")
    .insert({ site_id: site.id })
    .then(() => {});

  const content = site.content as any;
  const c = content?.colorScheme || {
    primary: "#4263eb",
    secondary: "#748ffc",
    accent: "#ff6b6b",
    background: "#ffffff",
    text: "#1a1a2e",
  };

  return (
    <div style={{ background: c.background, color: c.text, minHeight: "100vh" }}>
      {/* Hero */}
      <section
        className="relative px-6 py-28 text-center"
        style={{
          background: `linear-gradient(135deg, ${c.primary}12, ${c.secondary}08, ${c.accent}05)`,
        }}
      >
        <div className="mx-auto max-w-3xl">
          <h1
            className="text-5xl font-extrabold leading-tight md:text-6xl"
            style={{ color: c.text }}
          >
            {content?.headline || site.name}
          </h1>
          <p className="mt-5 text-xl opacity-70">
            {content?.subheadline || ""}
          </p>
          {content?.cta && (
            <div className="mt-10">
              <button
                className="rounded-xl px-10 py-4 text-lg font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:opacity-90"
                style={{
                  background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`,
                  boxShadow: `0 8px 30px ${c.primary}40`,
                }}
              >
                {content.cta.text}
              </button>
              {content.cta.subtext && (
                <p className="mt-3 text-sm opacity-50">{content.cta.subtext}</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* About */}
      {content?.about && (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold">About</h2>
            <p className="mt-6 text-lg leading-relaxed opacity-70">
              {content.about}
            </p>
          </div>
        </section>
      )}

      {/* Services */}
      {content?.services?.length > 0 && (
        <section
          className="px-6 py-20"
          style={{ background: `${c.primary}04` }}
        >
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-3xl font-bold mb-12">What We Offer</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {content.services.map(
                (
                  service: { title: string; description: string; icon: string },
                  i: number
                ) => {
                  const IconComp = iconMap[service.icon] || Zap;
                  return (
                    <div
                      key={i}
                      className="rounded-2xl p-8 text-center transition-all hover:shadow-lg"
                      style={{
                        background: `rgba(255,255,255,0.8)`,
                        backdropFilter: "blur(10px)",
                        border: `1px solid ${c.primary}12`,
                      }}
                    >
                      <div
                        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                        style={{ background: `${c.primary}12` }}
                      >
                        <IconComp
                          className="h-6 w-6"
                          style={{ color: c.primary }}
                        />
                      </div>
                      <h3 className="text-lg font-bold">{service.title}</h3>
                      <p className="mt-3 text-sm opacity-60 leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </section>
      )}

      {/* Testimonial */}
      {content?.testimonial && (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-2xl text-center">
            <div className="flex justify-center gap-1.5 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-6 w-6"
                  style={{ color: c.accent, fill: c.accent }}
                />
              ))}
            </div>
            <blockquote className="text-2xl italic leading-relaxed font-light">
              &ldquo;{content.testimonial.quote}&rdquo;
            </blockquote>
            <p className="mt-6 font-bold text-lg">
              {content.testimonial.author}
            </p>
            <p className="text-sm opacity-50">{content.testimonial.role}</p>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section
        className="px-6 py-20 text-center text-white"
        style={{
          background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`,
        }}
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-bold">Ready to get started?</h2>
          {content?.cta?.subtext && (
            <p className="mt-3 text-lg opacity-80">{content.cta.subtext}</p>
          )}
          <button
            className="mt-8 rounded-xl bg-white px-10 py-4 text-lg font-bold transition-all hover:shadow-lg"
            style={{ color: c.primary }}
          >
            {content?.cta?.text || "Contact Us"}
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-8 text-center text-sm"
        style={{ opacity: 0.4 }}
      >
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <p className="mt-1">
          Built with{" "}
          <a
            href="https://sitespark.dev"
            className="underline hover:opacity-80"
            target="_blank"
            rel="noopener"
          >
            SiteSpark AI
          </a>
        </p>
      </footer>
    </div>
  );
}
