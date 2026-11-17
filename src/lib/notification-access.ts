import * as Notifications from "expo-notifications";
import { Linking, Platform } from "react-native";

export type NotificationAccess = {
  supported: boolean;
  granted: boolean;
  canAskAgain: boolean;
};
function access(
  result: Notifications.NotificationPermissionsStatus,
): NotificationAccess {
  return {
    supported: true,
    granted:
      result.granted ||
      result.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL,
    canAskAgain: result.canAskAgain,
  };
}
export async function readNotificationAccess() {
  return access(await Notifications.getPermissionsAsync());
}
export async function requestNotificationAccess() {
  const current = await readNotificationAccess();
  if (current.granted || !current.canAskAgain) return current;
  // Android needs a channel before presenting its notification permission prompt.
  // Reuse the real task-reminder channel instead of creating a dummy channel.
  if (Platform.OS === "android")
    await Notifications.setNotificationChannelAsync("task-reminders", {
      name: "Task due dates",
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: "default",
    });
  return access(
    await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: true },
    }),
  );
}
export async function ensureNotificationAccess() {
  const result = await requestNotificationAccess();
  if (!result.granted)
    throw new Error(
      "Notifications are not allowed. Open device Settings to allow them, or keep using the app without background alerts.",
    );
}
export function openNotificationSettings() {
  return Linking.openSettings();
}
