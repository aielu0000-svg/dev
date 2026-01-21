import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

type ProcessingStyle = 'standard' | 'sketch' | 'minimal' | 'detailed';

const STYLE_INFO = {
  standard: { name: '標準', description: 'バランスの取れたスタイル' },
  sketch: { name: 'スケッチ風', description: '線画調の表現' },
  minimal: { name: 'ミニマル', description: 'シンプルで洗練された表現' },
  detailed: { name: '詳細', description: '細部まで鮮明な表現' },
};

const UPLOAD_TIPS = [
  '明るい場所で撮影すると、色が正確に抽出されます',
  '背景はシンプルな方が、服の輪郭がはっきりします',
  '全身が写るように撮影してください',
  '斜めからではなく、正面から撮影するのがおすすめです',
];

export default function UploadScreen() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<ProcessingStyle>('standard');
  const [isUploading, setIsUploading] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);

  const pickImage = async (useCamera: boolean) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert('権限エラー', `${useCamera ? 'カメラ' : 'ギャラリー'}へのアクセス権限が必要です`);
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 0.8,
          });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0].uri);
        setShowTips(false);

        // ファイルサイズから処理時間を見積もり（簡易版）
        const fileSize = result.assets[0].fileSize || 2 * 1024 * 1024; // デフォルト2MB
        const estimatedMs = Math.ceil((fileSize / (1024 * 1024)) * 2000);
        setEstimatedTime(estimatedMs);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('エラー', '画像の選択に失敗しました');
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    setIsUploading(true);

    try {
      const formData = new FormData();

      // URIからBlobを作成
      const response = await fetch(image);
      const blob = await response.blob();

      formData.append('image', blob as any, 'outfit.jpg');
      formData.append('style', selectedStyle);

      const uploadResponse = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await uploadResponse.json();

      if (uploadResponse.ok) {
        // 処理状況画面に遷移
        router.push(`/processing/${data.historyId}`);
      } else {
        throw new Error(data.error || 'アップロードに失敗しました');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('エラー', error instanceof Error ? error.message : 'アップロードに失敗しました');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>コーデ画像をアップロード</Text>
        <Text style={styles.subtitle}>ファッションデザイン画風に変換します</Text>
      </View>

      {showTips && (
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>📸 撮影のコツ</Text>
          {UPLOAD_TIPS.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      )}

      {!image && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cameraButton]}
            onPress={() => pickImage(true)}
          >
            <Text style={styles.buttonText}>📷 カメラで撮影</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.galleryButton]}
            onPress={() => pickImage(false)}
          >
            <Text style={styles.buttonText}>🖼️ ギャラリーから選択</Text>
          </TouchableOpacity>
        </View>
      )}

      {image && (
        <>
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} resizeMode="contain" />
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={() => setImage(null)}
            >
              <Text style={styles.changeImageText}>画像を変更</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.styleSelector}>
            <Text style={styles.styleSelectorTitle}>変換スタイル</Text>
            {Object.entries(STYLE_INFO).map(([key, info]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.styleOption,
                  selectedStyle === key && styles.styleOptionSelected,
                ]}
                onPress={() => setSelectedStyle(key as ProcessingStyle)}
              >
                <View style={styles.styleOptionHeader}>
                  <Text
                    style={[
                      styles.styleOptionName,
                      selectedStyle === key && styles.styleOptionTextSelected,
                    ]}
                  >
                    {info.name}
                  </Text>
                  {selectedStyle === key && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.styleOptionDescription}>{info.description}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {estimatedTime && (
            <View style={styles.estimateContainer}>
              <Text style={styles.estimateText}>
                ⏱️ 処理時間: 約 {Math.ceil(estimatedTime / 1000)} 秒
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
            onPress={uploadImage}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.uploadButtonText}>アップロードして変換</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  tipsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff8e1',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tipBullet: {
    marginRight: 8,
    color: '#ffa000',
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    padding: 16,
    gap: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cameraButton: {
    backgroundColor: '#4caf50',
  },
  galleryButton: {
    backgroundColor: '#2196f3',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  imageContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 400,
    borderRadius: 8,
  },
  changeImageButton: {
    marginTop: 12,
    padding: 8,
  },
  changeImageText: {
    color: '#2196f3',
    fontSize: 14,
  },
  styleSelector: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  styleSelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  styleOption: {
    padding: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
  },
  styleOptionSelected: {
    borderColor: '#2196f3',
    backgroundColor: '#e3f2fd',
  },
  styleOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  styleOptionName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  styleOptionTextSelected: {
    color: '#2196f3',
  },
  styleOptionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  checkmark: {
    color: '#2196f3',
    fontSize: 18,
    fontWeight: 'bold',
  },
  estimateContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
  },
  estimateText: {
    fontSize: 14,
    color: '#2e7d32',
    textAlign: 'center',
  },
  uploadButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ff5722',
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: '#bdbdbd',
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});
