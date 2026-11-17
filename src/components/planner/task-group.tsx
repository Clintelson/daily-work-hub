import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { type Task } from "@/lib/model";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { TaskList } from "./task-row";

export function TaskGroup({
  title,
  tasks,
  today,
  collapsible = false,
}: {
  title: string;
  tasks: Task[];
  today: string;
  collapsible?: boolean;
}) {
  const [open, setOpen] = useState(!collapsible);
  const t = useTheme();
  const heading = (
    <View style={styles.heading}>
      <ThemedText accessibilityRole='header' style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText type='small' themeColor='textSecondary'>
        {tasks.length.toLocaleString()}
        {collapsible ? (open ? "  −" : "  +") : ""}
      </ThemedText>
    </View>
  );
  return (
    <View style={styles.group}>
      {collapsible ? (
        <Pressable
          accessibilityRole='button'
          accessibilityLabel={`${title}, ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`}
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen(!open)}
          style={({ pressed }) => [
            styles.trigger,
            { borderColor: t.border, opacity: pressed ? 0.65 : 1 },
          ]}
        >
          {heading}
        </Pressable>
      ) : (
        heading
      )}
      {open && <TaskList tasks={tasks} today={today} />}
    </View>
  );
}
const styles = StyleSheet.create({
  group: { gap: 8 },
  heading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  title: { fontSize: 20, lineHeight: 28, fontWeight: "600", flexShrink: 1 },
  trigger: { minHeight: 52, justifyContent: "center", borderBottomWidth: 1 },
});
