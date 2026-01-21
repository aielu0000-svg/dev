import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ColorChip } from '@/components/ColorChip';
import { OutfitIllustration } from '@/components/OutfitIllustration';
import { fetchCodeDetail, CodeDetail, PaletteItem } from '@/lib/api';
import { useFavorites } from '@/lib/favorites';
import { useHistory } from '@/lib/history';

export default function CodeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [code, setCode] = useState<CodeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToHistory } = useHistory();

  useEffect(() => {
    if (id) {
      loadCode(id);
    }
  }, [id]);

  const loadCode = async (codeId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchCodeDetail(codeId);
      setCode(data);
      addToHistory(codeId); // 閲覧履歴に追加
    } catch (err) {
      setError('コーデの読み込みに失敗しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!code) return;
    try {
      await Share.share({
        message: `この配色コーデをチェック！\n色: ${code.palette.map(p => p.hex).join(', ')}\n#ColorCoord #配色 #コーデ`,
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2C3E50" />
      </View>
    );
  }

  if (error || !code) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'コーデが見つかりません'}</Text>
      </View>
    );
  }

  const getRoleName = (role: string): string => {
    const names: Record<string, string> = {
      outer: 'アウター',
      tops: 'トップス',
      bottoms: 'ボトムス',
      shoes: 'シューズ',
      accessories: '小物',
    };
    return names[role] || role;
  };

  const favorited = isFavorite(code.id);

  return (
    <ScrollView style={styles.container}>
      {/* シルエットイラスト */}
      <View style={styles.illustrationContainer}>
        <OutfitIllustration palette={code.palette} size="large" />
      </View>

      {/* アクションボタン */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, favorited && styles.actionButtonActive]}
          onPress={() => toggleFavorite(code.id)}
        >
          <Text style={styles.actionIcon}>{favorited ? '❤️' : '🤍'}</Text>
          <Text style={styles.actionText}>お気に入り</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>シェア</Text>
        </TouchableOpacity>
      </View>

      {/* Palette */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>配色構成</Text>
        {code.palette.map((item: PaletteItem, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.paletteItem}
            onPress={() => router.push(`/(tabs)/color?hex=${encodeURIComponent(item.hex)}`)}
          >
            <ColorChip hex={item.hex} size="medium" />
            <View style={styles.paletteInfo}>
              <Text style={styles.paletteName}>{getRoleName(item.role)}</Text>
              <Text style={styles.paletteHex}>{item.hex}</Text>
              <Text style={styles.paletteRatio}>{Math.round(item.ratio * 100)}%</Text>
            </View>
            <Text style={styles.paletteArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>カテゴリ</Text>
        <View style={styles.categoryChips}>
          {code.categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryChip}
              onPress={() => router.push(`/(tabs)/category?selected=${cat.id}`)}
            >
              <Text style={styles.categoryText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <View style={styles.statsRow}>
          <Text style={styles.stats}>❤️ {code.likes.toLocaleString()} いいね</Text>
        </View>
      </View>

      {/* Similar codes */}
      {code.similarCodes && code.similarCodes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>類似コーデ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.similarRow}>
              {code.similarCodes.map((similar) => (
                <TouchableOpacity
                  key={similar.id}
                  style={styles.similarCard}
                  onPress={() => router.push(`/code/${similar.id}`)}
                >
                  <View style={styles.similarIllustrationContainer}>
                    <OutfitIllustration palette={similar.palette} size="small" />
                  </View>
                  <Text style={styles.similarLikes}>❤️ {similar.likes.toLocaleString()}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </ScrollView>
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
  illustrationContainer: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 20,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  actionButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonActive: {
    backgroundColor: '#FFF0F0',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  paletteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  paletteInfo: {
    marginLeft: 12,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paletteName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    width: 80,
  },
  paletteHex: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    width: 80,
  },
  paletteRatio: {
    fontSize: 12,
    color: '#888',
  },
  paletteArrow: {
    fontSize: 16,
    color: '#CCC',
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 13,
    color: '#555',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stats: {
    fontSize: 14,
    color: '#666',
  },
  similarRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  similarCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  similarIllustrationContainer: {
    padding: 4,
  },
  similarLikes: {
    fontSize: 11,
    color: '#666',
    padding: 6,
    textAlign: 'center',
  },
});
