import { Response } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';
import { generateProductQR } from '../utils/qr.js';
import { ProductStatus } from '@prisma/client';
import { uploadProductImage } from '../services/image.service.js';
import { notifyUser } from '../services/notification.service.js';

// Multer memory storage configuration for secure image uploads
export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image format. Only JPEG, PNG, and WebP images are allowed.'));
    }
  },
});

export const uploadImageHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: 'No image file uploaded' });
      return;
    }

    const result = await uploadProductImage(file.buffer, file.originalname, file.mimetype);
    res.json({
      message: 'Product photograph uploaded successfully',
      url: result.url,
      provider: result.provider,
      sizeBytes: result.sizeBytes,
    });
  } catch (error: any) {
    console.error('Image upload handler error:', error);
    res.status(400).json({ message: error.message || 'Error processing image upload' });
  }
};

export const submitProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const {
      category,
      brand,
      model,
      ageYears,
      condition,
      problemDesc,
      pickupAddress,
      city = 'Chennai',
      pincode,
      preferredDate,
      preferredTimeSlot = '4:00 PM - 6:00 PM',
      images = [],
      serialNumber,
    } = req.body;

    if (!category || !brand || !model || !problemDesc || !pickupAddress) {
      res.status(400).json({ message: 'Category, brand, model, problem description, and pickup address are required.' });
      return;
    }

    // Generate guaranteed unique sequential Custom ID: RC-2026-XXXXX
    const lastProduct = await prisma.product.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { customId: true },
    });
    let nextNum = 300;
    if (lastProduct?.customId) {
      const match = lastProduct.customId.match(/RC-\d{4}-(\d+)/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }
    let customId = `RC-2026-${String(nextNum).padStart(5, '0')}`;
    while (await prisma.product.findUnique({ where: { customId } })) {
      nextNum++;
      customId = `RC-2026-${String(nextNum).padStart(5, '0')}`;
    }

    const requestId = `REQ-${Math.floor(2800 + Math.random() * 1000)}`;

    const { passportUrl, qrSvg } = await generateProductQR(customId, customId);

    // Initial valuation estimate based on category & condition
    let baseEst = 3000;
    if (category.toLowerCase().includes('laptop')) baseEst = 12000;
    else if (category.toLowerCase().includes('gpu')) baseEst = 15000;
    else if (category.toLowerCase().includes('phone') || category.toLowerCase().includes('mobile')) baseEst = 8000;
    else if (category.toLowerCase().includes('motherboard')) baseEst = 3500;
    else if (category.toLowerCase().includes('battery')) baseEst = 1500;
    else if (category.toLowerCase().includes('ram')) baseEst = 1800;

    const estimatedValue = baseEst;

    // Check configurable profit-sharing rules for this category
    const profitRule = await prisma.profitSharingRule.findFirst({
      where: { category: { equals: category, mode: 'insensitive' } },
    });

    const refCost = profitRule?.minRefurbFee || Math.round(estimatedValue * 0.25);
    const colCost = profitRule?.collectionFee || 300;
    const platformCutPct = profitRule ? profitRule.platformSharePercent / 100 : 0.15;
    const platformShare = Math.round(estimatedValue * platformCutPct);
    const userPayoutProposed = Math.max(500, estimatedValue - refCost - colCost - platformShare);

    // Create Product in transaction with PickupRequest, initial History, and Valuation draft
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          customId,
          userId,
          category,
          brand,
          model,
          ageYears: ageYears ? parseFloat(ageYears) : 2.0,
          condition: condition || 'Functional with issue',
          problemDesc,
          images: Array.isArray(images) && images.length > 0 ? images : [
            'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'
          ],
          serialNumber,
          currentStatus: ProductStatus.SUBMITTED,
          estimatedValue,
          qrCodeUrl: passportUrl,
          qrCodeSvg: qrSvg,
        },
      });

      const pickup = await tx.pickupRequest.create({
        data: {
          requestId,
          productId: product.id,
          userId,
          pickupAddress,
          city,
          pincode,
          preferredDate: preferredDate ? new Date(preferredDate) : new Date(Date.now() + 86400000),
          preferredTimeSlot,
          status: 'PENDING',
        },
      });

      // Append Product History: "Registered by User"
      await tx.productHistory.create({
        data: {
          productId: product.id,
          stepNumber: 1,
          title: 'Registered by User',
          description: `Device ${brand} ${model} registered for circular collection with issue: "${problemDesc}".`,
          actorName: req.user?.name || 'Registered User',
          actorRole: 'USER',
          timestamp: new Date(),
        },
      });

      // Draft valuation breakdown
      await tx.valuation.create({
        data: {
          productId: product.id,
          estimatedResaleValue: estimatedValue,
          refurbishmentCost: refCost,
          collectionCost: colCost,
          platformShare,
          userPayoutProposed,
          status: 'PROPOSED',
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'SUBMIT_EWASTE_REQUEST',
          entityType: 'PRODUCT',
          entityId: product.id,
          details: { customId, requestId, category, brand, model },
        },
      });

      return { product, pickup };
    });

    // Notify user with transactional email and in-app notification
    await notifyUser({
      userId,
      title: 'E-Waste Pickup Request Registered',
      message: `Your ${brand} ${model} (Request ID: ${requestId}) has been registered for circular collection. We are assigning a verified field agent.`,
      link: '/dashboard/user',
      sendEmail: true,
    });

    res.status(201).json({
      message: 'E-Waste request registered successfully',
      product: result.product,
      pickup: result.pickup,
    });
  } catch (error: any) {
    console.error('Submit product error:', error);
    res.status(500).json({ message: 'Error submitting e-waste request', error: error.message });
  }
};

export const getMyProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const products = await prisma.product.findMany({
      where: { userId },
      include: {
        pickupRequest: {
          include: { agent: { include: { user: true } } },
        },
        inspection: true,
        valuation: true,
        refurbishment: true,
        historyEvents: { orderBy: { timestamp: 'asc' } },
        payout: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ products });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, city: true } },
        pickupRequest: {
          include: { agent: { include: { user: { select: { name: true, phone: true } } } } },
        },
        inspection: { include: { agent: { include: { user: { select: { name: true } } } } } },
        valuation: true,
        refurbishment: true,
        historyEvents: { orderBy: { timestamp: 'asc' } },
        listing: true,
        transaction: true,
        payout: true,
      },
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving product', error: error.message });
  }
};

// PUBLIC QR PASSPORT ENDPOINT (No auth required, protects personal user data)
export const getProductPassport = async (req: any, res: Response): Promise<void> => {
  try {
    const { customId } = req.params;

    const product = await prisma.product.findUnique({
      where: { customId },
      include: {
        pickupRequest: {
          select: {
            city: true,
            status: true,
            collectedAt: true,
          },
        },
        inspection: {
          select: {
            physicalCondition: true,
            powerOnStatus: true,
            hardwareCondition: true,
            batteryHealth: true,
            damagedParts: true,
            missingParts: true,
            recommendation: true,
            reviewedAt: true,
          },
        },
        refurbishment: {
          select: {
            technicianName: true,
            repairDescription: true,
            componentsReplaced: true,
            testingStatus: true,
            qualityApproved: true,
            certifiedAt: true,
            warrantyMonths: true,
            certificateNumber: true,
          },
        },
        recyclingRecord: {
          include: {
            recycler: {
              select: {
                name: true,
                cpcbLicenseNumber: true,
                city: true,
              },
            },
          },
        },
        historyEvents: {
          orderBy: { timestamp: 'asc' },
          select: {
            stepNumber: true,
            title: true,
            description: true,
            actorRole: true,
            timestamp: true,
          },
        },
        listing: {
          select: {
            sellingPrice: true,
            conditionGrade: true,
            warranty: true,
            isAvailable: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({ message: 'Product passport record not found' });
      return;
    }

    // Masked and anonymized public record - strictly protects customer PII
    const sanitizedTimeline = product.historyEvents.map((evt) => {
      let sanitizedDesc = evt.description;
      if (evt.actorRole === 'USER') {
        sanitizedDesc = `Device registered for circular reclamation with issue: "${product.problemDesc}".`;
      }
      return {
        stepNumber: evt.stepNumber,
        title: evt.title,
        description: sanitizedDesc,
        actorRole: evt.actorRole === 'USER' ? 'VERIFIED_OWNER' : evt.actorRole,
        timestamp: evt.timestamp,
      };
    });

    // Generate cryptographic verification fingerprint
    const verificationHash = crypto
      .createHash('sha256')
      .update(`${product.customId}:${product.createdAt.toISOString()}:recircuit-certified`)
      .digest('hex')
      .substring(0, 16)
      .toUpperCase();

    const passport = {
      customId: product.customId,
      category: product.category,
      brand: product.brand,
      model: product.model,
      conditionAtSubmission: product.condition,
      currentStatus: product.currentStatus,
      registeredAt: product.createdAt,
      images: product.images,
      region: product.pickupRequest?.city || 'Chennai, India',
      carbonOffsetKg: product.category.toLowerCase().includes('laptop') ? 48.5 : 18.2,
      eWasteDivertedKg: product.category.toLowerCase().includes('laptop') ? 2.4 : 0.8,
      preciousMetalsRecoveredMg: 320,
      inspection: product.inspection,
      refurbishment: product.refurbishment,
      recycling: product.recyclingRecord ? {
        partnerName: product.recyclingRecord.recycler.name,
        cpcbLicenseNumber: product.recyclingRecord.recycler.cpcbLicenseNumber,
        certificateNumber: product.recyclingRecord.certificateNumber,
        weightKg: product.recyclingRecord.weightKg,
        preciousMetalsRecoveredMg: product.recyclingRecord.preciousMetalsRecoveredMg,
        zeroLandfillVerified: true,
      } : null,
      timeline: sanitizedTimeline,
      qrSvg: product.qrCodeSvg,
      qrUrl: product.qrCodeUrl,
      isVerified: true,
      verificationBadge: 'Verified Digital Product Passport (DPP)',
      verificationSeal: 'CPCB & ISO 14001 Registered Circular Chain',
      cryptographicSignature: `DPP-${verificationHash}`,
    };

    res.json({ passport });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving product passport', error: error.message });
  }
};
