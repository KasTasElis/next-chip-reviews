import "dotenv/config";
import { Pool } from "pg";
import { faker } from "@faker-js/faker";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const USERS_COUNT = 10_000;
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

  const values = Array.from({ length: USERS_COUNT }, (_, i) => {
    const username = `${faker.internet.username()}${i}`;
    const email = `${faker.internet.email()}${i}`;

    return `(gen_random_uuid(), 'authenticated', 'authenticated', '${email}', '${hash}', '{"username":"${username}","avatar_url":null}'::jsonb, now(), now(), now())`;
  });

  const batches = chunk(values, BATCH_SIZE);
  const userIds: string[] = [];

  try {
    for (let i = 0; i < batches.length; i++) {
      const result = await pool.query(`
        INSERT INTO auth.users
          (id, aud, role, email, encrypted_password, raw_user_meta_data, email_confirmed_at, created_at, updated_at)
        VALUES ${batches[i].join(",")}
        RETURNING id
      `);
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
  console.log("Done. Total users:", userIds.length);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`Elapsed time: ${elapsed}s`);

  await pool.end();
}

main();
