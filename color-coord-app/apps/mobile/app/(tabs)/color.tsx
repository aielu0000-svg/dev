import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { ColorPicker } from '@/components/ColorPicker';
import { ColorChip } from '@/components/ColorChip';
import { CodeCard } from '@/components/CodeCard';
import { searchByColor, ColorSearchResult } from '@/lib/api';

export default function ColorSearchScreen() {
  const [selectedColor, setSelectedColor] = useState('#2C3E50');
  const [result, setResult] = useState<ColorSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await searchByColor(selectedColor);
      setResult(data);
    } catch (err) {
      setError('検索に失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleColorSelect = (hex: string) => {
    setSelectedColor(hex);
    // Auto-search when selecting a color from results
    searchByColor(hex)
      .then(setResult)
      .catch(() => {});
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>色を選択</Text>
        <ColorPicker value={selectedColor} onChange={setSelectedColor} />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          activeOpacity={0.8}
        >
          <Text style={styles.searchButtonText}>この色で検索</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#2C3E50" />
        </View>
      )}

      {error && (
        <View style={styles.error}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {result && !loading && (
        <>
          {/* Near colors */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>近似色</Text>
            <Text style={styles.sectionSubtitle}>選んだ色に近い色</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {result.nearColors.map((hex, index) => (
                  <ColorChip
                    key={index}
                    hex={hex}
                    size="large"
                    onPress={() => handleColorSelect(hex)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Match colors */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>相性の良い色</Text>
            <Text style={styles.sectionSubtitle}>組み合わせにおすすめ</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                {result.matchColors.map((hex, index) => (
                  <ColorChip
                    key={index}
                    hex={hex}
                    size="large"
                    onPress={() => handleColorSelect(hex)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Related codes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>関連コーデ</Text>
            <Text style={styles.sectionSubtitle}>
              {result.relatedCodes.length > 0
                ? `${result.relatedCodes.length}件のコーデが見つかりました`
                : 'この色を使ったコーデがありません'}
            </Text>
            {result.relatedCodes.length > 0 && (
              <View style={styles.codeGrid}>
                {result.relatedCodes.slice(0, 6).map((code) => (
                  <View key={code.id} style={styles.codeItem}>
                    <CodeCard code={code} />
                  </View>
                ))}
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  section: {
    padding: 16,
    backgroundColor: '#FFF',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  searchButton: {
    backgroundColor: '#2C3E50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loading: {
    padding: 40,
    alignItems: 'center',
  },
  error: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: '#E74C3C',
  },
  chipRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  codeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  codeItem: {
    width: '50%',
    paddingHorizontal: 6,
  },
});
