import * as Notifications from 'expo-notifications';
import { Platform, Vibration } from 'react-native';
import { deriveFocus, type FocusSession } from './model';
const PREFIX = 'dwh-focus-';
const stopped = new Set<string>();
const signaled = new Set<string>();
Notifications.setNotificationHandler({ handleNotification: async notification => {
  const data = notification.request.content.data;
  const key = typeof data?.transition === 'string' ? data.transition : notification.request.identifier;
  const duplicate = signaled.has(key);
  signaled.add(key);
  if (signaled.size > 200) signaled.delete(signaled.values().next().value!);
  if (!duplicate && data?.vibrate) Vibration.vibrate(300);
  return { shouldShowBanner: !duplicate, shouldShowList: !duplicate, shouldSetBadge: false, shouldPlaySound: !duplicate && !!notification.request.content.sound };
} });
export async function allowAlerts() {
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync('focus-permission', { name: 'Focus permission setup', importance: Notifications.AndroidImportance.DEFAULT });
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted && permission.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) throw new Error('Notifications are not allowed. Enable them in device Settings, or use Focus without background alerts.');
}
async function clearPendingAlerts(includeImmediate = false) {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(pending.filter(n => n.identifier.startsWith(PREFIX) || (includeImmediate && n.identifier.startsWith('dwh-now-'))).map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)));
}
async function installAlerts(session: FocusSession) {
  if (stopped.has(session.id) || deriveFocus(session).phase === 'complete') return;
  await clearPendingAlerts();
  if (!session.config.alerts || stopped.has(session.id)) return;
  const { granted, ios } = await Notifications.getPermissionsAsync();
  if (!granted && ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) throw new Error('Background alerts are disabled in device Settings. The timer still works.');
  const channelId = `focus-${Number(session.config.sound)}-${Number(session.config.vibration)}`;
  if (Platform.OS === 'android') await Notifications.setNotificationChannelAsync(channelId, {
    name: 'Focus transitions', importance: Notifications.AndroidImportance.HIGH,
    sound: session.config.sound ? 'default' : null,
    enableVibrate: session.config.vibration, vibrationPattern: session.config.vibration ? [0, 300] : [0],
  });
  // ponytail: 48 future transitions fit within iOS's pending notification ceiling; replenish on foreground.
  let cursor = Date.now();
  for (let i = 0; i < 48; i++) {
    if (stopped.has(session.id)) return;
    const phase = deriveFocus(session, cursor);
    if (phase.phase === 'complete') break;
    const at = session.startedAt + phase.boundary;
    const after = deriveFocus(session, at);
    await Notifications.scheduleNotificationAsync({
      identifier: `${PREFIX}${session.id}-${phase.boundary}`,
      content: { title: after.phase === 'complete' ? 'Focus session complete' : after.phase === 'break' ? 'Time for a break' : 'Time to focus', body: after.phase === 'complete' ? 'Your planned work sessions are finished.' : 'Your next interval has started.', sound: session.config.sound ? 'default' : false, data: { vibrate: session.config.vibration, transition: `${session.id}-${phase.boundary}` } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(at), channelId },
    });
    cursor = at;
  }
}
export async function enterFocus() {}
export async function exitFocus() {}
export function foregroundSignal(session: FocusSession, boundary: number) {
  return enqueue(async () => {
    const transition = `${session.id}-${boundary}`;
    if (stopped.has(session.id) || signaled.has(transition)) return;
    if (!session.config.alerts) {
      if (session.config.vibration) Vibration.vibrate(300);
      signaled.add(transition);
      return;
    }
    try {
      // Replace a possibly delayed scheduled alert with an immediate foreground
      // alert. The handler deduplicates both deliveries by the transition key.
      await Notifications.cancelScheduledNotificationAsync(`${PREFIX}${transition}`);
      if (signaled.has(transition)) return;
      const permission = await Notifications.getPermissionsAsync();
      if (!permission.granted && permission.ios?.status !== Notifications.IosAuthorizationStatus.PROVISIONAL) {
        if (session.config.vibration) Vibration.vibrate(300);
        return;
      }
      await Notifications.scheduleNotificationAsync({
        identifier: `dwh-now-${transition}`,
        content: { title: deriveFocus(session).phase === 'complete' ? 'Focus session complete' : deriveFocus(session).phase === 'break' ? 'Time for a break' : 'Time to focus', sound: session.config.sound ? 'default' : false, data: { transition, vibrate: session.config.vibration } },
        trigger: Platform.OS === 'android' ? { channelId: `focus-${Number(session.config.sound)}-${Number(session.config.vibration)}` } : null,
      });
    } catch { if (session.config.vibration) Vibration.vibrate(300); }
  });
}

let operations: Promise<void> = Promise.resolve();
function enqueue(operation: () => Promise<void>) {
  const next = operations.catch(() => {}).then(operation);
  operations = next;
  return next;
}
export function cancelAlerts(sessionId: string, completed = false) {
  stopped.add(sessionId);
  return enqueue(() => clearPendingAlerts(!completed));
}
export function scheduleAlerts(session: FocusSession) { return enqueue(() => installAlerts(session)); }
