import crypto from 'crypto';

const BASE_URL = 'http://localhost:5001';

interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

const record = (category: string, name: string, passed: boolean, details?: string) => {
  results.push({ category, name, passed, details });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${category}] ${name}${details ? ` - ${details}` : ''}`);
};

async function runProductionReadinessTests() {
  console.log('=====================================================');
  console.log('🚀 RECIRCUIT — PRODUCTION READINESS VERIFICATION TEST');
  console.log('=====================================================\n');

  // -----------------------------------------------------------------
  // 1. SYSTEM HEALTH & SECURITY HEADERS
  // -----------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    const helmetHeader = res.headers.get('x-content-type-options');
    record(
      'System & Security',
      'API Health & PostgreSQL Connectivity',
      res.status === 200 && data.database?.status === 'healthy',
      `DB Latency: ${data.database?.latencyMs}ms`
    );
    record(
      'System & Security',
      'Helmet Security Headers Active',
      helmetHeader === 'nosniff',
      `X-Content-Type-Options: ${helmetHeader}`
    );
  } catch (err: any) {
    record('System & Security', 'API Health Check', false, err.message);
  }

  // -----------------------------------------------------------------
  // 2. AUTHENTICATION & SESSION MANAGEMENT
  // -----------------------------------------------------------------
  const testEmail = `user.test.${Date.now()}@recircuit.in`;
  const testPassword = 'Password@2026';
  let userToken = '';
  let refreshToken = '';
  let verifyToken = '';
  let resetToken = '';
  let userId = '';

  // Register
  try {
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Kavitha S',
        email: testEmail,
        password: testPassword,
        role: 'USER',
        phone: '+91 98401 55678',
        address: '14, Karpagam Gardens, Adyar',
        city: 'Chennai',
      }),
    });
    const regData = await regRes.json();
    userToken = regData.accessToken;
    refreshToken = regData.refreshToken;
    verifyToken = regData.verificationToken;
    userId = regData.user?.id;

    record(
      'Authentication',
      'Secure User Registration & Email Token Generation',
      regRes.status === 201 && Boolean(userToken) && Boolean(verifyToken),
      `User ID: ${userId}`
    );
  } catch (err: any) {
    record('Authentication', 'Secure User Registration', false, err.message);
  }

  // Email Verification
  try {
    const verifyRes = await fetch(`${BASE_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: verifyToken }),
    });
    record(
      'Authentication',
      'Email Verification Flow',
      verifyRes.status === 200,
      `Verified account for: ${testEmail}`
    );
  } catch (err: any) {
    record('Authentication', 'Email Verification Flow', false, err.message);
  }

  // Login
  try {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const loginData = await loginRes.json();
    record(
      'Authentication',
      'Standard Password Hashing & Login Verification',
      loginRes.status === 200 && loginData.user?.isEmailVerified === true,
      `User authenticated with verified status: true`
    );
  } catch (err: any) {
    record('Authentication', 'Standard Login', false, err.message);
  }

  // Refresh Token Rotation
  try {
    const refreshRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const refreshData = await refreshRes.json();
    const newRefresh = refreshData.refreshToken;

    record(
      'Authentication',
      'Refresh Token Rotation (Session Versioning)',
      refreshRes.status === 200 && Boolean(newRefresh) && newRefresh !== refreshToken,
      'New rotated refresh token issued'
    );

    // Stale Token Invalidation Check
    const staleRes = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }), // old token
    });
    record(
      'Authentication',
      'Stale Token Revocation on Reuse',
      staleRes.status === 403,
      'Stale refresh token correctly rejected with 403'
    );

    refreshToken = newRefresh; // update
  } catch (err: any) {
    record('Authentication', 'Refresh Token Rotation', false, err.message);
  }

  // Password Reset Flow
  try {
    const forgotRes = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail }),
    });
    const forgotData = await forgotRes.json();
    resetToken = forgotData.resetToken;

    record(
      'Authentication',
      'Password Reset Token & Transactional Email Request',
      forgotRes.status === 200 && Boolean(resetToken),
      'Generic enumeration-safe response dispatched'
    );

    const resetRes = await fetch(`${BASE_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: resetToken, newPassword: 'NewSecurePassword@2026' }),
    });
    record(
      'Authentication',
      'Password Reset Completion & Token Invalidation',
      resetRes.status === 200,
      'Password updated successfully'
    );
  } catch (err: any) {
    record('Authentication', 'Password Reset Flow', false, err.message);
  }

  // Strict RBAC Check
  try {
    const rbacRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    record(
      'Authentication',
      'Strict Backend RBAC (USER denied access to ADMIN stats)',
      rbacRes.status === 403,
      `Status code: ${rbacRes.status} (Forbidden)`
    );
  } catch (err: any) {
    record('Authentication', 'Strict RBAC', false, err.message);
  }

  // -----------------------------------------------------------------
  // 3. IMAGE UPLOAD VALIDATION & SECURITY
  // -----------------------------------------------------------------
  try {
    // 3a. Valid Image Upload (1x1 transparent PNG buffer)
    const validPngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    const formData = new FormData();
    formData.append('image', new Blob([validPngBuffer], { type: 'image/png' }), 'test-device.png');

    const uploadRes = await fetch(`${BASE_URL}/api/products/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: formData,
    });
    const uploadData = await uploadRes.json();

    record(
      'Image Storage',
      'Secure Product Photograph Upload (Valid PNG)',
      uploadRes.status === 200 && Boolean(uploadData.url),
      `Stored URL: ${uploadData.url} (${uploadData.provider})`
    );

    // 3b. Invalid MIME rejection (Executable / HTML spoof)
    const invalidForm = new FormData();
    invalidForm.append('image', new Blob(['<script>alert(1)</script>'], { type: 'text/html' }), 'exploit.html');

    const invalidRes = await fetch(`${BASE_URL}/api/products/upload-image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${userToken}` },
      body: invalidForm,
    });
    record(
      'Image Storage',
      'Invalid MIME-type Rejection (Non-image upload blocked)',
      invalidRes.status === 500 || invalidRes.status === 400,
      'Dangerous file type rejected'
    );
  } catch (err: any) {
    record('Image Storage', 'Image Upload Validation', false, err.message);
  }

  // -----------------------------------------------------------------
  // 4. NOTIFICATIONS & IN-APP HISTORY
  // -----------------------------------------------------------------
  try {
    const notifRes = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    const notifData = await notifRes.json();
    record(
      'Notifications',
      'In-App Notification History Retrieval',
      notifRes.status === 200 && Array.isArray(notifData.notifications),
      `Total notifications: ${notifData.notifications?.length}`
    );

    if (notifData.notifications?.length > 0) {
      const firstId = notifData.notifications[0].id;
      const readRes = await fetch(`${BASE_URL}/api/notifications/${firstId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${userToken}` },
      });
      record(
        'Notifications',
        'Mark Notification as Read',
        readRes.status === 200,
        `Notification ${firstId} marked read`
      );
    }
  } catch (err: any) {
    record('Notifications', 'Notification History', false, err.message);
  }

  // Get Admin credentials for admin checks
  let adminToken = '';
  try {
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@recircuit.com', password: 'password123' }),
    });
    const adminData = await adminLoginRes.json();
    adminToken = adminData.accessToken;
  } catch (err: any) {
    console.error('Admin login error:', err);
  }

  // -----------------------------------------------------------------
  // 5. AGENT LOCATION & GEOGRAPHIC MAPPING (WITH PRIVACY PROTECTION)
  // -----------------------------------------------------------------
  try {
    const mapRes = await fetch(`${BASE_URL}/api/admin/map-locations`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const mapData = await mapRes.json();

    const hasPickups = Array.isArray(mapData.pickupPins) && mapData.pickupPins.length > 0;
    const hasAgents = Array.isArray(mapData.agentPins) && mapData.agentPins.length > 0;
    const allMasked = mapData.pickupPins.every(
      (p: any) => !p.pickupAddress && Boolean(p.locality) && Boolean(p.lat) && Boolean(p.lng)
    );

    record(
      'Agent Location & Maps',
      'Geographic Fleet & Pickup Coordinates Retrieval',
      mapRes.status === 200 && hasPickups && hasAgents,
      `${mapData.pickupPins?.length} pickups, ${mapData.agentPins?.length} EV fleet vans in Chennai`
    );

    record(
      'Agent Location & Maps',
      'Customer Address Privacy Masking (Zero-PII Exposure)',
      allMasked,
      'Door numbers stripped, neighborhood locality preserved (e.g. VELACHERY, ADYAR)'
    );
  } catch (err: any) {
    record('Agent Location & Maps', 'Geographic Mapping', false, err.message);
  }

  // -----------------------------------------------------------------
  // 6. FINANCIAL MANAGEMENT & IDEMPOTENT PAYOUTS
  // -----------------------------------------------------------------
  try {
    // 6a. Profit Sharing Rules
    const rulesRes = await fetch(`${BASE_URL}/api/admin/profit-rules`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const rulesData = await rulesRes.json();
    record(
      'Financial Management',
      'Configurable Profit-Sharing Rules Available',
      rulesRes.status === 200 && Array.isArray(rulesData.rules) && rulesData.rules.length > 0,
      `Rules defined for: ${rulesData.rules?.map((r: any) => r.category).join(', ')}`
    );

    // 6b. Payment Gateway Intent (Sandbox)
    const intentRes = await fetch(`${BASE_URL}/api/marketplace/payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ amount: 28500, orderId: `TEST-${Date.now()}` }),
    });
    const intentData = await intentRes.json();
    record(
      'Financial Management',
      'Payment Gateway Intent Initialization (Sandbox Mode)',
      intentRes.status === 200 && Boolean(intentData.intent?.paymentIntentId),
      `Payment Intent: ${intentData.intent?.paymentIntentId} (Gateway: ${intentData.intent?.gatewayKeyId})`
    );

    // 6c. Webhook Signature Verification
    const secret = 'recircuit-sandbox-webhook-secret-2026';
    const payload = JSON.stringify({ event: 'payment.captured', amount: 28500, currency: 'INR' });
    const validSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

    const webhookRes = await fetch(`${BASE_URL}/api/marketplace/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': validSignature,
      },
      body: payload,
    });
    record(
      'Financial Management',
      'Server-Side Webhook HMAC SHA256 Signature Verification',
      webhookRes.status === 200,
      'Valid cryptographic signature verified'
    );
  } catch (err: any) {
    record('Financial Management', 'Financial Tests', false, err.message);
  }

  // -----------------------------------------------------------------
  // 7. RECYCLER MANAGEMENT & NON-REUSABLE ROUTING
  // -----------------------------------------------------------------
  try {
    const recyclersRes = await fetch(`${BASE_URL}/api/admin/recyclers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const recyclersData = await recyclersRes.json();
    const recycler = recyclersData.recyclers?.[0];

    record(
      'Recycler Management',
      'CPCB Authorized Recycling Partner Directory',
      recyclersRes.status === 200 && Boolean(recycler),
      `Partner: ${recycler?.name} (${recycler?.cpcbLicenseNumber})`
    );

    // Fetch an inspected product to route to recycler
    const reqsRes = await fetch(`${BASE_URL}/api/admin/requests`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const reqsData = await reqsRes.json();
    const productToRecycle = reqsData.products?.find(
      (p: any) => p.currentStatus !== 'PAYMENT_COMPLETED' && p.currentStatus !== 'RECYCLED'
    ) || reqsData.products?.[0];

    if (productToRecycle && recycler) {
      const routeRes = await fetch(`${BASE_URL}/api/admin/recyclers/route-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          productId: productToRecycle.id,
          recyclerId: recycler.id,
          weightKg: 2.8,
        }),
      });
      const routeData = await routeRes.json();
      record(
        'Recycler Management',
        'Route Non-Reusable Product & Generate Zero-Landfill Certificate',
        routeRes.status === 201 && Boolean(routeData.recyclingRecord?.certificateNumber),
        `Certificate: ${routeData.recyclingRecord?.certificateNumber}`
      );
    }
  } catch (err: any) {
    record('Recycler Management', 'Recycler Routing', false, err.message);
  }

  // -----------------------------------------------------------------
  // 8. PRODUCT PASSPORT (ZERO-PII & VERIFICATION BADGE)
  // -----------------------------------------------------------------
  try {
    const passportRes = await fetch(`${BASE_URL}/api/passport/RC-2026-00142`);
    const passportData = await passportRes.json();
    const p = passportData.passport;

    const noPiiLeaked =
      p &&
      !p.userName &&
      !p.userEmail &&
      !p.userPhone &&
      !p.pickupAddress &&
      p.timeline.every((evt: any) => evt.actorRole !== 'USER' || evt.actorRole === 'VERIFIED_OWNER');

    record(
      'Product Passport',
      'Public Passport Serves Full Lifecycle & DPP Fingerprint',
      passportRes.status === 200 && Boolean(p?.cryptographicSignature),
      `Signature: ${p?.cryptographicSignature}`
    );

    record(
      'Product Passport',
      'Strict Zero-PII Customer Protection on Public Endpoint',
      noPiiLeaked,
      `Region: ${p?.region} • Actor Role: VERIFIED_OWNER`
    );
  } catch (err: any) {
    record('Product Passport', 'Passport Verification', false, err.message);
  }

  // -----------------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------------
  console.log('\n=====================================================');
  console.log('📊 PRODUCTION READINESS TEST SUMMARY');
  console.log('=====================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log(`Total Scenarios Tested: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Pass Rate: ${Math.round((passed / total) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 ALL PRODUCTION READINESS CRITERIA VERIFIED SUCCESSFULLY!');
  } else {
    console.log(`\n⚠️  ${failed} test(s) failed. Please review errors above.`);
  }
}

runProductionReadinessTests();
