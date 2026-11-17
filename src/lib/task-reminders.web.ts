import { type HubState } from "./model";

export async function allowTaskReminders() {
  throw new Error(
    "Background task reminders are available in the native app. Use the in-app calendar on web.",
  );
}
export async function syncTaskReminders(_state: HubState) {}
