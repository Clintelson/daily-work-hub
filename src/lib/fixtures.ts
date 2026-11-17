import { blankState, dayKey, type Task } from "./model";
export const fixtureModes = [
  "live",
  "demo",
  "worst",
  "empty",
  "one",
  "huge",
] as const;
export type FixtureMode = (typeof fixtureModes)[number];
export function fixture(mode: FixtureMode) {
  const state = blankState(),
    today = dayKey();
  const task = (title: string, i: number): Task => ({
    id: `fixture-${i}`,
    title,
    note: "",
    due: "",
    planned: today,
    priority: i < 3 ? today : "",
    status: "Not started",
    waiting: "",
    followUp: "",
  });
  if (mode === "empty" || mode === "live") return state;
  state.tasks = [
    task("Finish the project proposal", 0),
    task("Review the design handoff", 1),
    task("Plan next week’s work", 2),
    task("Send the updated timeline", 3),
    task("Confirm the launch checklist", 4),
  ];
  state.tasks[1].status = "In progress";
  state.tasks[3].waiting = "Jo’s feedback";
  state.tasks[3].followUp = today;
  state.tasks[4].status = "Done";
  if (mode === "one") state.tasks = [task("J", 0)];
  if (mode === "worst") {
    state.tasks[0].title =
      "Review the cross-platform accessibility handoff with Aleksandra Wiśniewska-Kowalczyk before the international product launch";
    state.tasks[0].note =
      "Discuss keyboard navigation, screen-reader labels, and the final handoff. ".repeat(
        50,
      );
    state.tasks[1].title =
      "bartholomew.fitzgerald@northwind-industries-holdings.example.com";
    state.tasks[1].due = "2020-01-01";
    state.tasks[2].title = "Đặng Thị Ngọc Hân 王秀英 نور الهدى 👩🏽‍💻";
    state.tasks[3].waiting =
      "Approval from the regional procurement and information security steering committee";
    state.tasks[4].title = "<b>Review</b> &amp; **publish**";
  }
  if (mode === "huge")
    state.tasks = Array.from({ length: 1000 }, (_, i) =>
      task(`Review project handoff ${i + 1}`, i),
    );
  return state;
}
