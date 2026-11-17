import { ThemedText } from "@/components/themed-text";
import { useHub } from "@/hooks/use-hub";
import { useTaskReminders } from "@/hooks/use-task-reminders";
import { useTheme } from "@/hooks/use-theme";
import {
  openNotificationSettings,
  readNotificationAccess,
  requestNotificationAccess,
  type NotificationAccess,
} from "@/lib/notification-access";
import { useEffect, useState } from "react";
import { AppState, StyleSheet, View } from "react-native";
import { Action, SectionTitle, ui } from "./controls";

export function NotificationAccessCard({
  enableFeatures = false,
}: {
  enableFeatures?: boolean;
}) {
  const hub = useHub(),
    reminders = useTaskReminders(),
    t = useTheme();
  const [access, setAccess] = useState<NotificationAccess | null>(null);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const refresh = () => {
    void readNotificationAccess()
      .then((result) => {
        setAccess(result);
        setError("");
      })
      .catch(() =>
        setError("Notification access could not be checked. Try again."),
      );
  };
  useEffect(() => {
    refresh();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => sub.remove();
  }, []);
  const enable = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await requestNotificationAccess();
      setAccess(result);
      if (result.granted && enableFeatures) {
        await hub.change((state) => ({
          ...state,
          settings: {
            ...state.settings,
            alerts: true,
            reminder: "On due date",
          },
        }));
      }
      reminders.retry();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Notification access could not be updated.",
      );
    } finally {
      setBusy(false);
    }
  };
  if (access && !access.supported) return null;
  if (
    enableFeatures &&
    access?.granted &&
    hub.state.settings.alerts &&
    hub.state.settings.reminder !== "None"
  )
    return null;
  const blocked = access && !access.granted && !access.canAskAgain;
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.backgroundElement, borderColor: t.border },
      ]}
    >
      <SectionTitle
        title='Notifications'
        detail={
          access?.granted
            ? "Allowed on this device"
            : blocked
              ? "Off in device Settings"
              : "A heads-up when it matters"
        }
      />
      <ThemedText type='small' themeColor='textSecondary'>
        {enableFeatures
          ? "Allow notifications to enable private due-date summaries and Focus transition alerts. Task titles and notes stay out of the alerts."
          : "Notification access lets the reminder and Focus options below deliver alerts. Choose the options you want, then save your settings."}
      </ThemedText>
      <ThemedText type='small' themeColor='textSecondary'>
        Task storage and the in-app calendar need no permission prompts. Sound
        and vibration need no separate access beyond notification permission for
        alerts. You can use the planner without notifications.
      </ThemedText>
      {error ? (
        <ThemedText accessibilityRole='alert' themeColor='danger'>
          {error}
        </ThemedText>
      ) : null}
      <View style={ui.row}>
        {!access && error ? (
          <Action label='Retry access check' onPress={refresh} />
        ) : null}
        {access && (!access.granted || enableFeatures) && (
          <Action
            primary
            label={
              busy
                ? "Updating…"
                : blocked
                  ? "Open device Settings"
                  : access.granted
                    ? "Enable reminders and Focus alerts"
                    : "Allow notifications"
            }
            disabled={busy || hub.busy}
            onPress={() => {
              if (blocked)
                void openNotificationSettings().catch(() =>
                  setError(
                    "Device Settings could not be opened. Open your system settings manually.",
                  ),
                );
              else void enable();
            }}
          />
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: { padding: 20, borderWidth: 1, borderRadius: 16, gap: 16 },
});
