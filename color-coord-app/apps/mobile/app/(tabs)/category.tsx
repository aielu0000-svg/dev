import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { CodeCard } from '@/components/CodeCard';
import { fetchCategories, fetchCodesByCategory, Category, Code } from '@/lib/api';

export default function CategoryScreen() {
  const [categories, setCategories] = useState<(Category & { children?: Category[] })[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [codesLoading, setCodesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCategories();
      setCategories(data.categories);
      // Auto-select first category
      if (data.categories.length > 0) {
        handleCategorySelect(data.categories[0].id);
      }
    } catch (err) {
      setError('カテゴリの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    try {
      setCodesLoading(true);
      const data = await fetchCodesByCategory(categoryId);
      setCodes(data.codes);
    } catch (err) {
      console.error(err);
    } finally {
      setCodesLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2C3E50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Category tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabs}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.tab,
                  selectedCategory === cat.id && styles.tabSelected,
                ]}
                onPress={() => handleCategorySelect(cat.id)}
              >
                <Text
                  style={[
                    styles.tabText,
                    selectedCategory === cat.id && styles.tabTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Subcategories */}
      {selectedCategory && (
        <View style={styles.subCatsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.subCats}>
              {categories
                .find((c) => c.id === selectedCategory)
                ?.children?.map((sub) => (
                  <TouchableOpacity
                    key={sub.id}
                    style={styles.subCatChip}
                    onPress={() => handleCategorySelect(sub.id)}
                  >
                    <Text style={styles.subCatText}>{sub.name}</Text>
                  </TouchableOpacity>
                ))}
            </View>
          </ScrollView>
        </View>
      )}

      {/* Codes list */}
      <ScrollView style={styles.codesList}>
        {codesLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="small" color="#2C3E50" />
          </View>
        ) : codes.length > 0 ? (
          <View style={styles.codeGrid}>
            {codes.map((code) => (
              <View key={code.id} style={styles.codeItem}>
                <CodeCard code={code} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>このカテゴリにコーデがありません</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#E74C3C',
  },
  tabsContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabSelected: {
    borderBottomColor: '#2C3E50',
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  tabTextSelected: {
    color: '#2C3E50',
    fontWeight: '600',
  },
  subCatsContainer: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  subCats: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
  },
  subCatChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  subCatText: {
    fontSize: 13,
    color: '#555',
  },
  codesList: {
    flex: 1,
    padding: 12,
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
  loading: {
    padding: 40,
    alignItems: 'center',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
  },
});
