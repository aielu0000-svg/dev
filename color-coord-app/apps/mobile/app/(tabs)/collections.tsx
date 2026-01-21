import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { ColorChip } from '@/components/ColorChip';

interface Outfit {
  id: string;
  name: string;
  palette: string[];
}

interface Collection {
  id: string;
  name: string;
  outfitIds: string[];
}

const SAMPLE_OUTFITS: Outfit[] = [
  { id: 'o1', name: 'Weekend Casual', palette: ['#2C3E50', '#E67E22', '#F0E6DA'] },
  { id: 'o2', name: 'Smart Office', palette: ['#1F2D3D', '#D9CFC1', '#7F8C8D'] },
  { id: 'o3', name: 'Spring Bright', palette: ['#FF6B6B', '#FFE66D', '#4ECDC4'] },
  { id: 'o4', name: 'Night Out', palette: ['#111827', '#9CA3AF', '#F59E0B'] },
];

export default function CollectionsScreen() {
  const [collections, setCollections] = useState<Collection[]>([
    { id: 'c1', name: '今月の候補', outfitIds: ['o1', 'o4'] },
    { id: 'c2', name: 'オフィス', outfitIds: ['o2'] },
  ]);
  const [activeCollectionId, setActiveCollectionId] = useState('c1');
  const [modalVisible, setModalVisible] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const activeCollection = collections.find((collection) => collection.id === activeCollectionId);

  const openCreate = () => {
    setEditingId(null);
    setDraftName('');
    setModalVisible(true);
  };

  const openEdit = (collection: Collection) => {
    setEditingId(collection.id);
    setDraftName(collection.name);
    setModalVisible(true);
  };

  const saveCollection = () => {
    const trimmed = draftName.trim();
    if (!trimmed) {
      Alert.alert('名前を入力', 'コレクション名を入力してください。');
      return;
    }
    if (editingId) {
      setCollections((prev) =>
        prev.map((collection) =>
          collection.id === editingId ? { ...collection, name: trimmed } : collection
        )
      );
    } else {
      const newCollection: Collection = {
        id: `c${Date.now()}`,
        name: trimmed,
        outfitIds: [],
      };
      setCollections((prev) => [newCollection, ...prev]);
      setActiveCollectionId(newCollection.id);
    }
    setModalVisible(false);
  };

  const deleteCollection = (collectionId: string) => {
    Alert.alert('削除しますか？', 'このコレクションを削除します。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除',
        style: 'destructive',
        onPress: () => {
          setCollections((prev) => prev.filter((collection) => collection.id !== collectionId));
          if (activeCollectionId === collectionId && collections.length > 1) {
            const next = collections.find((collection) => collection.id !== collectionId);
            if (next) setActiveCollectionId(next.id);
          }
        },
      },
    ]);
  };

  const toggleOutfit = (outfitId: string) => {
    if (!activeCollection) return;
    setCollections((prev) =>
      prev.map((collection) => {
        if (collection.id !== activeCollection.id) return collection;
        const exists = collection.outfitIds.includes(outfitId);
        return {
          ...collection,
          outfitIds: exists
            ? collection.outfitIds.filter((id) => id !== outfitId)
            : [...collection.outfitIds, outfitId],
        };
      })
    );
  };

  const selectedOutfits = useMemo(() => {
    if (!activeCollection) return [];
    return SAMPLE_OUTFITS.filter((outfit) => activeCollection.outfitIds.includes(outfit.id));
  }, [activeCollection]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>コレクション</Text>
          <TouchableOpacity style={styles.createButton} onPress={openCreate}>
            <Text style={styles.createButtonText}>新規作成</Text>
          </TouchableOpacity>
        </View>
        {collections.map((collection) => {
          const isActive = collection.id === activeCollectionId;
          return (
            <TouchableOpacity
              key={collection.id}
              style={[styles.collectionCard, isActive && styles.collectionCardActive]}
              onPress={() => setActiveCollectionId(collection.id)}
            >
              <View>
                <Text style={styles.collectionName}>{collection.name}</Text>
                <Text style={styles.collectionCount}>
                  {collection.outfitIds.length} コーデ
                </Text>
              </View>
              <View style={styles.collectionActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => openEdit(collection)}
                >
                  <Text style={styles.actionText}>編集</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => deleteCollection(collection.id)}
                >
                  <Text style={styles.deleteText}>削除</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>コーデ一覧</Text>
        <Text style={styles.sectionSubtitle}>選択中のコレクションに追加/削除できます</Text>
        {SAMPLE_OUTFITS.map((outfit) => {
          const selected = activeCollection?.outfitIds.includes(outfit.id) ?? false;
          return (
            <View key={outfit.id} style={styles.outfitRow}>
              <View style={styles.outfitInfo}>
                <Text style={styles.outfitName}>{outfit.name}</Text>
                <View style={styles.paletteRow}>
                  {outfit.palette.map((hex) => (
                    <ColorChip key={`${outfit.id}-${hex}`} hex={hex} size="small" />
                  ))}
                </View>
              </View>
              <TouchableOpacity
                style={[styles.toggleButton, selected && styles.toggleButtonActive]}
                onPress={() => toggleOutfit(outfit.id)}
              >
                <Text style={[styles.toggleText, selected && styles.toggleTextActive]}>
                  {selected ? '削除' : '追加'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>選択中のコーデ</Text>
        {selectedOutfits.length === 0 ? (
          <Text style={styles.emptyText}>まだコーデがありません</Text>
        ) : (
          selectedOutfits.map((outfit) => (
            <View key={outfit.id} style={styles.selectedCard}>
              <Text style={styles.outfitName}>{outfit.name}</Text>
              <View style={styles.paletteRow}>
                {outfit.palette.map((hex) => (
                  <ColorChip key={`${outfit.id}-selected-${hex}`} hex={hex} size="medium" />
                ))}
              </View>
            </View>
          ))
        )}
      </View>

      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingId ? 'コレクション編集' : 'コレクション作成'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="コレクション名"
            value={draftName}
            onChangeText={setDraftName}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={saveCollection}
            >
              <Text style={styles.saveText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  createButton: {
    backgroundColor: '#2C3E50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  collectionCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  collectionCardActive: {
    borderColor: '#2C3E50',
    backgroundColor: '#F8FAFC',
  },
  collectionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2D3D',
  },
  collectionCount: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  collectionActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  actionText: {
    fontSize: 12,
    color: '#374151',
  },
  deleteButton: {
    backgroundColor: '#FDECEC',
  },
  deleteText: {
    fontSize: 12,
    color: '#C0392B',
  },
  outfitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  outfitInfo: {
    flex: 1,
    gap: 6,
  },
  outfitName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2D3D',
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  toggleButtonActive: {
    backgroundColor: '#2C3E50',
    borderColor: '#2C3E50',
  },
  toggleText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  selectedCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
    gap: 8,
  },
  emptyText: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#2C3E50',
  },
  cancelText: {
    color: '#374151',
    fontWeight: '600',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
