/**
 * 配色の理由説明サービス
 * 色の組み合わせがなぜ良いのかを説明
 */
export class ColorExplanationService {
    harmonyExplanations = {
        complementary: '補色の組み合わせです。色相環の反対側にある色同士で、互いを引き立て合い、視覚的なインパクトを生み出します。',
        analogous: '類似色の組み合わせです。色相環で隣り合う色同士で、調和が取れた穏やかな印象を与えます。',
        triadic: '三色配色です。色相環で等間隔に配置された3色の組み合わせで、バランスの取れた華やかな印象になります。',
        'split-complementary': '分裂補色の組み合わせです。補色に近い色を使うことで、補色ほど強すぎず、バランスの良い配色になります。',
        monochromatic: '同系色の組み合わせです。一つの色相で明度や彩度を変えることで、統一感のある洗練された印象を与えます。',
        neutral: 'ニュートラルな組み合わせです。白・黒・グレー・ベージュなどの無彩色を使い、どんな色とも相性が良く、落ち着いた印象を与えます。',
    };
    /**
     * 2色の組み合わせについて説明を生成
     */
    explainColorPair(baseHex, matchHex) {
        const baseRgb = this.hexToRgb(baseHex);
        const matchRgb = this.hexToRgb(matchHex);
        const baseHsv = this.rgbToHsv(baseRgb);
        const matchHsv = this.rgbToHsv(matchRgb);
        const harmonyType = this.detectHarmonyType(baseHsv, matchHsv);
        const explanation = this.harmonyExplanations[harmonyType];
        const tips = this.generateTips(baseHex, matchHex, baseHsv, matchHsv, harmonyType);
        return {
            baseHex,
            matchHex,
            harmonyType,
            explanation,
            tips,
        };
    }
    /**
     * 配色のハーモニータイプを検出
     */
    detectHarmonyType(baseHsv, matchHsv) {
        const hueDiff = Math.abs(baseHsv.h - matchHsv.h);
        const normalizedDiff = Math.min(hueDiff, 360 - hueDiff);
        // ニュートラルチェック（彩度が低い）
        if (baseHsv.s < 0.2 && matchHsv.s < 0.2) {
            return 'neutral';
        }
        // 単色チェック（色相差が小さく、明度・彩度が異なる）
        if (normalizedDiff < 30) {
            return 'monochromatic';
        }
        // 類似色チェック（色相差が30-60度）
        if (normalizedDiff >= 30 && normalizedDiff < 60) {
            return 'analogous';
        }
        // 補色チェック（色相差が150-210度）
        if (normalizedDiff >= 150 && normalizedDiff <= 210) {
            return 'complementary';
        }
        // 分裂補色チェック（色相差が120-150度または210-240度）
        if ((normalizedDiff >= 120 && normalizedDiff < 150) ||
            (normalizedDiff > 210 && normalizedDiff <= 240)) {
            return 'split-complementary';
        }
        // 三色配色チェック（色相差が120度前後）
        if (normalizedDiff >= 110 && normalizedDiff <= 130) {
            return 'triadic';
        }
        // デフォルトは類似色
        return 'analogous';
    }
    /**
     * 配色のコツを生成
     */
    generateTips(baseHex, matchHex, baseHsv, matchHsv, harmonyType) {
        const tips = [];
        // ハーモニータイプ別のアドバイス
        switch (harmonyType) {
            case 'complementary':
                tips.push('補色は面積比を7:3程度にすると、一方が主役、もう一方がアクセントとして際立ちます。');
                tips.push('両色を同じ面積で使うと視覚的に騒がしくなるので、どちらかをメインにしましょう。');
                break;
            case 'analogous':
                tips.push('類似色は失敗しにくい組み合わせです。3色以内に抑えるとより洗練されます。');
                tips.push('明度差をつけることで、メリハリのあるコーディネートになります。');
                break;
            case 'monochromatic':
                tips.push('同系色は統一感が出やすい反面、単調になりがちです。素材や質感で変化をつけましょう。');
                tips.push('明度差を大きくすることで、立体感が生まれます。');
                break;
            case 'neutral':
                tips.push('ニュートラルカラーは万能です。差し色として鮮やかな色を少し加えると、コーディネートが引き締まります。');
                tips.push('異なる素材（レザー、ニット、デニムなど）を組み合わせると、奥行きが出ます。');
                break;
            case 'triadic':
            case 'split-complementary':
                tips.push('3色を使う場合は、1色をメイン、残りをサブとアクセントにするとバランスが良くなります。');
                tips.push('面積比は6:3:1を目安にすると、調和が取れたコーディネートになります。');
                break;
        }
        // 明度・彩度に基づくアドバイス
        const avgValue = (baseHsv.v + matchHsv.v) / 2;
        const avgSaturation = (baseHsv.s + matchHsv.s) / 2;
        if (avgValue > 0.7) {
            tips.push('明るい色の組み合わせは、春夏に適しています。軽やかで爽やかな印象を与えます。');
        }
        else if (avgValue < 0.4) {
            tips.push('暗い色の組み合わせは、秋冬に適しています。落ち着いた大人っぽい印象を与えます。');
        }
        if (avgSaturation > 0.6) {
            tips.push('鮮やかな色の組み合わせは、華やかでエネルギッシュな印象です。特別な日のコーディネートに最適です。');
        }
        else if (avgSaturation < 0.3) {
            tips.push('くすんだ色の組み合わせは、柔らかく優しい印象です。デイリーコーデに取り入れやすい配色です。');
        }
        return tips;
    }
    /**
     * HEXをRGBに変換
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : { r: 0, g: 0, b: 0 };
    }
    /**
     * RGBをHSVに変換
     */
    rgbToHsv(rgb) {
        const r = rgb.r / 255;
        const g = rgb.g / 255;
        const b = rgb.b / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const delta = max - min;
        let h = 0;
        if (delta !== 0) {
            if (max === r) {
                h = 60 * (((g - b) / delta) % 6);
            }
            else if (max === g) {
                h = 60 * ((b - r) / delta + 2);
            }
            else {
                h = 60 * ((r - g) / delta + 4);
            }
        }
        if (h < 0)
            h += 360;
        const s = max === 0 ? 0 : delta / max;
        const v = max;
        return { h, s, v };
    }
}
