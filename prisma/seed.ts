import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SIZES = ["S", "M", "L", "XL", "XXL"] as const;

async function main() {
  const shorts = await prisma.product.upsert({
    where: { slug: "classic-swim-shorts" },
    update: {},
    create: {
      slug: "classic-swim-shorts",
      name: "Classic Swim Shorts",
      description:
        "Quick-dry swim shorts built for the beach and beyond. Mesh lining, side pockets, and a comfortable elastic waistband.",
      category: "SHORTS",
      coverImageUrl: "/placeholders/swim-shorts.svg",
      images: ["/placeholders/swim-shorts.svg"],
      variants: {
        create: SIZES.map((size) => ({
          size,
          sku: `ORCA-SH-${size}`,
          priceCents: 6900,
          stock: 25,
        })),
      },
    },
  });

  const boxers = await prisma.product.upsert({
    where: { slug: "tencel-modal-boxer-brief" },
    update: {},
    create: {
      slug: "tencel-modal-boxer-brief",
      name: "Tencel Modal Boxer Brief",
      description:
        "Ultra-soft Tencel modal boxer briefs with a breathable, moisture-wicking feel. Made for all-day comfort.",
      category: "BOXER_BRIEF",
      coverImageUrl: "/placeholders/boxer-briefs.svg",
      images: ["/placeholders/boxer-briefs.svg"],
      variants: {
        create: SIZES.map((size) => ({
          size,
          sku: `ORCA-BB-${size}`,
          priceCents: 3900,
          stock: 40,
        })),
      },
    },
  });

  console.log("Seeded products:", shorts.slug, boxers.slug);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
