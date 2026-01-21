import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';

const router = Router();

/**
 * GET /api/collections - コレクション一覧を取得
 */
router.get('/', (req, res) => {
  try {
    const collections = db.prepare(`
      SELECT c.id, c.name, c.description, c.created_at, c.updated_at,
             COUNT(ci.code_id) as item_count
      FROM collections c
      LEFT JOIN collection_items ci ON c.id = ci.collection_id
      GROUP BY c.id
      ORDER BY c.updated_at DESC
    `).all();

    res.json({ collections });
  } catch (error) {
    console.error('Get collections error:', error);
    res.status(500).json({ error: 'コレクションの取得に失敗しました' });
  }
});

/**
 * POST /api/collections - 新しいコレクションを作成
 */
router.post('/', (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      res.status(400).json({ error: 'コレクション名は必須です' });
      return;
    }

    const id = uuidv4();
    db.prepare(`
      INSERT INTO collections (id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `).run(id, name, description || null);

    res.json({
      id,
      name,
      description,
      message: 'コレクションを作成しました',
    });
  } catch (error) {
    console.error('Create collection error:', error);
    res.status(500).json({ error: 'コレクションの作成に失敗しました' });
  }
});

/**
 * GET /api/collections/:id - コレクションの詳細を取得
 */
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const collection = db.prepare(`
      SELECT id, name, description, created_at, updated_at
      FROM collections
      WHERE id = ?
    `).get(id);

    if (!collection) {
      res.status(404).json({ error: 'コレクションが見つかりません' });
      return;
    }

    // コレクション内のコード一覧
    const items = db.prepare(`
      SELECT c.id, c.illustration_url, c.palette, c.likes, ci.added_at
      FROM codes c
      JOIN collection_items ci ON c.id = ci.code_id
      WHERE ci.collection_id = ? AND c.status = 'active'
      ORDER BY ci.added_at DESC
    `).all(id);

    res.json({
      ...collection,
      items: items.map((item: any) => ({
        ...item,
        palette: JSON.parse(item.palette),
      })),
    });
  } catch (error) {
    console.error('Get collection error:', error);
    res.status(500).json({ error: 'コレクションの取得に失敗しました' });
  }
});

/**
 * POST /api/collections/:id/items - コレクションにアイテムを追加
 */
router.post('/:id/items', (req, res) => {
  try {
    const { id } = req.params;
    const { codeId } = req.body;

    if (!codeId) {
      res.status(400).json({ error: 'codeIdは必須です' });
      return;
    }

    // コレクションの存在確認
    const collection = db.prepare('SELECT id FROM collections WHERE id = ?').get(id);
    if (!collection) {
      res.status(404).json({ error: 'コレクションが見つかりません' });
      return;
    }

    // コードの存在確認
    const code = db.prepare('SELECT id FROM codes WHERE id = ? AND status = ?').get(codeId, 'active');
    if (!code) {
      res.status(404).json({ error: 'コードが見つかりません' });
      return;
    }

    // アイテムを追加
    try {
      db.prepare(`
        INSERT INTO collection_items (collection_id, code_id, added_at)
        VALUES (?, ?, datetime('now'))
      `).run(id, codeId);

      // コレクションの更新日時を更新
      db.prepare(`
        UPDATE collections SET updated_at = datetime('now') WHERE id = ?
      `).run(id);

      res.json({ message: 'コレクションにアイテムを追加しました' });
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        res.status(409).json({ error: 'このアイテムは既に追加されています' });
      } else {
        throw err;
      }
    }
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({ error: 'アイテムの追加に失敗しました' });
  }
});

/**
 * DELETE /api/collections/:id/items/:codeId - コレクションからアイテムを削除
 */
router.delete('/:id/items/:codeId', (req, res) => {
  try {
    const { id, codeId } = req.params;

    const result = db.prepare(`
      DELETE FROM collection_items WHERE collection_id = ? AND code_id = ?
    `).run(id, codeId);

    if (result.changes === 0) {
      res.status(404).json({ error: 'アイテムが見つかりません' });
      return;
    }

    // コレクションの更新日時を更新
    db.prepare(`
      UPDATE collections SET updated_at = datetime('now') WHERE id = ?
    `).run(id);

    res.json({ message: 'コレクションからアイテムを削除しました' });
  } catch (error) {
    console.error('Remove item error:', error);
    res.status(500).json({ error: 'アイテムの削除に失敗しました' });
  }
});

/**
 * DELETE /api/collections/:id - コレクションを削除
 */
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const result = db.prepare('DELETE FROM collections WHERE id = ?').run(id);

    if (result.changes === 0) {
      res.status(404).json({ error: 'コレクションが見つかりません' });
      return;
    }

    res.json({ message: 'コレクションを削除しました' });
  } catch (error) {
    console.error('Delete collection error:', error);
    res.status(500).json({ error: 'コレクションの削除に失敗しました' });
  }
});

/**
 * PATCH /api/collections/:id - コレクションを更新
 */
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || name.trim() === '') {
      res.status(400).json({ error: 'コレクション名は必須です' });
      return;
    }

    const result = db.prepare(`
      UPDATE collections
      SET name = ?, description = ?, updated_at = datetime('now')
      WHERE id = ?
    `).run(name, description || null, id);

    if (result.changes === 0) {
      res.status(404).json({ error: 'コレクションが見つかりません' });
      return;
    }

    res.json({ message: 'コレクションを更新しました' });
  } catch (error) {
    console.error('Update collection error:', error);
    res.status(500).json({ error: 'コレクションの更新に失敗しました' });
  }
});

export default router;
