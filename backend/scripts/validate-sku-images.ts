import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { EXPANDED_MARKETPLACE_PRODUCTS } from '../src/data/expandedMarketplaceProducts';

const prisma = new PrismaClient();
const FRONTEND_PUBLIC_DIR = path.resolve(__dirname, '../../frontend/public');

interface SkuAuditResult {
  skuId: string;
  category: string;
  brand: string;
  model: string;
  imagePath: string;
  fileExists: boolean;
  fileSizeBytes: number;
  isDuplicate: boolean;
  categoryFolderMatch: boolean;
  status: 'PASS' | 'FAIL';
  notes: string;
}

async function validateSkuImages() {
  console.log('================================================================');
  console.log('   RECIRCUIT SKU-LEVEL PRODUCT IMAGE AUDIT & VALIDATION SUITE   ');
  console.log('================================================================\n');

  const productsInDb = await prisma.product.findMany({
    where: {
      customId: {
        gte: 'RC-2026-00200',
        lte: 'RC-2026-00254',
      },
    },
    orderBy: { customId: 'asc' },
  });

  const listingsInDb = await prisma.marketplaceListing.findMany({
    include: { product: true },
    orderBy: { listedAt: 'asc' },
  });

  console.log(`Auditing ${EXPANDED_MARKETPLACE_PRODUCTS.length} catalogue products...`);
  console.log(`Database Products (RC-2026-00200..00254): ${productsInDb.length}`);
  console.log(`Database Marketplace Listings: ${listingsInDb.length}\n`);

  const assignedImages = new Set<string>();
  const duplicateImages = new Set<string>();

  // Check for duplicates in EXPANDED_MARKETPLACE_PRODUCTS
  for (const item of EXPANDED_MARKETPLACE_PRODUCTS) {
    const img = item.images[0];
    if (assignedImages.has(img)) {
      duplicateImages.add(img);
    }
    assignedImages.add(img);
  }

  const results: SkuAuditResult[] = [];
  let passCount = 0;
  let failCount = 0;

  for (let i = 0; i < EXPANDED_MARKETPLACE_PRODUCTS.length; i++) {
    const p = EXPANDED_MARKETPLACE_PRODUCTS[i];
    const skuId = `RC-2026-${String(200 + i).padStart(5, '0')}`;
    const imgPath = p.images[0];
    const fullDiskPath = path.join(FRONTEND_PUBLIC_DIR, imgPath);

    const exists = fs.existsSync(fullDiskPath);
    const size = exists ? fs.statSync(fullDiskPath).size : 0;
    const isDup = duplicateImages.has(imgPath);

    const catLower = p.category.toLowerCase();
    const expectedFolder = catLower === 'ram' ? 'ram' : 
                           catLower === 'cpu' ? 'cpus' :
                           catLower === 'gpu' ? 'gpus' :
                           catLower === 'battery' ? 'batteries' :
                           `${catLower}s`;
    const folderMatch = imgPath.includes(`/${expectedFolder}/`);

    const isPass = exists && size > 500 && !isDup && folderMatch;
    if (isPass) passCount++;
    else failCount++;

    results.push({
      skuId,
      category: p.category,
      brand: p.brand,
      model: p.model,
      imagePath: imgPath,
      fileExists: exists,
      fileSizeBytes: size,
      isDuplicate: isDup,
      categoryFolderMatch: folderMatch,
      status: isPass ? 'PASS' : 'FAIL',
      notes: isPass ? '100% distinct verified SKU image' : 
             !exists ? 'File missing on disk' :
             size <= 500 ? 'File too small' :
             isDup ? 'Duplicate image detected' : 'Category folder mismatch',
    });
  }

  // Print Summary Table by Category
  const categories = Array.from(new Set(results.map(r => r.category)));
  for (const cat of categories) {
    console.log(`----------------------------------------------------------------`);
    console.log(` CATEGORY: ${cat.toUpperCase()}`);
    console.log(`----------------------------------------------------------------`);
    const catResults = results.filter(r => r.category === cat);
    for (const r of catResults) {
      console.log(`  [${r.status}] ${r.skuId} | ${r.brand.padEnd(14)} | ${r.model.slice(0, 26).padEnd(26)} | ${path.basename(r.imagePath).padEnd(32)} | ${(r.fileSizeBytes / 1024).toFixed(1)} KB`);
    }
  }

  console.log('\n================================================================');
  console.log(` SUMMARY: TOTAL PRODUCTS AUDITED: ${results.length}`);
  console.log(` UNIQUE IMAGES: ${assignedImages.size}/${results.length}`);
  console.log(` DUPLICATES DETECTED: ${duplicateImages.size}`);
  console.log(` PASSED: ${passCount} | FAILED: ${failCount}`);
  console.log('================================================================\n');

  if (failCount > 0) {
    console.error(`VALIDATION FAILED: ${failCount} products failed image checks.`);
    process.exit(1);
  } else {
    console.log('ALL 55 PRODUCTS PASSED SKU-LEVEL IMAGE AUDIT WITH ZERO DUPLICATES!');
  }
}

validateSkuImages()
  .catch(err => {
    console.error('Validation error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
