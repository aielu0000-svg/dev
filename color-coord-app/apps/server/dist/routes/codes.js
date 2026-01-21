import { Router } from 'express';
import { db } from '../db/db.js';
const router = Router();
// GET /api/codes - Get popular codes list
router.get('/', (req, res) => {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const codes = db.prepare(`
    SELECT id, illustration_url, palette, likes, source, status, created_at
    FROM codes
    WHERE status = 'active'
    ORDER BY likes DESC
    LIMIT ? OFFSET ?
  `).all(limit, offset);
    const total = db.prepare(`
    SELECT COUNT(*) as count FROM codes WHERE status = 'active'
  `).get();
    res.json({
        codes: codes.map(code => ({
            ...code,
            palette: JSON.parse(code.palette),
        })),
        total: total.count,
        limit,
        offset,
    });
});
// GET /api/codes/:id - Get code detail
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const code = db.prepare(`
    SELECT id, illustration_url, palette, likes, source, status, created_at
    FROM codes
    WHERE id = ? AND status = 'active'
  `).get(id);
    if (!code) {
        res.status(404).json({ error: 'Code not found' });
        return;
    }
    // Get categories for this code
    const categories = db.prepare(`
    SELECT c.id, c.name, c.parent_id
    FROM categories c
    JOIN code_categories cc ON c.id = cc.category_id
    WHERE cc.code_id = ?
  `).all(id);
    // Get similar codes (same categories, different id)
    const similarCodes = db.prepare(`
    SELECT DISTINCT c.id, c.illustration_url, c.palette, c.likes
    FROM codes c
    JOIN code_categories cc ON c.id = cc.code_id
    WHERE cc.category_id IN (
      SELECT category_id FROM code_categories WHERE code_id = ?
    )
    AND c.id != ?
    AND c.status = 'active'
    ORDER BY c.likes DESC
    LIMIT 6
  `).all(id, id);
    res.json({
        ...code,
        palette: JSON.parse(code.palette),
        categories,
        similarCodes: similarCodes.map(c => ({
            ...c,
            palette: JSON.parse(c.palette),
        })),
    });
});
/**
 * GET /api/codes/similar/:id - 類似コードを検索
 */
router.get('/similar/:id', (req, res) => {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    // コードを取得
    const code = db.prepare(`
    SELECT id, palette, season_tags
    FROM codes
    WHERE id = ? AND status = 'active'
  `).get(id);
    if (!code) {
        res.status(404).json({ error: 'Code not found' });
        return;
    }
    const palette = JSON.parse(code.palette);
    const seasonTags = code.season_tags ? JSON.parse(code.season_tags) : [];
    // 類似色を含むコードを検索
    // 簡易版: 同じカテゴリ + 季節タグで検索
    let similarCodes = [];
    if (seasonTags.length > 0) {
        // 季節タグでフィルタリング
        similarCodes = db.prepare(`
      SELECT c.id, c.illustration_url, c.palette, c.likes
      FROM codes c
      WHERE c.id != ?
        AND c.status = 'active'
        AND (${seasonTags.map(() => `c.season_tags LIKE ?`).join(' OR ')})
      ORDER BY c.likes DESC
      LIMIT ?
    `).all(id, ...seasonTags.map((tag) => `%"${tag}"%`), limit);
    }
    else {
        // 季節タグがない場合は人気順
        similarCodes = db.prepare(`
      SELECT c.id, c.illustration_url, c.palette, c.likes
      FROM codes c
      WHERE c.id != ? AND c.status = 'active'
      ORDER BY c.likes DESC
      LIMIT ?
    `).all(id, limit);
    }
    res.json({
        originalCode: {
            id: code.id,
            palette,
        },
        similarCodes: similarCodes.map(c => ({
            ...c,
            palette: JSON.parse(c.palette),
        })),
    });
});
/**
 * GET /api/codes/filter - 季節・シーン別フィルター
 */
router.get('/filter', (req, res) => {
    const { season, scene, category } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    let query = `
    SELECT DISTINCT c.id, c.illustration_url, c.palette, c.likes, c.season_tags
    FROM codes c
  `;
    const conditions = ['c.status = ?'];
    const params = ['active'];
    // カテゴリフィルター
    if (category) {
        query += ` JOIN code_categories cc ON c.id = cc.code_id`;
        conditions.push('cc.category_id = ?');
        params.push(category);
    }
    // 季節フィルター
    if (season) {
        conditions.push(`c.season_tags LIKE ?`);
        params.push(`%"${season}"%`);
    }
    // シーンフィルター（将来の拡張用）
    if (scene) {
        // scene_tags カラムを追加する必要がある
        // 現在は season_tags で代用
    }
    if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
    }
    query += ` ORDER BY c.likes DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const codes = db.prepare(query).all(...params);
    const total = db.prepare(`
    SELECT COUNT(DISTINCT c.id) as count
    FROM codes c
    ${category ? 'JOIN code_categories cc ON c.id = cc.code_id' : ''}
    WHERE ${conditions.join(' AND ')}
  `).get(...params.slice(0, -2));
    res.json({
        codes: codes.map(code => ({
            ...code,
            palette: JSON.parse(code.palette),
            season_tags: code.season_tags ? JSON.parse(code.season_tags) : [],
        })),
        total: total.count,
        limit,
        offset,
        filters: {
            season: season || null,
            scene: scene || null,
            category: category || null,
        },
    });
});
export default router;
