import { View, StyleSheet } from 'react-native';
import Svg, { Path, G, Rect, Ellipse, Line } from 'react-native-svg';
import { PaletteItem } from '@/lib/api';

interface OutfitIllustrationProps {
  palette: PaletteItem[];
  size?: 'small' | 'medium' | 'large';
}

export function OutfitIllustration({ palette, size = 'medium' }: OutfitIllustrationProps) {
  const dimensions = {
    small: { width: 100, height: 150 },
    medium: { width: 160, height: 240 },
    large: { width: 240, height: 360 },
  };

  const { width, height } = dimensions[size];
  const strokeWidth = size === 'small' ? 1.5 : 2;

  // パレットから各パーツの色を取得
  const getColorByRole = (role: string): string => {
    const item = palette.find((p) => p.role === role);
    return item?.hex || '#CCCCCC';
  };

  const outerColor = getColorByRole('outer');
  const topsColor = getColorByRole('tops');
  const bottomsColor = getColorByRole('bottoms');
  const shoesColor = palette.find((p) => p.role === 'shoes')?.hex || '#333333';
  const accessoriesColor = palette.find((p) => p.role === 'accessories')?.hex;

  // SVG座標をサイズに応じてスケール
  const scale = width / 100;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height} viewBox="0 0 100 150">
        {/* 背景 */}
        <Rect x="0" y="0" width="100" height="150" fill="#FAFAFA" />

        {/* 頭部（シルエット） */}
        <Ellipse
          cx="50"
          cy="18"
          rx="12"
          ry="14"
          fill="none"
          stroke="#333"
          strokeWidth={strokeWidth}
        />

        {/* 首 */}
        <Line
          x1="50"
          y1="32"
          x2="50"
          y2="38"
          stroke="#333"
          strokeWidth={strokeWidth}
        />

        {/* アウター/上着（存在する場合） */}
        {palette.some((p) => p.role === 'outer') && (
          <G>
            {/* アウター本体 */}
            <Path
              d="M30 38 L25 42 L25 85 L35 85 L35 50 L40 45 L40 85 L60 85 L60 45 L65 50 L65 85 L75 85 L75 42 L70 38 L60 40 L50 38 L40 40 Z"
              fill={outerColor}
              stroke="#333"
              strokeWidth={strokeWidth}
            />
            {/* 襟 */}
            <Path
              d="M40 40 L45 48 L50 42 L55 48 L60 40"
              fill="none"
              stroke="#333"
              strokeWidth={strokeWidth}
            />
          </G>
        )}

        {/* トップス */}
        <G>
          {palette.some((p) => p.role === 'outer') ? (
            // アウターありの場合は見える部分だけ
            <Path
              d="M42 42 L45 48 L50 44 L55 48 L58 42 L58 55 L42 55 Z"
              fill={topsColor}
              stroke="#333"
              strokeWidth={strokeWidth}
            />
          ) : (
            // アウターなしの場合はトップス全体
            <Path
              d="M30 38 L25 45 L30 48 L30 85 L70 85 L70 48 L75 45 L70 38 L60 42 L50 38 L40 42 Z"
              fill={topsColor}
              stroke="#333"
              strokeWidth={strokeWidth}
            />
          )}
        </G>

        {/* ボトムス */}
        <G>
          <Path
            d="M32 85 L30 130 L42 130 L48 95 L52 95 L58 130 L70 130 L68 85 Z"
            fill={bottomsColor}
            stroke="#333"
            strokeWidth={strokeWidth}
          />
        </G>

        {/* シューズ */}
        <G>
          {/* 左足 */}
          <Path
            d="M30 130 L28 135 L25 138 L40 138 L42 130 Z"
            fill={shoesColor}
            stroke="#333"
            strokeWidth={strokeWidth}
          />
          {/* 右足 */}
          <Path
            d="M58 130 L60 135 L75 138 L72 138 L70 130 Z"
            fill={shoesColor}
            stroke="#333"
            strokeWidth={strokeWidth}
          />
        </G>

        {/* アクセサリー（バッグなど） */}
        {accessoriesColor && (
          <G>
            {/* バッグ */}
            <Rect
              x="72"
              y="55"
              width="15"
              height="20"
              rx="2"
              fill={accessoriesColor}
              stroke="#333"
              strokeWidth={strokeWidth}
            />
            {/* バッグの持ち手 */}
            <Path
              d="M75 55 L75 50 L84 50 L84 55"
              fill="none"
              stroke="#333"
              strokeWidth={strokeWidth}
            />
          </G>
        )}

        {/* 腕（シルエット線） */}
        <G>
          {/* 左腕 */}
          <Path
            d="M25 45 L15 70 L18 72 L30 50"
            fill="none"
            stroke="#333"
            strokeWidth={strokeWidth}
          />
          {/* 右腕 */}
          <Path
            d="M75 45 L85 70 L82 72 L70 50"
            fill="none"
            stroke="#333"
            strokeWidth={strokeWidth}
          />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    overflow: 'hidden',
  },
});
