import { db } from '../db/db.js';

interface ColorPair {
  base_hex: string;
  match_hex: string;
  score: number;
}

interface PaletteItem {
  hex: string;
  ratio: number;
  role: string;
}

interface CodeWithPalette {
  id: string;
  palette: string;
  likes: number;
}

// Convert hex to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex color: ${hex}`);
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

// Convert RGB to HSV
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s: s * 100, v: v * 100 };
}

// Calculate HSV distance between two colors
function hsvDistance(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);

  const hsv1 = rgbToHsv(rgb1.r, rgb1.g, rgb1.b);
  const hsv2 = rgbToHsv(rgb2.r, rgb2.g, rgb2.b);

  // Hue is circular, so we need to handle wraparound
  const hueDiff = Math.min(
    Math.abs(hsv1.h - hsv2.h),
    360 - Math.abs(hsv1.h - hsv2.h)
  );

  // Weighted distance (hue matters most for color perception)
  const distance = Math.sqrt(
    Math.pow(hueDiff / 360, 2) * 0.5 +
    Math.pow((hsv1.s - hsv2.s) / 100, 2) * 0.3 +
    Math.pow((hsv1.v - hsv2.v) / 100, 2) * 0.2
  );

  return distance;
}

// Find similar colors from the database
export function findSimilarColors(targetHex: string, limit: number = 8): string[] {
  // Get all unique colors from codes' palettes
  const codes = db.prepare(`
    SELECT palette FROM codes WHERE status = 'active'
  `).all() as { palette: string }[];

  const allColors = new Set<string>();
  for (const code of codes) {
    const palette: PaletteItem[] = JSON.parse(code.palette);
    for (const item of palette) {
      allColors.add(item.hex.toUpperCase());
    }
  }

  // Also get colors from color_pairs
  const colorPairs = db.prepare(`
    SELECT DISTINCT base_hex FROM color_pairs
    UNION
    SELECT DISTINCT match_hex FROM color_pairs
  `).all() as { base_hex: string }[];

  for (const pair of colorPairs) {
    allColors.add(pair.base_hex.toUpperCase());
  }

  // Calculate distances and sort
  const colorDistances = Array.from(allColors)
    .filter(color => color.toUpperCase() !== targetHex.toUpperCase())
    .map(color => ({
      hex: color,
      distance: hsvDistance(targetHex, color),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);

  return colorDistances.map(c => c.hex);
}

// 人気コーデから色の組み合わせを抽出して相性色として追加
function extractMatchingColorsFromPopularCodes(targetHex: string, limit: number = 10): Map<string, number> {
  const normalizedTarget = targetHex.toUpperCase();
  const matchingColors = new Map<string, number>();

  // いいね数100以上の人気コーデを取得
  const popularCodes = db.prepare(`
    SELECT id, palette, likes FROM codes
    WHERE status = 'active' AND likes >= 100
    ORDER BY likes DESC
  `).all() as CodeWithPalette[];

  for (const code of popularCodes) {
    const palette: PaletteItem[] = JSON.parse(code.palette);
    const paletteHexes = palette.map(p => p.hex.toUpperCase());

    // ターゲット色と近い色がパレットに含まれているか確認
    let containsTargetColor = false;
    for (const hex of paletteHexes) {
      if (hsvDistance(normalizedTarget, hex) < 0.12) {
        containsTargetColor = true;
        break;
      }
    }

    if (containsTargetColor) {
      // このコーデの他の色を相性色として追加（いいね数で重み付け）
      for (const hex of paletteHexes) {
        if (hsvDistance(normalizedTarget, hex) >= 0.12) {
          const currentScore = matchingColors.get(hex) || 0;
          // いいね数を正規化してスコアに加算
          const likeScore = Math.log10(code.likes + 1) / 4;
          matchingColors.set(hex, currentScore + likeScore);
        }
      }
    }
  }

  return matchingColors;
}

// Find matching/compatible colors from the predefined pairs + popular outfits
export function findMatchingColors(targetHex: string, limit: number = 10): string[] {
  const normalizedHex = targetHex.toUpperCase();
  const colorScores = new Map<string, number>();

  // 1. 固定リストから取得
  const exactMatches = db.prepare(`
    SELECT match_hex, score FROM color_pairs
    WHERE UPPER(base_hex) = ?
    ORDER BY score DESC
  `).all(normalizedHex) as ColorPair[];

  for (const match of exactMatches) {
    colorScores.set(match.match_hex.toUpperCase(), match.score);
  }

  // 2. 近い色の相性色も取得
  const allBasePairs = db.prepare(`
    SELECT DISTINCT base_hex FROM color_pairs
  `).all() as { base_hex: string }[];

  for (const basePair of allBasePairs) {
    const distance = hsvDistance(normalizedHex, basePair.base_hex);
    if (distance < 0.15 && distance > 0) {
      const matches = db.prepare(`
        SELECT match_hex, score FROM color_pairs
        WHERE UPPER(base_hex) = UPPER(?)
      `).all(basePair.base_hex) as ColorPair[];

      for (const match of matches) {
        const hex = match.match_hex.toUpperCase();
        const adjustedScore = match.score * (1 - distance);
        const currentScore = colorScores.get(hex) || 0;
        colorScores.set(hex, Math.max(currentScore, adjustedScore));
      }
    }
  }

  // 3. 人気コーデから動的に抽出
  const popularMatches = extractMatchingColorsFromPopularCodes(targetHex);
  for (const [hex, score] of popularMatches) {
    const currentScore = colorScores.get(hex) || 0;
    colorScores.set(hex, currentScore + score * 0.5);
  }

  // スコア順にソートして上位を返す
  const sortedColors = Array.from(colorScores.entries())
    .filter(([hex]) => hsvDistance(normalizedHex, hex) > 0.08) // 近すぎる色は除外
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([hex]) => hex);

  return sortedColors;
}

// Find codes that contain a specific color (or similar)
export function findCodesByColor(targetHex: string, threshold: number = 0.15): string[] {
  const codes = db.prepare(`
    SELECT id, palette, likes FROM codes
    WHERE status = 'active'
    ORDER BY likes DESC
  `).all() as CodeWithPalette[];

  const matchingCodeIds: string[] = [];

  for (const code of codes) {
    const palette: PaletteItem[] = JSON.parse(code.palette);
    for (const item of palette) {
      const distance = hsvDistance(targetHex, item.hex);
      if (distance <= threshold) {
        matchingCodeIds.push(code.id);
        break;
      }
    }
  }

  return matchingCodeIds;
}

// 色名を取得するヘルパー
export function getColorName(hex: string): string {
  const colorNames: Record<string, string> = {
    '#000000': 'ブラック',
    '#FFFFFF': 'ホワイト',
    '#808080': 'グレー',
    '#1A1A2E': 'ネイビー',
    '#F5F5DC': 'ベージュ',
    '#D4A574': 'キャメル',
    '#8B4513': 'ブラウン',
    '#E74C3C': 'レッド',
    '#FFA500': 'オレンジ',
    '#FFFF00': 'イエロー',
    '#FFC0CB': 'ピンク',
    '#4169E1': 'ブルー',
    '#87CEEB': 'ライトブルー',
    '#228B22': 'グリーン',
    '#556B2F': 'オリーブ',
    '#800080': 'パープル',
    '#722F37': 'ボルドー',
    '#FFDB58': 'マスタード',
    '#40E0D0': 'ターコイズ',
    '#6B8E23': 'カーキ',
    '#36454F': 'チャコール',
    '#E2725B': 'テラコッタ',
    '#4682B4': 'サックスブルー',
    '#FF7F50': 'コーラル',
    '#98FF98': 'ミントグリーン',
    '#D3D3D3': 'ライトグレー',
    '#FAF9F6': 'オフホワイト',
    '#FFFDD0': 'クリーム',
  };

  const normalized = hex.toUpperCase();
  if (colorNames[normalized]) {
    return colorNames[normalized];
  }

  // 近い色の名前を返す
  let closestName = '';
  let closestDistance = Infinity;

  for (const [knownHex, name] of Object.entries(colorNames)) {
    const distance = hsvDistance(normalized, knownHex);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestName = name;
    }
  }

  return closestDistance < 0.15 ? closestName : '';
}
