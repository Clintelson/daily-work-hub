export type NotificationAccess = {
  supported: boolean;
  granted: boolean;
  canAskAgain: boolean;
};
export async function readNotificationAccess(): Promise<NotificationAccess> {
  return { supported: false, granted: false, canAskAgain: false };
}
export async function requestNotificationAccess() {
  return readNotificationAccess();
}
export async function ensureNotificationAccess() {
  throw new Error(
    "Background notifications are available in the native app. No notification permission is needed for the web planner.",
  );
}
export async function openNotificationSettings() {}
