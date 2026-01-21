import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Code, PaletteItem } from '@/lib/api';
import { OutfitIllustration } from './OutfitIllustration';

interface CodeCardProps {
  code: Code;
  size?: 'small' | 'medium';
}

export function CodeCard({ code, size = 'medium' }: CodeCardProps) {
  const handlePress = () => {
    router.push(`/code/${code.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      {/* シルエットイラスト */}
      <View style={styles.illustrationContainer}>
        <OutfitIllustration palette={code.palette} size={size} />
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={styles.paletteRow}>
          {code.palette.slice(0, 4).map((item: PaletteItem, index: number) => (
            <View
              key={index}
              style={[styles.miniChip, { backgroundColor: item.hex }]}
            />
          ))}
        </View>
        <Text style={styles.likes}>❤️ {code.likes.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  illustrationContainer: {
    alignItems: 'center',
    paddingTop: 8,
  },
  info: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paletteRow: {
    flexDirection: 'row',
    gap: 4,
  },
  miniChip: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  likes: {
    fontSize: 12,
    color: '#666',
  },
});
