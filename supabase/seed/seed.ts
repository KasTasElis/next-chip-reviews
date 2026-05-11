import "dotenv/config";
import { Pool } from "pg";
import { faker } from "@faker-js/faker";
import slugify from "slugify";
import type { BrandInsert, ChipInsert, ReviewInsert } from "../types";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const USERS_COUNT = 10_000;
const BRANDS_COUNT = 200;
const CHIPS_COUNT = 10_000;
const REVIEWS_COUNT = 350_000;
const BATCH_SIZE = 500;

function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function runBatches<T, R>(
  label: string,
  total: number,
  items: T[],
  insertBatch: (batch: T[]) => Promise<R[]>,
): Promise<R[]> {
  const batches = chunk(items, BATCH_SIZE);
  const results: R[] = [];
  let processed = 0;

  try {
    for (const batch of batches) {
      results.push(...(await insertBatch(batch)));
      processed += batch.length;
      const pct = Math.round((processed / total) * 100);
      process.stdout.write(
        `\rSeeding ${label}: ${processed}/${total} (${pct}%)`,
      );
    }
    process.stdout.write("\n");
  } catch (error) {
    console.error(`Error seeding ${label}:`, error);
    throw error;
  }

  return results;
}

async function cleanup() {
  await pool.query("TRUNCATE public.reviews, public.chips, public.brands, public.profiles, auth.users CASCADE");
  console.log("Cleaned up.");
}

async function seedUsersAndProfiles(): Promise<string[]> {
  console.log(`Seeding ${USERS_COUNT} users...`);

  // Generate a single bcrypt hash for the password to reuse for all users
  // this is DRASTICALLY faster than generating a unique hash for each user
  const {
    rows: [{ hash }],
  } = await pool.query("SELECT crypt('password123', gen_salt('bf')) AS hash");

  const users = Array.from({ length: USERS_COUNT }, (_, i) => ({
    email: faker.internet.email().replace("@", `+${i}@`),
    metaData: JSON.stringify({
      username: `${faker.internet.username()}${i}`,
      avatar_url: null,
    }),
  }));

  return runBatches("users", USERS_COUNT, users, async (batch) => {
    const result = await pool.query(
      `INSERT INTO auth.users
         (id, aud, role, email, encrypted_password, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
       SELECT gen_random_uuid(), 'authenticated', 'authenticated', unnest($1::text[]), $2, unnest($3::text[])::jsonb, unnest($4::timestamptz[]), unnest($4::timestamptz[]), unnest($4::timestamptz[])
       RETURNING id`,
      [batch.map((u) => u.email), hash, batch.map((u) => u.metaData), batch.map(() => faker.date.past({ years: 2 }).toISOString())],
    );
    return result.rows.map((row) => row.id as string);
  });
}

async function seedBrands(userIds: string[]): Promise<string[]> {
  console.log(`Seeding ${BRANDS_COUNT} brands...`);

  const brands: BrandInsert[] = Array.from({ length: BRANDS_COUNT }, (_, i) => {
    const name = `${faker.company.name()}${i}`;
    return {
      name,
      slug: slugify(name, { lower: true, strict: true }),
      description:
        faker.helpers.maybe(() => faker.company.catchPhrase(), {
          probability: 0.7,
        }) ?? null,
      logo_url: '/brand-placeholder.jpg',
      user_id: randomFrom(userIds),
      created_at: faker.date.past({ years: 2 }).toISOString(),
    };
  });

  return runBatches("brands", BRANDS_COUNT, brands, async (batch) => {
    const result = await pool.query(
      `INSERT INTO public.brands (id, name, slug, logo_url, description, user_id, created_at)
       SELECT gen_random_uuid() AS id, unnest($1::text[]), unnest($2::text[]), unnest($3::text[]), unnest($4::text[]), unnest($5::uuid[]), unnest($6::timestamptz[])
       RETURNING id`,
      [
        batch.map((b) => b.name),
        batch.map((b) => b.slug),
        batch.map((b) => b.logo_url),
        batch.map((b) => b.description),
        batch.map((b) => b.user_id),
        batch.map((b) => b.created_at),
      ],
    );
    return result.rows.map((row) => row.id as string);
  });
}

async function seedChips(
  brandIds: string[],
  userIds: string[],
): Promise<string[]> {
  console.log(`Seeding ${CHIPS_COUNT} chips...`);

  const chips: ChipInsert[] = Array.from({ length: CHIPS_COUNT }, (_, i) => {
    const name = `${faker.commerce.productName()}${i}`;
    return {
      name,
      slug: slugify(name, { lower: true, strict: true }),
      description:
        faker.helpers.maybe(() => faker.commerce.productDescription(), {
          probability: 0.7,
        }) ?? null,
      photo_url: '/chip-placeholder.jpg',
      brand_id: randomFrom(brandIds),
      user_id: randomFrom(userIds),
      created_at: faker.date.past({ years: 2 }).toISOString(),
    };
  });

  return runBatches("chips", CHIPS_COUNT, chips, async (batch) => {
    const result = await pool.query(
      `INSERT INTO public.chips (id, name, slug, description, photo_url, brand_id, user_id, created_at)
       SELECT gen_random_uuid() AS id, unnest($1::text[]), unnest($2::text[]), unnest($3::text[]), unnest($4::text[]), unnest($5::uuid[]), unnest($6::uuid[]), unnest($7::timestamptz[])
       RETURNING id`,
      [
        batch.map((c) => c.name),
        batch.map((c) => c.slug),
        batch.map((c) => c.description),
        batch.map((c) => c.photo_url),
        batch.map((c) => c.brand_id),
        batch.map((c) => c.user_id),
        batch.map((c) => c.created_at),
      ],
    );
    return result.rows.map((row) => row.id as string);
  });
}

async function seedReviews(
  chipIds: string[],
  userIds: string[],
): Promise<void> {
  console.log(`Seeding ${REVIEWS_COUNT} reviews...`);

  // Build unique (chip_id, user_id) pairs — the table has a unique constraint on both
  const used = new Set<string>();
  const reviews: ReviewInsert[] = [];

  while (reviews.length < REVIEWS_COUNT) {
    const chip_id = randomFrom(chipIds);
    const user_id = randomFrom(userIds);
    const key = `${chip_id}:${user_id}`;
    if (used.has(key)) continue;
    used.add(key);
    reviews.push({
      chip_id,
      user_id,
      review: faker.lorem.sentences({ min: 1, max: 4 }),
      photo_url:
        faker.helpers.maybe(() => '/chip-placeholder.jpg', { probability: 0.3 }) ??
        null,
      rating: faker.number.int({ min: 1, max: 5 }),
      created_at: faker.date.past({ years: 2 }).toISOString(),
    });
  }

  await runBatches<ReviewInsert, never>(
    "reviews",
    REVIEWS_COUNT,
    reviews,
    async (batch) => {
      await pool.query(
        `INSERT INTO public.reviews (id, chip_id, user_id, review, photo_url, rating, created_at)
       SELECT gen_random_uuid(), unnest($1::uuid[]), unnest($2::uuid[]), unnest($3::text[]), unnest($4::text[]), unnest($5::smallint[]), unnest($6::timestamptz[])`,
        [
          batch.map((r) => r.chip_id),
          batch.map((r) => r.user_id),
          batch.map((r) => r.review),
          batch.map((r) => r.photo_url),
          batch.map((r) => r.rating),
          batch.map((r) => r.created_at),
        ],
      );
      return [];
    },
  );
}

async function main() {
  // Safety check to prevent seeding a production database
  const url = new URL(process.env.DATABASE_URL!);
  if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    console.error(
      `Refusing to seed: DATABASE_URL points to ${url.hostname}, not localhost.`,
    );
    process.exit(1);
  }

  const start = Date.now();

  try {
    await cleanup();
    const userIds = await seedUsersAndProfiles();
    const brandIds = await seedBrands(userIds);
    const chipIds = await seedChips(brandIds, userIds);
    await seedReviews(chipIds, userIds);
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log("✅ DONE - DB Seeding completed in", elapsed, "seconds");
  } finally {
    await pool.end();
  }
}

main();
