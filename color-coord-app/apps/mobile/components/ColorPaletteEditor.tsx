import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';

interface ColorInfo {
  hex: string;
  ratio: number;
  role: 'primary' | 'secondary' | 'accent' | 'neutral';
}

interface ColorPaletteEditorProps {
  colors: ColorInfo[];
  onSave: (newColors: ColorInfo[]) => void;
}

const ROLE_LABELS = {
  primary: '主役色',
  secondary: 'サブ色',
  accent: 'アクセント色',
  neutral: 'ニュートラル色',
};

export default function ColorPaletteEditor({
  colors: initialColors,
  onSave,
}: ColorPaletteEditorProps) {
  const [colors, setColors] = useState<ColorInfo[]>(initialColors);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingColor, setEditingColor] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleColorPress = (index: number) => {
    setEditingIndex(index);
    setEditingColor(colors[index].hex);
    setIsModalVisible(true);
  };

  const handleColorSave = () => {
    if (editingIndex === null) return;

    // HEXカラーの検証
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRegex.test(editingColor)) {
      Alert.alert('エラー', '無効な色形式です。#RRGGBBの形式で入力してください。');
      return;
    }

    const newColors = [...colors];
    newColors[editingIndex] = {
      ...newColors[editingIndex],
      hex: editingColor.toUpperCase(),
    };
    setColors(newColors);
    setIsModalVisible(false);
  };

  const handleSave = () => {
    onSave(colors);
    Alert.alert('保存完了', '色パレットを更新しました。');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>色パレット編集</Text>
        <Text style={styles.subtitle}>色をタップして編集できます</Text>
      </View>

      <ScrollView style={styles.colorList}>
        {colors.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={styles.colorItem}
            onPress={() => handleColorPress(index)}
          >
            <View style={[styles.colorPreview, { backgroundColor: color.hex }]} />
            <View style={styles.colorInfo}>
              <Text style={styles.colorHex}>{color.hex}</Text>
              <Text style={styles.colorRole}>{ROLE_LABELS[color.role]}</Text>
              <Text style={styles.colorRatio}>
                比率: {Math.round(color.ratio * 100)}%
              </Text>
            </View>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>変更を保存</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>色を編集</Text>

            {editingIndex !== null && (
              <>
                <View style={styles.colorPreviewLarge}>
                  <View
                    style={[
                      styles.colorPreviewLargeInner,
                      { backgroundColor: editingColor },
                    ]}
                  />
                </View>

                <Text style={styles.inputLabel}>カラーコード (#RRGGBB)</Text>
                <TextInput
                  style={styles.input}
                  value={editingColor}
                  onChangeText={setEditingColor}
                  placeholder="#000000"
                  autoCapitalize="characters"
                  maxLength={7}
                />

                <View style={styles.presetColors}>
                  <Text style={styles.presetTitle}>よく使う色</Text>
                  <View style={styles.presetGrid}>
                    {[
                      '#000000', '#FFFFFF', '#808080', '#C0C0C0',
                      '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
                      '#FF00FF', '#00FFFF', '#800000', '#008000',
                      '#000080', '#808000', '#800080', '#008080',
                    ].map((preset) => (
                      <TouchableOpacity
                        key={preset}
                        style={[styles.presetColor, { backgroundColor: preset }]}
                        onPress={() => setEditingColor(preset)}
                      />
                    ))}
                  </View>
                </View>

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setIsModalVisible(false)}
                  >
                    <Text style={styles.cancelButtonText}>キャンセル</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.confirmButton]}
                    onPress={handleColorSave}
                  >
                    <Text style={styles.confirmButtonText}>保存</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  colorList: {
    maxHeight: 300,
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  colorPreview: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  colorInfo: {
    flex: 1,
  },
  colorHex: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  colorRole: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  colorRatio: {
    fontSize: 12,
    color: '#999',
  },
  editIcon: {
    fontSize: 20,
  },
  saveButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#2196f3',
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  colorPreviewLarge: {
    alignItems: 'center',
    marginBottom: 16,
  },
  colorPreviewLargeInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#e0e0e0',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  presetColors: {
    marginBottom: 16,
  },
  presetTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#2196f3',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
