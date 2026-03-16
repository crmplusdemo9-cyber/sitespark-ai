"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Eye,
  Code,
  Palette,
  Globe,
  Save,
  Rocket,
  ArrowLeft,
  ArrowRight,
  Type,
  Image,
  Layout,
  MessageCircle,
  Star,
  Zap,
  Loader2,
  Check,
  ChevronDown,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Types ─────────────────────────────────────────────────────

interface SiteData {
  businessName: string;
  niche: string;
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
  template: string;
}

const defaultSiteData: SiteData = {
  businessName: "",
  niche: "",
  headline: "Welcome to Your Business",
  subheadline: "We help you achieve your goals",
  about:
    "We're passionate about delivering exceptional results. Our team brings years of experience and dedication to every project.",
  services: [
    { title: "Service One", description: "Description of your first service", icon: "star" },
    { title: "Service Two", description: "Description of your second service", icon: "zap" },
    { title: "Service Three", description: "Description of your third service", icon: "heart" },
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
  template: "glassmorphism-portfolio",
};

// ─── Builder Steps ─────────────────────────────────────────────

type BuilderStep = "describe" | "generate" | "customize" | "preview" | "publish";

function BuilderContent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt") || "";

  const [step, setStep] = useState<BuilderStep>("describe");
  const [siteData, setSiteData] = useState<SiteData>(defaultSiteData);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Auto-generate if prompt provided via URL
  useEffect(() => {
    if (initialPrompt && step === "describe") {
      handleGenerate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Please describe your business first");
      return;
    }

    setStep("generate");
    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: prompt.split(" ").slice(0, 3).join(" "),
          niche: prompt,
          tone: "professional",
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();

      setSiteData((prev) => ({
        ...prev,
        businessName: prompt.split(" ").slice(0, 3).join(" "),
        niche: prompt,
        headline: data.headline || prev.headline,
        subheadline: data.subheadline || prev.subheadline,
        about: data.about || prev.about,
        services: data.services || prev.services,
        testimonial: data.testimonial || prev.testimonial,
        cta: data.cta || prev.cta,
        colorScheme: data.colorScheme || prev.colorScheme,
      }));

      toast.success("Website generated! Now customize it.");
      setStep("customize");
    } catch {
      // Use intelligent defaults based on the prompt
      setSiteData((prev) => ({
        ...prev,
        businessName: prompt.split(" ").slice(0, 3).join(" "),
        niche: prompt,
        headline: `Welcome to ${prompt}`,
        subheadline: "Your trusted partner for exceptional results",
      }));
      toast("Using smart defaults — customize to your liking!", { icon: "💡" });
      setStep("customize");
    } finally {
      setIsGenerating(false);
    }
  }, [prompt]);

  const handlePublish = useCallback(async () => {
    setStep("publish");

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteData),
      });

      if (!response.ok) throw new Error("Publish failed");

      const data = await response.json();
      toast.success(`Site live at ${data.url}!`);
    } catch {
      toast.error("Publishing failed — please try again");
      setStep("preview");
    }
  }, [siteData]);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
          </a>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-600" />
            <span className="font-bold">SiteSpark Builder</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="hidden md:flex items-center gap-1">
          {(["describe", "customize", "preview", "publish"] as const).map((s, i) => (
            <div key={s} className="flex items-center">
              <button
                onClick={() => {
                  if (s === "describe" || siteData.headline !== defaultSiteData.headline) {
                    setStep(s);
                  }
                }}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  step === s
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-current/10 text-[10px]">
                  {i + 1}
                </span>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
              {i < 3 && <ChevronDown className="h-3 w-3 rotate-[-90deg] text-gray-300" />}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {step === "customize" && (
            <button
              onClick={() => setStep("preview")}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <Eye className="h-4 w-4" />
              Preview
            </button>
          )}
          {(step === "preview" || step === "customize") && (
            <button
              onClick={handlePublish}
              className="btn-glow flex items-center gap-2 !py-2 !px-4 text-sm"
            >
              <Rocket className="h-4 w-4" />
              Publish
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Step 1: Describe */}
          {step === "describe" && (
            <motion.div
              key="describe"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex h-full items-center justify-center p-6"
            >
              <div className="max-w-lg w-full text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
                  <Sparkles className="h-8 w-8 text-brand-600" />
                </div>
                <h1 className="text-2xl font-bold">What&apos;s your website about?</h1>
                <p className="mt-2 text-gray-600">
                  Describe your business, portfolio, or project in a few words.
                </p>

                <div className="mt-8">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder='e.g. "Yoga studio in Portland with meditation classes"&#10;or "Freelance photographer specializing in weddings"&#10;or "Artisan coffee shop with organic blends"'
                    rows={4}
                    className="w-full rounded-xl border border-gray-200 p-4 text-base outline-none resize-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
                  />
                  <button
                    onClick={handleGenerate}
                    className="btn-glow mt-4 flex w-full items-center justify-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    Generate My Website
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-2">
                  {[
                    "Photography portfolio",
                    "Yoga instructor",
                    "Restaurant menu",
                    "Freelance developer",
                    "Hair salon",
                    "Life coach",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPrompt(s)}
                      className="rounded-full bg-gray-100 px-3 py-1.5 text-xs text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Generating */}
          {step === "generate" && (
            <motion.div
              key="generate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full items-center justify-center"
            >
              <div className="text-center">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-600" />
                <h2 className="mt-4 text-xl font-bold">Creating your website...</h2>
                <p className="mt-2 text-gray-500">AI is writing copy, picking colors, and designing your layout</p>
                <div className="mt-6 space-y-2 max-w-xs mx-auto">
                  {["Analyzing your niche...", "Writing compelling copy...", "Selecting color scheme...", "Choosing layout..."].map(
                    (text, i) => (
                      <motion.div
                        key={text}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.8 }}
                        className="flex items-center gap-2 text-sm text-gray-600"
                      >
                        <Check className="h-4 w-4 text-green-500" />
                        {text}
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Customize */}
          {step === "customize" && (
            <motion.div
              key="customize"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full"
            >
              {/* Left Panel — Editor */}
              <div className="w-80 shrink-0 overflow-y-auto border-r border-gray-200 bg-white p-4">
                <div className="space-y-6">
                  {/* Content Section */}
                  <EditorSection title="Content" icon={Type}>
                    <EditorField
                      label="Headline"
                      value={siteData.headline}
                      onChange={(v) => setSiteData((p) => ({ ...p, headline: v }))}
                    />
                    <EditorField
                      label="Subheadline"
                      value={siteData.subheadline}
                      onChange={(v) => setSiteData((p) => ({ ...p, subheadline: v }))}
                    />
                    <EditorField
                      label="About"
                      value={siteData.about}
                      onChange={(v) => setSiteData((p) => ({ ...p, about: v }))}
                      multiline
                    />
                  </EditorSection>

                  {/* Services Section */}
                  <EditorSection title="Services" icon={Layout}>
                    {siteData.services.map((service, i) => (
                      <div key={i} className="rounded-lg bg-gray-50 p-3 space-y-2">
                        <EditorField
                          label={`Service ${i + 1}`}
                          value={service.title}
                          onChange={(v) => {
                            const services = [...siteData.services];
                            services[i] = { ...services[i], title: v };
                            setSiteData((p) => ({ ...p, services }));
                          }}
                        />
                        <EditorField
                          label="Description"
                          value={service.description}
                          onChange={(v) => {
                            const services = [...siteData.services];
                            services[i] = { ...services[i], description: v };
                            setSiteData((p) => ({ ...p, services }));
                          }}
                        />
                      </div>
                    ))}
                  </EditorSection>

                  {/* Colors */}
                  <EditorSection title="Colors" icon={Palette}>
                    <div className="grid grid-cols-2 gap-3">
                      {(
                        Object.entries(siteData.colorScheme) as [string, string][]
                      ).map(([key, value]) => (
                        <div key={key}>
                          <label className="text-xs font-medium text-gray-500 capitalize">
                            {key}
                          </label>
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              type="color"
                              value={value}
                              onChange={(e) =>
                                setSiteData((p) => ({
                                  ...p,
                                  colorScheme: {
                                    ...p.colorScheme,
                                    [key]: e.target.value,
                                  },
                                }))
                              }
                              className="h-8 w-8 cursor-pointer rounded border-0"
                            />
                            <span className="text-xs text-gray-400 font-mono">
                              {value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </EditorSection>

                  {/* CTA */}
                  <EditorSection title="Call to Action" icon={MessageCircle}>
                    <EditorField
                      label="Button Text"
                      value={siteData.cta.text}
                      onChange={(v) =>
                        setSiteData((p) => ({ ...p, cta: { ...p.cta, text: v } }))
                      }
                    />
                    <EditorField
                      label="Sub-text"
                      value={siteData.cta.subtext}
                      onChange={(v) =>
                        setSiteData((p) => ({
                          ...p,
                          cta: { ...p.cta, subtext: v },
                        }))
                      }
                    />
                  </EditorSection>

                  {/* Testimonial */}
                  <EditorSection title="Testimonial" icon={Star}>
                    <EditorField
                      label="Quote"
                      value={siteData.testimonial.quote}
                      onChange={(v) =>
                        setSiteData((p) => ({
                          ...p,
                          testimonial: { ...p.testimonial, quote: v },
                        }))
                      }
                      multiline
                    />
                    <EditorField
                      label="Author"
                      value={siteData.testimonial.author}
                      onChange={(v) =>
                        setSiteData((p) => ({
                          ...p,
                          testimonial: { ...p.testimonial, author: v },
                        }))
                      }
                    />
                  </EditorSection>

                  {/* Regenerate */}
                  <button
                    onClick={handleGenerate}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-500 hover:border-brand-300 hover:text-brand-600 transition"
                  >
                    <Sparkles className="h-4 w-4" />
                    Regenerate with AI
                  </button>
                </div>
              </div>

              {/* Right Panel — Live Preview */}
              <div className="flex-1 bg-gray-100 p-4 overflow-auto">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 rounded-lg bg-white p-1 shadow-sm">
                    {([
                      { mode: "desktop" as const, icon: Monitor, width: "100%" },
                      { mode: "tablet" as const, icon: Tablet, width: "768px" },
                      { mode: "mobile" as const, icon: Smartphone, width: "375px" },
                    ]).map(({ mode, icon: Icon }) => (
                      <button
                        key={mode}
                        onClick={() => setPreviewMode(mode)}
                        className={`rounded-md p-2 transition ${
                          previewMode === mode
                            ? "bg-brand-50 text-brand-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">Live Preview</span>
                </div>

                <div
                  className="mx-auto transition-all duration-300"
                  style={{
                    maxWidth:
                      previewMode === "mobile"
                        ? "375px"
                        : previewMode === "tablet"
                        ? "768px"
                        : "100%",
                  }}
                >
                  <SitePreview data={siteData} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Preview */}
          {step === "preview" && (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-auto"
            >
              <SitePreview data={siteData} fullscreen />
            </motion.div>
          )}

          {/* Step 5: Publishing */}
          {step === "publish" && (
            <motion.div
              key="publish"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full items-center justify-center"
            >
              <div className="text-center max-w-md">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-brand-600" />
                <h2 className="mt-4 text-xl font-bold">Publishing your site...</h2>
                <p className="mt-2 text-gray-500">
                  Setting up hosting, SSL, and making it live worldwide
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ─── Reusable Editor Components ────────────────────────────────

function EditorSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="rounded-xl border border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-3 text-sm font-semibold"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand-600" />
          {title}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open && <div className="space-y-3 px-3 pb-3">{children}</div>}
    </div>
  );
}

function EditorField({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none resize-none focus:border-brand-400 transition"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-400 transition"
        />
      )}
    </div>
  );
}

// ─── Live Site Preview (Glassmorphism Template) ────────────────

function SitePreview({ data, fullscreen = false }: { data: SiteData; fullscreen?: boolean }) {
  const { colorScheme: c } = data;

  return (
    <div
      className={`${fullscreen ? "" : "rounded-xl border border-gray-200 shadow-lg"} overflow-hidden`}
      style={{ background: c.background, color: c.text }}
    >
      {/* Hero */}
      <section
        className="relative px-6 py-24 text-center"
        style={{
          background: `linear-gradient(135deg, ${c.primary}15, ${c.secondary}10, ${c.accent}08)`,
        }}
      >
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            {data.headline}
          </h1>
          <p className="mt-4 text-lg opacity-70">{data.subheadline}</p>
          <div className="mt-8">
            <button
              className="rounded-xl px-8 py-3 font-semibold text-white transition-all hover:opacity-90"
              style={{ background: c.primary }}
            >
              {data.cta.text}
            </button>
            <p className="mt-2 text-sm opacity-50">{data.cta.subtext}</p>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold">About</h2>
          <p className="mt-4 leading-relaxed opacity-70">{data.about}</p>
        </div>
      </section>

      {/* Services */}
      <section
        className="px-6 py-16"
        style={{ background: `${c.primary}06` }}
      >
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold mb-10">What We Offer</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {data.services.map((service, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 text-center"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(10px)",
                  border: `1px solid ${c.primary}15`,
                }}
              >
                <div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${c.primary}15` }}
                >
                  <Zap className="h-5 w-5" style={{ color: c.primary }} />
                </div>
                <h3 className="font-bold">{service.title}</h3>
                <p className="mt-2 text-sm opacity-60">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="h-5 w-5"
                style={{ color: c.accent, fill: c.accent }}
              />
            ))}
          </div>
          <blockquote className="text-xl italic leading-relaxed">
            &ldquo;{data.testimonial.quote}&rdquo;
          </blockquote>
          <p className="mt-4 font-semibold">{data.testimonial.author}</p>
          <p className="text-sm opacity-50">{data.testimonial.role}</p>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-6 py-16 text-center text-white"
        style={{ background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})` }}
      >
        <h2 className="text-3xl font-bold">Ready to get started?</h2>
        <p className="mt-2 opacity-80">{data.cta.subtext}</p>
        <button className="mt-6 rounded-xl bg-white px-8 py-3 font-semibold transition-all hover:opacity-90"
          style={{ color: c.primary }}>
          {data.cta.text}
        </button>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 text-center text-sm opacity-40">
        © {new Date().getFullYear()} {data.businessName || "Your Business"} •
        Built with SiteSpark AI
      </footer>
    </div>
  );
}

// ─── Page Export with Suspense ─────────────────────────────────

export default function BuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </div>
      }
    >
      <BuilderContent />
    </Suspense>
  );
}
