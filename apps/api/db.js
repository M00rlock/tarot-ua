const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER || 'tarot',
  password: process.env.POSTGRES_PASSWORD || 'tarot',
  database: process.env.POSTGRES_DB || 'tarot',
  max: 10,
  idleTimeoutMillis: 30000,
});

async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

async function createTables() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        premium_tier VARCHAR(20) NOT NULL DEFAULT 'free',
        premium_until TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_spreads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        spread_type VARCHAR(50) NOT NULL,
        cards JSONB NOT NULL,
        interpretation JSONB,
        favorite BOOLEAN NOT NULL DEFAULT false,
        note TEXT,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS shared_spreads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        slug VARCHAR(12) UNIQUE NOT NULL,
        title TEXT NOT NULL,
        spread_type VARCHAR(50) NOT NULL,
        cards JSONB NOT NULL,
        interpretation JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_spreads_user_id ON user_spreads(user_id)
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_spreads_favorite ON user_spreads(user_id, favorite)
    `);

    await client.query('COMMIT');
    console.log('Database tables created successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Failed to create tables:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, createTables };
