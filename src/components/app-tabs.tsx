import { NativeTabs } from 'expo-router/native-tabs';
import { useTheme } from '@/hooks/use-theme';
export default function AppTabs() {
  const t = useTheme();
  // SDK 58 exposes the host appearance here; iOS 26+ draws its own tab material.
  return <NativeTabs unstable_nativeProps={{ colorScheme: 'dark' }} backgroundColor={t.backgroundElement} tintColor={t.accent} labelStyle={{ default: { color: t.textSecondary }, selected: { color: t.accent } }} iconColor={{ default: t.textSecondary, selected: t.accent }} indicatorColor={t.backgroundSelected}>
    <NativeTabs.Trigger name="index"><NativeTabs.Trigger.Label>Today</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="sun.max" md="today" /></NativeTabs.Trigger>
    <NativeTabs.Trigger name="tasks"><NativeTabs.Trigger.Label>Tasks</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="checklist" md="checklist" /></NativeTabs.Trigger>
    <NativeTabs.Trigger name="focus"><NativeTabs.Trigger.Label>Focus</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="timer" md="timer" /></NativeTabs.Trigger>
    <NativeTabs.Trigger name="review"><NativeTabs.Trigger.Label>Review</NativeTabs.Trigger.Label><NativeTabs.Trigger.Icon sf="moon" md="nightlight" /></NativeTabs.Trigger>
  </NativeTabs>;
}
