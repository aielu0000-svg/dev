import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

function TabIcon({ name }: { name: string }) {
  const icons: Record<string, string> = {
    home: '🏠',
    color: '🎨',
    category: '📂',
    mypage: '👤',
    studio: '🧵',
    collections: '🧳',
  };
  return (
    <View style={styles.tabIcon}>
      <Text style={{ fontSize: 20 }}>{icons[name] || '•'}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2C3E50',
        tabBarInactiveTintColor: '#95A5A6',
        tabBarStyle: styles.tabBar,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: () => <TabIcon name="home" />,
        }}
      />
      <Tabs.Screen
        name="studio"
        options={{
          title: 'スタジオ',
          tabBarIcon: () => <TabIcon name="studio" />,
        }}
      />
      <Tabs.Screen
        name="color"
        options={{
          title: '色で探す',
          tabBarIcon: () => <TabIcon name="color" />,
        }}
      />
      <Tabs.Screen
        name="collections"
        options={{
          title: 'コレクション',
          tabBarIcon: () => <TabIcon name="collections" />,
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          title: 'カテゴリ',
          tabBarIcon: () => <TabIcon name="category" />,
        }}
      />
      <Tabs.Screen
        name="mypage"
        options={{
          title: 'マイページ',
          tabBarIcon: () => <TabIcon name="mypage" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    height: 60,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    color: '#2C3E50',
    fontWeight: '600',
  },
});
