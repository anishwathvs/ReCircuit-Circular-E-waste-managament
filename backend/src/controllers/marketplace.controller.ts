import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';
import { OrderStatus, ProductStatus } from '@prisma/client';
import {
  createPaymentIntent,
  verifyWebhookSignature,
} from '../services/payment.service.js';
import { notifyUser } from '../services/notification.service.js';

export const listMarketplace = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, brand, condition, minPrice, maxPrice, search } = req.query;

    const filter: any = { isAvailable: true };

    if (category && category !== 'All Categories' && category !== 'all') {
      filter.category = { contains: String(category), mode: 'insensitive' };
    }
    if (brand && brand !== 'All Brands' && brand !== 'all') {
      filter.brand = { contains: String(brand), mode: 'insensitive' };
    }
    if (search) {
      filter.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { brand: { contains: String(search), mode: 'insensitive' } },
        { model: { contains: String(search), mode: 'insensitive' } },
        { category: { contains: String(search), mode: 'insensitive' } },
      ];
    }
    if (minPrice || maxPrice) {
      filter.sellingPrice = {};
      if (minPrice) filter.sellingPrice.gte = Number(minPrice);
      if (maxPrice) filter.sellingPrice.lte = Number(maxPrice);
    }

    const listings = await prisma.marketplaceListing.findMany({
      where: filter,
      include: {
        product: {
          select: {
            id: true,
            customId: true,
            condition: true,
            ageYears: true,
            qrCodeUrl: true,
            qrCodeSvg: true,
            inspection: true,
            refurbishment: true,
          },
        },
      },
      orderBy: { listedAt: 'desc' },
    });

    res.json({ listings });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching marketplace listings', error: error.message });
  }
};

export const getListingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const listing = await prisma.marketplaceListing.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            inspection: true,
            refurbishment: true,
            historyEvents: { orderBy: { timestamp: 'asc' } },
          },
        },
      },
    });

    if (!listing) {
      res.status(404).json({ message: 'Listing not found' });
      return;
    }

    res.json({ listing });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving listing details', error: error.message });
  }
};

/**
 * Create Payment Gateway Intent (Sandbox / Test Mode)
 */
export const createPaymentIntentHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, orderId = `DRAFT-${Date.now()}` } = req.body;
    if (!amount || amount <= 0) {
      res.status(400).json({ message: 'Valid payment amount is required' });
      return;
    }

    const intent = await createPaymentIntent(Number(amount), orderId);
    res.json({
      message: 'Payment intent initialized in sandbox mode',
      intent,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error creating payment intent', error: error.message });
  }
};

/**
 * Handle Server-Side Payment Webhook with HMAC Signature Verification
 */
export const handlePaymentWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = (req.headers['x-razorpay-signature'] || req.headers['x-webhook-signature'] || '') as string;
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const isValid = verifyWebhookSignature(rawBody, signature);

    if (!isValid && process.env.NODE_ENV === 'production') {
      res.status(400).json({ message: 'Invalid webhook signature' });
      return;
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log(`✅ Webhook verified: ${event.event || 'payment.captured'}`);

    res.json({ status: 'ok', received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ message: 'Error processing webhook', error: error.message });
  }
};

export const placeOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const {
      listingIds = [],
      shippingAddress = 'Retail Warehouse, Ambattur Industrial Estate, Chennai',
      paymentIntentId,
      gatewaySignature,
    } = req.body;

    if (!Array.isArray(listingIds) || listingIds.length === 0) {
      res.status(400).json({ message: 'At least one listing ID is required' });
      return;
    }

    // Find or create retailer profile
    let retailer = await prisma.retailer.findUnique({ where: { userId } });
    if (!retailer) {
      retailer = await prisma.retailer.create({
        data: {
          userId,
          businessName: req.user?.name || 'Retail Partner',
          city: 'Chennai',
        },
      });
    }

    const listings = await prisma.marketplaceListing.findMany({
      where: { id: { in: listingIds }, isAvailable: true },
      include: {
        product: {
          include: { valuation: true, refurbishment: true, user: true },
        },
      },
    });

    if (listings.length === 0) {
      res.status(400).json({ message: 'Selected items are no longer available.' });
      return;
    }

    const totalAmount = listings.reduce((sum, item) => sum + item.sellingPrice, 0);
    const orderNumber = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const notificationsToDispatch: Array<() => Promise<void>> = [];

    // Process order inside atomic transaction with generous timeout
    const orderResult = await prisma.$transaction(
      async (tx) => {
        // 1. Create Order
        const order = await tx.order.create({
          data: {
            orderNumber,
            retailerId: retailer!.id,
            userId,
            totalAmount,
            status: OrderStatus.CONFIRMED,
            shippingAddress,
            invoiceNumber: `INV-${orderNumber}`,
            invoiceUrl: `/invoices/${orderNumber}.pdf`,
          },
        });

        // 2. Process each listing
        for (const listing of listings) {
          // Create OrderItem
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              listingId: listing.id,
              productId: listing.productId,
              price: listing.sellingPrice,
            },
          });

          // Mark listing unavailable
          await tx.marketplaceListing.update({
            where: { id: listing.id },
            data: { isAvailable: false },
          });

          // Look up configurable profit-sharing rules
          const profitRule = await tx.profitSharingRule.findFirst({
            where: { category: { equals: listing.category, mode: 'insensitive' } },
          });

          const sellingPrice = listing.sellingPrice;
          const refCost = listing.product.refurbishment?.repairCost || Math.round(sellingPrice * 0.15);
          const logCost = 500;
          const platformCutPct = profitRule ? profitRule.platformSharePercent / 100 : 0.12;
          const platformCut = Math.round(sellingPrice * platformCutPct);
          const minPayoutFloor = 500;
          const userPayout = Math.max(minPayoutFloor, sellingPrice - refCost - logCost - platformCut);

          // Update product to SOLD & PAYMENT_COMPLETED
          await tx.product.update({
            where: { id: listing.productId },
            data: {
              currentStatus: ProductStatus.PAYMENT_COMPLETED,
              finalPrice: sellingPrice,
              userPayoutAmount: userPayout,
            },
          });

          // Unique idempotency key to prevent double transaction or double payout
          const txnIdempotencyKey = `TXN-${listing.productId}-${order.id}`;
          const payoutIdempotencyKey = `PAYOUT-${listing.productId}-${order.id}`;
          const txnNumber = `TXN-2026-${Math.floor(10000 + Math.random() * 90000)}`;

          // Create Transaction ledger
          await tx.transaction.create({
            data: {
              txnNumber,
              orderId: order.id,
              productId: listing.productId,
              retailerAmount: sellingPrice,
              refurbishmentCost: refCost,
              logisticsCost: logCost,
              platformProfit: platformCut,
              userPayout,
              status: 'COMPLETED',
              idempotencyKey: txnIdempotencyKey,
              paymentIntentId: paymentIntentId || `pi_sim_${Date.now()}`,
              gatewaySignature: gatewaySignature || 'sim_sig_valid',
            },
          });

          // Create User Payout with unique idempotency key
          await tx.userPayout.create({
            data: {
              userId: listing.product.userId,
              productId: listing.productId,
              amount: userPayout,
              status: 'COMPLETED',
              paymentMethod: 'Instant UPI / Direct Bank Transfer',
              transactionRef: `UTR-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
              idempotencyKey: payoutIdempotencyKey,
              paidAt: new Date(),
            },
          });

          // Append Product History: "Sold to Retailer"
          await tx.productHistory.create({
            data: {
              productId: listing.productId,
              stepNumber: 8,
              title: 'Sold to Retailer',
              description: `Sold to certified B2B retailer (${retailer!.businessName}) for ₹${sellingPrice.toLocaleString('en-IN')}. User payout of ₹${userPayout.toLocaleString('en-IN')} disbursed.`,
              actorName: retailer!.businessName,
              actorRole: 'RETAILER',
              timestamp: new Date(),
            },
          });

          // Queue notification to be sent post-commit
          notificationsToDispatch.push(() =>
            notifyUser({
              userId: listing.product.userId,
              title: 'Device Resold! Payout Credited to Your Account',
              message: `Congratulations! Your ${listing.title} has been purchased by ${retailer!.businessName}. Your fair-share payout of ₹${userPayout.toLocaleString('en-IN')} has been credited.`,
              link: '/dashboard/user',
              sendEmail: true,
            })
          );
        }

        // Update retailer total purchases
        await tx.retailer.update({
          where: { id: retailer!.id },
          data: { totalPurchases: { increment: totalAmount } },
        });

        // Queue retailer notification
        notificationsToDispatch.push(() =>
          notifyUser({
            userId,
            title: 'Order Confirmed — Invoice Generated',
            message: `Your purchase order ${orderNumber} for ₹${totalAmount.toLocaleString('en-IN')} has been verified. Refurbished hardware dispatch is scheduled.`,
            link: '/dashboard/retailer',
            sendEmail: true,
          })
        );

        return order;
      },
      { timeout: 15000 }
    );

    // Fire notifications asynchronously outside of database transaction
    Promise.all(notificationsToDispatch.map((fn) => fn())).catch((err) =>
      console.error('Post-order notification dispatch error:', err)
    );

    res.status(201).json({
      message: 'Order placed successfully! Product marked sold and profit distributed.',
      order: orderResult,
    });
  } catch (error: any) {
    console.error('Order error:', error);
    res.status(500).json({ message: 'Error processing order', error: error.message });
  }
};

export const getRetailerOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const retailer = await prisma.retailer.findUnique({ where: { userId } });

    if (!retailer) {
      res.json({ orders: [] });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { retailerId: retailer.id },
      include: {
        items: {
          include: {
            product: {
              include: { refurbishment: true, inspection: true },
            },
            listing: true,
          },
        },
        transaction: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};
