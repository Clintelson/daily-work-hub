export type TaskStatus = "Not started" | "In progress" | "Done";
export type Task = {
  id: string;
  title: string;
  note: string;
  due: string;
  planned: string;
  status: TaskStatus;
  priority: string;
  waiting: string;
  followUp: string;
  completedOn?: string;
  reviewedOn?: string;
};
export type Settings = {
  weekStart: "Monday" | "Sunday";
  reminder: "None" | "On due date";
  work: number;
  rest: number;
  sessions: number;
  endless: boolean;
  sound: boolean;
  vibration: boolean;
  alerts: boolean;
};
export type FocusSession = {
  id: string;
  taskId: string;
  startedAt: number;
  config: Settings;
};
export type HubState = {
  version: 1;
  tasks: Task[];
  settings: Settings;
  focus: FocusSession | null;
};
export const defaults: Settings = {
  weekStart: "Monday",
  reminder: "None",
  work: 25,
  rest: 5,
  sessions: 4,
  endless: false,
  sound: true,
  vibration: true,
  alerts: false,
};
export const blankState = (): HubState => ({
  version: 1,
  tasks: [],
  settings: { ...defaults },
  focus: null,
});
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function tomorrow(today = dayKey()) {
  const date = new Date(`${today}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return dayKey(date);
}
export function validDate(value: string) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return (
    Number.isFinite(date.getTime()) &&
    dayKey(date) === value &&
    date.getFullYear() >= 1900
  );
}
export function dateLabel(value: string) {
  return value
    ? new Date(`${value}T12:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";
}
export function isToday(task: Task, today: string) {
  return (
    task.completedOn === today ||
    task.planned === today ||
    (!!task.due && task.due <= today && task.status !== "Done") ||
    task.priority === today
  );
}
export function validateTask(task: Task) {
  if (!task.title.trim() || task.title.length > 240)
    throw new Error("Enter a title between 1 and 240 characters.");
  if (task.note.length > 4000 || task.waiting.length > 240)
    throw new Error(
      "Keep notes under 4,001 characters and waiting details under 241.",
    );
  if (
    (task.completedOn !== undefined && typeof task.completedOn !== "string") ||
    (task.reviewedOn !== undefined && typeof task.reviewedOn !== "string")
  )
    throw new Error("Saved task dates could not be read.");
  if (
    ![
      task.due,
      task.planned,
      task.priority,
      task.followUp,
      task.completedOn ?? "",
      task.reviewedOn ?? "",
    ].every(validDate)
  )
    throw new Error("Use a valid date in YYYY-MM-DD format (1900 or later).");
  if (!["Not started", "In progress", "Done"].includes(task.status))
    throw new Error("Choose a valid task status.");
}
export function validateSettings(s: Settings) {
  if (
    ![s.work, s.rest, s.sessions].every(Number.isInteger) ||
    s.work < 1 ||
    s.work > 180 ||
    s.rest < 1 ||
    s.rest > 60 ||
    s.sessions < 1 ||
    s.sessions > 24
  )
    throw new Error(
      "Use whole numbers: work 1–180, break 1–60 minutes, sessions 1–24.",
    );
  if (
    !["Monday", "Sunday"].includes(s.weekStart) ||
    !["None", "On due date"].includes(s.reminder) ||
    ![s.endless, s.sound, s.vibration, s.alerts].every(
      (x) => typeof x === "boolean",
    )
  )
    throw new Error(
      "Settings could not be read. Your stored data has been preserved.",
    );
}
export function decodeState(raw: string): HubState {
  const s = JSON.parse(raw) as HubState;
  if (
    s.version !== 1 ||
    !Array.isArray(s.tasks) ||
    !s.settings ||
    !("focus" in s)
  )
    throw new Error(
      "Unsupported saved data. Your stored data has been preserved.",
    );
  validateSettings(s.settings);
  const ids = new Set<string>();
  const priorities = new Map<string, number>();
  for (const t of s.tasks) {
    if (
      !t ||
      ![
        "id",
        "title",
        "note",
        "due",
        "planned",
        "priority",
        "waiting",
        "followUp",
      ].every((k) => typeof t[k as keyof Task] === "string") ||
      !t.id ||
      ids.has(t.id)
    )
      throw new Error(
        "Saved tasks could not be read. Your stored data has been preserved.",
      );
    validateTask(t);
    ids.add(t.id);
    if (t.priority) {
      const n = (priorities.get(t.priority) ?? 0) + 1;
      priorities.set(t.priority, n);
      if (n > 3)
        throw new Error(
          "Saved priorities need review. Your stored data has been preserved.",
        );
    }
  }
  if (s.focus) {
    if (
      typeof s.focus.id !== "string" ||
      typeof s.focus.taskId !== "string" ||
      !Number.isFinite(s.focus.startedAt) ||
      s.focus.startedAt <= 0 ||
      !ids.has(s.focus.taskId)
    )
      throw new Error(
        "Saved Focus session could not be read. Your stored data has been preserved.",
      );
    validateSettings(s.focus.config);
  }
  return s;
}
export function deriveFocus(session: FocusSession, now = Date.now()) {
  const work = session.config.work * 60000,
    rest = session.config.rest * 60000;
  const elapsed = Math.max(0, now - session.startedAt);
  const total = (session.config.sessions - 1) * (work + rest) + work;
  if (!session.config.endless && elapsed >= total)
    return {
      phase: "complete" as const,
      remaining: 0,
      cycle: session.config.sessions,
      boundary: total,
    };
  const cycle = Math.floor(elapsed / (work + rest));
  const offset = elapsed % (work + rest);
  const phase = offset < work ? ("work" as const) : ("break" as const);
  const boundary =
    cycle * (work + rest) + (phase === "work" ? work : work + rest);
  return {
    phase,
    remaining: Math.ceil((boundary - elapsed) / 1000),
    cycle: cycle + 1,
    boundary,
  };
}
export function clockLabel(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
export function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
