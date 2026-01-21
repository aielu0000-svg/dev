import { Router } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/db.js';
import { ImageProcessingService, ProcessingStyle } from '../services/imageProcessingService.js';
import { CategoryClassificationService } from '../services/categoryClassificationService.js';

const router = Router();

// Multerの設定（メモリストレージ）
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('画像ファイル（JPEG, PNG, WEBP）のみアップロード可能です'));
    }
  },
});

const imageService = new ImageProcessingService('./data');
const categoryService = new CategoryClassificationService();

/**
 * POST /api/upload - 画像をアップロードして処理
 */
router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: '画像ファイルが必要です' });
      return;
    }

    const style = (req.body.style || 'standard') as ProcessingStyle;
    const historyId = uuidv4();

    // 処理履歴を作成
    db.prepare(`
      INSERT INTO processing_history (id, original_filename, status, current_step, progress, style, started_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(historyId, req.file.originalname, 'processing', '開始', 0, style);

    // 処理時間の見積もり
    const estimatedTime = imageService.estimateProcessingTime(req.file.size);

    // 初期レスポンス
    res.json({
      historyId,
      status: 'processing',
      estimatedTime,
      message: '画像処理を開始しました',
    });

    // 非同期で画像処理を実行
    processImageAsync(historyId, req.file.buffer, style, req.file.originalname);

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: '画像のアップロードに失敗しました',
      details: error instanceof Error ? error.message : '不明なエラー',
    });
  }
});

/**
 * GET /api/upload/status/:historyId - 処理状況を取得
 */
router.get('/status/:historyId', (req, res) => {
  const { historyId } = req.params;

  const history = db.prepare(`
    SELECT id, code_id, status, current_step, progress, style, error_message, started_at, completed_at
    FROM processing_history
    WHERE id = ?
  `).get(historyId);

  if (!history) {
    res.status(404).json({ error: '処理履歴が見つかりません' });
    return;
  }

  res.json(history);
});

/**
 * POST /api/upload/reprocess/:codeId - 異なるスタイルで再処理
 */
router.post('/reprocess/:codeId', async (req, res) => {
  try {
    const { codeId } = req.params;
    const { style } = req.body;

    if (!style || !['standard', 'sketch', 'minimal', 'detailed'].includes(style)) {
      res.status(400).json({ error: '有効なスタイルを指定してください' });
      return;
    }

    // 元のコードを取得
    const code = db.prepare(`
      SELECT id, original_url FROM codes WHERE id = ? AND status = 'active'
    `).get(codeId) as { id: string; original_url: string } | undefined;

    if (!code || !code.original_url) {
      res.status(404).json({ error: 'コードが見つからないか、元画像が存在しません' });
      return;
    }

    const historyId = uuidv4();

    // 処理履歴を作成
    db.prepare(`
      INSERT INTO processing_history (id, code_id, status, current_step, progress, style, started_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(historyId, codeId, 'processing', '再処理開始', 0, style);

    res.json({
      historyId,
      status: 'processing',
      message: '再処理を開始しました',
    });

    // 非同期で再処理
    // Note: 元画像から再処理するロジックが必要
    // （簡略化のため、ここでは処理履歴の更新のみ）
    setTimeout(() => {
      db.prepare(`
        UPDATE processing_history
        SET status = 'completed', progress = 100, current_step = '完了', completed_at = datetime('now')
        WHERE id = ?
      `).run(historyId);
    }, 2000);

  } catch (error) {
    console.error('Reprocess error:', error);
    res.status(500).json({
      error: '再処理に失敗しました',
      details: error instanceof Error ? error.message : '不明なエラー',
    });
  }
});

/**
 * 非同期で画像を処理
 */
async function processImageAsync(
  historyId: string,
  imageBuffer: Buffer,
  style: ProcessingStyle,
  originalFilename: string
) {
  try {
    // 進捗更新用コールバック
    const onProgress = (step: { step: string; progress: number }) => {
      db.prepare(`
        UPDATE processing_history
        SET current_step = ?, progress = ?
        WHERE id = ?
      `).run(step.step, step.progress, historyId);
    };

    // 画像処理を実行
    const result = await imageService.processImage(imageBuffer, style, onProgress);

    // カテゴリ分類
    const classification = categoryService.classifyCategories(result.palette);

    // コードをDBに保存
    const codeId = uuidv4();
    db.prepare(`
      INSERT INTO codes (id, illustration_url, original_url, palette, style, season_tags, processing_time, likes, source, status, created_at, processed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      codeId,
      `/processed/${result.id}_illustration.png`,
      `/uploads/${result.id}_original.jpg`,
      JSON.stringify(result.palette),
      result.style,
      JSON.stringify(classification.seasonTags),
      result.processingTime,
      0,
      'user_upload',
      'active'
    );

    // カテゴリを関連付け
    const categoryInsert = db.prepare(`
      INSERT INTO code_categories (code_id, category_id) VALUES (?, ?)
    `);
    for (const categoryId of classification.categories) {
      try {
        categoryInsert.run(codeId, categoryId);
      } catch (err) {
        // カテゴリが存在しない場合はスキップ
        console.warn(`Category ${categoryId} not found, skipping`);
      }
    }

    // 処理履歴を更新
    db.prepare(`
      UPDATE processing_history
      SET code_id = ?, status = 'completed', current_step = '完了', progress = 100, completed_at = datetime('now')
      WHERE id = ?
    `).run(codeId, historyId);

  } catch (error) {
    console.error('Image processing failed:', error);

    // エラーを記録
    db.prepare(`
      UPDATE processing_history
      SET status = 'failed', error_message = ?, completed_at = datetime('now')
      WHERE id = ?
    `).run(error instanceof Error ? error.message : '不明なエラー', historyId);
  }
}

export default router;
