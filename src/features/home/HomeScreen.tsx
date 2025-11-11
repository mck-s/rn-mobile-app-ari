import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ImageBackground,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useMemo, useState } from 'react';
import Animated, {
  FadeInDown,
  FadeInUp,
  SlideInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { useLogs, startOfLocalDay, endOfLocalDay } from '../../store/useLogs';
import { dailySummary, formatDuration } from '../../utils/summary';
import { MemoModal } from '../../components/MemoModal';
import SettingsModal from '../../components/SettingsModal';

const icons = {
  poop: require('../../../assets/poopicon.png'),
  feed: require('../../../assets/feedicon.png'),
  sleep: require('../../../assets/sleepicon.png'),
  awake: require('../../../assets/awakeicon.png'),
  memo: require('../../../assets/memoicon.png'),
  plant: require('../../../assets/planticon.png'),
  gear: require('../../../assets/gear.png'),
};

const GradientView = ({ colors, style, children }: any) => (
  <View style={[style, { backgroundColor: colors[0], overflow: 'hidden' }]}>
    <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: colors[1], opacity: 0.6 }} />
    {children}
  </View>
);

const ChoiceModal = ({
  visible,
  onClose,
  title,
  subtitle,
  options,
  colors = ['#B4D4FF', '#8CB8FF'],
}: any) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.sheetOverlay}
    >
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <View style={[StyleSheet.absoluteFill, styles.sheetBackdropBlur]} />
      </Pressable>
      <View style={styles.sheetContainer}>
        <View style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            {!!subtitle && <Text style={styles.sheetSubtitle}>{subtitle}</Text>}
          </View>
          <View style={styles.sheetButtons}>
            {options.map((opt: any) => (
              <Pressable
                key={opt.label}
                onPress={() => {
                  opt.onPress();
                  onClose();
                }}
                style={styles.sheetOption}
              >
                <GradientView colors={colors} style={styles.sheetOptionGradient}>
                  <Text style={styles.sheetOptionText}>{opt.label}</Text>
                </GradientView>
              </Pressable>
            ))}
            <Pressable onPress={onClose} style={styles.sheetCancelButton}>
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  </Modal>
);

const AnimatedButton = ({ children, onPress, onLongPress, colors }: any) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    if (onPress) onPress();
  };

  const handleLongPress = () => {
    if (onLongPress) onLongPress();
  };

  return (
    <Animated.View style={[styles.actionButton, animatedStyle]}>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500}
        onPressIn={() => (scale.value = withSpring(0.92, { damping: 12, stiffness: 400 }))}
        onPressOut={() => (scale.value = withSpring(1, { damping: 12, stiffness: 400 }))}
      >
        <GradientView colors={colors} style={styles.actionContent}>
          {children}
        </GradientView>
      </Pressable>
    </Animated.View>
  );
};

const summaryConfig = [
  { kind: 'poop', label: 'Diapers', icon: icons.poop, bg: '#FFF4E6', key: 'poops' },
  { kind: 'feed', label: 'Feedings', icon: icons.feed, bg: '#F0F4FF', key: 'feeds' },
  { kind: 'sleep', label: 'Sleep', icon: icons.sleep, bg: '#F3F0FF', key: 'sleepMs', format: true },
];

const actionConfig = [
  {
    label: 'Potty',
    icon: icons.poop,
    colors: ['#FFFBF0', '#FFF4E6'],
    action: 'poop',
    sheet: 'poopSheetOpen',
  },
  {
    label: 'Feed',
    icon: icons.feed,
    colors: ['#F0F7FF', '#E8F2FF'],
    action: 'feed',
    sheet: 'feedSheetOpen',
  },
  { label: 'Sleep', icon: icons.sleep, colors: ['#F5F0FF', '#EDE8FF'], action: 'sleep' },
  { label: 'Note', icon: icons.memo, colors: ['#FFF0F7', '#FFE8F3'], action: 'memo' },
];

const logConfig: any = {
  poop: { label: 'Diaper Change', icon: icons.poop, bg: '#FFF4E6', hasAmount: true },
  feed: { label: 'Feeding', icon: icons.feed, bg: '#F0F4FF', hasAmount: true },
  sleepStart: { label: 'Fell Asleep', icon: icons.sleep, bg: '#F3F0FF', hasAmount: false },
  sleepEnd: { label: 'Woke Up', icon: icons.awake, bg: '#FFF9E6', hasAmount: false },
  memo: { label: 'Note', icon: icons.memo, bg: '#FFF0F7', hasAmount: false },
};

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
  const [memoOpen, setMemoOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [poopSheetOpen, setPoopSheetOpen] = useState(false);
  const [feedSheetOpen, setFeedSheetOpen] = useState(false);
  const [highlightLatestFeed, setHighlightLatestFeed] = useState(false);

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const start = startOfLocalDay(new Date(), tz).getTime();
  const end = endOfLocalDay(new Date(), tz).getTime();

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

  const todaySummary = useMemo(() => dailySummary(logs, new Date().toISOString(), tz), [logs, tz]);
  const latestFeedId = useMemo(() => todayLogs.find((l) => l.kind === 'feed')?.id, [todayLogs]);

  const handleAction = (action: string) => {
    if (action === 'sleep') activeSleepId ? endSleep() : startSleep();
    else if (action === 'memo') setMemoOpen(true);
  };

  return (
    <ImageBackground
      source={require('../../../assets/homebg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
          <Text style={styles.headerTitle}>Baby's Day</Text>
          <Text style={styles.headerSubtitle}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Pressable onPress={() => setSettingsOpen(true)} style={styles.gearButton}>
            <Image source={icons.gear} style={styles.gearIcon} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(600)}>
          <View style={styles.summaryCard}>
            {summaryConfig.map((item, idx) => (
              <React.Fragment key={item.key}>
                {idx > 0 && <View style={styles.summaryDivider} />}
                <View style={styles.summaryItem}>
                  <View style={[styles.summaryIconWrapper, { backgroundColor: item.bg }]}>
                    <Image source={item.icon} style={styles.summaryIconImage} />
                  </View>
                  <View style={styles.summaryTextWrapper}>
                    <Text style={styles.summaryLabel}>{item.label}</Text>
                    <Text style={styles.summaryValue}>
                      {item.format
                        ? formatDuration(todaySummary[item.key])
                        : todaySummary[item.key]}
                    </Text>
                  </View>
                </View>
              </React.Fragment>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.actionsRow}>
          <AnimatedButton
            onPress={() => addPoop()}
            onLongPress={() => setPoopSheetOpen(true)}
            colors={['#FFFBF0', '#FFF4E6']}
          >
            <Image source={icons.poop} style={styles.actionIconImage} />
            <Text style={styles.actionLabel}>Potty</Text>
          </AnimatedButton>

          <AnimatedButton
            onPress={() => addFeed()}
            onLongPress={() => setFeedSheetOpen(true)}
            colors={['#F0F7FF', '#E8F2FF']}
          >
            <Image source={icons.feed} style={styles.actionIconImage} />
            <Text style={styles.actionLabel}>Feed</Text>
          </AnimatedButton>

          <AnimatedButton
            onPress={() => (activeSleepId ? endSleep() : startSleep())}
            colors={activeSleepId ? ['#FFF9E6', '#FFF4D6'] : ['#F5F0FF', '#EDE8FF']}
          >
            <Image
              source={activeSleepId ? icons.awake : icons.sleep}
              style={styles.actionIconImage}
            />
            <Text style={styles.actionLabel}>{activeSleepId ? 'Awake' : 'Sleep'}</Text>
          </AnimatedButton>

          <AnimatedButton onPress={() => setMemoOpen(true)} colors={['#FFF0F7', '#FFE8F3']}>
            <Image source={icons.memo} style={styles.actionIconImage} />
            <Text style={styles.actionLabel}>Note</Text>
          </AnimatedButton>
        </Animated.View>

        <View style={styles.logHeader}>
          <Text style={styles.logTitle}>Today's Activity</Text>
          <Pressable onPress={() => deleteAll()}>
            <Text style={styles.deleteAllText}>Clear All</Text>
          </Pressable>
        </View>

        {todayLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Image source={icons.plant} style={styles.emptyStateIconImage} />
            <Text style={styles.emptyStateText}>No logs yet today</Text>
            <Text style={styles.emptyStateSubtext}>Tap an emoji to add a log</Text>
          </View>
        ) : (
          <FlatList
            data={todayLogs}
            keyExtractor={(item) => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => {
              const cfg = logConfig[item.kind];
              const hasAmount = cfg.hasAmount && 'amount' in item;
              return (
                <Animated.View entering={FadeInDown.duration(200).delay(index * 50)}>
                  <Swipeable
                    renderRightActions={() => (
                      <View style={styles.deleteActionContainer}>
                        <Pressable onPress={() => deleteLog(item.id)} style={styles.deleteButton}>
                          <Text style={styles.deleteButtonText}>Delete</Text>
                        </Pressable>
                      </View>
                    )}
                  >
                    <View
                      style={[
                        styles.logCard,
                        highlightLatestFeed && item.id === latestFeedId && styles.logCardHighlight,
                      ]}
                    >
                      <View style={styles.logIconContainer}>
                        <View style={[styles.logIconCircle, { backgroundColor: cfg.bg }]}>
                          <Image source={cfg.icon} style={styles.logIconImage} />
                        </View>
                      </View>
                      <View style={styles.logContent}>
                        <Text style={styles.logTitle}>
                          {cfg.label}
                          {hasAmount && (item as any).amount ? ` (${(item as any).amount})` : ''}
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
                        {'text' in item && item.text && (
                          <Text style={styles.logMemo}>{item.text}</Text>
                        )}
                      </View>
                    </View>
                  </Swipeable>
                </Animated.View>
              );
            }}
          />
        )}

        <MemoModal
          visible={memoOpen}
          onClose={() => setMemoOpen(false)}
          onSave={(text) => addMemo(text)}
        />
        <SettingsModal
          visible={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          highlightLatestFeed={highlightLatestFeed}
          onToggleHighlight={setHighlightLatestFeed}
        />

        <ChoiceModal
          visible={poopSheetOpen}
          onClose={() => setPoopSheetOpen(false)}
          title="Diaper Check"
          subtitle="How much?"
          colors={['#F6D9C3', '#E9B08A']}
          options={[
            { label: 'a lot', onPress: () => addPoop('a lot') },
            { label: 'normal', onPress: () => addPoop('normal') },
            { label: 'just pee', onPress: () => addPoop('just pee') },
          ]}
        />
        <ChoiceModal
          visible={feedSheetOpen}
          onClose={() => setFeedSheetOpen(false)}
          title="Feeding Amount"
          subtitle="How much did baby eat?"
          colors={['#B4D4FF', '#8CB8FF']}
          options={[
            { label: 'a lot', onPress: () => addFeed('a lot') },
            { label: 'normal', onPress: () => addFeed('normal') },
            { label: 'barely', onPress: () => addFeed('barely') },
          ]}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  header: { marginBottom: 24, position: 'relative', paddingRight: 64 },
  headerTitle: { fontSize: 32, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  headerSubtitle: { fontSize: 15, color: '#8B8B8B', fontWeight: '500' },
  gearButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gearIcon: { width: 40, height: 40, resizeMode: 'contain', opacity: 0.95 },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryIconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryIconImage: { width: 36, height: 36, resizeMode: 'contain' },
  summaryTextWrapper: { alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: '#8B8B8B', fontWeight: '500', marginBottom: 2 },
  summaryValue: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  summaryDivider: { width: 1, height: 40, backgroundColor: '#F5F5F5' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32, gap: 10 },
  actionButton: { flex: 1, borderRadius: 20, overflow: 'hidden' },
  actionContent: {
    paddingVertical: 24,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  actionIconImage: { width: 56, height: 56, resizeMode: 'contain', marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#5A5A5A' },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A' },
  deleteAllText: { fontSize: 14, fontWeight: '600', color: '#FF6B9D' },
  list: { flex: 1 },
  listContent: { paddingBottom: 20 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 80 },
  emptyStateIconImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyStateText: { fontSize: 18, fontWeight: '600', color: '#8B8B8B', marginBottom: 4 },
  emptyStateSubtext: { fontSize: 14, color: '#B8B8B8' },
  logCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logCardHighlight: { backgroundColor: '#feffd4' },
  logIconContainer: { marginRight: 14 },
  logIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logIconImage: { width: 32, height: 32, resizeMode: 'contain' },
  logContent: { flex: 1 },
  logTime: { fontSize: 13, color: '#B8B8B8', fontWeight: '500', marginTop: 2 },
  logMemo: { fontSize: 14, color: '#5A5A5A', marginTop: 8, lineHeight: 20 },
  deleteActionContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'stretch',
    paddingLeft: 8,
  },
  deleteButton: {
    minWidth: 72,
    paddingHorizontal: 16,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B9D',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  deleteButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  sheetOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject },
  sheetBackdropBlur: { backgroundColor: 'rgba(0, 0, 0, 0.4)' },
  sheetContainer: { width: '90%', maxWidth: 420 },
  sheetContent: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24 },
  sheetHeader: { marginBottom: 12 },
  sheetTitle: { fontSize: 22, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  sheetSubtitle: { fontSize: 14, color: '#8B8B8B', fontWeight: '500' },
  sheetButtons: { gap: 10, marginTop: 6 },
  sheetOption: { borderRadius: 16, overflow: 'hidden' },
  sheetOptionGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  sheetOptionText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  sheetCancelButton: {
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    marginTop: 2,
  },
  sheetCancelText: { fontSize: 15, fontWeight: '600', color: '#5A5A5A' },
});
