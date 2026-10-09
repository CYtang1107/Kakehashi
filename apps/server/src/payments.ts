import Stripe from 'stripe';

// Payments run on Stripe in TEST mode only. Live keys are refused on purpose:
// this pilot never moves real money. Without a key, checkout runs in demo mode.

const key = () => process.env.STRIPE_SECRET_KEY?.trim() ?? '';

export function paymentsMode(): 'stripe-test' | 'demo' {
  const k = key();
  if (!k) return 'demo';
  if (!k.startsWith('sk_test_')) {
    console.warn('STRIPE_SECRET_KEY is not a test key (sk_test_...). Payments stay in demo mode.');
    return 'demo';
  }
  return 'stripe-test';
}

const stripe = () => new Stripe(key());

export async function createCheckout(opts: { amountJpy: number; planName: string; homeId: string; planId: string; resaleCreditJpy: number; baseUrl: string }) {
  const session = await stripe().checkout.sessions.create({
    mode: 'payment',
    line_items: [{
      quantity: 1,
      price_data: {
        currency: 'jpy',
        unit_amount: opts.amountJpy,
        product_data: {
          name: `KAKEHASHI ${opts.planName} (first month)`,
          description: opts.resaleCreditJpy > 0 ? `Includes a resale credit of ¥${opts.resaleCreditJpy.toLocaleString('en-US')}` : undefined,
        },
      },
    }],
    metadata: { homeId: opts.homeId, planId: opts.planId, resaleCreditJpy: String(opts.resaleCreditJpy) },
    success_url: `${opts.baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${opts.baseUrl}/payment/cancel`,
  });
  return session.url as string;
}

export async function readCheckout(sessionId: string) {
  const s = await stripe().checkout.sessions.retrieve(sessionId);
  return {
    paid: s.payment_status === 'paid',
    amountJpy: s.amount_total ?? 0,
    homeId: s.metadata?.homeId ?? '',
    planId: s.metadata?.planId ?? '',
    resaleCreditJpy: Number(s.metadata?.resaleCreditJpy ?? 0),
  };
}
