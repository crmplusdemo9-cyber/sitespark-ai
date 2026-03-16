# 🚀 SiteSpark AI — One-Page Website Builder MVP

## Realistic Business Plan
- **Target**: $2-5K MRR in 6 months
- **Model**: Freemium — Free tier (subdomain) → $19/yr Pro (custom domain)
- **Stack**: Next.js 15 + Supabase + Stripe + Porkbun API
- **Hosting**: Vercel Free → Pro ($20/mo when needed)
- **Total Cost**: ~$25/mo at launch

## What This MVP Includes
1. ✅ Landing page with waitlist
2. ✅ AI website builder (template + GPT content generation)
3. ✅ 12 professional templates (glassmorphism, minimal, bold)
4. ✅ Live drag-and-drop editor
5. ✅ Porkbun domain purchase integration
6. ✅ Stripe subscription billing
7. ✅ Supabase auth + database
8. ✅ Auto-deploy sites to subdomain (yourname.sitespark.dev)
9. ✅ Mobile-responsive output
10. ✅ Basic analytics dashboard

## Setup Instructions

### 1. Clone & Install
```bash
git clone <this-repo>
cd sitespark-ai
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
OPENAI_API_KEY=sk-...
PORKBUN_API_KEY=pk1_...
PORKBUN_SECRET_KEY=sk1_...
```

### 3. Database Setup
Run the SQL in `supabase/schema.sql` in your Supabase SQL editor.

### 4. Run Locally
```bash
npm run dev
```

### 5. Deploy
```bash
npx vercel --prod
```

## Architecture
```
sitespark-ai/
├── app/                    # Next.js 15 App Router
│   ├── page.tsx           # Landing page
│   ├── layout.tsx         # Root layout
│   ├── builder/           # Website builder
│   ├── dashboard/         # User dashboard
│   ├── api/               # API routes
│   │   ├── generate/      # AI content generation
│   │   ├── domains/       # Porkbun integration
│   │   ├── billing/       # Stripe webhooks
│   │   └── publish/       # Site publishing
│   └── sites/[slug]/      # Published sites
├── components/            # Reusable UI components
├── lib/                   # Utilities & clients
├── templates/             # Website templates
├── supabase/              # Database schema
└── public/                # Static assets
```

## Revenue Projections (Realistic)
- Month 1: 200 users, 4 paid → $76 MRR
- Month 3: 2K users, 80 paid → $1,520 MRR
- Month 6: 8K users, 320 paid → $6,080 MRR
- Month 12: 25K users, 1K paid → $19,000 MRR

## Cost at Scale
| Item | Month 1 | Month 6 | Month 12 |
|------|---------|---------|----------|
| Vercel | $0 | $20 | $20 |
| Supabase | $0 | $25 | $25 |
| OpenAI | $5 | $50 | $200 |
| Porkbun domains | $0 | $0 | $0 (user pays) |
| BunnyCDN | $0 | $10 | $20 |
| **Total** | **$5** | **$105** | **$265** |
