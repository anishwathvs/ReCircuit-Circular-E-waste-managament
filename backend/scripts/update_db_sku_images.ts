import { PrismaClient } from '@prisma/client';
import { EXPANDED_MARKETPLACE_PRODUCTS } from '../src/data/expandedMarketplaceProducts';

const prisma = new PrismaClient();

async function main() {
  console.log('=== UPDATING POSTGRESQL PRODUCT & LISTING IMAGES ===');
  
  // Mapping of title to image
  const titleToImage = new Map<string, string>();
  for (const item of EXPANDED_MARKETPLACE_PRODUCTS) {
    titleToImage.set(item.title, item.images[0]);
  }

  // 1. Update MarketplaceListing records
  const listings = await prisma.marketplaceListing.findMany({
    include: { product: true },
  });
  console.log(`Found ${listings.length} marketplace listings`);

  let listingUpdatedCount = 0;
  for (const listing of listings) {
    const newImage = titleToImage.get(listing.title);
    if (newImage) {
      await prisma.marketplaceListing.update({
        where: { id: listing.id },
        data: { images: [newImage] },
      });
      // Also update linked product images
      if (listing.productId) {
        await prisma.product.update({
          where: { id: listing.productId },
          data: { images: [newImage] },
        });
      }
      listingUpdatedCount++;
      console.log(`Updated listing & product: [${listing.product?.customId || 'N/A'}] ${listing.title} -> ${newImage}`);
    } else {
      // If title doesn't match directly, check customId RC-2026-00200..00254
      console.log(`Listing title not in map: "${listing.title}"`);
    }
  }

  // 2. Also check all products in Product table to ensure customId RC-2026-00200..00254 have their images set
  const products = await prisma.product.findMany({
    where: {
      customId: {
        gte: 'RC-2026-00200',
        lte: 'RC-2026-00254',
      },
    },
  });

  let productUpdatedCount = 0;
  for (const prod of products) {
    // Find matching item in EXPANDED_MARKETPLACE_PRODUCTS by brand & model or title
    const match = EXPANDED_MARKETPLACE_PRODUCTS.find(
      p => p.model === prod.model || p.brand === prod.brand && prod.model.includes(p.model) || prod.model.includes(p.brand)
    );
    if (match) {
      await prisma.product.update({
        where: { id: prod.id },
        data: { images: [match.images[0]] },
      });
      productUpdatedCount++;
    }
  }

  console.log(`\nMarketplace listings updated: ${listingUpdatedCount}`);
  console.log(`Products checked/updated: ${productUpdatedCount}`);

  // Summary verification
  const updatedListings = await prisma.marketplaceListing.findMany({
    select: { id: true, title: true, images: true },
  });
  const uniqueImages = new Set(updatedListings.map(l => l.images[0]));
  console.log(`\nTotal listings: ${updatedListings.length}`);
  console.log(`Total UNIQUE images across listings: ${uniqueImages.size}`);
}

main()
  .catch(e => {
    console.error('Error updating DB:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

