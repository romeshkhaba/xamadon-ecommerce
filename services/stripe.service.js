import Stripe from 'stripe';
import { AppError } from '../middleware/error-response.js';

const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif',
  'clp',
  'djf',
  'gnf',
  'jpy',
  'kmf',
  'krw',
  'mga',
  'pyg',
  'rwf',
  'ugx',
  'vnd',
  'vuv',
  'xaf',
  'xof',
  'xpf',
]);

let stripeClient;

function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new AppError('Stripe is not configured. Set STRIPE_SECRET_KEY.', 500);
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

export function constructWebhookEvent(payload, signature) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new AppError('Stripe webhook is not configured. Set STRIPE_WEBHOOK_SECRET.', 500);
  }

  return getStripeClient().webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

function getReturnUrl() {
  if (process.env.STRIPE_CHECKOUT_RETURN_URL) {
    return process.env.STRIPE_CHECKOUT_RETURN_URL;
  }

  const clientUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';

  return `${clientUrl.replace(/\/$/, '')}/checkout/return?session_id={CHECKOUT_SESSION_ID}`;
}

function toStripeAmount(value, currency) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError('Stripe checkout total must be greater than zero', 400);
  }

  return ZERO_DECIMAL_CURRENCIES.has(currency)
    ? Math.round(amount)
    : Math.round(amount * 100);
}

function buildLineItems(items, currency) {
  return items.map((item) => ({
    price_data: {
      currency,
      product_data: {
        name: item.productName,
      },
      unit_amount: toStripeAmount(item.unitPrice, currency),
    },
    quantity: item.quantity,
  }));
}

export async function createEmbeddedCheckoutSession({ order, user }) {
  const stripe = getStripeClient();
  const currency = order.currency.toLowerCase();
  const metadata = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
  };

  return stripe.checkout.sessions.create({
    mode: 'payment',
    ui_mode: 'embedded_page',
    line_items: buildLineItems(order.items ?? [], currency),
    client_reference_id: order.id,
    customer_email: user.email,
    return_url: getReturnUrl(),
    metadata,
    payment_intent_data: {
      metadata,
    },
  });
}

export async function retrieveCheckoutSession(sessionId) {
  return getStripeClient().checkout.sessions.retrieve(sessionId);
}
