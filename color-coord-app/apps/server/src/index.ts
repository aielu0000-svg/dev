import express from 'express';
import cors from 'cors';
import codesRouter from './routes/codes.js';
import categoriesRouter from './routes/categories.js';
import colorsRouter from './routes/colors.js';
import uploadRouter from './routes/upload.js';
import collectionsRouter from './routes/collections.js';
import { initializeDatabase } from './db/db.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Static files (uploaded and processed images)
app.use('/uploads', express.static(join(__dirname, '../data/uploads')));
app.use('/processed', express.static(join(__dirname, '../data/processed')));

// Initialize database on startup
try {
  initializeDatabase();

  // Run migrations
  try {
    const { db } = await import('./db/db.js');

    // Check if columns already exist
    const tableInfo = db.pragma('table_info(codes)');
    const existingColumns = new Set(tableInfo.map((col: any) => col.name));

    // Add columns only if they don't exist
    if (!existingColumns.has('original_url')) {
      db.exec('ALTER TABLE codes ADD COLUMN original_url TEXT');
    }
    if (!existingColumns.has('style')) {
      db.exec("ALTER TABLE codes ADD COLUMN style TEXT DEFAULT 'standard' CHECK (style IN ('standard', 'sketch', 'minimal', 'detailed'))");
    }
    if (!existingColumns.has('season_tags')) {
      db.exec('ALTER TABLE codes ADD COLUMN season_tags TEXT');
    }
    if (!existingColumns.has('scene_tags')) {
      db.exec('ALTER TABLE codes ADD COLUMN scene_tags TEXT');
    }
    if (!existingColumns.has('processing_time')) {
      db.exec('ALTER TABLE codes ADD COLUMN processing_time INTEGER');
    }

    // Run remaining migrations (CREATE TABLE IF NOT EXISTS)
    const migrationPath = join(__dirname, 'db/migrations.sql');
    const migrations = readFileSync(migrationPath, 'utf-8');
    // Only run CREATE TABLE statements
    const createStatements = migrations.split(';')
      .filter(stmt => stmt.trim().startsWith('CREATE'))
      .join(';');
    if (createStatements) {
      db.exec(createStatements);
    }

    console.log('Migrations applied successfully');
  } catch (migrationError) {
    console.warn('Migration warning:', migrationError);
  }
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Routes
app.use('/api/codes', codesRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/colors', colorsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/collections', collectionsRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Root route for browser access
app.get('/', (_req, res) => {
  res.type('text').send('Color Coord API is running. See /health for status.');
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
