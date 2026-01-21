import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { CodeCard } from '@/components/CodeCard';
import { fetchCodes, Code } from '@/lib/api';

export default function HomeScreen() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCodes = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const data = await fetchCodes(20);
      setCodes(data.codes);
    } catch (err) {
      setError('コーデの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCodes();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2C3E50" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText} onPress={() => loadCodes()}>
          タップして再読み込み
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>人気のコーデ</Text>
      <FlatList
        data={codes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <CodeCard code={item} />}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadCodes(true)} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>コーデがありません</Text>
          </View>
        }
      />
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
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    padding: 16,
  },
  list: {
    paddingHorizontal: 12,
  },
  row: {
    justifyContent: 'space-between',
    gap: 12,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 16,
    marginBottom: 8,
  },
  retryText: {
    color: '#3498DB',
    fontSize: 14,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
});
