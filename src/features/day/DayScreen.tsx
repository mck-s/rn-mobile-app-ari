import { View, Text, FlatList } from 'react-native';
import { useLogs, startOfLocalDay, endOfLocalDay } from '../../store/useLogs';
import { dailySummary, formatDuration } from '../../utils/summary';

export default function DayScreen({ dateISO }: { dateISO: string }) {
  const { logs } = useLogs();
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const sum = dailySummary(logs, dateISO, tz);

  const start = startOfLocalDay(new Date(dateISO), tz).getTime();
  const end = endOfLocalDay(new Date(dateISO), tz).getTime();

  const dayLogs = logs
    .filter((l) => {
      const t = new Date(l.createdAt).getTime();
      return t >= start && t <= end;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const hasData = dayLogs.length > 0 || sum.poops || sum.feeds || sum.sleepMs;

  return (
    <View className="flex-1 p-4 gap-4">
      {/* Summary card */}
      <View className="flex-row justify-between bg-white p-3 rounded-xl shadow">
        <Text>💩 {sum.poops}</Text>
        <Text>🍼 {sum.feeds}</Text>
        <Text>😴 {formatDuration(sum.sleepMs)}</Text>
      </View>

      {/* Main content */}
      {hasData ? (
        <FlatList
          data={dayLogs}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View className="p-3 mb-2 bg-white rounded-xl shadow">
              <Text className="font-semibold">
                {item.kind === 'poop' && '💩 Poop'}
                {item.kind === 'feed' && `🍼 Feed${item.amount ? ` (${item.amount})` : ''}`}
                {item.kind === 'sleepStart' && '😴 Sleep started'}
                {item.kind === 'sleepEnd' && '😀 Woke up'}
                {item.kind === 'memo' && '📝 Memo'}
              </Text>
              <Text className="text-xs text-gray-500">
                {new Date(item.createdAt).toLocaleString()}
              </Text>
              {'text' in item && item.text ? <Text className="mt-1">{item.text}</Text> : null}
            </View>
          )}
        />
      ) : (
        <View className="flex-1 items-center justify-center opacity-60">
          <Text className="text-gray-500 text-base">No logs for this day</Text>
        </View>
      )}
    </View>
  );
}
