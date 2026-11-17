import crypto from 'crypto';
import { prisma } from '../config/db.js';

const PAYMENT_WEBHOOK_SECRET = process.env.PAYMENT_WEBHOOK_SECRET || 'recircuit-sandbox-webhook-secret-2026';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_recircuit_sandbox';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_sandbox_mock';

export interface PaymentIntentResult {
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCEEDED';
  gatewayKeyId: string;
}

export const createPaymentIntent = async (
  amount: number,
  orderId: string,
  currency: string = 'INR'
): Promise<PaymentIntentResult> => {
  // In sandbox / test mode:
  const paymentIntentId = `pi_test_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    paymentIntentId,
    amount,
    currency,
    status: 'PENDING',
    gatewayKeyId: RAZORPAY_KEY_ID,
  };
};

export const verifyWebhookSignature = (
  rawBody: string,
  signatureHeader: string
): boolean => {
  if (!signatureHeader) return false;
  // Compute HMAC SHA256 signature
  const expectedSignature = crypto
    .createHmac('sha256', PAYMENT_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  // Secure constant-time comparison
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader),
      Buffer.from(expectedSignature)
    );
  } catch {
    // Length mismatch
    return false;
  }
};

/**
 * Idempotent Disbursal of User Payout
 * Prevents duplicate payout processing by enforcing unique idempotency key
 */
export const processUserPayoutSafely = async (
  userId: string,
  productId: string,
  amount: number,
  idempotencyKey: string
): Promise<{ success: boolean; payout: any; alreadyProcessed: boolean }> => {
  // 1. Check if payout with this idempotency key already exists
  const existing = await prisma.userPayout.findUnique({
    where: { idempotencyKey },
  });

  if (existing) {
    return {
      success: true,
      payout: existing,
      alreadyProcessed: true,
    };
  }

  // 2. Perform atomic transaction
  const payout = await prisma.$transaction(async (tx) => {
    // Check if product already has payout
    const prod = await tx.product.findUnique({
      where: { id: productId },
      include: { payout: true },
    });

    if (prod?.payout) {
      return prod.payout;
    }

    const created = await tx.userPayout.create({
      data: {
        userId,
        productId,
        amount,
        status: 'COMPLETED',
        paymentMethod: 'Instant UPI / Direct Bank Transfer',
        transactionRef: `UTR-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        idempotencyKey,
        paidAt: new Date(),
      },
    });

    return created;
  });

  return {
    success: true,
    payout,
    alreadyProcessed: false,
  };
};

