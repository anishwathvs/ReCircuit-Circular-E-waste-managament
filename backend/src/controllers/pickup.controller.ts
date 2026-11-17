import { Response } from 'express';
import { prisma } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';
import { PickupStatus, ProductStatus } from '@prisma/client';
import { notifyUser } from '../services/notification.service.js';

export const listPickups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, city } = req.query;
    const filter: any = {};

    if (status) filter.status = status as PickupStatus;
    if (city) filter.city = String(city);

    const pickups = await prisma.pickupRequest.findMany({
      where: filter,
      include: {
        product: true,
        user: { select: { id: true, name: true, phone: true, email: true } },
        agent: { include: { user: { select: { name: true, phone: true } } } },
      },
      orderBy: { preferredDate: 'asc' },
    });

    res.json({ pickups });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving pickups', error: error.message });
  }
};

export const getAgentPickups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const agent = await prisma.agent.findUnique({ where: { userId } });

    if (!agent) {
      res.status(404).json({ message: 'Agent profile not found' });
      return;
    }

    const { status } = req.query;
    const filter: any = { agentId: agent.id };
    if (status) filter.status = status as PickupStatus;

    const pickups = await prisma.pickupRequest.findMany({
      where: filter,
      include: {
        product: true,
        user: { select: { id: true, name: true, phone: true, address: true, city: true } },
      },
      orderBy: { preferredDate: 'asc' },
    });

    res.json({ pickups, agent });
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving agent pickups', error: error.message });
  }
};

export const assignAgent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { pickupId, agentId } = req.body;
    if (!pickupId || !agentId) {
      res.status(400).json({ message: 'pickupId and agentId are required' });
      return;
    }

    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { user: true },
    });
    if (!agent) {
      res.status(404).json({ message: 'Agent not found' });
      return;
    }

    const pickup = await prisma.pickupRequest.update({
      where: { id: pickupId },
      data: {
        agentId,
        status: PickupStatus.ASSIGNED,
      },
      include: { product: true, user: true },
    });

    await prisma.product.update({
      where: { id: pickup.productId },
      data: { currentStatus: ProductStatus.AGENT_ASSIGNED },
    });

    // History event
    await prisma.productHistory.create({
      data: {
        productId: pickup.productId,
        stepNumber: 2,
        title: 'Agent Assigned for Pickup',
        description: `Field agent ${agent.user.name} (${agent.employeeId}) assigned for verified doorstep collection in ${pickup.city}.`,
        actorName: 'ReCircuit Dispatcher',
        actorRole: 'ADMIN',
      },
    });

    // Notify agent with in-app notification & transactional email
    await notifyUser({
      userId: agent.userId,
      title: 'New Doorstep Pickup Assigned',
      message: `Pickup request #${pickup.requestId} for ${pickup.product.brand} ${pickup.product.model} in ${pickup.city} has been assigned to you.`,
      link: '/dashboard/agent',
      sendEmail: true,
    });

    // Notify user with in-app notification & transactional email
    await notifyUser({
      userId: pickup.userId,
      title: 'Pickup Request Approved & Agent Assigned',
      message: `Your pickup request #${pickup.requestId} has been approved! Agent ${agent.user.name} (${agent.user.phone || ''}) has been assigned to collect your device.`,
      link: '/dashboard/user',
      sendEmail: true,
    });

    res.json({ message: 'Agent assigned successfully', pickup });
  } catch (error: any) {
    res.status(500).json({ message: 'Error assigning agent', error: error.message });
  }
};

export const startPickup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const pickup = await prisma.pickupRequest.update({
      where: { id },
      data: { status: PickupStatus.IN_PROGRESS },
      include: { product: true, agent: { include: { user: true } } },
    });

    await prisma.product.update({
      where: { id: pickup.productId },
      data: { currentStatus: ProductStatus.PICKUP_SCHEDULED },
    });

    res.json({ message: 'Pickup started', pickup });
  } catch (error: any) {
    res.status(500).json({ message: 'Error updating pickup status', error: error.message });
  }
};

export const completePickup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { collectionNotes, collectionImages = [] } = req.body;

    const pickup = await prisma.pickupRequest.findUnique({
      where: { id },
      include: { product: true, agent: { include: { user: true } } },
    });

    if (!pickup) {
      res.status(404).json({ message: 'Pickup request not found' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.pickupRequest.update({
        where: { id },
        data: {
          status: PickupStatus.COLLECTED,
          collectionNotes,
          collectionImages,
          collectedAt: new Date(),
        },
      });

      await tx.product.update({
        where: { id: pickup.productId },
        data: { currentStatus: ProductStatus.COLLECTED },
      });

      // Update agent completed pickups counter
      if (pickup.agentId) {
        await tx.agent.update({
          where: { id: pickup.agentId },
          data: { completedPickups: { increment: 1 } },
        });
      }

      // History event: "Collected by Agent"
      await tx.productHistory.create({
        data: {
          productId: pickup.productId,
          stepNumber: 2,
          title: 'Collected by Agent',
          description: `Device safely collected from user location by ${pickup.agent?.user?.name || 'Agent'}. Handover confirmed.`,
          actorName: pickup.agent?.user?.name || 'Field Agent',
          actorRole: 'AGENT',
          timestamp: new Date(),
        },
      });

      return p;
    });

    // Notify User
    await notifyUser({
      userId: pickup.userId,
      title: 'Device Collected by Agent',
      message: `Your device ${pickup.product.brand} ${pickup.product.model} has been collected safely and is headed to our inspection lab.`,
      link: '/dashboard/user',
      sendEmail: true,
    });

    res.json({ message: 'Pickup marked as collected', pickup: updated });
  } catch (error: any) {
    res.status(500).json({ message: 'Error completing pickup', error: error.message });
  }
};
