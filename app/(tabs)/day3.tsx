import DayScreen from '../../src/features/day/DayScreen';
import { subDays } from 'date-fns';
import { startOfLocalDay } from '../../src/store/useLogs';

export default function Day3() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const dateISO = startOfLocalDay(subDays(new Date(), 2), tz).toISOString();
  return <DayScreen dateISO={dateISO} />;
}
