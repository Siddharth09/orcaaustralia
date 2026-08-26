import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
const BASE = "https://tyypnlpqlv0ylyem.public.blob.vercel-storage.com/products";

const products = [
  {
    slug: "black-gym-shorts",
    name: "Black Gym Shorts",
    category: "GYM_SHORTS" as const,
    description:
      "Our go-to gym short in matte black. Lightweight, breathable fabric with a secure zip pocket for your keys, and just enough stretch to move the way you train.",
    priceCents: 6900,
    skuCode: "BLKSH",
    images: [
      "black-shorts-1-front.jpg",
      "black-shorts-2-back.jpg",
      "black-shorts-3-detail.jpg",
      "black-shorts-4-model.jpg",
    ],
  },
  {
    slug: "blue-gym-shorts",
    name: "Blue Gym Shorts",
    category: "GYM_SHORTS" as const,
    description:
      "A washed denim-blue gym short that goes from training to errands without missing a beat. Breathable fabric, a secure zip pocket, and stretch built to move.",
    priceCents: 6900,
    skuCode: "BLUSH",
    images: [
      "blue-shorts-1-front.jpg",
      "blue-shorts-2-back.jpg",
      "blue-shorts-3-detail.jpg",
      "blue-shorts-4-model.jpg",
      "blue-shorts-5-model.jpg",
    ],
  },
  {
    slug: "green-gym-shorts",
    name: "Green Gym Shorts",
    category: "GYM_SHORTS" as const,
    description:
      "Deep forest green for training days that need a bit of edge. Breathable fabric with a secure zip pocket and stretch that keeps up with you.",
    priceCents: 6900,
    skuCode: "GRNSH",
    images: [
      "green-shorts-1-front.jpg",
      "green-shorts-2-back.jpg",
      "green-shorts-3-detail.jpg",
      "green-shorts-4-model.jpg",
    ],
  },
  {
    slug: "high-seas-swim-shorts",
    name: "High Seas Print Swim Shorts",
    category: "SHORTS" as const,
    badge: "New",
    description:
      "Whales, sailboats, and a flock of gulls — for the ones who'd rather be out on the water. Lightweight, quick-dry, and just the right amount of playful.",
    priceCents: 7400,
    skuCode: "SEASH",
    images: [
      "highseas-shorts-1-front.jpg",
      "highseas-shorts-2-back.jpg",
      "highseas-shorts-3-side.jpg",
      "highseas-shorts-4-model.jpg",
      "highseas-shorts-5-model.jpg",
    ],
  },
  {
    slug: "polar-bear-swim-shorts",
    name: "Polar Bear Print Swim Shorts",
    category: "SHORTS" as const,
    badge: "New",
    description:
      "A snowy cabin and a family of polar bears — our most fun print yet, done up in lightweight, quick-dry swim fabric.",
    priceCents: 7400,
    skuCode: "PBSH",
    images: [
      "polarbear-shorts-1-front.jpg",
      "polarbear-shorts-2-back.jpg",
      "polarbear-shorts-3-detail.jpg",
      "polarbear-shorts-4-model.jpg",
      "polarbear-shorts-5-model.jpg",
    ],
  },
  {
    slug: "boxer-briefs-lockin",
    name: "Boxer Briefs — Lock-In Pouch",
    category: "BOXER_BRIEF" as const,
    badge: "Lock-In Pouch",
    description:
      "Our signature boxer brief with Lock-In Technology — a built-in inner pocket that keeps everything secure and in place, no adjusting required. Cut from ultra-luxury Tencel modal for an all-day second-skin feel.",
    priceCents: 3900,
    skuCode: "BBRFL",
    images: [
      "briefs-1-front.jpg",
      "briefs-2-back.jpg",
      "briefs-3-detail.jpg",
      "briefs-pocket-zoomed.jpg",
      "briefs-4-model.jpg",
      "briefs-5-model.jpg",
    ],
  },
  {
    slug: "boxer-briefs-classic",
    name: "Boxer Briefs — Classic Lining",
    category: "BOXER_BRIEF" as const,
    description:
      "The same ultra-luxury Tencel modal boxer brief, in our classic plain lining. Breathable, all-day comfort, zero fuss.",
    priceCents: 3900,
    skuCode: "BBRFC",
    images: [
      "briefs-1-front.jpg",
      "briefs-2-back.jpg",
      "briefs-plain-detail.jpg",
      "briefs-4-model.jpg",
      "briefs-5-model.jpg",
    ],
  },
];

async function main() {
  for (const p of products) {
    const images = p.images.map((f) => `${BASE}/${f}`);
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        category: p.category,
        badge: "badge" in p ? p.badge : undefined,
        description: p.description,
        coverImageUrl: images[0],
        images,
        variants: {
          create: SIZES.map((size) => ({
            size,
            sku: `ORCA-${p.skuCode}-${size}`,
            priceCents: p.priceCents,
            stock: 25,
          })),
        },
      },
    });
    console.log("Seeded product:", product.slug);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
