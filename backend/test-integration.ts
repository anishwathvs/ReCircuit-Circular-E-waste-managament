import { describe, it } from 'node:test';
import assert from 'node:assert';

const BASE_URL = 'http://localhost:5001/api';

async function runTests() {
  console.log('🧪 Starting ReCircuit Comprehensive Integration & Security Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (e: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${e.message}`);
      failed++;
    }
  };

  let userToken = '';
  let adminToken = '';
  let agentToken = '';
  let retailerToken = '';
  let createdProductId = '';
  let createdCustomId = '';
  let createdPickupId = '';

  // 1. AUTHENTICATION & SECURITY TESTS
  console.log('--- 1. Authentication & Security Tests ---');
  await test('User Login with Valid Credentials', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@recircuit.com', password: 'password123' }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.accessToken);
    assert.strictEqual(data.user.role, 'USER');
    assert.strictEqual(data.user.name, 'Anishwath V');
    userToken = data.accessToken;
  });

  await test('Admin Login with Valid Credentials', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@recircuit.com', password: 'password123' }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.role, 'ADMIN');
    adminToken = data.accessToken;
  });

  await test('Agent Login with Valid Credentials', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'agent@recircuit.com', password: 'password123' }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.role, 'AGENT');
    agentToken = data.accessToken;
  });

  await test('Retailer Login with Valid Credentials', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'retailer@recircuit.com', password: 'password123' }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.role, 'RETAILER');
    retailerToken = data.accessToken;
  });

  await test('Invalid Password Rejection (401)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@recircuit.com', password: 'wrongpassword' }),
    });
    assert.strictEqual(res.status, 401);
  });

  await test('RBAC Security: User Token accessing Admin API -> 403 Forbidden', async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 403);
  });

  await test('RBAC Security: Unauthenticated access -> 401 Unauthorized', async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`);
    assert.strictEqual(res.status, 401);
  });

  // 2. PRODUCT SUBMISSION & USER DASHBOARD
  console.log('\n--- 2. Product Submission & User Flow ---');
  await test('User submits e-waste device', async () => {
    const res = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({
        category: 'Laptop',
        brand: 'Lenovo',
        model: 'Yoga Slim 7',
        ageYears: '1.5',
        condition: 'Screen flickering',
        problemDesc: 'Display cable has intermittent connection when opening past 90 degrees.',
        pickupAddress: '42, 4th Seaward Road, Valmiki Nagar',
        city: 'Chennai',
        pincode: '600041',
        preferredDate: new Date(Date.now() + 86400000).toISOString(),
        preferredTimeSlot: '2:00 PM - 4:00 PM',
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.product.id);
    assert.ok(data.product.customId.startsWith('RC-2026-'));
    assert.ok(data.pickup.id);
    createdProductId = data.product.id;
    createdCustomId = data.product.customId;
    createdPickupId = data.pickup.id;
  });

  await test('User retrieves my-products list', async () => {
    const res = await fetch(`${BASE_URL}/products/my-products`, {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data.products));
    assert.ok(data.products.length >= 1);
  });

  // 3. ADMIN MANAGEMENT & ASSIGNMENT
  console.log('\n--- 3. Admin Management & Operations ---');
  let agentId = '';
  await test('Admin retrieves stats & active agents', async () => {
    const res = await fetch(`${BASE_URL}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.strictEqual(res.status, 200);
    const stats = await res.json();
    assert.ok(stats.stats.totalRequests >= 1);
    assert.ok(stats.stats.totalRevenue >= 482300);

    const agRes = await fetch(`${BASE_URL}/admin/agents`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const agData = await agRes.json();
    assert.ok(agData.agents.length >= 1);
    agentId = agData.agents[0].id;
  });

  await test('Admin assigns field agent to pickup request', async () => {
    const res = await fetch(`${BASE_URL}/pickups/assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ pickupId: createdPickupId, agentId }),
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.pickup.status, 'ASSIGNED');
  });

  // 4. AGENT PICKUP & INSPECTION
  console.log('\n--- 4. Agent Pickup & Inspection Flow ---');
  await test('Agent starts pickup', async () => {
    const res = await fetch(`${BASE_URL}/pickups/${createdPickupId}/start`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${agentToken}` },
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.pickup.status, 'IN_PROGRESS');
  });

  await test('Agent completes pickup and submits physical inspection', async () => {
    // 1. Mark collected
    const colRes = await fetch(`${BASE_URL}/pickups/${createdPickupId}/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agentToken}`,
      },
      body: JSON.stringify({
        collectionNotes: 'Safely picked up from doorstep in anti-static foam pouch.',
      }),
    });
    assert.strictEqual(colRes.status, 200);

    // 2. Submit inspection
    const insRes = await fetch(`${BASE_URL}/inspections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${agentToken}`,
      },
      body: JSON.stringify({
        productId: createdProductId,
        physicalCondition: 'Good',
        powerOnStatus: true,
        hardwareCondition: 'Operational',
        batteryHealth: 88,
        damagedParts: ['Internal EDP Cable'],
        recommendation: 'REFURBISH',
        inspectionNotes: 'High-tier laptop. Replace EDP display cable and it will pass Grade A certified refurbished tests.',
        estimatedResaleValue: 34000,
      }),
    });
    assert.strictEqual(insRes.status, 201);
    const insData = await insRes.json();
    assert.strictEqual(insData.inspection.recommendation, 'REFURBISH');
  });

  // 5. VALUATION & REFURBISHMENT
  console.log('\n--- 5. Valuation & Refurbishment QA ---');
  await test('User accepts proposed fair-valuation', async () => {
    const res = await fetch(`${BASE_URL}/valuations/${createdProductId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
      body: JSON.stringify({ accept: true, remarks: 'Agreed with the breakdown' }),
    });
    assert.strictEqual(res.status, 200);
  });

  await test('Admin logs refurbishment repair and issues QC certificate', async () => {
    const refRes = await fetch(`${BASE_URL}/refurbishment/${createdProductId}/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        technicianName: 'Arun Kumar (Lead Hardware Tech)',
        repairDescription: 'Replaced OEM high-speed eDP ribbon cable, cleaned fan assembly, updated BIOS.',
        componentsReplaced: ['OEM Lenovo eDP 40-pin Cable'],
        repairCost: 1400,
        hardwareTestPassed: true,
        batteryTestPassed: true,
        stressTestPassed: true,
        testingStatus: 'Passed All 32 Diagnostics',
      }),
    });
    assert.strictEqual(refRes.status, 200);

    // Approve QC & List
    const certRes = await fetch(`${BASE_URL}/refurbishment/${createdProductId}/quality-approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ warrantyMonths: 6, sellingPrice: 34000 }),
    });
    assert.strictEqual(certRes.status, 200);
  });

  // 6. RETAILER B2B MARKETPLACE & PROFIT DISTRIBUTION
  console.log('\n--- 6. B2B Marketplace & Profit Distribution ---');
  let listingIdToBuy = '';
  await test('Retailer browses available listings', async () => {
    const res = await fetch(`${BASE_URL}/marketplace`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.listings.length >= 1);
    const created = data.listings.find((l: any) => l.productId === createdProductId);
    assert.ok(created, 'Newly refurbished product should be listed on marketplace');
    listingIdToBuy = created.id;
  });

  await test('Retailer places order -> Waterfall profit distribution executed', async () => {
    const res = await fetch(`${BASE_URL}/marketplace/order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${retailerToken}`,
      },
      body: JSON.stringify({
        listingIds: [listingIdToBuy],
        shippingAddress: 'Plot 44 Guindy Industrial Estate, Chennai',
      }),
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.order.orderNumber.startsWith('ORD-2026-'));
  });

  // 7. PUBLIC QR PRODUCT PASSPORT & ZERO-PII PRIVACY VERIFICATION
  console.log('\n--- 7. QR Product Passport & Zero-PII Verification ---');
  await test('Public Passport endpoint serves verified lifecycle without leaking customer PII', async () => {
    const res = await fetch(`${BASE_URL}/passport/${createdCustomId}`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    const passport = data.passport;

    // Verify key fields
    assert.strictEqual(passport.customId, createdCustomId);
    assert.strictEqual(passport.brand, 'Lenovo');
    assert.strictEqual(passport.model, 'Yoga Slim 7');
    assert.strictEqual(passport.currentStatus, 'PAYMENT_COMPLETED');
    assert.ok(passport.qrSvg);
    assert.ok(passport.timeline.length >= 4);

    // CRITICAL SECURITY & PRIVACY CHECK:
    // Ensure original user's name, email, phone, and specific street address are NOT present in passport object!
    const serialized = JSON.stringify(passport);
    assert.ok(!serialized.includes('Anishwath V'), 'CRITICAL: Seller name must not be leaked in public passport');
    assert.ok(!serialized.includes('user@recircuit.com'), 'CRITICAL: Seller email must not be leaked');
    assert.ok(!serialized.includes('98765 43210'), 'CRITICAL: Seller phone must not be leaked');
    assert.ok(!serialized.includes('4th Seaward Road'), 'CRITICAL: Street address must not be leaked');
    console.log('     🛡️ Privacy check confirmed: Zero PII exposed in public passport.');
  });

  await test('Public Passport for Featured RC-2026-00142 matches reference history', async () => {
    const res = await fetch(`${BASE_URL}/passport/RC-2026-00142`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.passport.brand, 'Dell');
    assert.strictEqual(data.passport.model, 'Latitude 5420');
    assert.strictEqual(data.passport.timeline.length, 5);
  });

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL: ${passed + failed})`);
  console.log(`========================================\n`);

  if (failed > 0) process.exit(1);
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

