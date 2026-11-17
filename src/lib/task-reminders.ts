import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { type HubState } from "./model";
import { ensureNotificationAccess } from "./notification-access";
import { reminderPlan } from "./reminder-plan";
const PREFIX = "dwh-task-reminder-";
const CHANNEL = "task-reminders";
async function channel() {
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync(CHANNEL, {
      name: "Task due dates",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
    });
}
export async function allowTaskReminders() {
  await ensureNotificationAccess();
}
let queue = Promise.resolve();
export function syncTaskReminders(state: HubState) {
  const operation = queue
    .catch(() => {})
    .then(async () => {
      const enabled = state.settings.reminder !== "None";
      const plan = enabled ? reminderPlan(state.tasks) : [];
      if (enabled) {
        const permission = await Notifications.getPermissionsAsync();
        if (
          !permission.granted &&
          permission.ios?.status !==
            Notifications.IosAuthorizationStatus.PROVISIONAL
        )
          throw new Error("Task reminders are blocked in device Settings.");
        await channel();
      }
      const pending = (
        await Notifications.getAllScheduledNotificationsAsync()
      ).filter((item) => item.identifier.startsWith(PREFIX));
      for (const item of pending) {
        if (!plan.some((wanted) => wanted.id === item.identifier))
          await Notifications.cancelScheduledNotificationAsync(item.identifier);
      }
      // 12 reminders plus 48 Focus transitions leave headroom under iOS's pending limit.
      for (const item of plan) {
        const old = pending.find(
          (notification) => notification.identifier === item.id,
        );
        if (
          old?.content.body === item.body &&
          old.content.data?.scheduledFor === item.date.getTime()
        )
          continue;
        if (old)
          await Notifications.cancelScheduledNotificationAsync(old.identifier);
        await Notifications.scheduleNotificationAsync({
          identifier: item.id,
          content: {
            title: "Tasks coming up",
            body: item.body,
            sound: "default",
            data: { scheduledFor: item.date.getTime() },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: item.date,
            channelId: CHANNEL,
          },
        });
      }
    });
  queue = operation;
  return operation;
}
