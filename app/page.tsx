"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Globe,
  Zap,
  Palette,
  ArrowRight,
  Check,
  Star,
  ChevronRight,
  Monitor,
  Smartphone,
} from "lucide-react";

// ─── Landing Page ──────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="relative overflow-hidden">
      <Navbar />
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <TemplateShowcase />
      <PricingSection />
      <WaitlistSection />
      <Footer />
    </main>
  );
}

// ─── Navbar ────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100/50 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold">SiteSpark</span>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-600">
            AI
          </span>
        </div>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Features
          </a>
          <a href="#templates" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Templates
          </a>
          <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            Pricing
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/auth/login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Log in
          </a>
          <a
            href="/builder"
            className="btn-glow !py-2 !px-5 text-sm"
          >
            Build Free
          </a>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ──────────────────────────────────────────────────────

function HeroSection() {
  const [prompt, setPrompt] = useState("");

  return (
    <section className="relative min-h-screen pt-32 pb-20 mesh-gradient">
      {/* Floating decorative elements */}
      <div className="absolute top-40 left-10 h-72 w-72 rounded-full bg-brand-200/30 blur-3xl" />
      <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-purple-200/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
            <Zap className="h-3.5 w-3.5" />
            AI-Powered • Ships in 30 Seconds
          </div>

          {/* Headline */}
          <h1 className="mx-auto max-w-4xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
            Describe your business.
            <br />
            <span className="gradient-text">Get a stunning website.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 md:text-xl">
            SiteSpark AI creates beautiful one-page websites in seconds.
            Just tell us about your business — our AI handles design, copy,
            and deployment.
          </p>

          {/* AI Prompt Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mx-auto mt-10 max-w-2xl"
          >
            <div className="border-gradient">
              <div className="flex items-center gap-3 bg-white p-2 rounded-2xl">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                  <Sparkles className="h-5 w-5 text-brand-600" />
                </div>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder='e.g. "Yoga studio in Portland" or "Freelance photographer portfolio"'
                  className="flex-1 bg-transparent text-base outline-none placeholder:text-gray-400"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && prompt.trim()) {
                      window.location.href = `/builder?prompt=${encodeURIComponent(prompt)}`;
                    }
                  }}
                />
                <button
                  onClick={() => {
                    if (prompt.trim()) {
                      window.location.href = `/builder?prompt=${encodeURIComponent(prompt)}`;
                    }
                  }}
                  className="btn-glow flex items-center gap-2 !py-2.5 !px-5 text-sm whitespace-nowrap"
                >
                  Generate Site
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-gray-400">Try:</span>
              {["Photography portfolio", "Yoga instructor", "Restaurant", "Life coach", "Hair salon"].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setPrompt(suggestion)}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          </motion.div>

          {/* Social Proof */}
          <div className="mt-12 flex items-center justify-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <div className="flex -space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-brand-300 to-brand-600"
                    style={{ zIndex: 5 - i }}
                  />
                ))}
              </div>
              <span className="ml-2">2,000+ sites built</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span>4.9/5 rating</span>
            </div>
          </div>
        </motion.div>

        {/* Hero Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-16"
        >
          <div className="relative mx-auto max-w-4xl">
            <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-2xl shadow-brand-500/10">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="mx-auto flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-1.5 text-xs text-gray-400">
                  <Globe className="h-3 w-3" />
                  yoursite.sitespark.dev
                </div>
              </div>
              {/* Site preview placeholder */}
              <div className="aspect-[16/9] rounded-b-xl bg-gradient-to-br from-brand-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 h-16 w-16 rounded-2xl bg-brand-100 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-brand-600" />
                  </div>
                  <p className="text-xl font-bold text-gray-800">Your AI-Generated Site</p>
                  <p className="text-sm text-gray-500 mt-1">Appears here in seconds</p>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute -left-4 top-1/3 glass px-4 py-2 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-brand-600" />
                <span className="text-xs font-medium">Desktop Ready</span>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, delay: 1.5 }}
              className="absolute -right-4 top-1/2 glass px-4 py-2 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium">Mobile Optimized</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Describe",
      desc: "Tell AI about your business in plain English",
      icon: Sparkles,
      color: "bg-brand-50 text-brand-600",
    },
    {
      num: "02",
      title: "Customize",
      desc: "Drag blocks, edit text, pick your style",
      icon: Palette,
      color: "bg-purple-50 text-purple-600",
    },
    {
      num: "03",
      title: "Launch",
      desc: "One click to go live with your own domain",
      icon: Globe,
      color: "bg-green-50 text-green-600",
    },
  ];

  return (
    <section className="py-24 bg-gray-50/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold md:text-4xl">
            Three steps. Thirty seconds.
          </h2>
          <p className="mt-3 text-gray-600">
            No coding. No design skills. No hiring a developer.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative rounded-2xl bg-white p-8 shadow-sm border border-gray-100 card-hover"
            >
              <div className="text-6xl font-black text-gray-100 absolute top-4 right-6">
                {step.num}
              </div>
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${step.color}`}>
                <step.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
              <p className="mt-2 text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────────────

function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "AI Content Generation",
      desc: "GPT-4o-mini writes headlines, bios, CTAs, and SEO metadata tailored to your niche",
    },
    {
      icon: Palette,
      title: "Glassmorphism & 3D Styles",
      desc: "Modern frosted glass effects, gradient meshes, and animated backgrounds",
    },
    {
      icon: Globe,
      title: "Custom Domains ($8/yr)",
      desc: "One-click domain purchase via Porkbun with auto DNS setup and free WHOIS privacy",
    },
    {
      icon: Zap,
      title: "Instant Publishing",
      desc: "Your site goes live in under 5 seconds on a global CDN with 99.99% uptime",
    },
    {
      icon: Monitor,
      title: "Fully Responsive",
      desc: "Looks perfect on desktop, tablet, and mobile — automatically, no extra work",
    },
    {
      icon: Star,
      title: "SEO Optimized",
      desc: "AI generates meta tags, Open Graph, structured data — rank on Google from day 1",
    },
  ];

  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700">
            <Zap className="h-3.5 w-3.5" />
            Built Different
          </div>
          <h2 className="text-3xl font-bold md:text-4xl">
            Everything you need. Nothing you don&apos;t.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-gray-100 bg-white p-6 card-hover"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50">
                <feature.icon className="h-5 w-5 text-brand-600" />
              </div>
              <h3 className="mt-4 font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Template Showcase ─────────────────────────────────────────

function TemplateShowcase() {
  const templates = [
    { name: "Glassmorphism", category: "Portfolio", gradient: "from-blue-400 to-purple-500" },
    { name: "Zen Minimal", category: "Wellness", gradient: "from-green-400 to-teal-500" },
    { name: "Bold Showcase", category: "Restaurant", gradient: "from-orange-400 to-red-500" },
    { name: "Dark Developer", category: "Tech", gradient: "from-gray-700 to-gray-900" },
    { name: "Creative Gradient", category: "Artist", gradient: "from-pink-400 to-purple-500" },
    { name: "Professional Clean", category: "Business", gradient: "from-brand-400 to-brand-700" },
  ];

  return (
    <section id="templates" className="py-24 bg-gray-50/50">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold md:text-4xl">
            Stunning templates, infinite styles
          </h2>
          <p className="mt-3 text-gray-600">
            AI picks the best template for your niche. Customize everything.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template, i) => (
            <motion.div
              key={template.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer"
            >
              <div className={`aspect-[4/3] rounded-2xl bg-gradient-to-br ${template.gradient} p-6 flex flex-col justify-end transition-transform group-hover:scale-[1.02]`}>
                <div className="glass px-4 py-3">
                  <p className="font-bold text-white">{template.name}</p>
                  <p className="text-xs text-white/70">{template.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a
            href="/builder"
            className="inline-flex items-center gap-2 text-brand-600 font-semibold hover:text-brand-700 transition-colors"
          >
            See all templates
            <ChevronRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Pricing ───────────────────────────────────────────────────

function PricingSection() {
  return (
    <section id="pricing" className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold md:text-4xl">
            Simple, honest pricing
          </h2>
          <p className="mt-3 text-gray-600">
            Start free. Upgrade when you need a custom domain.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Free Plan */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8">
            <h3 className="text-lg font-bold">Free</h3>
            <div className="mt-4">
              <span className="text-4xl font-black">$0</span>
              <span className="text-gray-500">/forever</span>
            </div>
            <ul className="mt-6 space-y-3">
              {[
                "1 published site",
                "SiteSpark subdomain",
                "AI content generation",
                "Basic templates",
                "Mobile responsive",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-green-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href="/builder"
              className="mt-8 block w-full rounded-xl border-2 border-gray-200 py-3 text-center font-semibold text-gray-700 hover:border-brand-300 hover:text-brand-600 transition-colors"
            >
              Start Building
            </a>
          </div>

          {/* Pro Plan */}
          <div className="relative rounded-2xl border-2 border-brand-500 bg-white p-8 shadow-lg shadow-brand-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1 text-xs font-bold text-white">
              MOST POPULAR
            </div>
            <h3 className="text-lg font-bold">Pro</h3>
            <div className="mt-4">
              <span className="text-4xl font-black">$19</span>
              <span className="text-gray-500">/year</span>
            </div>
            <p className="mt-1 text-xs text-gray-500">That&apos;s $1.58/mo — less than a coffee</p>
            <ul className="mt-6 space-y-3">
              {[
                "Unlimited sites",
                "Custom domain (from $8/yr)",
                "All premium templates",
                "Remove SiteSpark branding",
                "Analytics dashboard",
                "Priority support",
                "Referral rewards (30 days free)",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 text-brand-500 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href="/builder?plan=pro"
              className="btn-glow mt-8 block w-full text-center"
            >
              Get Pro — $19/yr
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Waitlist / CTA ────────────────────────────────────────────

function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch {
      // Still show success — we don't want to block on errors
      setSubmitted(true);
    }
  }

  return (
    <section className="py-24 mesh-gradient">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
          Ready to build your site?
        </h2>
        <p className="mt-3 text-gray-600">
          Join 2,000+ creators who built their website in under a minute.
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 rounded-2xl bg-green-50 border border-green-200 p-6"
          >
            <Check className="mx-auto h-8 w-8 text-green-500" />
            <p className="mt-2 font-semibold text-green-800">You&apos;re on the list!</p>
            <p className="mt-1 text-sm text-green-600">We&apos;ll notify you when we launch.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8">
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 transition"
              />
              <button type="submit" className="btn-glow !py-3 whitespace-nowrap text-sm">
                Join Waitlist
              </button>
            </div>
            <p className="mt-3 text-xs text-gray-400">
              Free forever tier. No credit card required.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-white py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold">SiteSpark AI</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-500">
            <a href="/privacy" className="hover:text-gray-700">Privacy</a>
            <a href="/terms" className="hover:text-gray-700">Terms</a>
            <a href="mailto:support@sitespark.dev" className="hover:text-gray-700">Support</a>
          </div>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} SiteSpark AI
          </p>
        </div>
      </div>
    </footer>
  );
}
