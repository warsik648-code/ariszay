/**
 * Prisma seed script.
 * Run: pnpm db:seed
 *
 * Seeds the database with:
 *  - Initial games (The Isle, Naraka)
 *  - Product plans from static data
 *  - FAQ entries
 *  - First admin account from env (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD)
 */

import { PrismaClient, UserRole } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ── Games ────────────────────────────────────────────────────────────────
  const isle = await prisma.game.upsert({
    where: { slug: "isle" },
    update: {},
    create: {
      slug: "isle",
      cheatsSlug: "the-isle",
      name: "The Isle",
      shortName: "Isle",
      description:
        "Software tools for The Isle — covering both Evrima and Legacy builds.",
      tagline: "Evrima & Legacy supported",
      accent: "#10b981",
    },
  });

  const naraka = await prisma.game.upsert({
    where: { slug: "naraka" },
    update: {},
    create: {
      slug: "naraka",
      cheatsSlug: "naraka-bladepoint",
      name: "Naraka: Bladepoint",
      shortName: "Naraka",
      description:
        "Enhancement tools for Naraka: Bladepoint's competitive melee-combat environment.",
      tagline: "Competitive enhancement tools",
      accent: "#6366f1",
    },
  });

  console.log("✅ Games seeded");

  // ── Products ─────────────────────────────────────────────────────────────
  const cheatDefs = [
    {
      slug: "isle-xray",
      name: "Isle Xray",
      description:
        "Visibility overlay for The Isle — player positions, loot, and distance readouts.",
      features: [
        "Player ESP with health bars",
        "Distance indicators",
        "Loot value overlay",
        "Configurable hotkeys",
        "Customizable render distance",
      ],
      plans: [
        { label: "Monthly", durationDays: 30, price: "14.99" },
        { label: "Lifetime", durationDays: null, price: "49.99" },
      ],
      gameId: isle.id,
    },
    {
      slug: "isle-pro",
      name: "Isle Pro",
      description:
        "Expanded toolkit with aim-assist options, additional ESP types, and threat filters.",
      features: [
        "All Xray features",
        "Aim assist (configurable)",
        "Trigger assist",
        "Threat filter ESP",
        "Weapon detection overlay",
      ],
      plans: [
        { label: "Monthly", durationDays: 30, price: "24.99" },
        { label: "Lifetime", durationDays: null, price: "79.99" },
      ],
      gameId: isle.id,
    },
    {
      slug: "isle-private",
      name: "Isle Private",
      description:
        "Full-featured suite with aimbot controls, radar, and stream-capture exclusion.",
      features: [
        "All Pro features",
        "Aimbot with smoothing controls",
        "2D radar minimap",
        "Stream-capture exclusion",
        "Priority support channel",
        "Drone/companion tools",
      ],
      plans: [
        { label: "Monthly", durationDays: 30, price: "29.99" },
        { label: "Lifetime", durationDays: null, price: "99.99" },
      ],
      gameId: isle.id,
    },
    {
      slug: "naraka-xray",
      name: "Naraka Xray",
      description:
        "Overlay tools for Naraka: Bladepoint focused on situational awareness.",
      features: [
        "Player ESP with health",
        "Distance indicators",
        "Loot overlay",
        "Configurable hotkeys",
        "Customizable render distance",
      ],
      plans: [
        { label: "Monthly", durationDays: 30, price: "14.99" },
        { label: "Lifetime", durationDays: null, price: "49.99" },
      ],
      gameId: naraka.id,
    },
    {
      slug: "naraka-pro",
      name: "Naraka Pro",
      description:
        "Competitive toolkit with aim assistance, trigger tools, and hostile filters.",
      features: [
        "All Xray features",
        "Aim assist (configurable)",
        "Trigger assist",
        "Hostile filter ESP",
        "Weapon detection",
      ],
      plans: [
        { label: "Monthly", durationDays: 30, price: "24.99" },
        { label: "Lifetime", durationDays: null, price: "79.99" },
      ],
      gameId: naraka.id,
    },
    {
      slug: "naraka-private",
      name: "Naraka Private",
      description:
        "Complete suite for Naraka with aimbot controls, radar, and stream-capture exclusion.",
      features: [
        "All Pro features",
        "Aimbot with smoothing controls",
        "2D radar minimap",
        "Stream-capture exclusion",
        "Priority support channel",
      ],
      plans: [
        { label: "Monthly", durationDays: 30, price: "29.99" },
        { label: "Lifetime", durationDays: null, price: "99.99" },
      ],
      gameId: naraka.id,
    },
  ];

  for (const def of cheatDefs) {
    const product = await prisma.product.upsert({
      where: { slug: def.slug },
      update: { name: def.name, description: def.description },
      create: {
        slug: def.slug,
        type: "CHEAT",
        name: def.name,
        description: def.description,
        longDescription: def.description,
        gameId: def.gameId,
      },
    });

    for (let i = 0; i < def.features.length; i++) {
      await prisma.productFeature.upsert({
        where: { id: `${product.id}-feat-${i}` },
        update: { text: def.features[i]! },
        create: {
          id: `${product.id}-feat-${i}`,
          productId: product.id,
          text: def.features[i]!,
          sortOrder: i,
        },
      });
    }

    for (let i = 0; i < def.plans.length; i++) {
      const plan = def.plans[i]!;
      await prisma.productPlan.upsert({
        where: { id: `${product.id}-plan-${i}` },
        update: { price: plan.price },
        create: {
          id: `${product.id}-plan-${i}`,
          productId: product.id,
          label: plan.label,
          durationDays: plan.durationDays,
          price: plan.price,
          sortOrder: i,
        },
      });
    }
  }

  console.log("✅ Products seeded");

  // ── Admin account ─────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  const adminName = process.env.SEED_ADMIN_NAME ?? "Admin";

  if (adminEmail && adminPassword) {
    const hashedPassword = await hash(adminPassword, 12);

    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        name: adminName,
        emailVerified: true,
        role: UserRole.OWNER,
      },
    });

    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: "credential",
          accountId: adminEmail,
        },
      },
      update: { password: hashedPassword },
      create: {
        userId: admin.id,
        accountId: adminEmail,
        providerId: "credential",
        password: hashedPassword,
      },
    });

    console.log(`✅ Admin account seeded: ${adminEmail}`);
  } else {
    console.warn(
      "⚠️  SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD not set. Skipping admin account.",
    );
  }

  console.log("🎉 Seed complete");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
