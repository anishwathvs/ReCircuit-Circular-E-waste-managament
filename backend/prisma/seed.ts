import { PrismaClient, Role, ProductStatus, PickupStatus, InspectionRecommendation, ValuationStatus, OrderStatus, PayoutStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { EXPANDED_MARKETPLACE_PRODUCTS } from '../src/data/expandedMarketplaceProducts';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ReCircuit database seeding...');

  // Clean existing tables
  await prisma.recyclingRecord.deleteMany();
  await prisma.authorizedRecycler.deleteMany();
  await prisma.profitSharingRule.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.userPayout.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.marketplaceListing.deleteMany();
  await prisma.productHistory.deleteMany();
  await prisma.refurbishment.deleteMany();
  await prisma.valuation.deleteMany();
  await prisma.inspection.deleteMany();
  await prisma.pickupRequest.deleteMany();
  await prisma.product.deleteMany();
  await prisma.retailer.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const userAnishwath = await prisma.user.create({
    data: {
      name: 'Anishwath V',
      email: 'user@recircuit.com',
      password: hashedPassword,
      role: Role.USER,
      phone: '+91 98765 43210',
      address: '42, 4th Seaward Road, Valmiki Nagar, Thiruvanmiyur',
      city: 'Chennai',
      pincode: '600041',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  const userSecond = await prisma.user.create({
    data: {
      name: 'Karthik Raja',
      email: 'karthik@example.com',
      password: hashedPassword,
      role: Role.USER,
      phone: '+91 98401 23456',
      address: '15, 2nd Main Road, Kasturibai Nagar, Adyar',
      city: 'Chennai',
      pincode: '600020',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
  });

  const userPriya = await prisma.user.create({
    data: {
      name: 'Priya Sundaram',
      email: 'priya@example.com',
      password: hashedPassword,
      role: Role.USER,
      phone: '+91 97890 87654',
      address: '88, 100 Feet Bypass Road, Velachery',
      city: 'Chennai',
      pincode: '600042',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin',
      email: 'admin@recircuit.com',
      password: hashedPassword,
      role: Role.ADMIN,
      phone: '+91 99999 00001',
      city: 'Chennai',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const agentUser = await prisma.user.create({
    data: {
      name: 'Rakesh K',
      email: 'agent@recircuit.com',
      password: hashedPassword,
      role: Role.AGENT,
      phone: '+91 98888 77766',
      city: 'Chennai',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
  });

  const retailerUser = await prisma.user.create({
    data: {
      name: 'Retailer',
      email: 'retailer@recircuit.com',
      password: hashedPassword,
      role: Role.RETAILER,
      phone: '+91 94444 33322',
      city: 'Chennai',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 2. Profiles for Agent & Retailer
  const agentRakesh = await prisma.agent.create({
    data: {
      userId: agentUser.id,
      employeeId: 'RC-AGT-042',
      vehicleType: 'Ather 450X EV Scooter',
      serviceArea: 'South Chennai (Adyar, Velachery, OMR, Thiruvanmiyur)',
      completedPickups: 48,
      rating: 4.9,
      currentLat: 12.9815,
      currentLng: 80.2180,
    },
  });

  const retailerProfile = await prisma.retailer.create({
    data: {
      userId: retailerUser.id,
      businessName: 'Apex Refurbished IT Hub',
      gstNumber: '33AAACA1234A1Z5',
      businessAddress: 'Plot 44, Guindy Industrial Estate, Chennai',
      city: 'Chennai',
      isVerified: true,
      totalPurchases: 285400,
    },
  });

  // Helper for QR code SVG
  const makeQR = async (customId: string) => {
    const url = `http://localhost:5173/passport/${customId}`;
    const svg = await QRCode.toString(url, {
      type: 'svg',
      color: { dark: '#084D36', light: '#FFFFFF' },
      margin: 2,
    });
    return { url, svg };
  };

  // 3. Featured Product RC-2026-00142 matching the UI reference QR card!
  const qr142 = await makeQR('RC-2026-00142');
  const prod142 = await prisma.product.create({
    data: {
      customId: 'RC-2026-00142',
      userId: userAnishwath.id,
      category: 'Laptop',
      brand: 'Dell',
      model: 'Latitude 5420',
      ageYears: 2.2,
      condition: 'Minor Hinge Play & Battery Degradation',
      problemDesc: 'Keyboard backlighting flickering and battery only holds 45 minutes charge.',
      images: [
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
      ],
      currentStatus: ProductStatus.PAYMENT_COMPLETED,
      estimatedValue: 26000,
      finalPrice: 28500,
      userPayoutAmount: 22300,
      qrCodeUrl: qr142.url,
      qrCodeSvg: qr142.svg,
      createdAt: new Date('2026-11-12T10:15:00Z'),
    },
  });

  // History timeline matching UI reference QR card!
  await prisma.productHistory.createMany({
    data: [
      {
        productId: prod142.id,
        stepNumber: 1,
        title: 'Registered by User',
        description: 'Anishwath V registered Dell Latitude 5420 for circular e-waste reclamation.',
        actorName: 'Anishwath V',
        actorRole: 'USER',
        timestamp: new Date('2026-11-12T10:15:00Z'),
      },
      {
        productId: prod142.id,
        stepNumber: 2,
        title: 'Collected by Agent',
        description: 'Collected by verified agent Rakesh K from Thiruvanmiyur pickup point.',
        actorName: 'Rakesh K',
        actorRole: 'AGENT',
        timestamp: new Date('2026-11-13T14:30:00Z'),
      },
      {
        productId: prod142.id,
        stepNumber: 3,
        title: 'Inspected & Tested',
        description: 'Complete 32-point hardware diagnostics completed. Motherboard intact; battery replacement needed.',
        actorName: 'Rakesh K',
        actorRole: 'AGENT',
        timestamp: new Date('2026-11-14T11:00:00Z'),
      },
      {
        productId: prod142.id,
        stepNumber: 4,
        title: 'Refurbished',
        description: 'New OEM 54Wh battery installed, thermal re-paste applied, clean OS image installed.',
        actorName: 'Arun Kumar (Lead Hardware Tech)',
        actorRole: 'ADMIN',
        timestamp: new Date('2026-11-18T16:20:00Z'),
      },
      {
        productId: prod142.id,
        stepNumber: 5,
        title: 'Sold to Retailer',
        description: 'Purchased by Apex Refurbished IT Hub. Certified 6-month warranty issued. Payout processed.',
        actorName: 'Apex Refurbished IT Hub',
        actorRole: 'RETAILER',
        timestamp: new Date('2026-11-20T12:00:00Z'),
      },
    ],
  });

  await prisma.inspection.create({
    data: {
      productId: prod142.id,
      agentId: agentRakesh.id,
      physicalCondition: 'Good - Light Scratches on lid',
      powerOnStatus: true,
      hardwareCondition: 'Operational',
      batteryHealth: 68,
      damagedParts: ['Battery degraded'],
      missingParts: [],
      recommendation: InspectionRecommendation.REFURBISH,
      inspectionNotes: 'Display panel and keyboard in very good condition. Suitable for Grade A refurbishment.',
      adminApproved: true,
      reviewedAt: new Date('2026-11-14T15:00:00Z'),
    },
  });

  await prisma.refurbishment.create({
    data: {
      productId: prod142.id,
      technicianName: 'Arun Kumar (Lead Hardware Tech)',
      repairDescription: 'Installed new OEM Dell 54Wh 4-cell battery, replaced thermal paste with Noctua NT-H1, cleaned fan assembly.',
      componentsReplaced: ['OEM Dell 54Wh Battery', 'Thermal Interface Material', 'Hinge Bushing'],
      repairCost: 2200,
      hardwareTestPassed: true,
      batteryTestPassed: true,
      stressTestPassed: true,
      testingStatus: 'Passed All 32 Diagnostics',
      qualityApproved: true,
      certifiedAt: new Date('2026-11-18T16:20:00Z'),
      warrantyMonths: 6,
      certificateNumber: 'CERT-RC-98124',
    },
  });

  await prisma.valuation.create({
    data: {
      productId: prod142.id,
      estimatedResaleValue: 28500,
      refurbishmentCost: 2200,
      collectionCost: 500,
      platformShare: 3500,
      userPayoutProposed: 22300,
      status: ValuationStatus.ACCEPTED,
      approvedAt: new Date('2026-11-15T10:00:00Z'),
    },
  });

  // 4. Product: Dell Inspiron 5570 (Under Refurbishing - matching User Dashboard in reference screenshot!)
  const qr5570 = await makeQR('RC-2026-00138');
  const prodInspiron = await prisma.product.create({
    data: {
      customId: 'RC-2026-00138',
      userId: userAnishwath.id,
      category: 'Laptop',
      brand: 'Dell',
      model: 'Inspiron 5570',
      ageYears: 3.5,
      condition: 'Hinged issue, slow performance',
      problemDesc: 'Hinged issue, slow performance',
      images: [
        'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&auto=format&fit=crop&q=80',
      ],
      currentStatus: ProductStatus.IN_REFURBISHMENT,
      estimatedValue: 18000,
      userPayoutAmount: 13500,
      qrCodeUrl: qr5570.url,
      qrCodeSvg: qr5570.svg,
      createdAt: new Date('2026-11-10T09:00:00Z'),
    },
  });

  await prisma.productHistory.createMany({
    data: [
      {
        productId: prodInspiron.id,
        stepNumber: 1,
        title: 'Registered by User',
        description: 'Anishwath V registered Dell Inspiron 5570 with hinged issue and slow performance.',
        actorName: 'Anishwath V',
        actorRole: 'USER',
        timestamp: new Date('2026-11-10T09:00:00Z'),
      },
      {
        productId: prodInspiron.id,
        stepNumber: 2,
        title: 'Collected by Agent',
        description: 'Collected by agent Rakesh K.',
        actorName: 'Rakesh K',
        actorRole: 'AGENT',
        timestamp: new Date('2026-11-11T11:00:00Z'),
      },
      {
        productId: prodInspiron.id,
        stepNumber: 3,
        title: 'Inspected & Tested',
        description: 'Hinge mount cracked on palmrest. Core i5 CPU and 8GB RAM functional. Proposed SSD upgrade.',
        actorName: 'Rakesh K',
        actorRole: 'AGENT',
        timestamp: new Date('2026-11-12T14:00:00Z'),
      },
      {
        productId: prodInspiron.id,
        stepNumber: 4,
        title: 'In Refurbishment',
        description: 'Undergoing hinge repair, palmrest reinforcement, and 512GB NVMe SSD installation.',
        actorName: 'Arun Kumar',
        actorRole: 'ADMIN',
        timestamp: new Date('2026-11-15T10:00:00Z'),
      },
    ],
  });

  await prisma.valuation.create({
    data: {
      productId: prodInspiron.id,
      estimatedResaleValue: 18000,
      refurbishmentCost: 2200,
      collectionCost: 300,
      platformShare: 2000,
      userPayoutProposed: 13500,
      status: ValuationStatus.ACCEPTED,
      approvedAt: new Date('2026-11-13T12:00:00Z'),
    },
  });

  await prisma.refurbishment.create({
    data: {
      productId: prodInspiron.id,
      technicianName: 'Arun Kumar (Lead Hardware Tech)',
      repairDescription: 'Replacing left hinge brackets, servicing heatsink, upgrading mechanical HDD to NVMe SSD.',
      componentsReplaced: ['Hinge Bracket Assembly', 'Crucial 512GB NVMe SSD'],
      repairCost: 1900,
      testingStatus: 'Bench Stress Testing In Progress',
      qualityApproved: false,
    },
  });

  // 5. Active Requests for Anishwath (to match "Active Requests: 2" on screenshot!)
  const qrAct1 = await makeQR('RC-2026-00145');
  const prodAct1 = await prisma.product.create({
    data: {
      customId: 'RC-2026-00145',
      userId: userAnishwath.id,
      category: 'Mobile Phone',
      brand: 'OnePlus',
      model: '9 Pro 5G',
      ageYears: 2.0,
      condition: 'Cracked back glass',
      problemDesc: 'Rear camera glass has a hairline crack; charging port loose.',
      images: [
        'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
      ],
      currentStatus: ProductStatus.AGENT_ASSIGNED,
      estimatedValue: 14000,
      userPayoutAmount: 10500,
      qrCodeUrl: qrAct1.url,
      qrCodeSvg: qrAct1.svg,
    },
  });

  await prisma.pickupRequest.create({
    data: {
      requestId: 'REQ-2860',
      productId: prodAct1.id,
      userId: userAnishwath.id,
      agentId: agentRakesh.id,
      pickupAddress: '42, 4th Seaward Road, Valmiki Nagar, Thiruvanmiyur',
      city: 'Chennai',
      pincode: '600041',
      preferredDate: new Date(Date.now() + 86400000),
      preferredTimeSlot: '11:00 AM - 1:00 PM',
      status: PickupStatus.ASSIGNED,
    },
  });

  // Second active request: Motherboard
  const qrAct2 = await makeQR('RC-2026-00146');
  const prodAct2 = await prisma.product.create({
    data: {
      customId: 'RC-2026-00146',
      userId: userAnishwath.id,
      category: 'Motherboard',
      brand: 'MSI',
      model: 'B450 Tomahawk Max',
      ageYears: 3.0,
      condition: 'No display POST',
      problemDesc: 'EZ Debug LED stuck on CPU; no bent pins visible.',
      images: [
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
      ],
      currentStatus: ProductStatus.SUBMITTED,
      estimatedValue: 4500,
      userPayoutAmount: 3200,
      qrCodeUrl: qrAct2.url,
      qrCodeSvg: qrAct2.svg,
    },
  });

  await prisma.pickupRequest.create({
    data: {
      requestId: 'REQ-2865',
      productId: prodAct2.id,
      userId: userAnishwath.id,
      pickupAddress: '42, 4th Seaward Road, Valmiki Nagar, Thiruvanmiyur',
      city: 'Chennai',
      pincode: '600041',
      preferredDate: new Date(Date.now() + 172800000),
      preferredTimeSlot: '4:00 PM - 6:00 PM',
      status: PickupStatus.PENDING,
    },
  });

  // 6. Completed requests for Anishwath to reach "Completed: 3" & "Total Earnings: ₹5,600"
  // Previous payout 1: ₹3,200
  await prisma.userPayout.create({
    data: {
      userId: userAnishwath.id,
      productId: prodAct2.id, // linked reference
      amount: 3200,
      status: PayoutStatus.COMPLETED,
      paymentMethod: 'UPI (anishwath@okhdfcbank)',
      transactionRef: 'UTR-982187391823',
      paidAt: new Date('2026-10-14T14:20:00Z'),
    },
  });

  // Previous payout 2: ₹2,400 (3200 + 2400 = 5600 matching screenshot!)
  await prisma.userPayout.create({
    data: {
      userId: userAnishwath.id,
      productId: prod142.id,
      amount: 2400,
      status: PayoutStatus.COMPLETED,
      paymentMethod: 'UPI (anishwath@okhdfcbank)',
      transactionRef: 'UTR-982187394411',
      paidAt: new Date('2026-10-28T16:45:00Z'),
    },
  });

  // 7. Pickups for Agent Rakesh matching the Agent Dashboard in the reference image:
  // Item 1: REQ-2847 | Acer Aspire 5 | Location: Velachery, Chennai | Today, 4:00 PM
  const qr2847 = await makeQR('RC-2026-00129');
  const prod2847 = await prisma.product.create({
    data: {
      customId: 'RC-2026-00129',
      userId: userPriya.id,
      category: 'Laptop',
      brand: 'Acer',
      model: 'Aspire 5',
      ageYears: 2.8,
      condition: 'Broken screen hinges and worn keyboard',
      problemDesc: 'Laptop turns on with external monitor, but internal display cable damaged.',
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
      ],
      currentStatus: ProductStatus.AGENT_ASSIGNED,
      estimatedValue: 19000,
      qrCodeUrl: qr2847.url,
      qrCodeSvg: qr2847.svg,
    },
  });

  await prisma.pickupRequest.create({
    data: {
      requestId: 'REQ-2847',
      productId: prod2847.id,
      userId: userPriya.id,
      agentId: agentRakesh.id,
      pickupAddress: '88, 100 Feet Bypass Road, Velachery',
      city: 'Velachery, Chennai',
      pincode: '600042',
      preferredDate: new Date(),
      preferredTimeSlot: 'Today, 4:00 PM',
      status: PickupStatus.ASSIGNED,
    },
  });

  // Item 2: REQ-2851 | HP Pavilion 15 | Location: Adyar, Chennai | Today, 6:00 PM
  const qr2851 = await makeQR('RC-2026-00130');
  const prod2851 = await prisma.product.create({
    data: {
      customId: 'RC-2026-00130',
      userId: userSecond.id,
      category: 'Laptop',
      brand: 'HP',
      model: 'Pavilion 15',
      ageYears: 3.1,
      condition: 'Overheating & fan grinding noise',
      problemDesc: 'System shuts down after 15 minutes of video playback; noisy bearing.',
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      ],
      currentStatus: ProductStatus.AGENT_ASSIGNED,
      estimatedValue: 22000,
      qrCodeUrl: qr2851.url,
      qrCodeSvg: qr2851.svg,
    },
  });

  await prisma.pickupRequest.create({
    data: {
      requestId: 'REQ-2851',
      productId: prod2851.id,
      userId: userSecond.id,
      agentId: agentRakesh.id,
      pickupAddress: '15, 2nd Main Road, Kasturibai Nagar, Adyar',
      city: 'Adyar, Chennai',
      pincode: '600020',
      preferredDate: new Date(),
      preferredTimeSlot: 'Today, 6:00 PM',
      status: PickupStatus.ASSIGNED,
    },
  });

  // Item 3: REQ-2839 | MacBook Air M1 | Location: T. Nagar, Chennai
  const qr2839 = await makeQR('RC-2026-00131');
  const prod2839 = await prisma.product.create({
    data: {
      customId: 'RC-2026-00131',
      userId: userPriya.id,
      category: 'Laptop',
      brand: 'Apple',
      model: 'MacBook Air M1',
      ageYears: 2.0,
      condition: 'Keycap missing, battery 78%',
      problemDesc: 'Return key mechanism broken; spacebar sticky.',
      images: [
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=600&auto=format&fit=crop&q=80',
      ],
      currentStatus: ProductStatus.PICKUP_SCHEDULED,
      estimatedValue: 42000,
      qrCodeUrl: qr2839.url,
      qrCodeSvg: qr2839.svg,
    },
  });

  await prisma.pickupRequest.create({
    data: {
      requestId: 'REQ-2839',
      productId: prod2839.id,
      userId: userPriya.id,
      agentId: agentRakesh.id,
      pickupAddress: '7, Venkatnarayana Road, T. Nagar',
      city: 'T. Nagar, Chennai',
      pincode: '600017',
      preferredDate: new Date(),
      preferredTimeSlot: 'Today, 2:30 PM',
      status: PickupStatus.IN_PROGRESS,
    },
  });

  // 8. EXPANDED MARKETPLACE PRODUCTS (55 ITEMS ACROSS ALL 9 CATEGORIES)
  const marketplaceProducts = EXPANDED_MARKETPLACE_PRODUCTS;

  for (let i = 0; i < marketplaceProducts.length; i++) {
    const item = marketplaceProducts[i];
    const customId = `RC-2026-${String(200 + i).padStart(5, '0')}`;
    const qr = await makeQR(customId);

    const prod = await prisma.product.create({
      data: {
        customId,
        userId: userSecond.id,
        category: item.category,
        brand: item.brand,
        model: item.model,
        ageYears: 1.5,
        condition: 'Refurbished Certified',
        problemDesc: 'Refurbished to original OEM specifications.',
        images: item.images,
        currentStatus: ProductStatus.LISTED_FOR_SALE,
        estimatedValue: item.sellingPrice,
        finalPrice: item.sellingPrice,
        qrCodeUrl: qr.url,
        qrCodeSvg: qr.svg,
      },
    });

    await prisma.refurbishment.create({
      data: {
        productId: prod.id,
        technicianName: 'Arun Kumar (Lead Hardware Tech)',
        repairDescription: `Full service overhaul, thermal reconditioning and 32-point diagnostics passed for ${item.title}.`,
        componentsReplaced: ['Thermal Compound', 'Dust Filtration Gaskets'],
        repairCost: 1200,
        hardwareTestPassed: true,
        batteryTestPassed: true,
        stressTestPassed: true,
        testingStatus: 'Passed All 32 Quality Diagnostics',
        qualityApproved: true,
        certifiedAt: new Date(),
        warrantyMonths: 6,
        certificateNumber: `CERT-RC-${77000 + i}`,
      },
    });

    await prisma.marketplaceListing.create({
      data: {
        productId: prod.id,
        title: item.title,
        category: item.category,
        brand: item.brand,
        model: item.model,
        conditionGrade: item.conditionGrade,
        sellingPrice: item.sellingPrice,
        originalPrice: item.originalPrice,
        specs: item.specs,
        warranty: item.warranty,
        images: item.images,
        isAvailable: true,
      },
    });
  }

  // 9. Initial Seeded B2B Orders and Transactions for prod142 (Latitude 5420)
  const listing142 = await prisma.marketplaceListing.create({
    data: {
      productId: prod142.id,
      title: 'Dell Latitude 5420',
      category: 'Laptop',
      brand: 'Dell',
      model: 'Latitude 5420',
      conditionGrade: 'Grade A - Certified Refurbished',
      sellingPrice: 28500,
      originalPrice: 62000,
      specs: {
        processor: 'Intel Core i5-1145G7',
        ram: '16GB DDR4',
        storage: '512GB NVMe SSD',
      },
      warranty: '6 Months ReCircuit Certified Warranty',
      images: prod142.images,
      isAvailable: false,
    },
  });

  const order142 = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-8901',
      retailerId: retailerProfile.id,
      userId: retailerUser.id,
      totalAmount: 28500,
      status: OrderStatus.DELIVERED,
      shippingAddress: 'Plot 44, Guindy Industrial Estate, Chennai',
      invoiceNumber: 'INV-ORD-2026-8901',
      invoiceUrl: '/invoices/ORD-2026-8901.pdf',
      createdAt: new Date('2026-11-20T12:00:00Z'),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: order142.id,
      listingId: listing142.id,
      productId: prod142.id,
      price: 28500,
    },
  });

  await prisma.transaction.create({
    data: {
      txnNumber: 'TXN-2026-44021',
      orderId: order142.id,
      productId: prod142.id,
      retailerAmount: 28500,
      refurbishmentCost: 2200,
      logisticsCost: 500,
      platformProfit: 3500,
      userPayout: 22300,
      status: 'COMPLETED',
      createdAt: new Date('2026-11-20T12:30:00Z'),
    },
  });

  // Batch B2B Enterprise Order from earlier in the month
  const pastOrder = await prisma.order.create({
    data: {
      orderNumber: 'ORD-2026-8512',
      retailerId: retailerProfile.id,
      userId: retailerUser.id,
      totalAmount: 453800,
      status: OrderStatus.DELIVERED,
      shippingAddress: 'Plot 44, Guindy Industrial Estate, Chennai',
      invoiceNumber: 'INV-ORD-2026-8512',
      invoiceUrl: '/invoices/ORD-2026-8512.pdf',
      createdAt: new Date('2026-11-05T10:00:00Z'),
    },
  });

  await prisma.transaction.create({
    data: {
      txnNumber: 'TXN-2026-43900',
      orderId: pastOrder.id,
      productId: prodInspiron.id,
      retailerAmount: 453800,
      refurbishmentCost: 48000,
      logisticsCost: 12000,
      platformProfit: 65000,
      userPayout: 328800,
      status: 'COMPLETED',
      createdAt: new Date('2026-11-05T10:30:00Z'),
    },
  });

  // 10. Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'SYSTEM_INITIALIZATION',
        entityType: 'PLATFORM',
        entityId: 'RECIRCUIT_CORE',
        details: { message: 'ReCircuit Circular Economy Platform database synchronized successfully.' },
      },
      {
        userId: adminUser.id,
        action: 'APPROVE_QUALITY_CERTIFICATE',
        entityType: 'PRODUCT',
        entityId: prod142.id,
        details: { customId: 'RC-2026-00142', cert: 'CERT-RC-98124' },
      },
    ],
  });

  // 11. Seed Authorized Recyclers & Recycling Records
  const recycler = await prisma.authorizedRecycler.create({
    data: {
      name: 'EcoSmelt Clean Tech Refineries Pvt. Ltd.',
      cpcbLicenseNumber: 'CPCB/EWASTE/TN/2024/0912',
      facilityAddress: 'Survey 221, SIPCOT Industrial Park, Sriperumbudur, Tamil Nadu',
      city: 'Chennai',
      materialsProcessed: ['PCBs', 'Lithium Batteries', 'Rare Earth Magnetics', 'Copper Windings'],
      contactEmail: 'compliance@ecosmelt.in',
      contactPhone: '+91 44 4890 1200',
      active: true,
    },
  });

  // Transfer non-reusable motherboard for authorized smelting & zero-landfill certificate
  await prisma.recyclingRecord.create({
    data: {
      productId: prodAct2.id, // B450 Tomahawk Max (Damaged PCB)
      recyclerId: recycler.id,
      certificateNumber: 'ZERO-LANDFILL-2026-9901',
      weightKg: 1.4,
      manifestUrl: '/certificates/ZERO-LANDFILL-2026-9901.pdf',
      status: 'CERTIFIED',
      preciousMetalsRecoveredMg: 280,
      completedAt: new Date('2026-11-15T14:00:00Z'),
    },
  });

  // 12. Seed Configurable Profit-Sharing Rules
  await prisma.profitSharingRule.createMany({
    data: [
      { category: 'Laptop', platformSharePercent: 15, minRefurbFee: 1500, collectionFee: 300 },
      { category: 'Mobile Phone', platformSharePercent: 12, minRefurbFee: 800, collectionFee: 200 },
      { category: 'Motherboard', platformSharePercent: 15, minRefurbFee: 600, collectionFee: 200 },
      { category: 'GPU', platformSharePercent: 10, minRefurbFee: 1200, collectionFee: 300 },
      { category: 'Battery', platformSharePercent: 10, minRefurbFee: 400, collectionFee: 150 },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log(`
  DEMO ACCOUNTS READY:
  -----------------------------------------------
  User:     user@recircuit.com     / password123 (Anishwath V)
  Admin:    admin@recircuit.com    / password123 (Super Admin)
  Agent:    agent@recircuit.com    / password123 (Rakesh K)
  Retailer: retailer@recircuit.com / password123 (Retail Partner)
  -----------------------------------------------
  `);
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

