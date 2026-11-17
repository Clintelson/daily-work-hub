import { Action } from "@/components/planner/controls";
import { TaskForm } from "@/components/planner/task-form";
import { Workspace } from "@/components/planner/workspace";
import { ThemedText } from "@/components/themed-text";
import { useHub } from "@/hooks/use-hub";
import { router, useLocalSearchParams } from "expo-router";
export default function CaptureScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>(),
    { state } = useHub();
  const task = state.tasks.find((t) => t.id === id);
  return (
    <Workspace
      title={id ? "Edit task" : "Make a little space"}
      subtitle='Capture it now. Decide what comes next.'
      capture={false}
    >
      {id && !task ? (
        <>
          <ThemedText>Task not found.</ThemedText>
          <Action
            label='Return to tasks'
            onPress={() => router.replace("/tasks")}
          />
        </>
      ) : (
        <TaskForm key={id ?? "new"} existing={task} />
      )}
    </Workspace>
  );
}
