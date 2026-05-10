import pg from 'pg';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required for the API server');
}

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
});
