export type Role = 'USER' | 'ADMIN' | 'AGENT' | 'RETAILER';

export type ProductStatus =
  | 'SUBMITTED'
  | 'APPROVED'
  | 'ASSIGNED'
  | 'AGENT_ASSIGNED'
  | 'PICKUP_SCHEDULED'
  | 'COLLECTED'
  | 'INSPECTION_PENDING'
  | 'INSPECTED'
  | 'VALUATION_PROPOSED'
  | 'VALUATION_ACCEPTED'
  | 'VALUATION_REJECTED'
  | 'IN_REFURBISHMENT'
  | 'REFURBISHED'
  | 'QUALITY_VERIFIED'
  | 'RECYCLE_PENDING'
  | 'RECYCLED'
  | 'SENT_FOR_RECYCLING'
  | 'LISTED_FOR_SALE'
  | 'SOLD'
  | 'SOLD_TO_RETAILER'
  | 'PAYMENT_COMPLETED';

export type PickupStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COLLECTED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  address?: string;
  city?: string;
  avatar?: string;
  agentProfile?: AgentProfile;
  retailerProfile?: RetailerProfile;
}

export interface AgentProfile {
  id: string;
  employeeId: string;
  vehicleType?: string;
  serviceArea?: string;
  completedPickups: number;
  rating: number;
  currentLat?: number;
  currentLng?: number;
}

export interface RetailerProfile {
  id: string;
  businessName: string;
  gstNumber?: string;
  businessAddress?: string;
  city?: string;
  isVerified: boolean;
  totalPurchases: number;
}

export interface Product {
  id: string;
  customId: string;
  userId: string;
  category: string;
  brand: string;
  model: string;
  ageYears?: number;
  condition: string;
  problemDesc?: string;
  issueDescription?: string;
  images: string[];
  serialNumber?: string;
  status?: string;
  currentStatus: ProductStatus;
  estimatedValue?: number;
  finalPrice?: number;
  userPayoutAmount?: number;
  qrCodeUrl?: string;
  qrCodeSvg?: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; name: string; phone?: string; email?: string; city?: string };
  pickupRequest?: PickupRequest;
  inspection?: Inspection;
  inspections?: any[];
  valuation?: Valuation;
  refurbishment?: Refurbishment;
  history?: any[];
  historyEvents?: ProductHistory[];
  listing?: MarketplaceListing;
}

export interface PickupRequest {
  id: string;
  requestId: string;
  productId: string;
  product?: Product;
  userId: string;
  user?: { id: string; name: string; phone?: string; email?: string; address?: string; city?: string };
  agentId?: string;
  agent?: { id: string; employeeId: string; user: { name: string; phone?: string } };
  pickupAddress: string;
  address?: string;
  city: string;
  pincode?: string;
  preferredDate?: string;
  preferredTimeSlot?: string;
  status: PickupStatus;
  agentNotes?: string;
  collectionNotes?: string;
  collectionImages?: string[];
  collectedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Inspection {
  id: string;
  productId: string;
  agentId: string;
  agent?: { user: { name: string } };
  physicalCondition: string;
  powerOnStatus: boolean;
  hardwareCondition: string;
  batteryHealth?: number;
  damagedParts: string[];
  missingParts: string[];
  recommendation: 'REFURBISH' | 'RECYCLE';
  inspectionNotes?: string;
  photos: string[];
  adminApproved: boolean;
  reviewedAt?: string;
}

export interface Valuation {
  id: string;
  productId: string;
  estimatedResaleValue: number;
  refurbishmentCost: number;
  collectionCost: number;
  platformShare: number;
  userPayoutProposed: number;
  status: 'PROPOSED' | 'ACCEPTED' | 'REJECTED';
  userRemarks?: string;
  approvedAt?: string;
}

export interface Refurbishment {
  id: string;
  productId: string;
  technicianName: string;
  repairDescription: string;
  componentsReplaced: string[];
  repairCost: number;
  hardwareTestPassed: boolean;
  batteryTestPassed: boolean;
  stressTestPassed: boolean;
  testingStatus: string;
  qualityApproved: boolean;
  certifiedAt?: string;
  warrantyMonths: number;
  certificateNumber?: string;
}

export interface ProductHistory {
  id: string;
  productId: string;
  stepNumber: number;
  title: string;
  description: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
}

export interface MarketplaceListing {
  id: string;
  productId: string;
  product?: Product;
  title: string;
  category: string;
  brand: string;
  model: string;
  conditionGrade: string;
  sellingPrice: number;
  originalPrice: number;
  specs?: any;
  warranty: string;
  images: string[];
  isAvailable: boolean;
  listedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  retailerId: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  invoiceNumber?: string;
  invoiceUrl?: string;
  createdAt: string;
  items: Array<{
    id: string;
    price: number;
    listing: MarketplaceListing;
    product: Product;
  }>;
}

export interface Transaction {
  id: string;
  txnNumber: string;
  retailerAmount: number;
  refurbishmentCost: number;
  logisticsCost: number;
  platformProfit: number;
  userPayout: number;
  status: string;
  createdAt: string;
  product?: { customId: string; brand: string; model: string; category: string };
  order?: { orderNumber: string; retailer: { businessName: string } };
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: any;
  ipAddress?: string;
  createdAt: string;
  user?: { name: string; email: string; role: Role };
}

