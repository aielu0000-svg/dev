import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import { ColorChip } from '@/components/ColorChip';
import { ColorPicker } from '@/components/ColorPicker';

interface ColorReplaceSimulatorProps {
  sourceCandidates: string[];
}

export function ColorReplaceSimulator({ sourceCandidates }: ColorReplaceSimulatorProps) {
  const [sourceColor, setSourceColor] = useState(sourceCandidates[0] ?? '#333333');
  const [targetColor, setTargetColor] = useState('#F59E0B');
  const [editing, setEditing] = useState<'source' | 'target' | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>色の置き換えシミュレーション</Text>
      <View style={styles.selectRow}>
        <View style={styles.selectBlock}>
          <Text style={styles.label}>元の色</Text>
          <TouchableOpacity onPress={() => setEditing('source')}>
            <ColorChip hex={sourceColor} size="large" />
          </TouchableOpacity>
        </View>
        <View style={styles.selectBlock}>
          <Text style={styles.label}>新しい色</Text>
          <TouchableOpacity onPress={() => setEditing('target')}>
            <ColorChip hex={targetColor} size="large" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.preview}>
        <Text style={styles.previewLabel}>シミュレーション結果</Text>
        <View style={styles.previewRow}>
          <View style={styles.previewItem}>
            <View style={[styles.previewSwatch, { backgroundColor: sourceColor }]} />
            <Text style={styles.previewText}>変更前</Text>
          </View>
          <View style={styles.previewItem}>
            <View style={[styles.previewSwatch, { backgroundColor: targetColor }]} />
            <Text style={styles.previewText}>変更後</Text>
          </View>
        </View>
      </View>

      <Modal visible={editing !== null} transparent animationType="slide">
        <Pressable style={styles.modalBackdrop} onPress={() => setEditing(null)} />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>色を選択</Text>
          <ColorPicker
            value={editing === 'source' ? sourceColor : targetColor}
            onChange={(hex) => {
              if (editing === 'source') setSourceColor(hex);
              if (editing === 'target') setTargetColor(hex);
            }}
          />
          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => setEditing(null)}
            activeOpacity={0.8}
          >
            <Text style={styles.modalButtonText}>完了</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
  },
  selectRow: {
    flexDirection: 'row',
    gap: 16,
  },
  selectBlock: {
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
  },
  preview: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  previewLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewItem: {
    alignItems: 'center',
    gap: 6,
  },
  previewSwatch: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  previewText: {
    fontSize: 12,
    color: '#4B5563',
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
    marginBottom: 8,
  },
  modalButton: {
    marginTop: 8,
    backgroundColor: '#2C3E50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
