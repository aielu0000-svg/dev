import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = join(__dirname, '../../data/app.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initializeDatabase() {
  const schemaPath = join(__dirname, 'schema.sql');
  const seedPath = join(__dirname, 'seed.sql');

  const schema = readFileSync(schemaPath, 'utf-8');
  const seed = readFileSync(seedPath, 'utf-8');

  db.exec(schema);
  db.exec(seed);

  console.log('Database initialized successfully');
}
