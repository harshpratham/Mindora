import type { Pool } from 'pg';

export async function kvSet(pool: Pool, key: string, value: unknown): Promise<void> {
  await pool.query(
    `INSERT INTO app_kv (key, value) VALUES ($1, $2::jsonb)
     ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, JSON.stringify(value)],
  );
}

export async function kvGet(pool: Pool, key: string): Promise<unknown | undefined> {
  const { rows } = await pool.query<{ value: unknown }>(
    'SELECT value FROM app_kv WHERE key = $1',
    [key],
  );
  return rows[0]?.value;
}

export async function kvDel(pool: Pool, key: string): Promise<void> {
  await pool.query('DELETE FROM app_kv WHERE key = $1', [key]);
}

export async function kvGetByPrefix(pool: Pool, prefix: string): Promise<unknown[]> {
  const { rows } = await pool.query<{ value: unknown }>(
    'SELECT value FROM app_kv WHERE key LIKE $1 ORDER BY key',
    [`${prefix}%`],
  );
  return rows.map((r) => r.value);
}

export async function kvListByPrefix(
  pool: Pool,
  prefix: string,
  limit = 50,
): Promise<{ key: string; value: unknown }[]> {
  const { rows } = await pool.query<{ key: string; value: unknown }>(
    'SELECT key, value FROM app_kv WHERE key LIKE $1 ORDER BY key DESC LIMIT $2',
    [`${prefix}%`, limit],
  );
  return rows;
}
