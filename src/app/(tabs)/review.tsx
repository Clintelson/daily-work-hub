import { Workspace, useToday } from '@/components/planner/workspace';
import { Empty, SectionTitle, ui } from '@/components/planner/controls';
import { TaskList } from '@/components/planner/task-row';
import { useHub } from '@/hooks/use-hub';
import { isToday } from '@/lib/model';
import { View } from 'react-native';
export default function ReviewScreen() {
  const { state } = useHub(), today = useToday();
  const planned = state.tasks.filter(t => isToday(t, today));
  const completed = planned.filter(t => t.status === 'Done');
  const unfinished = planned.filter(t => t.status !== 'Done' && t.reviewedOn !== today);
  return <Workspace title="A good place to stop" subtitle="Notice what moved forward. Give the rest a place to land.">
    <View style={ui.section}><SectionTitle title="Completed" detail={`${completed.length.toLocaleString()} ${completed.length === 1 ? 'task' : 'tasks'} from today’s plan`} />{completed.length ? <TaskList tasks={completed} today={today} review /> : <Empty title="Every day looks different" detail="Completed tasks from your daily plan will appear here." />}</View>
    <View style={ui.section}><SectionTitle title="Still open" detail="Carry a task to tomorrow, or leave it in Tasks for later. Due dates stay unchanged; overdue tasks remain visible in Today." />{unfinished.length ? <TaskList tasks={unfinished} today={today} review /> : <Empty title="Your plan is clear" detail="There is nothing left to carry forward." />}</View>
  </Workspace>;
}
