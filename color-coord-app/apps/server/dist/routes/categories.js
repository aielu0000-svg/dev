import { Router } from 'express';
import { db } from '../db/db.js';
const router = Router();
// GET /api/categories - Get all categories
router.get('/', (_req, res) => {
    const categories = db.prepare(`
    SELECT id, name, parent_id, sort_order
    FROM categories
    ORDER BY sort_order
  `).all();
    // Organize into tree structure
    const mainCategories = categories.filter(c => !c.parent_id);
    const result = mainCategories.map(main => ({
        ...main,
        children: categories.filter(c => c.parent_id === main.id),
    }));
    res.json({ categories: result });
});
// GET /api/categories/:id/codes - Get codes by category
router.get('/:id/codes', (req, res) => {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    // Check if category exists
    const category = db.prepare(`
    SELECT id, name, parent_id FROM categories WHERE id = ?
  `).get(id);
    if (!category) {
        res.status(404).json({ error: 'Category not found' });
        return;
    }
    // Get codes - include both direct matches and child category matches
    const codes = db.prepare(`
    SELECT DISTINCT c.id, c.illustration_url, c.palette, c.likes
    FROM codes c
    JOIN code_categories cc ON c.id = cc.code_id
    WHERE cc.category_id = ?
       OR cc.category_id IN (SELECT id FROM categories WHERE parent_id = ?)
    AND c.status = 'active'
    ORDER BY c.likes DESC
    LIMIT ? OFFSET ?
  `).all(id, id, limit, offset);
    const total = db.prepare(`
    SELECT COUNT(DISTINCT c.id) as count
    FROM codes c
    JOIN code_categories cc ON c.id = cc.code_id
    WHERE (cc.category_id = ? OR cc.category_id IN (SELECT id FROM categories WHERE parent_id = ?))
    AND c.status = 'active'
  `).get(id, id);
    res.json({
        category,
        codes: codes.map(code => ({
            ...code,
            palette: JSON.parse(code.palette),
        })),
        total: total.count,
        limit,
        offset,
    });
});
export default router;
