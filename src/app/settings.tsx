import { NotificationAccessCard } from "@/components/planner/notification-access-card";
import { Action, SectionTitle, ui } from "@/components/planner/controls";
import { FocusConfig, Preference } from "@/components/planner/focus-config";
import { Workspace } from "@/components/planner/workspace";
import { ThemedText } from "@/components/themed-text";
import { useHub } from "@/hooks/use-hub";
import { allowAlerts } from "@/lib/focus-alerts";
import { validateSettings, type Settings } from "@/lib/model";
import { allowTaskReminders } from "@/lib/task-reminders";
import { router } from "expo-router";
import { useState } from "react";
import { Platform, View } from "react-native";
export default function SettingsScreen() {
  const hub = useHub();
  return (
    <Workspace
      title='Make it yours'
      subtitle='Simple defaults for the way you work.'
      capture={false}
    >
      <SettingsForm
        key={JSON.stringify(hub.state.settings)}
        initial={hub.state.settings}
      />
    </Workspace>
  );
}
function SettingsForm({ initial }: { initial: Settings }) {
  const hub = useHub(),
    [settings, setSettings] = useState(initial),
    [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  const close = () =>
    router.canGoBack() ? router.back() : router.replace("/");
  const save = async () => {
    try {
      validateSettings(settings);
      setSaving(true);
      setError("");
      if (
        hub.mode === "live" &&
        Platform.OS !== "web" &&
        settings.reminder !== "None"
      )
        await allowTaskReminders();
      if (settings.alerts && !initial.alerts) await allowAlerts();
      await hub.change((s) => ({ ...s, settings }));
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Settings could not be saved.");
    } finally {
      setSaving(false);
    }
  };
  return (
    <View style={ui.column}>
      <NotificationAccessCard />
      <SectionTitle title='Planning' />
      <ThemedText>Start of the week</ThemedText>
      <View style={ui.row}>
        {(["Monday", "Sunday"] as const).map((weekStart) => (
          <Action
            key={weekStart}
            label={weekStart}
            selected={settings.weekStart === weekStart}
            onPress={() => setSettings({ ...settings, weekStart })}
          />
        ))}
      </View>
      <ThemedText>Task due-date reminders</ThemedText>
      <View style={ui.row}>
        {(["None", "On due date"] as const).map((reminder) => (
          <Action
            key={reminder}
            label={reminder === "None" ? "Off" : "Today and tomorrow"}
            disabled={Platform.OS === "web" && reminder !== "None"}
            selected={settings.reminder === reminder}
            onPress={() => setSettings({ ...settings, reminder })}
          />
        ))}
      </View>
      <ThemedText type='small' themeColor='textSecondary'>
        {Platform.OS === "web"
          ? "Background task reminders are available in the native app. Check the Calendar view here for due dates."
          : "At 9:00 AM local time, a private summary lists how many tasks are due today or tomorrow. Reminders are scheduled for the next 12 relevant mornings and refreshed when you reopen the app. Tasks added after 9:00 AM do not trigger a late reminder for that morning. Device settings can delay delivery."}
      </ThemedText>
      <SectionTitle title='Focus defaults' />
      <FocusConfig value={settings} onChange={setSettings} />
      <Preference
        label='Sound at transitions'
        value={settings.sound}
        onChange={(sound) => setSettings({ ...settings, sound })}
      />
      <Preference
        label='Vibration where supported'
        value={settings.vibration}
        onChange={(vibration) => setSettings({ ...settings, vibration })}
      />
      {Platform.OS !== "web" && (
        <Preference
          label='Background Focus alerts'
          value={settings.alerts}
          onChange={(alerts) => setSettings({ ...settings, alerts })}
        />
      )}
      <ThemedText type='small' themeColor='textSecondary'>
        {Platform.OS === "web"
          ? "Sound is available while the page is active. Vibration depends on the browser and device."
          : "Sound uses local notifications and requires background Focus alerts. Foreground vibration works without notification access. Active sessions keep the settings they started with."}
      </ThemedText>
      <SectionTitle title='Only on this device' />
      <ThemedText themeColor='textSecondary'>
        Your tasks stay here. There is no account or sync. Uninstalling the app
        or clearing browser site data can remove your workspace.
      </ThemedText>
      {error ? (
        <ThemedText accessibilityRole='alert' themeColor='danger'>
          {error}
        </ThemedText>
      ) : null}
      <View style={ui.row}>
        <Action
          label={saving ? "Saving…" : "Save settings"}
          primary
          disabled={saving}
          onPress={() => void save()}
        />
        <Action label='Cancel' onPress={close} />
      </View>
    </View>
  );
}
