import sharp from 'sharp';
import { Vibrant } from 'node-vibrant/node';
import { v4 as uuidv4 } from 'uuid';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export type ProcessingStyle = 'standard' | 'sketch' | 'minimal' | 'detailed';

export interface ProcessingStep {
  step: string;
  progress: number;
}

export interface ProcessedImage {
  id: string;
  originalPath: string;
  illustrationPath: string;
  palette: ColorInfo[];
  style: ProcessingStyle;
  processingTime: number;
}

export interface ColorInfo {
  hex: string;
  ratio: number;
  role: 'primary' | 'secondary' | 'accent' | 'neutral';
  rgb: { r: number; g: number; b: number };
}

export class ImageProcessingService {
  private uploadsDir: string;
  private outputDir: string;

  constructor(baseDir: string = './data') {
    this.uploadsDir = join(baseDir, 'uploads');
    this.outputDir = join(baseDir, 'processed');

    // ディレクトリ作成
    [this.uploadsDir, this.outputDir].forEach(dir => {
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
    });
  }

  /**
   * ファッションデザイン画風に画像を変換
   */
  async processImage(
    inputBuffer: Buffer,
    style: ProcessingStyle = 'standard',
    onProgress?: (step: ProcessingStep) => void
  ): Promise<ProcessedImage> {
    const startTime = Date.now();
    const id = uuidv4();

    try {
      // ステップ1: 画像のメタデータ取得と前処理
      onProgress?.({ step: '画像を読み込んでいます', progress: 10 });
      const image = sharp(inputBuffer);
      const metadata = await image.metadata();

      // ステップ2: リサイズと正規化（縦長に）
      onProgress?.({ step: '画像を正規化しています', progress: 20 });
      const targetHeight = 800;
      const targetWidth = Math.floor(targetHeight * 0.6); // 3:5 ratio

      let normalized = image.resize(targetWidth, targetHeight, {
        fit: 'cover',
        position: 'center',
      });

      // ステップ3: 背景除去（簡易版）
      onProgress?.({ step: '背景を処理しています', progress: 35 });
      // 背景を白に統一化（閾値処理）
      normalized = normalized.threshold(240, { greyscale: false });

      // ステップ4: スタイル別処理
      onProgress?.({ step: 'デザイン画風に変換しています', progress: 50 });
      const styled = await this.applyStyle(normalized, style);

      // ステップ5: 輪郭強調
      onProgress?.({ step: '輪郭を強調しています', progress: 70 });
      const edgeDetected = await this.enhanceEdges(styled, style);

      // ステップ6: 色抽出
      onProgress?.({ step: '色を抽出しています', progress: 85 });
      const palette = await this.extractColors(inputBuffer);

      // ステップ7: 最終出力
      onProgress?.({ step: '画像を保存しています', progress: 95 });
      const originalPath = join(this.uploadsDir, `${id}_original.jpg`);
      const illustrationPath = join(this.outputDir, `${id}_illustration.png`);

      await sharp(inputBuffer).jpeg({ quality: 90 }).toFile(originalPath);
      await sharp(edgeDetected).png().toFile(illustrationPath);

      onProgress?.({ step: '完了しました', progress: 100 });

      const processingTime = Date.now() - startTime;

      return {
        id,
        originalPath,
        illustrationPath,
        palette,
        style,
        processingTime,
      };
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error(`画像処理に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`);
    }
  }

  /**
   * スタイル別の画像処理を適用
   */
  private async applyStyle(
    image: sharp.Sharp,
    style: ProcessingStyle
  ): Promise<Buffer> {
    switch (style) {
      case 'sketch':
        // スケッチ風: 高コントラスト + グレースケール化
        return await image
          .greyscale()
          .linear(1.5, -(128 * 0.5))
          .blur(0.3)
          .toBuffer();

      case 'minimal':
        // ミニマル風: 減色処理
        return await image
          .toColourspace('srgb')
          .modulate({ saturation: 0.7, brightness: 1.1 })
          .toBuffer();

      case 'detailed':
        // 詳細風: シャープネス強化
        return await image
          .sharpen({ sigma: 2 })
          .modulate({ saturation: 1.2 })
          .toBuffer();

      case 'standard':
      default:
        // 標準: 適度な彩度調整
        return await image
          .modulate({ saturation: 0.9 })
          .toBuffer();
    }
  }

  /**
   * エッジ検出と輪郭強調
   */
  private async enhanceEdges(
    imageBuffer: Buffer,
    style: ProcessingStyle
  ): Promise<Buffer> {
    const image = sharp(imageBuffer);

    // エッジ検出の強度をスタイルに応じて調整
    const edgeStrength = {
      sketch: 3,
      minimal: 1,
      detailed: 2,
      standard: 1.5,
    }[style];

    // Sobelフィルタでエッジ検出（近似）
    const edges = await image
      .greyscale()
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
        scale: edgeStrength,
      })
      .toBuffer();

    // 元画像とエッジを合成
    const result = await sharp(imageBuffer)
      .composite([
        {
          input: edges,
          blend: 'multiply',
        },
      ])
      .toBuffer();

    return result;
  }

  /**
   * 色抽出（Vibrantを使用）
   */
  private async extractColors(imageBuffer: Buffer): Promise<ColorInfo[]> {
    const palette = await Vibrant.from(imageBuffer).getPalette();

    const colors: ColorInfo[] = [];
    const swatches = [
      { swatch: palette.Vibrant, role: 'primary' as const },
      { swatch: palette.DarkVibrant, role: 'secondary' as const },
      { swatch: palette.LightVibrant, role: 'accent' as const },
      { swatch: palette.Muted, role: 'neutral' as const },
    ];

    for (const { swatch, role } of swatches) {
      if (swatch) {
        const [r, g, b] = swatch.rgb;
        colors.push({
          hex: swatch.hex,
          ratio: swatch.population / 100, // 簡易的な比率
          role,
          rgb: { r: Math.round(r), g: Math.round(g), b: Math.round(b) },
        });
      }
    }

    return colors;
  }

  /**
   * 処理時間の見積もり（画像サイズに基づく）
   */
  estimateProcessingTime(fileSizeBytes: number): number {
    // 簡易的な見積もり: 1MBあたり2秒
    const sizeMB = fileSizeBytes / (1024 * 1024);
    return Math.ceil(sizeMB * 2000); // ミリ秒
  }
}
