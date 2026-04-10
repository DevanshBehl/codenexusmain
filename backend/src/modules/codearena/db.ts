import { Pool } from 'pg';
import { env } from '../../config/env.js';

// We use the existing DATABASE_URL from .env
const connectionString = env.DATABASE_URL;

// Create a dedicated pool for CodeArena queries
export const db = new Pool({
    connectionString,
    max: 10, // Adjust according to your needs
});

db.on('error', (err) => {
    console.error('Unexpected error on idle CodeArena DB client', err);
});
