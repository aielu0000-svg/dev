import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ProcessingProgress } from '@/components/ProcessingProgress';
import { BeforeAfterCompare } from '@/components/BeforeAfterCompare';
import { PaletteEditor } from '@/components/PaletteEditor';
import { ColorHarmonyCard } from '@/components/ColorHarmonyCard';
import { ColorReplaceSimulator } from '@/components/ColorReplaceSimulator';

type StyleOption = 'standard' | 'sketch' | 'minimal' | 'detailed';

const STYLE_OPTIONS: { value: StyleOption; label: string; estimate: string }[] = [
  { value: 'standard', label: 'Standard', estimate: '約20〜30秒' },
  { value: 'sketch', label: 'Sketch', estimate: '約30〜40秒' },
  { value: 'minimal', label: 'Minimal', estimate: '約15〜20秒' },
  { value: 'detailed', label: 'Detailed', estimate: '約45〜60秒' },
];

const GUIDE_TIPS = [
  '背景は無地に近い場所で撮影',
  '全身が入る距離で撮影',
  '自然光に近い光源を使用',
  '洋服の色が潰れない露出に調整',
];

const PROCESS_STEPS = ['アップロード確認', 'イラスト化', '色抽出', 'カテゴリ分類'];

const DEFAULT_PALETTE = ['#2C3E50', '#D9CFC1', '#E67E22', '#8E5A2B', '#F0E6DA'];

export default function StudioScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [processedUri, setProcessedUri] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<StyleOption>('standard');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [palette, setPalette] = useState(DEFAULT_PALETTE);
  const [compareMode, setCompareMode] = useState<'slider' | 'split'>('slider');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const requestPermissions = async () => {
    const camera = await ImagePicker.requestCameraPermissionsAsync();
    const library = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!camera.granted || !library.granted) {
      Alert.alert('権限が必要です', 'カメラと写真ライブラリへのアクセスを許可してください。');
      return false;
    }
    return true;
  };

  const pickFromCamera = async () => {
    const permitted = await requestPermissions();
    if (!permitted) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setProcessedUri(null);
      setProgressPercent(0);
    }
  };

  const pickFromLibrary = async () => {
    const permitted = await requestPermissions();
    if (!permitted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setProcessedUri(null);
      setProgressPercent(0);
    }
  };

  const startProcessing = () => {
    if (!imageUri) {
      Alert.alert('画像を選択', 'まずは画像をアップロードしてください。');
      return;
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setIsProcessing(true);
    setProgressPercent(0);
    setCurrentStepIndex(0);

    timerRef.current = setInterval(() => {
      setProgressPercent((prev) => {
        const next = Math.min(100, prev + 8);
        const stepIndex = Math.min(
          PROCESS_STEPS.length - 1,
          Math.floor((next / 100) * PROCESS_STEPS.length)
        );
        setCurrentStepIndex(stepIndex);
        if (next === 100) {
          setIsProcessing(false);
          setProcessedUri(imageUri);
          if (timerRef.current) clearInterval(timerRef.current);
        }
        return next;
      });
    }, 400);
  };

  const estimate = STYLE_OPTIONS.find((option) => option.value === selectedStyle)?.estimate;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>画像アップロード</Text>
        <Text style={styles.sectionSubtitle}>コーデ画像を読み込んで変換します</Text>
        <View style={styles.uploadRow}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickFromCamera}>
            <Text style={styles.uploadButtonText}>カメラ撮影</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.uploadButton} onPress={pickFromLibrary}>
            <Text style={styles.uploadButtonText}>ギャラリー選択</Text>
          </TouchableOpacity>
        </View>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.previewImage} />}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>撮影のコツ</Text>
        <View style={styles.tipList}>
          {GUIDE_TIPS.map((tip) => (
            <Text key={tip} style={styles.tipItem}>
              • {tip}
            </Text>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>イラストスタイル</Text>
        <View style={styles.styleRow}>
          {STYLE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.styleChip,
                selectedStyle === option.value && styles.styleChipActive,
              ]}
              onPress={() => setSelectedStyle(option.value)}
            >
              <Text
                style={[
                  styles.styleChipText,
                  selectedStyle === option.value && styles.styleChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.estimateText}>処理時間目安: {estimate}</Text>
        <TouchableOpacity
          style={[styles.primaryButton, !imageUri && styles.primaryButtonDisabled]}
          onPress={startProcessing}
          activeOpacity={0.8}
          disabled={!imageUri}
        >
          <Text style={styles.primaryButtonText}>変換を開始</Text>
        </TouchableOpacity>
      </View>

      {isProcessing && (
        <ProcessingProgress
          steps={PROCESS_STEPS}
          currentStepIndex={currentStepIndex}
          percent={progressPercent}
        />
      )}

      {imageUri && processedUri && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>比較表示</Text>
            <View style={styles.modeRow}>
              <TouchableOpacity
                style={[styles.modeChip, compareMode === 'slider' && styles.modeChipActive]}
                onPress={() => setCompareMode('slider')}
              >
                <Text
                  style={[
                    styles.modeChipText,
                    compareMode === 'slider' && styles.modeChipTextActive,
                  ]}
                >
                  スライダー
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeChip, compareMode === 'split' && styles.modeChipActive]}
                onPress={() => setCompareMode('split')}
              >
                <Text
                  style={[
                    styles.modeChipText,
                    compareMode === 'split' && styles.modeChipTextActive,
                  ]}
                >
                  左右分割
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <BeforeAfterCompare
            beforeUri={imageUri}
            afterUri={processedUri}
            mode={compareMode}
          />
          <PaletteEditor colors={palette} onSave={setPalette} />
          <ColorHarmonyCard
            primary={palette[0]}
            secondary={palette[2] ?? palette[1]}
            harmonyType="ナチュラル・アナロガス"
            tips={['ベース色は面積を広く', 'アクセントは1点に絞る', '中間色で滑らかに繋ぐ']}
          />
          <ColorReplaceSimulator sourceCandidates={palette} />
        </>
      )}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  uploadRow: {
    flexDirection: 'row',
    gap: 12,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: '#2C3E50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginTop: 12,
  },
  tipList: {
    gap: 6,
  },
  tipItem: {
    fontSize: 13,
    color: '#4B5563',
  },
  styleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  styleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  styleChipActive: {
    backgroundColor: '#2C3E50',
    borderColor: '#2C3E50',
  },
  styleChipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  styleChipTextActive: {
    color: '#FFFFFF',
  },
  estimateText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#2C3E50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modeChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  modeChipActive: {
    backgroundColor: '#2C3E50',
    borderColor: '#2C3E50',
  },
  modeChipText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  modeChipTextActive: {
    color: '#FFFFFF',
  },
});
