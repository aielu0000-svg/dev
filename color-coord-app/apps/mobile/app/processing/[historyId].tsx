import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

interface ProcessingStatus {
  id: string;
  code_id: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  current_step: string;
  progress: number;
  style: string;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

export default function ProcessingScreen() {
  const router = useRouter();
  const { historyId } = useLocalSearchParams();
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (!historyId) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/upload/status/${historyId}`
        );
        const data = await response.json();

        setStatus(data);

        // 処理完了または失敗した場合、ポーリング停止
        if (data.status === 'completed' || data.status === 'failed') {
          setPolling(false);
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    };

    checkStatus(); // 初回実行

    // ポーリング（2秒ごと）
    const interval = setInterval(() => {
      if (polling) {
        checkStatus();
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [historyId, polling]);

  const handleViewResult = () => {
    if (status?.code_id) {
      router.push(`/code/${status.code_id}`);
    }
  };

  const handleRetry = () => {
    router.back();
  };

  if (!status) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196f3" />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {status.status === 'completed'
            ? '✓ 変換完了'
            : status.status === 'failed'
            ? '× 変換失敗'
            : '⏳ 処理中'}
        </Text>
        <Text style={styles.subtitle}>{status.current_step}</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[styles.progressBarFill, { width: `${status.progress}%` }]}
          />
        </View>
        <Text style={styles.progressText}>{status.progress}%</Text>
      </View>

      {status.status === 'processing' && (
        <View style={styles.processingInfo}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={styles.processingText}>
            画像を処理しています。しばらくお待ちください...
          </Text>
        </View>
      )}

      {status.status === 'completed' && (
        <View style={styles.completedContainer}>
          <View style={styles.successIcon}>
            <Text style={styles.successIconText}>✓</Text>
          </View>
          <Text style={styles.completedText}>
            ファッションデザイン画への変換が完了しました！
          </Text>
          <TouchableOpacity style={styles.viewButton} onPress={handleViewResult}>
            <Text style={styles.viewButtonText}>結果を見る</Text>
          </TouchableOpacity>
        </View>
      )}

      {status.status === 'failed' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>処理に失敗しました</Text>
          {status.error_message && (
            <Text style={styles.errorMessage}>{status.error_message}</Text>
          )}
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>もう一度試す</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.stepsContainer}>
        <Text style={styles.stepsTitle}>処理ステップ</Text>
        {[
          { name: '画像を読み込んでいます', progress: 10 },
          { name: '画像を正規化しています', progress: 20 },
          { name: '背景を処理しています', progress: 35 },
          { name: 'デザイン画風に変換しています', progress: 50 },
          { name: '輪郭を強調しています', progress: 70 },
          { name: '色を抽出しています', progress: 85 },
          { name: '画像を保存しています', progress: 95 },
          { name: '完了しました', progress: 100 },
        ].map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View
              style={[
                styles.stepIndicator,
                status.progress >= step.progress && styles.stepIndicatorActive,
              ]}
            >
              {status.progress >= step.progress && (
                <Text style={styles.stepIndicatorText}>✓</Text>
              )}
            </View>
            <Text
              style={[
                styles.stepText,
                status.progress >= step.progress && styles.stepTextActive,
              ]}
            >
              {step.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  progressContainer: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 16,
  },
  progressBarBackground: {
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2196f3',
    borderRadius: 12,
  },
  progressText: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2196f3',
  },
  processingInfo: {
    padding: 40,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  completedContainer: {
    padding: 40,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4caf50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successIconText: {
    fontSize: 48,
    color: '#fff',
  },
  completedText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  viewButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#2196f3',
    borderRadius: 8,
  },
  viewButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f44336',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: '#ff5722',
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorActive: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  stepIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    color: '#999',
  },
  stepTextActive: {
    color: '#333',
    fontWeight: '500',
  },
});
