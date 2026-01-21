import { View, Text, StyleSheet } from 'react-native';

interface ProcessingProgressProps {
  steps: string[];
  currentStepIndex: number;
  percent: number;
}

export function ProcessingProgress({
  steps,
  currentStepIndex,
  percent,
}: ProcessingProgressProps) {
  const safePercent = Math.max(0, Math.min(100, percent));
  const currentStep = steps[currentStepIndex] ?? '準備中';

  const getStepPercent = (index: number) => {
    if (index < currentStepIndex) return 100;
    if (index === currentStepIndex) return safePercent;
    return 0;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>処理状況</Text>
      <Text style={styles.currentStep}>{currentStep}</Text>
      <Text style={styles.percent}>{safePercent}%</Text>

      <View style={styles.steps}>
        {steps.map((step, index) => {
          const stepPercent = getStepPercent(index);
          return (
            <View key={step} style={styles.stepRow}>
              <Text style={styles.stepLabel}>{step}</Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${stepPercent}%` }]} />
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E6E6E6',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 6,
  },
  currentStep: {
    fontSize: 14,
    color: '#34495E',
    marginBottom: 4,
  },
  percent: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2D3D',
    marginBottom: 12,
  },
  steps: {
    gap: 10,
  },
  stepRow: {
    gap: 6,
  },
  stepLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  barTrack: {
    height: 8,
    borderRadius: 6,
    backgroundColor: '#E9EDF2',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
    backgroundColor: '#2C3E50',
  },
});
