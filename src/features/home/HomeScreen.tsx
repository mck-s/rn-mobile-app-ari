// src/features/home/HomeScreen.tsx
import { View, Text, FlatList, Pressable, Alert } from 'react-native';
import { useMemo } from 'react';
import React from 'react';
import { useLogs, startOfLocalDay, endOfLocalDay } from '../../store/useLogs';
import { dailySummary, formatDuration } from '../../utils/summary';
import { MemoModal } from '../../components/MemoModal';
import { Swipeable } from 'react-native-gesture-handler';

export default function HomeScreen() {
  const {
    logs,
    addPoop,
    addFeed,
    startSleep,
    endSleep,
    addMemo,
    deleteLog,
    activeSleepId,
    deleteAll,
  } = useLogs();

  // --- Memo modal state (handled inside MemoModal) ---
  const [memoOpen, setMemoOpen] = React.useState(false);

  // --- Today range ---
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const start = startOfLocalDay(new Date(), tz).getTime();
  const end = endOfLocalDay(new Date(), tz).getTime();

  // --- Today-only logs ---
  const todayLogs = useMemo(
    () =>
      logs
        .filter((l) => {
          const t = new Date(l.createdAt).getTime();
          return Number.isFinite(t) && t >= start && t <= end;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [logs, start, end],
  );

  // --- Summary for today (keep your util usage) ---
  const todaySummary = useMemo(() => dailySummary(logs, new Date().toISOString(), tz), [logs, tz]);

  const sleepToggle = () => (activeSleepId ? endSleep() : startSleep());

  // --- Swipeable right action (Delete) ---
  const renderRightActions = (onDelete: () => void) => (
    <View className="flex-row h-full">
      <Pressable
        onPress={onDelete}
        className="w-28 h-full items-center justify-center bg-red-600 rounded-r-xl"
      >
        <Text className="text-white font-semibold">Delete</Text>
      </Pressable>
    </View>
  );

  return (
    <View className="flex-1 p-4 gap-4">
      {/* Summary (today) */}
      <View className="flex-row justify-between bg-white p-3 rounded-xl shadow">
        <Text>💩 {todaySummary.poops}</Text>
        <Text>🍼 {todaySummary.feeds}</Text>
        <Text>😴 {formatDuration(todaySummary.sleepMs)}</Text>
      </View>

      {/* Top 4 round buttons */}
      <View className="flex-row justify-between">
        <Pressable
          onPress={addPoop}
          className="w-16 h-16 rounded-full items-center justify-center bg-white shadow"
        >
          <Text className="text-2xl">💩</Text>
        </Pressable>

        <Pressable
          onPress={() => addFeed()}
          onLongPress={() => {
            Alert.alert('Feed amount', '', [
              { text: 'a lot', onPress: () => addFeed('a-lot') },
              { text: 'normal', onPress: () => addFeed('normal') },
              { text: 'barely', onPress: () => addFeed('barely') },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
          className="w-16 h-16 rounded-full items-center justify-center bg-white shadow"
        >
          <Text className="text-2xl">🍼</Text>
        </Pressable>

        <Pressable
          onPress={sleepToggle}
          className="w-16 h-16 rounded-full items-center justify-center bg-white shadow"
        >
          <Text className="text-2xl">{activeSleepId ? '😀' : '😴'}</Text>
        </Pressable>

        <Pressable
          onPress={() => setMemoOpen(true)}
          className="w-16 h-16 rounded-full items-center justify-center bg-white shadow"
        >
          <Text className="text-2xl">📝</Text>
        </Pressable>
      </View>

      {/* Single Delete All control */}
      <View className="items-end">
        <Pressable
          onPress={() =>
            Alert.alert(
              'Delete All',
              'This will remove the entire history. This cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete All', style: 'destructive', onPress: () => deleteAll() },
              ],
            )
          }
        >
          <Text className="text-red-600">Delete All</Text>
        </Pressable>
      </View>

      {/* Today-only list (swipe to delete) */}
      {todayLogs.length === 0 ? (
        <View className="flex-1 items-center justify-center opacity-60">
          <Text className="text-gray-500">No logs yet today</Text>
        </View>
      ) : (
        <FlatList
          data={todayLogs}
          keyExtractor={(item) => item.id}
          className="flex-1"
          renderItem={({ item }) => (
            <Swipeable renderRightActions={() => renderRightActions(() => deleteLog(item.id))}>
              <View className="p-3 mb-2 bg-white rounded-xl shadow">
                <Text className="font-semibold">
                  {item.kind === 'poop' && '💩 Poop'}
                  {item.kind === 'feed' && `🍼 Feed${item.amount ? ` (${item.amount})` : ''}`}
                  {item.kind === 'sleepStart' && '😴 Sleep started'}
                  {item.kind === 'sleepEnd' && '😀 Woke up'}
                  {item.kind === 'memo' && '📝 Memo'}
                </Text>
                <Text className="text-xs text-gray-500">
                  {(() => {
                    const d = new Date(item.createdAt);
                    return Number.isFinite(d.getTime())
                      ? d.toLocaleString()
                      : String(item.createdAt);
                  })()}
                </Text>
                {'text' in item && item.text ? <Text className="mt-1">{item.text}</Text> : null}
              </View>
            </Swipeable>
          )}
        />
      )}

      <MemoModal
        visible={memoOpen}
        onClose={() => setMemoOpen(false)}
        onSave={(text) => addMemo(text)}
      />
    </View>
  );
}
