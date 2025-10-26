import DayScreen from '../../src/features/day/DayScreen';
import { subDays } from 'date-fns';
import { startOfLocalDay } from '../../src/store/useLogs'; // you already export this

export default function Yesterday() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  const dateISO = startOfLocalDay(subDays(new Date(), 1), tz).toISOString();
  return <DayScreen dateISO={dateISO} />;
}
