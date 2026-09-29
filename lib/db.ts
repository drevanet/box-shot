import { neon } from "@neondatabase/serverless";

let initialized = false;
let initializing: Promise<void> | null = null;

function getDatabaseUrl() {
  const url = process.env.DATABASE_URL?.trim();

  if (!url) {
    throw new Error(
      "DATABASE_URL is missing. Add your PostgreSQL connection string to .env.local."
    );
  }

  return url;
}

export const sql = neon(getDatabaseUrl());

async function initializeDatabase() {
  if (initialized) return;

  if (!initializing) {
    initializing = (async () => {
      // ============================================================
      // USERS
      // ============================================================

      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT,
          email TEXT NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      // ============================================================
      // POLAR WEBHOOK EVENTS
      // ============================================================

      await sql`
        CREATE TABLE IF NOT EXISTS polar_webhook_events (
          id BIGSERIAL PRIMARY KEY,
          event_type TEXT NOT NULL,
          event_id TEXT,
          external_customer_id TEXT,
          subscription_id TEXT,
          status TEXT,
          payload JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      // ============================================================
      // SUBSCRIPTIONS
      // ============================================================

      await sql`
        CREATE TABLE IF NOT EXISTS subscriptions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          customer_id TEXT,
          product_id TEXT,
          status TEXT NOT NULL,
          current_period_start TIMESTAMPTZ,
          current_period_end TIMESTAMPTZ,
          cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      // ============================================================
      // DESIGNS
      // ============================================================

      await sql`
        CREATE TABLE IF NOT EXISTS designs (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL UNIQUE,

          front TEXT,
          back TEXT,
          left_face TEXT,
          right_face TEXT,
          top_face TEXT,
          bottom_face TEXT,

          width NUMERIC NOT NULL DEFAULT 28,
          height NUMERIC NOT NULL DEFAULT 36,
          depth NUMERIC NOT NULL DEFAULT 11,

          rotation_y NUMERIC NOT NULL DEFAULT -22,

          box_color TEXT NOT NULL DEFAULT '#f5f5f5',
          background_color TEXT NOT NULL DEFAULT '#111111',

          selected_face TEXT NOT NULL DEFAULT 'front',

          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;

      // ============================================================
      // INDEXES
      // ============================================================

      await sql`
        CREATE INDEX IF NOT EXISTS idx_users_email
        ON users(email)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_polar_external_customer
        ON polar_webhook_events(external_customer_id)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
        ON subscriptions(user_id)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_subscriptions_status
        ON subscriptions(status)
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_designs_user_id
        ON designs(user_id)
      `;

      initialized = true;
    })().catch((error) => {
      initializing = null;
      throw error;
    });
  }

  await initializing;
}

// ============================================================
// USER TYPE
// ============================================================

export type DbUser = {
  id: string;
  name: string | null;
  email: string;
  password_hash: string;
  created_at: string;
};

// ============================================================
// FIND USER BY EMAIL
// ============================================================

export async function findUserByEmail(email: string) {
  await initializeDatabase();

  const rows = await sql`
    SELECT
      id,
      name,
      email,
      password_hash,
      created_at
    FROM users
    WHERE email = ${email}
    LIMIT 1
  `;

  return (rows[0] as DbUser | undefined) || undefined;
}

// ============================================================
// FIND USER BY ID
// ============================================================

export async function findUserById(id: string) {
  await initializeDatabase();

  const rows = await sql`
    SELECT
      id,
      name,
      email,
      password_hash,
      created_at
    FROM users
    WHERE id = ${id}
    LIMIT 1
  `;

  return (rows[0] as DbUser | undefined) || undefined;
}

// ============================================================
// INSERT USER
// ============================================================

export async function insertUser(user: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}) {
  await initializeDatabase();

  const rows = await sql`
    INSERT INTO users (
      id,
      name,
      email,
      password_hash
    )
    VALUES (
      ${user.id},
      ${user.name || null},
      ${user.email},
      ${user.passwordHash}
    )
    RETURNING
      id,
      name,
      email,
      password_hash,
      created_at
  `;

  return rows[0] as DbUser;
}

// ============================================================
// RECORD POLAR WEBHOOK
// ============================================================

export async function recordPolarWebhook(data: {
  eventType: string;
  eventId: string | null;
  externalCustomerId: string | null;
  subscriptionId: string | null;
  status: string | null;
  payload: unknown;
}) {
  await initializeDatabase();

  await sql`
    INSERT INTO polar_webhook_events (
      event_type,
      event_id,
      external_customer_id,
      subscription_id,
      status,
      payload
    )
    VALUES (
      ${data.eventType},
      ${data.eventId},
      ${data.externalCustomerId},
      ${data.subscriptionId},
      ${data.status},
      ${JSON.stringify(data.payload)}::jsonb
    )
  `;
}

// ============================================================
// UPSERT SUBSCRIPTION
// ============================================================

export async function upsertSubscription(data: {
  id: string;
  userId: string;
  customerId: string | null;
  productId: string | null;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}) {
  await initializeDatabase();

  await sql`
    INSERT INTO subscriptions (
      id,
      user_id,
      customer_id,
      product_id,
      status,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      updated_at
    )
    VALUES (
      ${data.id},
      ${data.userId},
      ${data.customerId},
      ${data.productId},
      ${data.status},
      ${data.currentPeriodStart},
      ${data.currentPeriodEnd},
      ${data.cancelAtPeriodEnd},
      NOW()
    )
    ON CONFLICT (id)
    DO UPDATE SET
      user_id = EXCLUDED.user_id,
      customer_id = EXCLUDED.customer_id,
      product_id = EXCLUDED.product_id,
      status = EXCLUDED.status,
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      cancel_at_period_end = EXCLUDED.cancel_at_period_end,
      updated_at = NOW()
  `;
}

// ============================================================
// GET USER SUBSCRIPTION
// ============================================================

export async function getUserSubscription(userId: string) {
  await initializeDatabase();

  const rows = await sql`
    SELECT
      id,
      user_id,
      customer_id,
      product_id,
      status,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      created_at,
      updated_at
    FROM subscriptions
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
    LIMIT 1
  `;

  return rows[0] || null;
}

// ============================================================
// CHECK ACTIVE SUBSCRIPTION
// ============================================================

export async function hasActiveSubscription(userId: string) {
  await initializeDatabase();

  const rows = await sql`
    SELECT id
    FROM subscriptions
    WHERE user_id = ${userId}
      AND status = 'active'
      AND (
        current_period_end IS NULL
        OR current_period_end > NOW()
      )
    LIMIT 1
  `;

  return rows.length > 0;
}

// ============================================================
// SAVE USER DESIGN
// ============================================================

export async function saveUserDesign(data: {
  id: string;
  userId: string;

  front: string | null;
  back: string | null;
  left: string | null;
  right: string | null;
  top: string | null;
  bottom: string | null;

  width: number;
  height: number;
  depth: number;

  rotationY: number;

  boxColor: string;
  backgroundColor: string;

  selectedFace: string;
}) {
  await initializeDatabase();

  await sql`
    INSERT INTO designs (
      id,
      user_id,

      front,
      back,
      left_face,
      right_face,
      top_face,
      bottom_face,

      width,
      height,
      depth,

      rotation_y,

      box_color,
      background_color,

      selected_face,

      updated_at
    )
    VALUES (
      ${data.id},
      ${data.userId},

      ${data.front},
      ${data.back},
      ${data.left},
      ${data.right},
      ${data.top},
      ${data.bottom},

      ${data.width},
      ${data.height},
      ${data.depth},

      ${data.rotationY},

      ${data.boxColor},
      ${data.backgroundColor},

      ${data.selectedFace},

      NOW()
    )
    ON CONFLICT (user_id)
    DO UPDATE SET

      front = EXCLUDED.front,
      back = EXCLUDED.back,
      left_face = EXCLUDED.left_face,
      right_face = EXCLUDED.right_face,
      top_face = EXCLUDED.top_face,
      bottom_face = EXCLUDED.bottom_face,

      width = EXCLUDED.width,
      height = EXCLUDED.height,
      depth = EXCLUDED.depth,

      rotation_y = EXCLUDED.rotation_y,

      box_color = EXCLUDED.box_color,
      background_color = EXCLUDED.background_color,

      selected_face = EXCLUDED.selected_face,

      updated_at = NOW()
  `;
}

// ============================================================
// GET USER DESIGN
// ============================================================

export async function getUserDesign(userId: string) {
  await initializeDatabase();

  const rows = await sql`
    SELECT
      id,
      user_id,

      front,
      back,
      left_face,
      right_face,
      top_face,
      bottom_face,

      width,
      height,
      depth,

      rotation_y,

      box_color,
      background_color,

      selected_face,

      created_at,
      updated_at

    FROM designs
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  return rows[0] || null;
}

// ============================================================
// DATABASE HEALTH
// ============================================================

export async function getDatabaseHealth() {
  await initializeDatabase();

  const rows = await sql`
    SELECT NOW() AS now
  `;

  return rows[0];
}