import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Pool } from 'pg';

export type JwtPayload = { sub: string; email: string; name: string };

const SALT_ROUNDS = 10;

export function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is required');
  return s;
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function verifyAccessToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtPayload;
    if (!decoded.sub || !decoded.email) return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function userRowToClient(
  row: { id: string; email: string; name: string },
): { id: string; email?: string; user_metadata?: { name?: string } } {
  return {
    id: row.id,
    email: row.email,
    user_metadata: { name: row.name },
  };
}

export async function findUserByEmail(
  pool: Pool,
  email: string,
): Promise<{ id: string; email: string; name: string; password_hash: string } | null> {
  const { rows } = await pool.query<{
    id: string;
    email: string;
    name: string;
    password_hash: string;
  }>('SELECT id, email, name, password_hash FROM app_users WHERE lower(email) = lower($1)', [email]);
  return rows[0] ?? null;
}

export async function createUser(
  pool: Pool,
  email: string,
  passwordHash: string,
  name: string,
): Promise<{ id: string; email: string; name: string }> {
  const { rows } = await pool.query<{ id: string; email: string; name: string }>(
    `INSERT INTO app_users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name`,
    [email, passwordHash, name],
  );
  return rows[0];
}
