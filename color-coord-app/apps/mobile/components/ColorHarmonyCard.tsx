import { View, Text, StyleSheet } from 'react-native';
import { ColorChip } from '@/components/ColorChip';

interface ColorHarmonyCardProps {
  primary: string;
  secondary: string;
  harmonyType: string;
  tips: string[];
}

export function ColorHarmonyCard({
  primary,
  secondary,
  harmonyType,
  tips,
}: ColorHarmonyCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>配色のポイント</Text>
      <View style={styles.chipRow}>
        <ColorChip hex={primary} size="large" />
        <ColorChip hex={secondary} size="large" />
      </View>
      <Text style={styles.harmonyLabel}>ハーモニータイプ</Text>
      <Text style={styles.harmonyType}>{harmonyType}</Text>
      <Text style={styles.tipTitle}>配色のコツ</Text>
      <View style={styles.tipList}>
        {tips.map((tip, index) => (
          <Text key={`${tip}-${index}`} style={styles.tipItem}>
            • {tip}
          </Text>
        ))}
      </View>
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
  chipRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  harmonyLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  harmonyType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2D3D',
    marginBottom: 12,
  },
  tipTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  tipList: {
    gap: 4,
  },
  tipItem: {
    fontSize: 12,
    color: '#4B5563',
  },
});
