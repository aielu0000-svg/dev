import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

interface ColorExplanationProps {
  baseColor: string;
  matchColor: string;
}

interface ExplanationData {
  baseHex: string;
  matchHex: string;
  harmonyType: string;
  explanation: string;
  tips: string[];
}

const HARMONY_TYPE_LABELS: Record<string, string> = {
  complementary: '補色配色',
  analogous: '類似色配色',
  triadic: '三色配色',
  'split-complementary': '分裂補色配色',
  monochromatic: '単色配色',
  neutral: 'ニュートラル配色',
};

export default function ColorExplanation({
  baseColor,
  matchColor,
}: ColorExplanationProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ExplanationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExplanation();
  }, [baseColor, matchColor]);

  const fetchExplanation = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/colors/explain?base=${encodeURIComponent(
          baseColor
        )}&match=${encodeURIComponent(matchColor)}`
      );

      if (!response.ok) {
        throw new Error('配色の説明を取得できませんでした');
      }

      const result = await response.json();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラー');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.loadingText}>配色を分析中...</Text>
      </View>
    );
  }

  if (error || !data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || '説明を取得できませんでした'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>配色の説明</Text>
      </View>

      <View style={styles.colorPair}>
        <View style={styles.colorBox}>
          <View style={[styles.colorSwatch, { backgroundColor: data.baseHex }]} />
          <Text style={styles.colorLabel}>ベース色</Text>
          <Text style={styles.colorHex}>{data.baseHex}</Text>
        </View>
        <Text style={styles.plusSign}>+</Text>
        <View style={styles.colorBox}>
          <View style={[styles.colorSwatch, { backgroundColor: data.matchHex }]} />
          <Text style={styles.colorLabel}>相性色</Text>
          <Text style={styles.colorHex}>{data.matchHex}</Text>
        </View>
      </View>

      <View style={styles.harmonyType}>
        <Text style={styles.harmonyTypeLabel}>配色タイプ</Text>
        <Text style={styles.harmonyTypeName}>
          {HARMONY_TYPE_LABELS[data.harmonyType] || data.harmonyType}
        </Text>
      </View>

      <View style={styles.explanation}>
        <Text style={styles.sectionTitle}>この配色について</Text>
        <Text style={styles.explanationText}>{data.explanation}</Text>
      </View>

      <View style={styles.tips}>
        <Text style={styles.sectionTitle}>💡 配色のコツ</Text>
        {data.tips.map((tip, index) => (
          <View key={index} style={styles.tipItem}>
            <Text style={styles.tipBullet}>•</Text>
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    padding: 20,
    fontSize: 14,
    color: '#f44336',
    textAlign: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  colorPair: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  colorBox: {
    alignItems: 'center',
  },
  colorSwatch: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  colorLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  colorHex: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  plusSign: {
    fontSize: 32,
    color: '#999',
    marginHorizontal: 20,
  },
  harmonyType: {
    padding: 16,
    backgroundColor: '#e3f2fd',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  harmonyTypeLabel: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 4,
  },
  harmonyTypeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  explanation: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#333',
  },
  tips: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    marginTop: 8,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipBullet: {
    marginRight: 8,
    color: '#2196f3',
    fontSize: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
});
