import { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface ColorPickerProps {
  value: string;
  onChange: (hex: string) => void;
}

const PRESET_COLORS = [
  { name: 'ブラック', hex: '#000000' },
  { name: 'ホワイト', hex: '#FFFFFF' },
  { name: 'グレー', hex: '#808080' },
  { name: 'ネイビー', hex: '#1A1A2E' },
  { name: 'ベージュ', hex: '#F5F5DC' },
  { name: 'レッド', hex: '#E74C3C' },
  { name: 'ピンク', hex: '#FFC0CB' },
  { name: 'オレンジ', hex: '#FFA500' },
  { name: 'イエロー', hex: '#FFFF00' },
  { name: 'グリーン', hex: '#228B22' },
  { name: 'オリーブ', hex: '#556B2F' },
  { name: 'ブルー', hex: '#4169E1' },
  { name: 'ライトブルー', hex: '#87CEEB' },
  { name: 'パープル', hex: '#800080' },
  { name: 'ブラウン', hex: '#8B4513' },
  { name: 'キャメル', hex: '#D4A574' },
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    if (/^#[0-9A-Fa-f]{6}$/.test(text)) {
      onChange(text.toUpperCase());
    }
  };

  const handlePresetPress = (hex: string) => {
    setInputValue(hex);
    onChange(hex);
  };

  return (
    <View style={styles.container}>
      {/* Color preview and input */}
      <View style={styles.inputRow}>
        <View style={[styles.preview, { backgroundColor: value }]} />
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={handleInputChange}
          placeholder="#RRGGBB"
          autoCapitalize="characters"
          maxLength={7}
        />
      </View>

      {/* Preset colors */}
      <Text style={styles.label}>よく使う色</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.presetRow}>
          {PRESET_COLORS.map((color) => (
            <TouchableOpacity
              key={color.hex}
              style={[
                styles.presetChip,
                { backgroundColor: color.hex },
                value === color.hex && styles.presetChipSelected,
              ]}
              onPress={() => handlePresetPress(color.hex)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.presetName,
                  { color: isLightColor(color.hex) ? '#000' : '#FFF' },
                ]}
              >
                {color.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function isLightColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  preview: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  presetChipSelected: {
    borderWidth: 2,
    borderColor: '#2C3E50',
  },
  presetName: {
    fontSize: 12,
    fontWeight: '500',
  },
});
