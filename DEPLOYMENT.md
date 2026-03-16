# 🚀 SiteSpark AI — Deployment & Operations Guide

## Step-by-Step Launch Checklist

### Phase 1: Accounts Setup (30 min)

1. **Supabase** — https://supabase.com (free tier)
   - Create project → copy URL + anon key + service role key
   - Run `supabase/schema.sql` in SQL Editor
   - Enable Google OAuth in Auth → Providers
   - Set redirect URL: `https://yourdomain.com/auth/callback`

2. **Stripe** — https://stripe.com
   - Create account → get test keys
   - Create Product: "SiteSpark Pro" → $19/year recurring
   - Copy the Price ID → `STRIPE_PRICE_ID`
   - Set up webhook endpoint: `https://yourdomain.com/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`

3. **Porkbun** — https://porkbun.com/api
   - Create account → API Access → generate API key + secret
   - Test with: `POST https://porkbun.com/api/json/v3/ping`

4. **OpenAI** — https://platform.openai.com
   - Create API key → set $10/mo spending limit (safety)
   - Model: gpt-4o-mini (~$0.001 per website generation)

5. **Vercel** — https://vercel.com
   - Connect GitHub repo
   - Add all environment variables
   - Deploy

### Phase 2: Deploy (15 min)

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial SiteSpark AI MVP"
git remote add origin https://github.com/YOU/sitespark-ai.git
git push -u origin main

# 2. Deploy to Vercel
npx vercel --prod

# 3. Configure custom domain in Vercel
# Add sitespark.dev → Vercel project settings → Domains

# 4. Set up Stripe webhook
stripe listen --forward-to https://sitespark.dev/api/billing/webhook
```

### Phase 3: Test Everything (20 min)

```
✅ Landing page loads
✅ AI generation works (try "yoga studio")
✅ Builder editor updates live preview
✅ Auth flow: magic link + Google OAuth
✅ Stripe checkout → Pro upgrade
✅ Domain search returns results
✅ Published site renders at /sites/[slug]
✅ Dashboard shows sites + stats
✅ Mobile responsive on all pages
```

### Phase 4: Launch Marketing (Week 1)

**Reddit (highest ROI for solo founders):**
- r/SideProject — "I built an AI website builder in 2 weeks"
- r/webdev — "Show HN: SiteSpark — AI generates one-page sites"
- r/Entrepreneur — Launch story
- r/freelance — "Built this for freelancers who need a quick portfolio"

**Twitter/X:**
- Build in public thread
- Demo GIF: type prompt → website appears
- Tag @pabormus @levelsio @marc_louvion (indie hacker community)

**Product Hunt:**
- Schedule launch for Tuesday 12:01 AM PST
- Prepare 5 GIFs showing the builder
- Pre-gather 20 supporters from Twitter

---

## 💰 Realistic Cost Breakdown

### Month 1 (0-500 users)
| Service | Cost |
|---------|------|
| Vercel (Hobby) | $0 |
| Supabase (Free) | $0 |
| OpenAI (est. 200 generations) | $0.20 |
| Porkbun API | $0 (users pay for domains) |
| Stripe (2.9% + 30¢ per txn) | Per-transaction |
| **Total** | **~$0.20** |

### Month 6 (5K-10K users)
| Service | Cost |
|---------|------|
| Vercel (Pro) | $20 |
| Supabase (Pro) | $25 |
| OpenAI (5K generations) | $5 |
| BunnyCDN | $10 |
| **Total** | **~$60** |

### Revenue vs Cost
- 200 paying users × $19/yr = $3,800/yr = **$316/mo revenue**
- $60/mo cost = **$256/mo profit** at just 200 paid users
- Break-even: ~4 paid users

---

## 🔧 Ongoing Operations (Actual Time Required)

### Weekly (15-30 min/week, NOT 2 min)
- Check Stripe dashboard for revenue
- Review Supabase for errors
- Check OpenAI usage/costs
- Respond to support emails (real ones, not AI-handled)

### Monthly (2-4 hours/month)
- Update dependencies (`npm audit fix`)
- Review analytics — what templates are popular?
- Write 1-2 blog posts for SEO
- Engage on Twitter/Reddit

### Quarterly (half day)
- Review pricing strategy
- Plan next features based on user feedback
- Tax preparation (consult a CPA!)

---

## ⚠️ Legal Requirements (Don't Skip These)

1. **Privacy Policy** — Required by law if collecting emails
   - Use a generator: termly.io or iubenda.com
   
2. **Terms of Service** — Protect yourself from liability
   
3. **Cookie Consent** — Required for EU visitors (GDPR)
   
4. **Tax Registration** — Consult a CPA for your state/country
   - Stripe sends 1099-K if you earn >$600/yr (US)
   
5. **Domain Registration** — When purchasing on behalf of users:
   - You are the registrar reseller
   - Must comply with ICANN policies
   - Porkbun handles most compliance

---

## 📊 Metrics to Track

| Metric | Target Month 1 | Target Month 6 |
|--------|----------------|----------------|
| Signups | 200 | 5,000 |
| Paid conversions | 4 (2%) | 200 (4%) |
| MRR | $6.33 | $316 |
| Churn | <5%/mo | <3%/mo |
| Sites published | 50 | 2,000 |
| AI generations | 200 | 5,000 |

---

## 🛡️ Security Checklist

- [x] RLS enabled on all Supabase tables
- [x] API routes check auth before mutations
- [x] Stripe webhook signature verification
- [x] Porkbun API keys server-side only
- [x] OpenAI key server-side only
- [x] Content sanitization (sanitize-html)
- [ ] Rate limiting on API routes (add `next-rate-limit`)
- [ ] CAPTCHA on waitlist form (add hCaptcha)
- [ ] CSP headers (add to next.config.ts)
