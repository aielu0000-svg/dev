import { useEffect, useState } from 'react';
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

interface PaletteEditorProps {
  colors: string[];
  onSave: (colors: string[]) => void;
}

export function PaletteEditor({ colors, onSave }: PaletteEditorProps) {
  const [localColors, setLocalColors] = useState(colors);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingColor, setEditingColor] = useState('#FFFFFF');

  useEffect(() => {
    setLocalColors(colors);
  }, [colors]);

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingColor(localColors[index]);
  };

  const applyEdit = () => {
    if (editingIndex === null) return;
    const updated = [...localColors];
    updated[editingIndex] = editingColor;
    setLocalColors(updated);
    setEditingIndex(null);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>抽出カラーの編集</Text>
      <Text style={styles.subtitle}>タップして色を調整できます</Text>
      <View style={styles.paletteRow}>
        {localColors.map((hex, index) => (
          <TouchableOpacity key={`${hex}-${index}`} onPress={() => startEditing(index)}>
            <View style={styles.colorItem}>
              <ColorChip hex={hex} size="large" />
              <Text style={styles.colorLabel}>{hex}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => onSave(localColors)}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>保存</Text>
      </TouchableOpacity>

      <Modal visible={editingIndex !== null} transparent animationType="slide">
        <Pressable style={styles.modalBackdrop} onPress={() => setEditingIndex(null)} />
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>色を選択</Text>
          <ColorPicker value={editingColor} onChange={setEditingColor} />
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setEditingIndex(null)}
            >
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.applyButton]}
              onPress={applyEdit}
            >
              <Text style={styles.applyText}>適用</Text>
            </TouchableOpacity>
          </View>
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
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 12,
  },
  paletteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorItem: {
    alignItems: 'center',
    gap: 6,
  },
  colorLabel: {
    fontSize: 12,
    color: '#5D6D7E',
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: '#2C3E50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#2C3E50',
    marginLeft: 8,
  },
  cancelText: {
    color: '#374151',
    fontWeight: '600',
  },
  applyText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
