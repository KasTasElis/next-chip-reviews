import "dotenv/config";
import { Pool } from "pg";
import { faker } from "@faker-js/faker";
import slugify from "slugify";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const USERS_COUNT = 10_000;
const BRANDS_COUNT = 200;
const CHIPS_COUNT = 2_000;
const BATCH_SIZE = 500;

function chunk<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );
}

async function cleanup() {
  console.log("Cleaning up...");

  await pool.query("DELETE FROM auth.users");

  console.log("Cleanup done.");
}

async function seedUsersAndProfiles(): Promise<string[]> {
  console.log(`Seeding ${USERS_COUNT} users...`);

  // Generate a single bcrypt hash for the password to reuse for all users
  // this is DRASTICALLY faster than generating a unique hash for each user
  const {
    rows: [{ hash }],
  } = await pool.query("SELECT crypt('password123', gen_salt('bf')) AS hash");

  const users = Array.from({ length: USERS_COUNT }, (_, i) => ({
    email: `${faker.internet.email()}${i}`,
    metaData: JSON.stringify({
      username: `${faker.internet.username()}${i}`,
      avatar_url: null,
    }),
  }));

  const batches = chunk(users, BATCH_SIZE);
  const userIds: string[] = [];

  try {
    for (const batch of batches) {
      const result = await pool.query(
        `INSERT INTO auth.users
           (id, aud, role, email, encrypted_password, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
         SELECT gen_random_uuid(), 'authenticated', 'authenticated', unnest($1::text[]), $2, unnest($3::text[])::jsonb, now(), now(), now()
         RETURNING id`,
        [batch.map((u) => u.email), hash, batch.map((u) => u.metaData)],
      );
      userIds.push(...result.rows.map((row) => row.id));
      const pct = Math.round((userIds.length / USERS_COUNT) * 100);
      process.stdout.write(
        `\rInserted ${userIds.length}/${USERS_COUNT} users (${pct}%)`,
      );
    }
    process.stdout.write("\n");
    return userIds;
  } catch (error) {
    console.error("Error inserting users:", error);
    throw error;
  }
}

async function seedBrands(userIds: string[]): Promise<string[]> {
  console.log(`Seeding ${BRANDS_COUNT} brands...`);

  const brands = Array.from({ length: BRANDS_COUNT }, (_, i) => {
    const name = `${faker.company.name()}${i}`;
    return {
      name,
      slug: slugify(name, { lower: true, strict: true }),
      description:
        faker.helpers.maybe(() => faker.company.catchPhrase(), {
          probability: 0.7,
        }) ?? null,
      logoUrl: faker.image.url(),
      userId: userIds[Math.floor(Math.random() * userIds.length)],
    };
  });

  const batches = chunk(brands, BATCH_SIZE);
  let inserted = 0;
  const brandIds: string[] = [];

  try {
    for (const batch of batches) {
      const result = await pool.query(
        `INSERT INTO public.brands (id, name, slug, logo_url, description, user_id, created_at)
         SELECT gen_random_uuid() AS id, unnest($1::text[]), unnest($2::text[]), unnest($3::text[]), unnest($4::text[]), unnest($5::uuid[]), now()
         RETURNING id`,
        [
          batch.map((b) => b.name),
          batch.map((b) => b.slug),
          batch.map((b) => b.logoUrl),
          batch.map((b) => b.description),
          batch.map((b) => b.userId),
        ],
      );
      brandIds.push(...result.rows.map((row) => row.id));
      inserted += batch.length;
      process.stdout.write(`\rInserted ${inserted}/${BRANDS_COUNT} brands`);
    }
    process.stdout.write("\n");
    return brandIds;
  } catch (error) {
    console.error("Error inserting brands:", error);
    throw error;
  }
}

async function seedChips(brandIds: string[], userIds: string[]) {
  console.log(`Seeding ${CHIPS_COUNT} chips...`);

  const chips = Array.from({ length: CHIPS_COUNT }, (_, i) => {
    const name = `${faker.commerce.productName()}${i}`;
    return {
      name,
      slug: slugify(name, { lower: true, strict: true }),
      description:
        faker.helpers.maybe(() => faker.commerce.productDescription(), {
          probability: 0.7,
        }) ?? null,
      photoUrl: faker.image.url(),
      brandId: brandIds[Math.floor(Math.random() * brandIds.length)],
      userId: userIds[Math.floor(Math.random() * userIds.length)],
    };
  });

  const batches = chunk(chips, BATCH_SIZE);
  let inserted = 0;

  try {
    for (const batch of batches) {
      await pool.query(
        `INSERT INTO public.chips (id, name, slug, description, photo_url, brand_id, user_id, created_at)
         SELECT gen_random_uuid(), unnest($1::text[]), unnest($2::text[]), unnest($3::text[]), unnest($4::text[]), unnest($5::uuid[]), unnest($6::uuid[]), now()`,
        [
          batch.map((c) => c.name),
          batch.map((c) => c.slug),
          batch.map((c) => c.description),
          batch.map((c) => c.photoUrl),
          batch.map((c) => c.brandId),
          batch.map((c) => c.userId),
        ],
      );
      inserted += batch.length;
      process.stdout.write(`\rInserted ${inserted}/${CHIPS_COUNT} chips`);
    }
    process.stdout.write("\n");
  } catch (error) {
    console.error("Error inserting chips:", error);
    throw error;
  }
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

  await cleanup();
  const userIds = await seedUsersAndProfiles();
  const brandIds = await seedBrands(userIds);
  await seedChips(brandIds, userIds);
  console.log("Done. Total users:", userIds.length);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Elapsed time: ${elapsed}s`);

  await pool.end();
}

main();
