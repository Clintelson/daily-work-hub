import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Workspace, useToday } from '@/components/planner/workspace';
import { Action, Empty, SectionTitle, ui } from '@/components/planner/controls';
import { TaskList } from '@/components/planner/task-row';
import { useHub } from '@/hooks/use-hub';
import { useTheme } from '@/hooks/use-theme';
import { clockLabel, isToday } from '@/lib/model';

export default function TodayScreen() {
  const { state } = useHub(), today = useToday(), { width } = useWindowDimensions(), t = useTheme();
  const priorities = state.tasks.filter(task => task.priority === today);
  const tasks = state.tasks.filter(task => isToday(task, today) && !task.waiting && task.priority !== today);
  const waiting = state.tasks.filter(task => !!task.waiting && task.status !== 'Done');
  const completed = state.tasks.filter(task => isToday(task, today) && task.status === 'Done').length;
  const wide = width >= 1000;

  return (
    <Workspace title="Today" subtitle={new Date(`${today}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}>
      <View style={[styles.layout, wide && styles.wide]}>
        <View style={styles.main}>
          <ThemedView type="backgroundElement" style={[styles.priorities, { borderColor: t.border }]}>
            <View style={styles.priorityHeader}>
              <SectionTitle title="Today’s priorities" detail="Up to three tasks to guide your day." />
              <View accessible accessibilityLabel={`${priorities.length} of 3 priorities chosen`} style={styles.quota}>
                <ThemedText type="small" themeColor="textSecondary">{priorities.length}/3</ThemedText>
                {[0, 1, 2].map(index => <View key={index} style={[styles.quotaMark, { backgroundColor: index < priorities.length ? t.accent : t.controlBorder }]} />)}
              </View>
            </View>
            {priorities.length
              ? <TaskList tasks={priorities} today={today} />
              : <Empty title="Choose what matters today" detail="Pick up to three tasks to keep at the top of your day." />}
            {priorities.length < 3 && <View style={styles.priorityAction}><Action compact label="Choose priorities" onPress={() => router.push('/tasks')} /></View>}
          </ThemedView>
          <View style={ui.section}>
            <SectionTitle title="The rest of your plan" detail={`${tasks.length.toLocaleString()} ${tasks.length === 1 ? 'task' : 'tasks'} beyond your priorities`} />
            {tasks.length
              ? <TaskList tasks={tasks} today={today} />
              : <Empty title="No other tasks planned" detail="Add a task for today, or bring one in from your task list." />}
          </View>
        </View>
        <View style={[styles.aside, wide && styles.asideWide]}>
          <ThemedView type="backgroundElement" style={[styles.focus, { borderColor: t.border }]}>
            <SectionTitle title="Focus" detail="Your next work interval." />
            <ThemedText
              accessibilityLabel={`${state.settings.work} minute default Focus interval`}
              adjustsFontSizeToFit
              minimumFontScale={0.25}
              numberOfLines={1}
              style={styles.focusTime}>
              {clockLabel(state.settings.work * 60)}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">{state.settings.work} minutes of work, then a {state.settings.rest} minute break.</ThemedText>
            <Action label={state.focus ? 'Resume Focus' : 'Start Focus'} primary onPress={() => router.push(state.focus ? '/timer' : '/focus')} />
          </ThemedView>
          <View style={ui.section}>
            <SectionTitle title="Waiting on" detail="Blocked tasks and follow-ups." />
            {waiting.length
              ? <TaskList tasks={waiting} today={today} />
              : <Empty title="Nothing holding you up" detail="Add waiting details to a task when it needs someone else’s input." />}
          </View>
          <View style={[styles.review, { borderTopColor: t.border }]}>
            <SectionTitle title="Close the day" detail={`${completed.toLocaleString()} ${completed === 1 ? 'task' : 'tasks'} completed in today’s plan`} />
            <View style={styles.priorityAction}><Action compact label="Review your day" onPress={() => router.push('/review')} /></View>
          </View>
        </View>
      </View>
    </Workspace>
  );
}

const styles = StyleSheet.create({
  layout: { gap: 40 },
  wide: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { flex: 1, minWidth: 0, gap: 36 },
  priorities: { padding: 20, borderRadius: 18, borderWidth: 1, gap: 12 },
  priorityHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  quota: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingTop: 6, paddingBottom: 6 },
  quotaMark: { width: 20, height: 4, borderRadius: 2 },
  priorityAction: { alignItems: 'flex-start' },
  aside: { gap: 32, minWidth: 0 },
  asideWide: { width: 300 },
  focus: { padding: 24, borderRadius: 18, borderWidth: 1, gap: 20 },
  focusTime: { fontSize: 64, lineHeight: 80, fontWeight: '400', letterSpacing: -3, fontVariant: ['tabular-nums'] },
  review: { borderTopWidth: 1, paddingTop: 24, gap: 16 },
});
