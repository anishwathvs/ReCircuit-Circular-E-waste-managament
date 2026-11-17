import { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';
import { ProductStatus, ValuationStatus } from '@prisma/client';

export const respondToValuation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { accept = true, userRemarks } = req.body;

    const valuation = await prisma.valuation.findUnique({
      where: { productId },
      include: { product: true },
    });

    if (!valuation) {
      res.status(404).json({ message: 'Valuation not found' });
      return;
    }

    const nextValuationStatus = accept ? ValuationStatus.ACCEPTED : ValuationStatus.REJECTED;
    const nextProductStatus = accept ? ProductStatus.IN_REFURBISHMENT : ProductStatus.VALUATION_REJECTED;

    await prisma.$transaction(async (tx) => {
      await tx.valuation.update({
        where: { productId },
        data: {
          status: nextValuationStatus,
          userRemarks,
          approvedAt: new Date(),
        },
      });

      await tx.product.update({
        where: { id: productId },
        data: {
          currentStatus: nextProductStatus,
          userPayoutAmount: accept ? valuation.userPayoutProposed : 0,
        },
      });

      await tx.productHistory.create({
        data: {
          productId,
          stepNumber: 5,
          title: accept ? 'Valuation Accepted by User' : 'Valuation Rejected by User',
          description: accept
            ? `User approved proposed payout of ₹${valuation.userPayoutProposed.toLocaleString('en-IN')}. Device queued for refurbishment.`
            : `User rejected proposed payout. Remarks: "${userRemarks || 'None provided'}".`,
          actorName: req.user?.name || 'User',
          actorRole: 'USER',
        },
      });
    });

    res.json({ message: `Valuation ${accept ? 'accepted' : 'rejected'} successfully` });
  } catch (error: any) {
    res.status(500).json({ message: 'Error processing valuation response', error: error.message });
  }
};

