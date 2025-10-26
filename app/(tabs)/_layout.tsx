// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { format, subDays } from 'date-fns';

export default function TabLayout() {
  const today = new Date();
  const y = subDays(today, 1);
  const d2 = subDays(today, 2);

  return (
    <Tabs screenOptions={{ tabBarLabelStyle: { fontSize: 12 } }}>
      <Tabs.Screen name="index" options={{ title: `Today (${format(today, 'MM/dd')})` }} />
      <Tabs.Screen name="yesterday" options={{ title: format(y, 'MM/dd') }} />
      <Tabs.Screen name="day3" options={{ title: format(d2, 'MM/dd') }} />
    </Tabs>
  );
}
