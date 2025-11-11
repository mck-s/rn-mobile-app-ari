import React from 'react';
import { View, Text, FlatList, StyleSheet, Image, ImageBackground } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useLogs, startOfLocalDay, endOfLocalDay } from '../../store/useLogs';
import { dailySummary, formatDuration } from '../../utils/summary';

// Icons
const poopIcon = require('../../../assets/poopicon.png');
const feedIcon = require('../../../assets/feedicon.png');
const sleepIcon = require('../../../assets/sleepicon.png');
const awakeIcon = require('../../../assets/awakeicon.png');
const memoIcon = require('../../../assets/memoicon.png');
const plantIcon = require('../../../assets/planticon.png');

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
    <ImageBackground
      source={require('../../../assets/homebg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.content}>
        {/* Header */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <Text style={styles.headerTitle}>Daily Summary</Text>
          <Text style={styles.headerSubtitle}>
            {new Date(dateISO).toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </Animated.View>

        {/* Summary card */}
        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <View style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <View style={[styles.summaryIconWrapper, { backgroundColor: '#FFF4E6' }]}>
                <Image source={poopIcon} style={styles.summaryIconImage} />
              </View>
              <View style={styles.summaryTextWrapper}>
                <Text style={styles.summaryLabel}>Diapers</Text>
                <Text style={styles.summaryValue}>{sum.poops}</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <View style={[styles.summaryIconWrapper, { backgroundColor: '#F0F4FF' }]}>
                <Image source={feedIcon} style={styles.summaryIconImage} />
              </View>
              <View style={styles.summaryTextWrapper}>
                <Text style={styles.summaryLabel}>Feedings</Text>
                <Text style={styles.summaryValue}>{sum.feeds}</Text>
              </View>
            </View>

            <View style={styles.summaryDivider} />

            <View style={styles.summaryItem}>
              <View style={[styles.summaryIconWrapper, { backgroundColor: '#F3F0FF' }]}>
                <Image source={sleepIcon} style={styles.summaryIconImage} />
              </View>
              <View style={styles.summaryTextWrapper}>
                <Text style={styles.summaryLabel}>Sleep</Text>
                <Text style={styles.summaryValue}>{formatDuration(sum.sleepMs)}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Main content */}
        {hasData ? (
          <>
            <View style={styles.logHeader}>
              <Text style={styles.logTitle}>Activity Log</Text>
            </View>
            <FlatList
              data={dayLogs}
              keyExtractor={(i) => i.id}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.delay(200 + index * 50).duration(400)}>
                  <View style={styles.logCard}>
                    <View style={styles.logIconContainer}>
                      {item.kind === 'poop' && (
                        <View style={[styles.logIconCircle, { backgroundColor: '#FFF4E6' }]}>
                          <Image source={poopIcon} style={styles.logIconImage} />
                        </View>
                      )}
                      {item.kind === 'feed' && (
                        <View style={[styles.logIconCircle, { backgroundColor: '#F0F4FF' }]}>
                          <Image source={feedIcon} style={styles.logIconImage} />
                        </View>
                      )}
                      {item.kind === 'sleepStart' && (
                        <View style={[styles.logIconCircle, { backgroundColor: '#F3F0FF' }]}>
                          <Image source={sleepIcon} style={styles.logIconImage} />
                        </View>
                      )}
                      {item.kind === 'sleepEnd' && (
                        <View style={[styles.logIconCircle, { backgroundColor: '#FFF9E6' }]}>
                          <Image source={awakeIcon} style={styles.logIconImage} />
                        </View>
                      )}
                      {item.kind === 'memo' && (
                        <View style={[styles.logIconCircle, { backgroundColor: '#FFF0F7' }]}>
                          <Image source={memoIcon} style={styles.logIconImage} />
                        </View>
                      )}
                    </View>

                    <View style={styles.logContent}>
                      <Text style={styles.logTitle}>
                        {item.kind === 'poop' &&
                          `Diaper Change${item.amount ? ` (${item.amount})` : ''}`}
                        {item.kind === 'feed' && `Feeding${item.amount ? ` (${item.amount})` : ''}`}
                        {item.kind === 'sleepStart' && 'Bedtime'}
                        {item.kind === 'sleepEnd' && 'Woke Up'}
                        {item.kind === 'memo' && 'Note'}
                      </Text>
                      <Text style={styles.logTime}>
                        {(() => {
                          const d = new Date(item.createdAt);
                          return Number.isFinite(d.getTime())
                            ? d.toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })
                            : String(item.createdAt);
                        })()}
                      </Text>
                      {'text' in item && item.text ? (
                        <Text style={styles.logMemo}>{item.text}</Text>
                      ) : null}
                    </View>
                  </View>
                </Animated.View>
              )}
            />
          </>
        ) : (
          <View style={styles.emptyState}>
            <Image source={plantIcon} style={styles.emptyStateIconImage} />
            <Text style={styles.emptyStateText}>No logs for this day</Text>
          </View>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#8B8B8B',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryIconImage: {
    width: 36,
    height: 36,
    resizeMode: 'contain',
  },
  summaryTextWrapper: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#8B8B8B',
    fontWeight: '500',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#F5F5F5',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyStateIconImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B8B8B',
    marginBottom: 4,
  },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logIconContainer: {
    marginRight: 14,
  },
  logIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logIconImage: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  logContent: {
    flex: 1,
  },
  logTime: {
    fontSize: 13,
    color: '#B8B8B8',
    fontWeight: '500',
    marginTop: 2,
  },
  logMemo: {
    fontSize: 14,
    color: '#5A5A5A',
    marginTop: 8,
    lineHeight: 20,
  },
});
