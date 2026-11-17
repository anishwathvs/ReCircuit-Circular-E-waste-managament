import { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';
import { ProductStatus, InspectionRecommendation } from '@prisma/client';
import { notifyUser } from '../services/notification.service.js';

export const submitInspection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const agent = await prisma.agent.findUnique({ where: { userId } });

    if (!agent && req.user?.role !== 'ADMIN') {
      res.status(403).json({ message: 'Only collection agents or admins can submit inspections' });
      return;
    }

    const {
      productId,
      physicalCondition = 'Scratched',
      powerOnStatus = true,
      hardwareCondition = 'Faulty',
      batteryHealth = 82,
      damagedParts = [],
      missingParts = [],
      recommendation = 'REFURBISH',
      inspectionNotes,
      photos = [],
      estimatedResaleValue,
    } = req.body;

    if (!productId) {
      res.status(400).json({ message: 'productId is required' });
      return;
    }

    const effectiveAgentId = agent ? agent.id : (await prisma.agent.findFirst())?.id;
    if (!effectiveAgentId) {
      res.status(400).json({ message: 'No valid agent found for inspection' });
      return;
    }

    const parsedRecommendation = recommendation === 'RECYCLE' 
      ? InspectionRecommendation.RECYCLE 
      : InspectionRecommendation.REFURBISH;

    const result = await prisma.$transaction(async (tx) => {
      // Upsert Inspection
      const inspection = await tx.inspection.upsert({
        where: { productId },
        create: {
          productId,
          agentId: effectiveAgentId,
          physicalCondition,
          powerOnStatus: Boolean(powerOnStatus),
          hardwareCondition,
          batteryHealth: Number(batteryHealth) || 75,
          damagedParts,
          missingParts,
          recommendation: parsedRecommendation,
          inspectionNotes,
          photos,
          adminApproved: false,
        },
        update: {
          physicalCondition,
          powerOnStatus: Boolean(powerOnStatus),
          hardwareCondition,
          batteryHealth: Number(batteryHealth) || 75,
          damagedParts,
          missingParts,
          recommendation: parsedRecommendation,
          inspectionNotes,
          photos,
        },
      });

      // Update Product status
      await tx.product.update({
        where: { id: productId },
        data: { currentStatus: ProductStatus.INSPECTED },
      });

      // Update / calculate valuation if provided
      if (estimatedResaleValue) {
        const est = Number(estimatedResaleValue);
        const refCost = parsedRecommendation === 'REFURBISH' ? Math.round(est * 0.22) : 200;
        const colCost = 300;
        const platformShare = Math.round(est * 0.15);
        const userPayoutProposed = Math.max(0, est - refCost - colCost - platformShare);

        await tx.valuation.upsert({
          where: { productId },
          create: {
            productId,
            estimatedResaleValue: est,
            refurbishmentCost: refCost,
            collectionCost: colCost,
            platformShare,
            userPayoutProposed,
            status: 'PROPOSED',
          },
          update: {
            estimatedResaleValue: est,
            refurbishmentCost: refCost,
            collectionCost: colCost,
            platformShare,
            userPayoutProposed,
          },
        });
      }

      // History event: "Inspected & Tested"
      await tx.productHistory.create({
        data: {
          productId,
          stepNumber: 3,
          title: 'Inspected & Tested',
          description: `Device inspected at facility. Battery health: ${batteryHealth}%, Power-on: ${powerOnStatus ? 'Yes' : 'No'}. Recommendation: ${recommendation}.`,
          actorName: req.user?.name || 'Inspection Agent',
          actorRole: 'AGENT',
          timestamp: new Date(),
        },
      });

      return inspection;
    });

    // Notify user that inspection is complete
    const targetProduct = await prisma.product.findUnique({
      where: { id: productId },
      select: { userId: true, brand: true, model: true },
    });

    if (targetProduct) {
      await notifyUser({
        userId: targetProduct.userId,
        title: 'Inspection Completed',
        message: `Diagnostic inspection for your ${targetProduct.brand} ${targetProduct.model} has been completed. Recommendation: ${recommendation}.`,
        link: '/dashboard/user',
        sendEmail: true,
      });
    }

    res.status(201).json({ message: 'Inspection report submitted', inspection: result });
  } catch (error: any) {
    console.error('Inspection error:', error);
    res.status(500).json({ message: 'Error submitting inspection', error: error.message });
  }
};

export const adminApproveInspection = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params; // inspection id
    const { decision = 'APPROVE_REFURBISH' } = req.body; // APPROVE_REFURBISH or ROUTE_RECYCLE

    const inspection = await prisma.inspection.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!inspection) {
      res.status(404).json({ message: 'Inspection not found' });
      return;
    }

    const nextStatus = decision === 'ROUTE_RECYCLE' 
      ? ProductStatus.RECYCLE_PENDING 
      : ProductStatus.VALUATION_PROPOSED;

    await prisma.$transaction(async (tx) => {
      await tx.inspection.update({
        where: { id },
        data: {
          adminApproved: true,
          reviewedAt: new Date(),
        },
      });

      await tx.product.update({
        where: { id: inspection.productId },
        data: { currentStatus: nextStatus },
      });

      await tx.productHistory.create({
        data: {
          productId: inspection.productId,
          stepNumber: 4,
          title: decision === 'ROUTE_RECYCLE' ? 'Routed for Authorized Recycling' : 'Inspection Verified by Admin',
          description: decision === 'ROUTE_RECYCLE'
            ? 'Non-reusable components routed to authorized circular e-waste smelter for zero-landfill raw material recovery.'
            : 'Device inspection passed review. Fair-value estimation prepared for user approval.',
          actorName: req.user?.name || 'Super Admin',
          actorRole: 'ADMIN',
        },
      });
    });

    // Notify user that valuation is ready for review
    await notifyUser({
      userId: inspection.product.userId,
      title: decision === 'ROUTE_RECYCLE' ? 'Device Transitioning to Authorized Recycling' : 'Valuation Ready for Your Approval',
      message: decision === 'ROUTE_RECYCLE'
        ? 'Based on inspection, your device will be routed to a certified zero-landfill e-waste facility.'
        : `Your ${inspection.product.brand} ${inspection.product.model} valuation is ready. Please review and accept your estimated payout in your dashboard.`,
      link: '/dashboard/user',
      sendEmail: true,
    });

    res.json({ message: 'Inspection reviewed successfully', nextStatus });
  } catch (error: any) {
    res.status(500).json({ message: 'Error approving inspection', error: error.message });
  }
};
