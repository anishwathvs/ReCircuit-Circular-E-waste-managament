import { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';
import { ProductStatus } from '@prisma/client';

export const updateRefurbishment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const {
      technicianName = 'Arun Kumar (Lead Hardware Tech)',
      repairDescription,
      componentsReplaced = [],
      repairCost = 1500,
      hardwareTestPassed = true,
      batteryTestPassed = true,
      stressTestPassed = true,
      testingStatus = 'Passed All Diagnostics (MemTest86, FurMark, BatteryCycle)',
    } = req.body;

    if (!repairDescription) {
      res.status(400).json({ message: 'repairDescription is required' });
      return;
    }

    const certNumber = `CERT-RC-${Math.floor(10000 + Math.random() * 90000)}`;

    const ref = await prisma.refurbishment.upsert({
      where: { productId },
      create: {
        productId,
        technicianName,
        repairDescription,
        componentsReplaced,
        repairCost: Number(repairCost),
        hardwareTestPassed,
        batteryTestPassed,
        stressTestPassed,
        testingStatus,
        certificateNumber: certNumber,
      },
      update: {
        technicianName,
        repairDescription,
        componentsReplaced,
        repairCost: Number(repairCost),
        hardwareTestPassed,
        batteryTestPassed,
        stressTestPassed,
        testingStatus,
      },
    });

    await prisma.product.update({
      where: { id: productId },
      data: { currentStatus: ProductStatus.REFURBISHED },
    });

    await prisma.productHistory.create({
      data: {
        productId,
        stepNumber: 6,
        title: 'Refurbished',
        description: `Refurbished by ${technicianName}. Replaced: ${componentsReplaced.join(', ') || 'Internal components restored'}. Diagnostics: ${testingStatus}.`,
        actorName: technicianName,
        actorRole: 'ADMIN',
      },
    });

    res.json({ message: 'Refurbishment log updated', refurbishment: ref });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating refurbishment', error: error.message });
  }
};

export const qualityApprove = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const { warrantyMonths = 6, listDirectly = true, sellingPrice } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { refurbishment: true, valuation: true },
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const price = Number(sellingPrice) || product.valuation?.estimatedResaleValue || 24000;

    const certNumber = `CERT-RC-${Math.floor(10000 + Math.random() * 90000)}`;

    await prisma.$transaction(async (tx) => {
      await tx.refurbishment.upsert({
        where: { productId },
        create: {
          productId,
          technicianName: 'Arun Kumar (Lead Hardware Tech)',
          repairDescription: 'Certified diagnostics, stress testing and quality inspection passed.',
          componentsReplaced: ['Thermal Interface Material', 'Internal Connectors Checked'],
          repairCost: 1200,
          hardwareTestPassed: true,
          batteryTestPassed: true,
          stressTestPassed: true,
          testingStatus: 'Passed All Quality Diagnostics',
          certificateNumber: certNumber,
          qualityApproved: true,
          certifiedAt: new Date(),
          warrantyMonths: Number(warrantyMonths),
        },
        update: {
          qualityApproved: true,
          certifiedAt: new Date(),
          warrantyMonths: Number(warrantyMonths),
        },
      });

      // Update product status
      await tx.product.update({
        where: { id: productId },
        data: {
          currentStatus: listDirectly ? ProductStatus.LISTED_FOR_SALE : ProductStatus.QUALITY_VERIFIED,
          finalPrice: price,
        },
      });

      // If list directly, create or update Marketplace listing
      if (listDirectly) {
        await tx.marketplaceListing.upsert({
          where: { productId },
          create: {
            productId,
            title: `${product.brand} ${product.model}`,
            category: product.category,
            brand: product.brand,
            model: product.model,
            conditionGrade: 'Grade A - Certified Refurbished',
            sellingPrice: price,
            originalPrice: Math.round(price * 1.8),
            specs: {
              category: product.category,
              condition: 'Certified Like-New',
              testingPassed: true,
              testedComponents: ['CPU', 'RAM', 'Storage', 'Battery', 'Display'],
            },
            warranty: `${warrantyMonths} Months ReCircuit Certified Warranty`,
            images: product.images.length > 0 ? product.images : [
              'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'
            ],
            isAvailable: true,
          },
          update: {
            sellingPrice: price,
            isAvailable: true,
          },
        });
      }

      await tx.productHistory.create({
        data: {
          productId,
          stepNumber: 7,
          title: 'Quality Verified & Certified',
          description: `Passed rigorous 32-point hardware QC audit. Certified with ${warrantyMonths}-month warranty and listed on B2B Retailer Hub.`,
          actorName: req.user?.name || 'QA Director',
          actorRole: 'ADMIN',
        },
      });
    });

    res.json({ message: 'Product quality approved and listed for sale!' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error approving quality', error: error.message });
  }
};

