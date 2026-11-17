import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

async function main() {
  const prodDbUrl = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;

  if (!prodDbUrl || prodDbUrl.includes('localhost') || prodDbUrl.includes('127.0.0.1')) {
    console.error('❌ Error: PRODUCTION_DATABASE_URL must be set to a remote production PostgreSQL connection string (e.g. Neon).');
    process.exit(1);
  }

  console.log('🚀 Connecting to Production Neon PostgreSQL...');
  console.log(`🔗 Target Host: ${new URL(prodDbUrl).hostname}`);

  // Test Prisma Client connection to production DB
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

    console.log('📦 Pushing Prisma schema to Production Database...');
    execSync('npx prisma db push --skip-generate', {
      env: { ...process.env, DATABASE_URL: prodDbUrl },
      stdio: 'inherit'
    });
    console.log('✅ Production schema successfully synchronized!');

    const shouldSeed = process.argv.includes('--seed');
    if (shouldSeed) {
      console.log('🌱 Seeding initial production data (55 catalogue SKUs & reference accounts)...');
      execSync('npx tsx prisma/seed.ts', {
        env: { ...process.env, DATABASE_URL: prodDbUrl },
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
