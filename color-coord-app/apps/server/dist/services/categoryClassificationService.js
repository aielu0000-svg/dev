/**
 * カテゴリ分類サービス
 * 色情報から服のカテゴリと季節・シーンを推定
 */
export class CategoryClassificationService {
    /**
     * 色情報からカテゴリを推定
     */
    classifyCategories(palette) {
        const categories = [];
        const seasonTags = [];
        const sceneTags = [];
        // 色数と明度から推定
        const darkColors = palette.filter(c => this.getBrightness(c.rgb) < 100);
        const lightColors = palette.filter(c => this.getBrightness(c.rgb) > 180);
        const vibrantColors = palette.filter(c => this.getSaturation(c.rgb) > 0.5);
        // カテゴリ推定（簡易版）
        categories.push('tops'); // デフォルト
        if (darkColors.length >= 2) {
            categories.push('bottoms');
        }
        if (palette.length >= 4) {
            categories.push('outer');
        }
        // 季節推定
        const avgHue = this.getAverageHue(palette);
        const avgSaturation = this.getAverageSaturation(palette);
        const avgBrightness = this.getAverageBrightness(palette);
        if (lightColors.length > darkColors.length && avgBrightness > 160) {
            seasonTags.push('spring', 'summer');
            sceneTags.push('casual', 'outdoor');
        }
        else if (darkColors.length > lightColors.length) {
            seasonTags.push('autumn', 'winter');
            sceneTags.push('formal', 'business');
        }
        if (vibrantColors.length >= 2) {
            sceneTags.push('party', 'date');
        }
        else {
            sceneTags.push('daily', 'office');
        }
        // パステルカラーチェック
        if (avgSaturation < 0.4 && avgBrightness > 180) {
            sceneTags.push('feminine');
        }
        return {
            categories: [...new Set(categories)],
            confidence: 0.7, // 簡易版なので固定値
            seasonTags: [...new Set(seasonTags)],
            sceneTags: [...new Set(sceneTags)],
        };
    }
    /**
     * RGBから明度を計算
     */
    getBrightness(rgb) {
        return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    }
    /**
     * RGBから彩度を計算
     */
    getSaturation(rgb) {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        if (max === 0)
            return 0;
        return (max - min) / max;
    }
    /**
     * RGBから色相を計算
     */
    getHue(rgb) {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        if (delta === 0)
            return 0;
        let hue = 0;
        if (max === r) {
            hue = 60 * (((g - b) / delta) % 6);
        }
        else if (max === g) {
            hue = 60 * ((b - r) / delta + 2);
        }
        else {
            hue = 60 * ((r - g) / delta + 4);
        }
        return hue < 0 ? hue + 360 : hue;
    }
    /**
     * パレット全体の平均色相
     */
    getAverageHue(palette) {
        const sum = palette.reduce((acc, c) => acc + this.getHue(c.rgb), 0);
        return sum / palette.length;
    }
    /**
     * パレット全体の平均彩度
     */
    getAverageSaturation(palette) {
        const sum = palette.reduce((acc, c) => acc + this.getSaturation(c.rgb), 0);
        return sum / palette.length;
    }
    /**
     * パレット全体の平均明度
     */
    getAverageBrightness(palette) {
        const sum = palette.reduce((acc, c) => acc + this.getBrightness(c.rgb), 0);
        return sum / palette.length;
    }
}
