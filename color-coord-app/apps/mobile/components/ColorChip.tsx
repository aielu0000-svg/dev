import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ColorChipProps {
  hex: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

function getContrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
}

export function ColorChip({ hex, label, size = 'medium', onPress }: ColorChipProps) {
  const sizeStyles = {
    small: { width: 32, height: 32, borderRadius: 4 },
    medium: { width: 48, height: 48, borderRadius: 8 },
    large: { width: 64, height: 64, borderRadius: 12 },
  };

  const chipStyle = [
    styles.chip,
    sizeStyles[size],
    { backgroundColor: hex },
  ];

  const content = (
    <View style={chipStyle}>
      {label && (
        <Text style={[styles.label, { color: getContrastColor(hex) }]}>
          {label}
        </Text>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});
