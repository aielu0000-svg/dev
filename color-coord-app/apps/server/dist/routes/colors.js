import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/db.js';
import { findSimilarColors, findMatchingColors, findCodesByColor } from '../services/colorService.js';
import { ColorExplanationService } from '../services/colorExplanationService.js';
const router = Router();
const explanationService = new ColorExplanationService();
const hexColorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format');
// GET /api/colors/search?hex=#RRGGBB - Search by color
router.get('/search', (req, res) => {
    const hexParam = req.query.hex;
    if (!hexParam) {
        res.status(400).json({ error: 'hex parameter is required' });
        return;
    }
    // Normalize hex format (add # if missing)
    const hex = hexParam.startsWith('#') ? hexParam : `#${hexParam}`;
    // Validate hex format
    const parseResult = hexColorSchema.safeParse(hex);
    if (!parseResult.success) {
        res.status(400).json({ error: 'Invalid hex color format. Use #RRGGBB' });
        return;
    }
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);
    // Find similar colors
    const nearColors = findSimilarColors(hex, limit);
    // Find matching/compatible colors
    const matchColors = findMatchingColors(hex, limit);
    // Find codes containing this color or similar
    const codeIds = findCodesByColor(hex);
    let relatedCodes = [];
    if (codeIds.length > 0) {
        const placeholders = codeIds.map(() => '?').join(',');
        relatedCodes = db.prepare(`
      SELECT id, illustration_url, palette, likes
      FROM codes
      WHERE id IN (${placeholders})
      AND status = 'active'
      ORDER BY likes DESC
      LIMIT 20
    `).all(...codeIds);
    }
    res.json({
        searchColor: hex.toUpperCase(),
        nearColors,
        matchColors,
        relatedCodes: relatedCodes.map(code => ({
            ...code,
            palette: JSON.parse(code.palette),
        })),
    });
});
/**
 * GET /api/colors/explain?base=#RRGGBB&match=#RRGGBB - 配色の理由を説明
 */
router.get('/explain', (req, res) => {
    const baseHex = req.query.base;
    const matchHex = req.query.match;
    if (!baseHex || !matchHex) {
        res.status(400).json({ error: 'baseとmatchパラメータは必須です' });
        return;
    }
    // Normalize hex format
    const normalizedBase = baseHex.startsWith('#') ? baseHex : `#${baseHex}`;
    const normalizedMatch = matchHex.startsWith('#') ? matchHex : `#${matchHex}`;
    // Validate hex format
    const baseResult = hexColorSchema.safeParse(normalizedBase);
    const matchResult = hexColorSchema.safeParse(normalizedMatch);
    if (!baseResult.success || !matchResult.success) {
        res.status(400).json({ error: '無効な色形式です。#RRGGBB形式で指定してください' });
        return;
    }
    try {
        const explanation = explanationService.explainColorPair(normalizedBase, normalizedMatch);
        res.json(explanation);
    }
    catch (error) {
        console.error('Color explanation error:', error);
        res.status(500).json({ error: '配色の説明に失敗しました' });
    }
});
/**
 * POST /api/colors/simulate-replace - 色の置き換えシミュレーション
 */
router.post('/simulate-replace', (req, res) => {
    try {
        const { codeId, originalColor, newColor } = req.body;
        if (!codeId || !originalColor || !newColor) {
            res.status(400).json({ error: 'codeId, originalColor, newColorは必須です' });
            return;
        }
        // コードを取得
        const code = db.prepare(`
      SELECT id, palette
      FROM codes
      WHERE id = ? AND status = 'active'
    `).get(codeId);
        if (!code) {
            res.status(404).json({ error: 'コードが見つかりません' });
            return;
        }
        const palette = JSON.parse(code.palette);
        // 色を置き換え
        const newPalette = palette.map((color) => {
            if (color.hex.toUpperCase() === originalColor.toUpperCase()) {
                return {
                    ...color,
                    hex: newColor,
                };
            }
            return color;
        });
        res.json({
            originalPalette: palette,
            newPalette,
            message: '色の置き換えシミュレーション結果',
        });
    }
    catch (error) {
        console.error('Color replacement simulation error:', error);
        res.status(500).json({ error: '色の置き換えシミュレーションに失敗しました' });
    }
});
export default router;
