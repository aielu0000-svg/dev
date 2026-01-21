import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BeforeAfterComparisonProps {
  originalUrl: string;
  illustrationUrl: string;
}

export default function BeforeAfterComparison({
  originalUrl,
  illustrationUrl,
}: BeforeAfterComparisonProps) {
  const [mode, setMode] = useState<'slider' | 'split'>('slider');
  const sliderPosition = useSharedValue(SCREEN_WIDTH / 2);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      sliderPosition.value = Math.max(0, Math.min(SCREEN_WIDTH, e.absoluteX));
    });

  const sliderStyle = useAnimatedStyle(() => ({
    width: sliderPosition.value,
  }));

  const handleStyle = useAnimatedStyle(() => ({
    left: sliderPosition.value - 2,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>変換結果の比較</Text>
        <View style={styles.modeSwitch}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'slider' && styles.modeButtonActive]}
            onPress={() => setMode('slider')}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === 'slider' && styles.modeButtonTextActive,
              ]}
            >
              スライダー
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'split' && styles.modeButtonActive]}
            onPress={() => setMode('split')}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === 'split' && styles.modeButtonTextActive,
              ]}
            >
              左右分割
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {mode === 'slider' ? (
        <GestureDetector gesture={pan}>
          <View style={styles.sliderContainer}>
            <Image
              source={{ uri: illustrationUrl }}
              style={styles.backgroundImage}
              resizeMode="cover"
            />
            <Animated.View style={[styles.foregroundContainer, sliderStyle]}>
              <Image
                source={{ uri: originalUrl }}
                style={styles.foregroundImage}
                resizeMode="cover"
              />
            </Animated.View>
            <Animated.View style={[styles.sliderHandle, handleStyle]}>
              <View style={styles.sliderHandleInner}>
                <Text style={styles.sliderHandleText}>⬅ ➡</Text>
              </View>
            </Animated.View>
            <View style={styles.labels}>
              <View style={styles.labelLeft}>
                <Text style={styles.labelText}>元画像</Text>
              </View>
              <View style={styles.labelRight}>
                <Text style={styles.labelText}>変換後</Text>
              </View>
            </View>
          </View>
        </GestureDetector>
      ) : (
        <View style={styles.splitContainer}>
          <View style={styles.splitItem}>
            <Text style={styles.splitLabel}>元画像</Text>
            <Image
              source={{ uri: originalUrl }}
              style={styles.splitImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.splitDivider} />
          <View style={styles.splitItem}>
            <Text style={styles.splitLabel}>変換後</Text>
            <Image
              source={{ uri: illustrationUrl }}
              style={styles.splitImage}
              resizeMode="contain"
            />
          </View>
        </View>
      )}
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
    marginBottom: 12,
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeButtonActive: {
    backgroundColor: '#2196f3',
  },
  modeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  modeButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sliderContainer: {
    height: 400,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  foregroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    overflow: 'hidden',
  },
  foregroundImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  sliderHandle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderHandleInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderHandleText: {
    color: '#fff',
    fontSize: 16,
  },
  labels: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  labelLeft: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  labelRight: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  labelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  splitContainer: {
    flexDirection: 'row',
    height: 400,
  },
  splitItem: {
    flex: 1,
    padding: 16,
  },
  splitLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  splitImage: {
    width: '100%',
    height: '100%',
  },
  splitDivider: {
    width: 2,
    backgroundColor: '#e0e0e0',
  },
});
