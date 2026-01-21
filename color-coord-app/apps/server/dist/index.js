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
        const migrationPath = join(__dirname, 'db/migrations.sql');
        const migrations = readFileSync(migrationPath, 'utf-8');
        const { db } = await import('./db/db.js');
        db.exec(migrations);
        console.log('Migrations applied successfully');
    }
    catch (migrationError) {
        console.warn('Migration warning:', migrationError);
        // 既存のテーブルがある場合はエラーになるが、無視して続行
    }
}
catch (error) {
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
// Error handler
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
