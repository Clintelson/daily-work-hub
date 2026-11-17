import { ThemedText } from "@/components/themed-text";
import { useTheme } from "@/hooks/use-theme";
import { dateLabel, dayKey, type Task } from "@/lib/model";
import { orderTasks } from "@/lib/task-order";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Action, Empty, ui } from "./controls";
import { TaskGroup } from "./task-group";
import { TaskList } from "./task-row";

export function TaskCalendar({
  tasks,
  today,
  weekStart,
}: {
  tasks: Task[];
  today: string;
  weekStart: "Monday" | "Sunday";
}) {
  const [selected, setSelected] = useState(today),
    t = useTheme();
  const start = new Date(`${selected}T12:00:00`);
  const offset = (start.getDay() - (weekStart === "Monday" ? 1 : 0) + 7) % 7;
  start.setDate(start.getDate() - offset);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
  const due = orderTasks(
    tasks.filter((task) => task.due === selected && task.status !== "Done"),
  );
  const completed = orderTasks(
    tasks.filter((task) => task.due === selected && task.status === "Done"),
  );
  const move = (amount: number) => {
    const date = new Date(`${selected}T12:00:00`);
    date.setDate(date.getDate() + amount);
    setSelected(dayKey(date));
  };
  return (
    <View style={ui.column}>
      <View style={ui.row}>
        <Action label='Previous week' compact onPress={() => move(-7)} />
        <Action label='Today' compact onPress={() => setSelected(today)} />
        <Action label='Next week' compact onPress={() => move(7)} />
      </View>
      <ThemedText accessibilityRole='header' style={styles.heading}>
        {start.toLocaleDateString(undefined, {
          month: "long",
          year: "numeric",
        })}
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        contentContainerStyle={styles.week}
      >
        {days.map((date) => {
          const key = dayKey(date),
            count = tasks.filter(
              (task) => task.due === key && task.status !== "Done",
            ).length;
          return (
            <Pressable
              key={key}
              accessibilityRole='button'
              accessibilityState={{ selected: selected === key }}
              accessibilityLabel={`${dateLabel(key)}, ${count} unfinished ${count === 1 ? "task" : "tasks"} due`}
              onPress={() => setSelected(key)}
              style={({ pressed }) => [
                styles.day,
                {
                  backgroundColor:
                    selected === key
                      ? t.backgroundSelected
                      : t.backgroundElement,
                  borderColor: selected === key ? t.accent : t.border,
                  opacity: pressed ? 0.65 : 1,
                },
              ]}
            >
              <ThemedText type='small' themeColor='textSecondary'>
                {date.toLocaleDateString(undefined, { weekday: "short" })}
              </ThemedText>
              <ThemedText style={styles.date}>{date.getDate()}</ThemedText>
              <ThemedText
                type='small'
                themeColor={count ? "accent" : "textSecondary"}
              >
                {count.toLocaleString()}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
      <ThemedText accessibilityRole='header' style={styles.heading}>
        Due {dateLabel(selected)}
      </ThemedText>
      {due.length ? (
        <TaskList key={selected} tasks={due} today={today} />
      ) : (
        <Empty
          title='No unfinished tasks due'
          detail='Tasks with this due date will appear here. Swipe the week strip to see all seven days.'
        />
      )}
      {!!completed.length && (
        <TaskGroup
          key={selected}
          title='Completed'
          tasks={completed}
          today={today}
          collapsible
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  heading: { fontSize: 20, lineHeight: 28, fontWeight: "600" },
  week: { gap: 8, paddingBottom: 8 },
  day: {
    minWidth: 64,
    padding: 12,
    borderWidth: 1,
    borderRadius: 12,
    gap: 8,
    alignItems: "center",
  },
  date: { fontSize: 24, lineHeight: 32 },
});
