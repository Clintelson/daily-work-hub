import { Workspace, useToday } from '@/components/planner/workspace';
import { Empty, SectionTitle } from '@/components/planner/controls';
import { TaskList } from '@/components/planner/task-row';
import { useHub } from '@/hooks/use-hub';
export default function TasksScreen() {
  const { state } = useHub(), today = useToday();
  return <Workspace title="Your tasks" subtitle="A place for everything. A few things for today.">
    <SectionTitle title="All tasks" detail={`${state.tasks.length.toLocaleString()} ${state.tasks.length === 1 ? 'task' : 'tasks'} kept on this device`} />
    {state.tasks.length ? <TaskList tasks={state.tasks} today={today} /> : <Empty title="Get it out of your head" detail="Capture your first task. You can add a note and a due date, then decide when to work on it." />}
  </Workspace>;
}
