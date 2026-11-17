import { tomorrow, type Task } from "./model";

export function orderTasks(tasks: Task[]) {
  return [...tasks].sort(
    (a, b) =>
      (a.due || a.planned || "9999-12-31").localeCompare(
        b.due || b.planned || "9999-12-31",
      ) ||
      Number(b.status === "In progress") - Number(a.status === "In progress") ||
      a.title.localeCompare(b.title, undefined, { numeric: true }) ||
      a.id.localeCompare(b.id),
  );
}

export function groupTasks(tasks: Task[], today: string) {
  const next = tomorrow(today);
  const buckets = [
    { title: "Overdue", tasks: [] as Task[] },
    { title: "Today", tasks: [] as Task[] },
    { title: "Tomorrow", tasks: [] as Task[] },
    { title: "Later", tasks: [] as Task[] },
    { title: "No date", tasks: [] as Task[] },
  ];
  for (const task of orderTasks(tasks.filter((t) => t.status !== "Done"))) {
    const date = task.due || (task.planned >= today ? task.planned : "");
    const index =
      date && date < today
        ? 0
        : date === today || task.priority === today
          ? 1
          : date === next
            ? 2
            : date
              ? 3
              : 4;
    buckets[index].tasks.push(task);
  }
  return buckets.filter((group) => group.tasks.length > 0);
}
