import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useFavorites, Favorite } from '@/lib/favorites';
import { useHistory, HistoryItem } from '@/lib/history';
import { fetchCodeDetail, Code } from '@/lib/api';
import { OutfitIllustration } from '@/components/OutfitIllustration';

type TabType = 'favorites' | 'history';

export default function MyPageScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('favorites');
  const { favorites, loading: favLoading } = useFavorites();
  const { history, loading: histLoading, clearHistory } = useHistory();
  const [codes, setCodes] = useState<Map<string, Code>>(new Map());
  const [loadingCodes, setLoadingCodes] = useState(false);

  useEffect(() => {
    loadCodes();
  }, [favorites, history, activeTab]);

  const loadCodes = async () => {
    const idsToLoad =
      activeTab === 'favorites'
        ? favorites.map((f) => f.codeId)
        : history.map((h) => h.codeId);

    const newCodes = new Map(codes);
    const missingIds = idsToLoad.filter((id) => !newCodes.has(id));

    if (missingIds.length > 0) {
      setLoadingCodes(true);
      try {
        for (const id of missingIds.slice(0, 10)) {
          try {
            const detail = await fetchCodeDetail(id);
            newCodes.set(id, detail);
          } catch {
            // Skip failed loads
          }
        }
        setCodes(newCodes);
      } finally {
        setLoadingCodes(false);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = (item: Favorite | HistoryItem, index: number) => {
    const codeId = item.codeId;
    const code = codes.get(codeId);
    const date = 'createdAt' in item ? item.createdAt : item.viewedAt;

    return (
      <TouchableOpacity
        key={`${codeId}-${index}`}
        style={styles.itemCard}
        onPress={() => router.push(`/code/${codeId}`)}
      >
        {code ? (
          <View style={styles.itemIllustration}>
            <OutfitIllustration palette={code.palette} size="small" />
          </View>
        ) : (
          <View style={[styles.itemIllustration, styles.placeholder]}>
            <Text style={styles.placeholderText}>読込中</Text>
          </View>
        )}
        <View style={styles.itemInfo}>
          {code && (
            <>
              <View style={styles.paletteRow}>
                {code.palette.slice(0, 3).map((p, i) => (
                  <View
                    key={i}
                    style={[styles.miniChip, { backgroundColor: p.hex }]}
                  />
                ))}
              </View>
              <Text style={styles.likes}>❤️ {code.likes.toLocaleString()}</Text>
            </>
          )}
          <Text style={styles.date}>{formatDate(date)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const loading = favLoading || histLoading || loadingCodes;
  const currentItems = activeTab === 'favorites' ? favorites : history;

  return (
    <View style={styles.container}>
      {/* Tab switcher */}
      <View style={styles.tabSwitcher}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.tabActive]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'favorites' && styles.tabTextActive,
            ]}
          >
            ❤️ お気に入り ({favorites.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'history' && styles.tabTextActive,
            ]}
          >
            🕐 履歴 ({history.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Clear history button */}
      {activeTab === 'history' && history.length > 0 && (
        <TouchableOpacity style={styles.clearButton} onPress={clearHistory}>
          <Text style={styles.clearButtonText}>履歴をクリア</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      {loading && currentItems.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2C3E50" />
        </View>
      ) : currentItems.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>
            {activeTab === 'favorites' ? '❤️' : '🕐'}
          </Text>
          <Text style={styles.emptyText}>
            {activeTab === 'favorites'
              ? 'お気に入りがありません'
              : '閲覧履歴がありません'}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'favorites'
              ? 'コーデ詳細でハートをタップして保存しましょう'
              : 'コーデを見ると履歴に追加されます'}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list}>
          <View style={styles.grid}>
            {currentItems.map((item, index) => renderItem(item, index))}
          </View>
        </ScrollView>
      )}
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
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#2C3E50',
  },
  tabText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2C3E50',
    fontWeight: '600',
  },
  clearButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    marginTop: 8,
  },
  clearButtonText: {
    fontSize: 13,
    color: '#E74C3C',
  },
  list: {
    flex: 1,
    padding: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  itemCard: {
    width: '50%',
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  itemIllustration: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 8,
  },
  placeholder: {
    height: 150,
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#CCC',
    fontSize: 12,
  },
  itemInfo: {
    backgroundColor: '#FFF',
    padding: 10,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  miniChip: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  likes: {
    fontSize: 11,
    color: '#666',
  },
  date: {
    fontSize: 10,
    color: '#AAA',
    marginTop: 4,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#AAA',
    textAlign: 'center',
  },
});
