// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { format, subDays } from 'date-fns';
import { View, Text, StyleSheet } from 'react-native';

// Custom tab label component
const TabLabel = ({ date, label, focused }: { date: string; label?: string; focused: boolean }) => (
  <View style={[styles.tabLabelContainer, focused && styles.tabLabelFocused]}>
    <Text style={[styles.tabDate, focused && styles.tabDateFocused]}>{date}</Text>
    {label && <Text style={[styles.tabSubtext, focused && styles.tabSubtextFocused]}>{label}</Text>}
  </View>
);

export default function TabLayout() {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const dayBeforeYesterday = subDays(today, 2);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 85,
          paddingBottom: 0,
          paddingTop: 10,
        },
        tabBarItemStyle: {
          paddingTop: 10,
          marginTop: -30,
        },
        tabBarActiveTintColor: '#D6D6D6',
        tabBarInactiveTintColor: '#1A1A1A',
        tabBarActiveBackgroundColor: '#D6D6D6',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: () => null,
          tabBarLabel: ({ focused }) => (
            <TabLabel date={format(today, 'MMM d')} label="Today" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="yesterday"
        options={{
          tabBarIcon: () => null,
          tabBarLabel: ({ focused }) => (
            <TabLabel date={format(yesterday, 'MMM d')} label="Yesterday" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="day3"
        options={{
          tabBarIcon: () => null,
          tabBarLabel: ({ focused }) => (
            <TabLabel date={format(dayBeforeYesterday, 'MMM d')} label=" " focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    flex: 1,
    width: '100%',
  },
  tabLabelFocused: {
    backgroundColor: 'transparent',
  },
  tabDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  tabDateFocused: {},
  tabSubtext: {
    fontSize: 11,
    color: '#8B8B8B',
    marginTop: 2,
  },
  tabSubtextFocused: {},
});
