import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

// Load .env.local safely
const envLocalPath = fs.existsSync(path.resolve(process.cwd(), '.env.local'))
  ? path.resolve(process.cwd(), '.env.local')
  : path.resolve(process.cwd(), 'backend/.env.local');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath, override: true });
}

async function main() {
  const prodDbUrl = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL || process.env.DATABASE_URL_UNPOOLED || prodDbUrl;

  if (!prodDbUrl || prodDbUrl.includes('localhost') || prodDbUrl.includes('127.0.0.1')) {
    console.error('❌ Error: Remote production database URL not found or pointing to localhost.');
    process.exit(1);
  }

  // Safe host display (never print credentials or connection string)
  try {
    const parsed = new URL(prodDbUrl);
    console.log('🚀 Connecting to Production Neon PostgreSQL...');
    console.log(`🔗 Target Host: ${parsed.hostname}`);
  } catch {
    console.log('🚀 Connecting to Production Neon PostgreSQL...');
  }

  const prisma = new PrismaClient({
    datasources: {
      db: { url: prodDbUrl }
    }
  });

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;
    console.log(`✅ Database connection verified! Latency: ${latency}ms`);

    console.log('📦 Pushing Prisma schema to Production Neon Database...');
    execSync('npx prisma db push --skip-generate', {
      env: {
        ...process.env,
        DATABASE_URL: prodDbUrl,
        DIRECT_URL: directUrl
      },
      stdio: 'inherit'
    });
    console.log('✅ Production schema successfully synchronized!');

    const shouldSeed = process.argv.includes('--seed');
    if (shouldSeed) {
      console.log('🌱 Seeding initial production data (55 catalogue SKUs & reference accounts)...');
      execSync('npx tsx prisma/seed.ts', {
        env: {
          ...process.env,
          DATABASE_URL: prodDbUrl,
          DIRECT_URL: directUrl
        },
        stdio: 'inherit'
      });
      console.log('✅ Initial production seeding completed!');
    }

    const tableCounts = await prisma.$queryRaw<Array<{ count: bigint }>>`SELECT count(*) FROM "Product"`;
    console.log(`📊 Total Products in Production DB: ${tableCounts[0]?.count?.toString() || 0}`);
    console.log('🎉 Production database is ready for Render deployment!');

  } catch (error: any) {
    console.error('❌ Production database setup failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
