import type { ComponentRef, Ref } from 'react';
import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const t = useTheme();
  return (
    <Tabs style={styles.fill}>
      <TabSlot style={styles.fill} />
      <TabList style={[styles.tabs, { backgroundColor: t.background, borderTopColor: t.border }]}>
        <TabTrigger name="today" href="/" asChild><TabButton>Today</TabButton></TabTrigger>
        <TabTrigger name="tasks" href="/tasks" asChild><TabButton>Tasks</TabButton></TabTrigger>
        <TabTrigger name="focus" href="/focus" asChild><TabButton>Focus</TabButton></TabTrigger>
        <TabTrigger name="review" href="/review" asChild><TabButton>Review</TabButton></TabTrigger>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ref, ...props }: TabTriggerSlotProps) {
  const t = useTheme();
  return (
    <Pressable
      {...props}
      ref={ref as Ref<ComponentRef<typeof Pressable>>}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={({ pressed }) => [styles.button, { backgroundColor: pressed ? t.backgroundElevated : 'transparent' }]}>
      <View style={[styles.indicator, { backgroundColor: isFocused ? t.accent : 'transparent' }]} />
      <ThemedText style={{ fontSize: 14, fontWeight: isFocused ? '600' : '400', color: isFocused ? t.text : t.textSecondary }}>{children}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  tabs: { flexDirection: 'row', borderTopWidth: 1, justifyContent: 'center', paddingBottom: 8 },
  button: { flex: 1, maxWidth: 160, minHeight: 68, alignItems: 'center', justifyContent: 'center', gap: 10 },
  indicator: { width: 18, height: 3, borderRadius: 2 },
});
