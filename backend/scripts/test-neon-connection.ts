import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

import fs from 'fs';

// Explicitly load .env.local with override: true
const envLocalPath = fs.existsSync(path.resolve(process.cwd(), '.env.local'))
  ? path.resolve(process.cwd(), '.env.local')
  : path.resolve(process.cwd(), 'backend/.env.local');

dotenv.config({ path: envLocalPath, override: true });

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL not found in environment or .env.local');
    process.exit(1);
  }

  // Masked host inspection (NEVER print password or secret)
  try {
    const parsed = new URL(dbUrl);
    console.log(`🔌 Neon Database Target Host: ${parsed.hostname}`);
    console.log(`📡 Protocol: ${parsed.protocol} | User: ${parsed.username} | DB: ${parsed.pathname.replace('/', '')}`);
  } catch {
    console.log('🔌 Connecting to configured database...');
  }

  const prisma = new PrismaClient({
    datasources: {
      db: { url: dbUrl }
    }
  });

  try {
    console.log('⏳ Testing connection to Neon PostgreSQL...');
    const start = Date.now();
    const result = await prisma.$queryRaw<Array<{ connected: number; now: Date }>>`
      SELECT 1 as connected, NOW() as now
    `;
    const latency = Date.now() - start;

    console.log(`✅ Connection SUCCESSFUL! Query latency: ${latency}ms`);
    console.log(`⏱️ Neon Server Time: ${result[0]?.now?.toISOString() || 'Unknown'}`);

    // Check existing tables in public schema
    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    console.log(`📋 Existing tables in database (${tables.length} total):`);
    if (tables.length === 0) {
      console.log('   (No application tables found yet - clean database ready for schema sync)');
    } else {
      tables.forEach(t => console.log(`   - ${t.table_name}`));
      
      // If Product table exists, count products
      const hasProduct = tables.some(t => t.table_name === 'Product');
      if (hasProduct) {
        const productCount = await prisma.$queryRaw<Array<{ count: bigint }>>`SELECT count(*) FROM "Product"`;
        console.log(`📦 Existing Products in database: ${productCount[0]?.count?.toString() || 0}`);
      }
    }

    console.log('🎉 Neon PostgreSQL integration test PASSED with zero credential leakage!');
  } catch (error: any) {
    console.error('❌ Database connection error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
