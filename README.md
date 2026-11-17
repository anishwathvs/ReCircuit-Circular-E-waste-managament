# ReCircuit — E-Waste Management & Circular Economy SaaS Platform

ReCircuit is an enterprise-grade, full-stack circular economy platform designed to collect, inspect, refurbish, and resell end-of-life electronic products with end-to-end transparency, cryptographic QR product passports, and automated fair profit-sharing.

---

## 🌟 Visual Design System (Strictly Adheres to Specification)

- **Primary Forest Green**: `#084D36`
- **Secondary Green**: `#16834D`
- **Accent Lime**: `#62B735` / `#22C55E`
- **Light Mint**: `#EBF8E9`
- **Off-White Background**: `#F8FAF7`
- **Typography**: Headings: *Manrope*, Body: *Inter*

---

## 🚀 Key Modules & Role-Based Dashboards

### 1. Public Landing Page
- **Hero Section**: "Give Your Electronics a Second Life" with interactive composite visual (laptop with green nature screen, motherboard PCB, RAM module, flowing circular recycling arrows, and floating QR badge).
- **Verified Impact Statistics**:
  - `12,580+` Devices Collected
  - `7,920+` Devices Refurbished
  - `1,340 Tons` E-Waste Diverted
  - `₹2.8 Cr+` Paid to Users
- **How ReCircuit Works**: 4-step circular flow (01 Register → 02 Collect → 03 Refurbish → 04 Reuse & Earn).
- **QR Tracking Banner**: Dark forest green card with smartphone scanning mockup and live product history timeline.
- **B2B Refurbished Products Grid**: Pre-owned certified electronics with pricing and specifications.

### 2. User Dashboard (Individual / Household Seller)
- Personalized header: `Hello, Anishwath 👋`
- 4 Key Metrics:
  - Active Requests: `2`
  - In Refurbishment: `1`
  - Completed: `3`
  - Total Earnings: `₹5,600`
- **My Recent Request**: Dell Inspiron 5570 ("Hinged issue, slow performance" — Refurbishing badge)
- **12-Stage Lifecycle Tracker**: Submitted → Approved → Agent Assigned → Collected → Inspected → Valuation Proposed → User Approval → Refurbishment → Quality Approved → Listed → Sold → Payment Completed.
- **Transparent Valuation Breakdown**: Estimated resale value, refurbishment cost, collection cost, platform cut, and net user payout with 1-click Accept/Reject.

### 3. Admin Dashboard (Platform Director & Operations)
- Header: `Admin Dashboard` / "Manage pickups, refurbishment, sales and payouts."
- 4 Operational KPIs:
  - Total Requests: `148`
  - In Refurbishment: `62`
  - Listed for Sale: `51`
  - Total Revenue: `₹4,82,300`
- **Collection Overview Chart**: Monthly volume area chart with peak indicator badge at `148`.
- **Quick Actions**: Assign Agent modal, Approve Refurbishment QA modal, Manage Retailers.
- **Profit-Sharing & Transaction Ledger**: Automated waterfall calculations on all sold inventory.

### 4. Field Agent Dashboard (Logistics & Inspection)
- Header: `My Pickups` / "Collect and inspect assigned e-waste devices."
- Status Tabs: `Assigned (3)`, `In Progress (1)`, `Completed (12)`.
- Live Pickup Cards:
  - `REQ-2847` | Acer Aspire 5 | Location: Velachery, Chennai | Today, 4:00 PM
  - `REQ-2851` | HP Pavilion 15 | Location: Adyar, Chennai | Today, 6:00 PM
- **Physical Inspection Module**: 32-point hardware checklist, power-on diagnostic, battery health %, damage assessment, and Reusability Recommendation (Refurbish vs. Authorized Zero-Landfill Recycling).

### 5. Retailer Dashboard (B2B Refurbished Procurement)
- Header: `Refurbished Devices for Retailers`
- Filter Bar: Categories, Condition Grade, Price Range, and Instant Search.
- Product Catalog: Certified Grade A/B pre-owned hardware with 6-month warranties.
- Shopping Cart Drawer & Instant GST Invoice Checkout.

### 6. Public Cryptographic QR Product Passport (`/passport/:customId`)
- Every device receives a permanent identifier (e.g. `RC-2026-00142`) and vector QR code.
- Displays full chronological history, diagnostic test certificates, replaced parts, and eco-impact metrics:
  - 48.5 kg CO₂ avoided
  - 2.4 kg e-waste diverted
  - 320 mg precious metals recovered
- **Zero-PII Privacy Protection**: Masked and privacy-sanitized to safeguard original seller identity.

---

## 🔑 Demo Accounts (1-Click Switcher Available on UI)

| Role | Name | Email | Password |
|---|---|---|---|
| **User** | Anishwath V | `user@recircuit.com` | `password123` |
| **Admin** | Super Admin | `admin@recircuit.com` | `password123` |
| **Agent** | Rakesh K | `agent@recircuit.com` | `password123` |
| **Retailer** | Retail Partner | `retailer@recircuit.com` | `password123` |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Framer Motion
- **Backend**: Node.js, Express.js, TypeScript, RESTful API
- **Database**: PostgreSQL with Prisma ORM
- **Security**: JWT Access & Refresh Tokens, Role-Based Access Control (RBAC), bcryptjs password hashing
- **QR Engine**: `qrcode` vector SVG generation & camera scanner

---

## 💻 Local Development Setup

### 1. Database Setup
Ensure PostgreSQL is running locally:
```bash
createdb recircuit
```

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npm run prisma:seed
npm run dev
# Backend runs on http://localhost:5001
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

