/**
 * Zion Shop -- database seed (Phase 1, Week 2)
 * Run with: pnpm db:seed
 *
 * Creates:
 *   - 2 parent + 5 sellable categories
 *   - 20 sample products, each with images + size/color variants
 *   - 1 admin user (via Supabase Auth, if service-role env is present)
 *
 * Idempotent: re-running upserts by unique slug/sku and won't duplicate rows.
 */
import { PrismaClient, Gender, Size, Role } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
async function seedCategories() {
  const men = await prisma.category.upsert({
    where: { slug: "men" },
    update: {},
    create: { name: "Men", slug: "men", gender: Gender.MEN },
  });
  const women = await prisma.category.upsert({
    where: { slug: "women" },
    update: {},
    create: { name: "Women", slug: "women", gender: Gender.WOMEN },
  });

  const subs = [
    { name: "Men's Shirts", parentId: men.id, gender: Gender.MEN },
    { name: "Men's Panjabi", parentId: men.id, gender: Gender.MEN },
    { name: "Women's Three-Piece", parentId: women.id, gender: Gender.WOMEN },
    { name: "Women's Saree", parentId: women.id, gender: Gender.WOMEN },
    { name: "Women's Kurti", parentId: women.id, gender: Gender.WOMEN },
  ];

  const created = [];
  for (const s of subs) {
    const cat = await prisma.category.upsert({
      where: { slug: slugify(s.name) },
      update: {},
      create: { name: s.name, slug: slugify(s.name), parentId: s.parentId, gender: s.gender },
    });
    created.push(cat);
  }
  return created; // 5 sellable categories
}

// ---------------------------------------------------------------------------
// Products (4 per sellable category = 20 total)
// ---------------------------------------------------------------------------
const SIZES: Size[] = [Size.S, Size.M, Size.L, Size.XL];

const PRODUCTS: Record<string, { names: string[]; colors: string[]; price: number }> = {
  "men-s-shirts": {
    names: ["Classic Oxford Shirt", "Slim-Fit Formal Shirt", "Casual Check Shirt", "Linen Summer Shirt"],
    colors: ["White", "Sky Blue", "Black"],
    price: 1450,
  },
  "men-s-panjabi": {
    names: ["Embroidered Eid Panjabi", "Cotton Casual Panjabi", "Silk Festive Panjabi", "Printed Panjabi"],
    colors: ["Off-White", "Maroon", "Navy"],
    price: 2200,
  },
  "women-s-three-piece": {
    names: ["Floral Cotton Three-Piece", "Embroidered Party Three-Piece", "Block-Print Three-Piece", "Georgette Three-Piece"],
    colors: ["Pink", "Teal", "Mustard"],
    price: 2600,
  },
  "women-s-saree": {
    names: ["Jamdani Handloom Saree", "Soft Silk Saree", "Cotton Tant Saree", "Half-Silk Saree"],
    colors: ["Red", "Green", "Royal Blue"],
    price: 3500,
  },
  "women-s-kurti": {
    names: ["Straight-Cut Kurti", "A-Line Printed Kurti", "Embroidered Festive Kurti", "Denim Casual Kurti"],
    colors: ["Black", "Yellow", "Lavender"],
    price: 1200,
  },
};

async function seedProducts(categories: { id: string; slug: string; gender: Gender | null }[]) {
  let total = 0;
  for (const cat of categories) {
    const spec = PRODUCTS[cat.slug];
    if (!spec) continue;

    for (let i = 0; i < spec.names.length; i++) {
      const name = spec.names[i];
      const slug = slugify(name);
      const isFeatured = i === 0; // first product of each category is featured

      const product = await prisma.product.upsert({
        where: { slug },
        update: {},
        create: {
          name,
          slug,
          description:
            `${name} -- premium quality from Zion Shop. Comfortable fit, durable fabric, and made for the Bangladeshi climate. Available in multiple sizes and colors.`,
          basePrice: spec.price,
          gender: cat.gender ?? Gender.UNISEX,
          categoryId: cat.id,
          brand: "Zion",
          isActive: true,
          isFeatured,
          images: {
            create: [
              { url: `https://res.cloudinary.com/demo/image/upload/zion/${slug}-1.jpg`, order: 0, alt: `${name} front` },
              { url: `https://res.cloudinary.com/demo/image/upload/zion/${slug}-2.jpg`, order: 1, alt: `${name} back` },
            ],
          },
        },
      });

      // Variants: every color x size combination
      for (const color of spec.colors) {
        for (const size of SIZES) {
          const sku = `${slug}-${slugify(color)}-${size}`.toUpperCase();
          await prisma.productVariant.upsert({
            where: { sku },
            update: {},
            create: {
              productId: product.id,
              size,
              color,
              sku,
              stock: 25,
            },
          });
        }
      }
      total++;
    }
  }
  return total;
}

// ---------------------------------------------------------------------------
// Admin user (Supabase Auth + mirrored User row)
// ---------------------------------------------------------------------------
async function seedAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const email = "admin@zionshop.com";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  if (!url || !serviceKey) {
    console.warn("  [skip] admin: NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set.");
    return;
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // Create (or find) the Supabase auth user
  let userId: string | undefined;
  const { data: created, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: "Zion Admin" },
  });

  if (error) {
    // Likely already exists -- look it up
    const { data: list } = await supabase.auth.admin.listUsers();
    userId = list?.users.find((u) => u.email === email)?.id;
    if (!userId) {
      console.warn("  [skip] admin: could not create or find auth user ->", error.message);
      return;
    }
  } else {
    userId = created.user?.id;
  }

  if (!userId) return;

  await prisma.user.upsert({
    where: { id: userId },
    update: { role: Role.ADMIN, name: "Zion Admin" },
    create: { id: userId, email, name: "Zion Admin", role: Role.ADMIN },
  });

  console.log(`  admin ready -> ${email} (password: ${password})`);
}

// ---------------------------------------------------------------------------
async function main() {
  console.log("Seeding Zion Shop...");

  const categories = await seedCategories();
  console.log(`  categories: ${categories.length} sellable (+2 parents)`);

  const productCount = await seedProducts(categories);
  console.log(`  products:   ${productCount} (with images + variants)`);

  await seedAdmin();

  // Default white-label store settings (single row)
  const existing = await prisma.storeSettings.findFirst();
  if (!existing) {
    await prisma.storeSettings.create({
      data: {
        storeName: "Zion Shop",
        contactEmail: "hello@zionshop.com",
        contactPhone: "+8801XXXXXXXXX",
        primaryColor: "#c2410c",
        secondaryColor: "#1f2937",
      },
    });
    console.log("  store settings: created default branding row");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
