import { dayKey, tomorrow, type Task } from "./model";

export function reminderPlan(tasks: Task[], now = new Date()) {
  const open = tasks.filter((task) => task.status !== "Done" && task.due);
  const candidates = new Set<string>();
  const counts = new Map<string, number>();
  for (const task of open) {
    counts.set(task.due, (counts.get(task.due) ?? 0) + 1);
    candidates.add(task.due);
    const before = new Date(`${task.due}T12:00:00`);
    before.setDate(before.getDate() - 1);
    candidates.add(dayKey(before));
  }
  return [...candidates]
    .sort()
    .map((day) => {
      const date = new Date(`${day}T09:00:00`);
      const todayCount = (counts.get(day) ?? 0);
      const next = tomorrow(day),
        tomorrowCount = (counts.get(next) ?? 0);
      const body = [
        todayCount
          ? `${todayCount.toLocaleString()} ${todayCount === 1 ? "task" : "tasks"} due today.`
          : "",
        tomorrowCount
          ? `${tomorrowCount.toLocaleString()} ${tomorrowCount === 1 ? "task" : "tasks"} due tomorrow.`
          : "",
      ]
        .filter(Boolean)
        .join(" ");
      return { id: `dwh-task-reminder-${day}`, date, body };
    })
    .filter((item) => item.date.getTime() > now.getTime())
    .slice(0, 12);
}
