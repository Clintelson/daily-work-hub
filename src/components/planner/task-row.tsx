import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useHub } from '@/hooks/use-hub';
import { dateLabel, tomorrow, type Task, type TaskStatus } from '@/lib/model';
import { Action, ui } from './controls';

export function TaskRow({ task, today, review = false }: { task: Task; today: string; review?: boolean }) {
  const hub = useHub(), t = useTheme();
  const save = (patch: Partial<Task>) => { void hub.saveTask({ ...task, ...patch }, task).catch(() => {}); };
  const next: Record<TaskStatus, TaskStatus> = { 'Not started': 'In progress', 'In progress': 'Done', Done: 'Not started' };
  const done = task.status === 'Done';
  return (
    <View style={[styles.row, { borderBottomColor: t.border }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${task.title}: ${task.status}. Change to ${next[task.status]}`}
        disabled={hub.busy}
        onPress={() => save({ status: next[task.status], completedOn: next[task.status] === 'Done' ? today : '', reviewedOn: '' })}
        style={({ pressed }) => [styles.statusTarget, { opacity: pressed ? 0.6 : 1 }]}>
        <View style={[styles.status, {
          borderColor: done ? t.success : task.status === 'In progress' ? t.accent : t.controlBorder,
          backgroundColor: done ? t.success : task.status === 'In progress' ? t.backgroundSelected : 'transparent',
        }]}>
          {done ? <ThemedText style={[styles.check, { color: t.background }]}>✓</ThemedText> : task.status === 'In progress' ? <View style={[styles.dot, { backgroundColor: t.accent }]} /> : null}
        </View>
      </Pressable>
      <View style={styles.body}>
        <View style={styles.description}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${task.title}`}
            onPress={() => router.push({ pathname: '/capture', params: { id: task.id } })}
            style={({ pressed }) => [styles.titleTarget, { opacity: pressed ? 0.65 : 1 }]}>
            <ThemedText style={[styles.title, done && { color: t.textSecondary, textDecorationLine: 'line-through' }]}>{task.title}</ThemedText>
            <ThemedText type="small" themeColor={done ? 'success' : 'textSecondary'}>
              {task.status}{task.due ? ` · Due ${dateLabel(task.due)}` : ''}
            </ThemedText>
          </Pressable>
          {task.waiting ? <ThemedText type="small" themeColor="textSecondary" style={styles.waiting}>Waiting on {task.waiting}{task.followUp ? ` · Follow up ${dateLabel(task.followUp)}` : ''}</ThemedText> : null}
        </View>
        <View style={[ui.row, styles.actions]}>
          {review && !done ? <>
            <Action compact label="Carry to tomorrow" disabled={hub.busy} onPress={() => save({ planned: tomorrow(today), priority: '', reviewedOn: today })} />
            <Action compact label="Leave for later" disabled={hub.busy} onPress={() => save({ planned: '', priority: '', reviewedOn: today })} />
          </> : <>
            <Action compact label={task.priority === today ? 'Unpin priority' : 'Make priority'} selected={task.priority === today} disabled={hub.busy} onPress={() => save({ priority: task.priority === today ? '' : today, reviewedOn: task.priority === today ? task.reviewedOn : '' })} />
            {!done && <Action compact label="Focus" onPress={() => router.push({ pathname: '/focus', params: { task: task.id } })} />}
          </>}
        </View>
      </View>
    </View>
  );
}

export function TaskList({ tasks, today, review }: { tasks: Task[]; today: string; review?: boolean }) {
  // ponytail: paginate 30 rows to bound native layout work; use FlatList if continuous scrolling becomes necessary.
  const [page, setPage] = useState(0);
  const total = Math.max(1, Math.ceil(tasks.length / 30)), safePage = Math.min(page, total - 1);
  useEffect(() => { setPage(0); }, [today]);
  return (
    <View>
      {tasks.slice(safePage * 30, safePage * 30 + 30).map(task => <TaskRow key={task.id} task={task} today={today} review={review} />)}
      {total > 1 && <View style={[ui.row, styles.pagination]}>
        <Action label="Previous" disabled={safePage === 0} onPress={() => setPage(safePage - 1)} />
        <ThemedText type="small">Page {safePage + 1} of {total.toLocaleString()}</ThemedText>
        <Action label="Next" disabled={safePage >= total - 1} onPress={() => setPage(safePage + 1)} />
      </View>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, borderBottomWidth: 1, paddingVertical: 16, alignItems: 'flex-start' },
  statusTarget: { width: 48, minHeight: 48, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  status: { width: 22, height: 22, borderWidth: 1.5, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  check: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  body: { flex: 1, minWidth: 0, flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 4, alignItems: 'flex-start' },
  description: { flexBasis: 240, flexGrow: 1, flexShrink: 1, minWidth: 0, gap: 6 },
  titleTarget: { minHeight: 48, justifyContent: 'center', gap: 6 },
  title: { fontSize: 16, lineHeight: 25, fontWeight: '500', flexShrink: 1 },
  waiting: { lineHeight: 22 },
  actions: { flexShrink: 1, minWidth: 0 },
  pagination: { marginTop: 24 },
});
