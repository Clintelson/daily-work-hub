import { syncTaskReminders } from "@/lib/task-reminders";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import { useHub } from "./use-hub";
const Context = createContext({ error: "", retry: () => {} });
export function TaskRemindersProvider({ children }: { children: ReactNode }) {
  const { state, ready, mode } = useHub();
  const [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!ready || mode !== "live") return;
    let active = true;
    const refresh = () => {
      void syncTaskReminders(state)
        .then(() => {
          if (active) setError("");
        })
        .catch((e) => {
          if (active)
            setError(
              e instanceof Error
                ? e.message
                : "Task reminders could not be updated.",
            );
        });
    };
    refresh();
    const listener = AppState.addEventListener("change", (status) => {
      if (status === "active") refresh();
    });
    const interval = setInterval(refresh, 60 * 60 * 1000);
    return () => {
      active = false;
      listener.remove();
      clearInterval(interval);
    };
  }, [ready, mode, state.tasks, state.settings.reminder, revision]);
  return (
    <Context.Provider
      value={{ error, retry: () => setRevision((value) => value + 1) }}
    >
      {children}
    </Context.Provider>
  );
}
export function useTaskReminders() {
  return useContext(Context);
}
