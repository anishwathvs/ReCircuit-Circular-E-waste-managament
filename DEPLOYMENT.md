# 🌐 ReCircuit Platform — Production Deployment Guide

This document provides complete instructions for deploying and running **ReCircuit** (E-Waste Management & Circular Economy Platform) in a production-ready environment.

---

## 1. System Architecture

ReCircuit utilizes a high-performance modular monolithic architecture designed for reliability, strict data integrity, and compliance with Central Pollution Control Board (CPCB) standards:

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts.
- **Backend**: Node.js 20+, Express.js, TypeScript, REST APIs.
- **Database**: PostgreSQL 16+ managed with Prisma ORM (16 relational models).
- **Authentication**: JWT Access Tokens (1-hour expiry) with Refresh Token Rotation & Session Revocation (`tokenVersion`), bcrypt password hashing (10 salt rounds).
- **Security & Headers**: Helmet, strict CORS policy, payload size limits (10MB json/url-encoded, 5MB image limit), zero customer PII leakage on public endpoints.
- **Transactional Services**:
  - Image Storage: Cloudinary API with fallback to local persistent filesystem (`/uploads`).
  - Notifications: Nodemailer supporting any SMTP provider (SendGrid, AWS SES, Postmark) + local sandbox fallback (Ethereal).
  - Payment Gateway: Dual mode (sandbox mock test mode / live Razorpay/Stripe) with HMAC SHA-256 webhook signature verification and idempotent payouts.
  - Fleet Routing: Geographical Chennai Metropolitan coordinates with customer address masking.

---

## 2. Production Prerequisites

1. **Server Environment**: Linux (Ubuntu 22.04 LTS recommended) or macOS / Cloud VM.
2. **Node.js**: Version 20.x LTS or higher.
3. **PostgreSQL**: Version 15+ or 16+ instance (AWS RDS, Supabase, Neon, or self-hosted).
4. **Reverse Proxy**: Nginx or Caddy with SSL/TLS (Let's Encrypt).
5. **Process Manager**: PM2 or systemd.

---

## 3. Environment Configuration

### Backend Configuration (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and update the values:

```bash
cd backend
cp .env.example .env
```

| Key | Description | Example |
| :--- | :--- | :--- |
| `PORT` | API Server listening port | `5001` |
| `NODE_ENV` | Environment mode (`production` / `development`) | `production` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/recircuit?sslmode=require` |
| `JWT_SECRET` | Secret key for access token signing | 64+ char random string |
| `JWT_REFRESH_SECRET` | Secret key for refresh token signing | 64+ char random string |
| `ALLOW_DEMO_LOGIN` | Disable quick demo login in production | `false` |
| `CLIENT_URL` | Frontend URL for email verification links | `https://recircuit.in` |
| `CORS_ORIGIN` | Allowed CORS origins (comma-separated) | `https://recircuit.in` |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud name | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `your_api_key` |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret | `your_api_secret` |
| `SMTP_HOST` | Transactional email SMTP host | `smtp.sendgrid.net` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username | `apikey` |
| `SMTP_PASS` | SMTP API key / password | `your_smtp_password` |
| `SMTP_FROM` | Sender address | `"ReCircuit" <notifications@recircuit.in>` |
| `RAZORPAY_KEY_ID` | Payment gateway Key ID | `rzp_live_...` |
| `RAZORPAY_KEY_SECRET` | Payment gateway Secret | `your_secret` |
| `PAYMENT_WEBHOOK_SECRET` | HMAC signature secret for webhooks | `your_webhook_secret` |

---

## 4. Build and Deployment Steps

### Step 1: Database Setup & Migration

```bash
cd backend

# Install production dependencies
npm install --production=false

# Generate Prisma Client
npm run prisma:generate

# Apply schema migrations
npm run prisma:push

# (Optional) Seed standard admin, field agent, and CPCB recyclers
npm run prisma:seed
```

### Step 2: Build the Backend

```bash
cd backend
npm run build
# Compiles TypeScript into dist/
```

### Step 3: Build the Frontend

```bash
cd frontend
npm install
npm run build
# Compiles React application into dist/
```

### Step 4: Process Management with PM2

Install PM2 globally if not installed:
```bash
npm install -g pm2
```

Create or use the PM2 ecosystem configuration `ecosystem.config.cjs`:

```bash
# Start backend service
cd backend
pm2 start dist/index.js --name "recircuit-api" -i max --env NODE_ENV=production

# Save PM2 process list
pm2 save
pm2 startup
```

---

## 5. Nginx Reverse Proxy Configuration

Recommended Nginx configuration for serving the React frontend and proxying API requests with SSL:

```nginx
server {
    listen 80;
    server_name recircuit.in www.recircuit.in;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name recircuit.in www.recircuit.in;

    ssl_certificate /etc/letsencrypt/live/recircuit.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/recircuit.in/privkey.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend Single Page Application
    root /var/www/recircuit/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 90;
    }

    # Static Uploads Proxy
    location /uploads/ {
        proxy_pass http://127.0.0.1:5001/uploads/;
        proxy_cache_valid 200 30d;
        add_header Cache-Control "public, max-age=2592000";
    }
}
```

---

## 6. Verification and Health Monitoring

- **API Health Check**: `GET /api/health`
  - Returns `status: "online"`, DB connection status, latency, and uptime.
- **Public Product Passport**: `GET /api/passport/RC-2026-00142`
  - Verifies DPP tamper-proof signature without exposing customer personal information.
- **Integration Test Suite**:
  ```bash
  cd backend
  npx tsx test-production-readiness.ts
  ```

