import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, PanResponder, LayoutChangeEvent } from 'react-native';

type CompareMode = 'slider' | 'split';

interface BeforeAfterCompareProps {
  beforeUri: string;
  afterUri: string;
  mode?: CompareMode;
}

export function BeforeAfterCompare({
  beforeUri,
  afterUri,
  mode = 'slider',
}: BeforeAfterCompareProps) {
  const [containerWidth, setContainerWidth] = useState(0);
  const [sliderX, setSliderX] = useState(0);

  useEffect(() => {
    if (containerWidth > 0 && sliderX === 0) {
      setSliderX(containerWidth / 2);
    }
  }, [containerWidth, sliderX]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const clamp = (value: number) => Math.max(0, Math.min(containerWidth, value));

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (event) => {
        const locationX = event.nativeEvent.locationX;
        setSliderX(clamp(locationX));
      },
    })
  ).current;

  const dividerStyle = useMemo(
    () => ({
      left: sliderX - 1,
    }),
    [sliderX]
  );

  if (mode === 'split') {
    return (
      <View style={styles.container} onLayout={handleLayout}>
        <Text style={styles.title}>ビフォー / アフター</Text>
        <View style={styles.splitRow}>
          <Image source={{ uri: beforeUri }} style={styles.splitImage} />
          <Image source={{ uri: afterUri }} style={styles.splitImage} />
        </View>
        <View style={styles.splitLabels}>
          <Text style={styles.label}>元画像</Text>
          <Text style={styles.label}>イラスト</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <Text style={styles.title}>ビフォー / アフター</Text>
      <View style={styles.compareArea} {...panResponder.panHandlers}>
        <Image source={{ uri: afterUri }} style={styles.fullImage} />
        <View style={[styles.beforeMask, { width: sliderX }]}>
          <Image source={{ uri: beforeUri }} style={styles.fullImage} />
        </View>
        <View style={[styles.divider, dividerStyle]}>
          <View style={styles.handle} />
        </View>
      </View>
      <View style={styles.splitLabels}>
        <Text style={styles.label}>元画像</Text>
        <Text style={styles.label}>イラスト</Text>
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
  compareArea: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F1F3F5',
  },
  fullImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  beforeMask: {
    height: '100%',
    overflow: 'hidden',
  },
  divider: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#2C3E50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#2C3E50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  splitRow: {
    flexDirection: 'row',
    gap: 8,
  },
  splitImage: {
    flex: 1,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#F1F3F5',
  },
  splitLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
  },
});
