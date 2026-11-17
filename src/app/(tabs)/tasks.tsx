import { useState } from 'react';
import { View } from 'react-native';
import { Workspace, useToday } from '@/components/planner/workspace';
import { Action, Empty, ui } from '@/components/planner/controls';
import { TaskCalendar } from '@/components/planner/task-calendar';
import { TaskGroup } from '@/components/planner/task-group';
import { useHub } from '@/hooks/use-hub';
import { groupTasks, orderTasks } from '@/lib/task-order';

export default function TasksScreen() {
  const { state } = useHub(), today = useToday();
  const [calendar, setCalendar] = useState(false);
  const groups = groupTasks(state.tasks, today);
  const completed = orderTasks(state.tasks.filter(task => task.status === 'Done'));
  return <Workspace title="Your tasks" subtitle="The next things first. Everything else has a place.">
    <View style={ui.row}><Action label="List" selected={!calendar} onPress={() => setCalendar(false)} /><Action label="Calendar" selected={calendar} onPress={() => setCalendar(true)} /></View>
    {calendar ? <TaskCalendar key={today} tasks={state.tasks} today={today} weekStart={state.settings.weekStart} /> : <View style={[ui.column, { gap: 32 }]}>
      {!state.tasks.length && <Empty title="Start with one task" detail="Add a task and a due date. Your list will organize itself around what’s coming up." />}
      {!groups.length && !!completed.length && <Empty title="All caught up" detail="Your completed work is kept below." />}
      {groups.map(group => <TaskGroup key={group.title} title={group.title} tasks={group.tasks} today={today} />)}
      {!!completed.length && <TaskGroup title="Completed" tasks={completed} today={today} collapsible />}
    </View>}
  </Workspace>;
}
