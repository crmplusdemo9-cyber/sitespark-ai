import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    features: [
      "1 published site",
      "SiteSpark subdomain",
      "Basic templates",
      "SiteSpark branding",
    ],
    limits: {
      sites: 1,
      customDomain: false,
      removeBranding: false,
      analytics: false,
    },
  },
  pro: {
    name: "Pro",
    price: 1900, // $19.00 in cents
    priceId: process.env.STRIPE_PRICE_ID,
    features: [
      "Unlimited sites",
      "Custom domain ($8-12/yr extra)",
      "All premium templates",
      "No SiteSpark branding",
      "Basic analytics",
      "Priority support",
    ],
    limits: {
      sites: 50,
      customDomain: true,
      removeBranding: true,
      analytics: true,
    },
  },
} as const;

export type PlanType = keyof typeof PLANS;

export async function createCheckoutSession(
  userId: string,
  email: string,
  returnUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    metadata: { userId },
    line_items: [
      {
        price: PLANS.pro.priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${returnUrl}?success=true`,
    cancel_url: `${returnUrl}?canceled=true`,
    subscription_data: {
      metadata: { userId },
    },
  });

  return session;
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  return session;
}
