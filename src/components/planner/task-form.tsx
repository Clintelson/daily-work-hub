import { ThemedText } from "@/components/themed-text";
import { useHub } from "@/hooks/use-hub";
import { dayKey, newId, validDate, validateTask, type Task } from "@/lib/model";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";
import { Action, Field, ui } from "./controls";
import { Preference } from "./focus-config";
export function TaskForm({ existing }: { existing?: Task }) {
  const hub = useHub(),
    original = useRef(existing);
  const [task, setTask] = useState<Task>(
    existing ?? {
      id: newId(),
      title: "",
      note: "",
      due: "",
      planned: dayKey(),
      status: "Not started",
      priority: "",
      waiting: "",
      followUp: "",
    },
  );
  const [error, setError] = useState(""),
    [saving, setSaving] = useState(false);
  const close = () =>
    router.canGoBack() ? router.back() : router.replace("/");
  const patch = (p: Partial<Task>) => setTask((s) => ({ ...s, ...p }));
  const save = async () => {
    try {
      setError("");
      validateTask(task);
      setSaving(true);
      await hub.saveTask(
        {
          ...task,
          title: task.title.trim(),
          waiting: task.waiting.trim(),
          followUp: task.waiting.trim() ? task.followUp : "",
        },
        original.current,
      );
      close();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not save. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <View style={ui.column}>
      <Field
        label='Task title'
        value={task.title}
        maxLength={240}
        onChangeText={(title) => patch({ title })}
        autoFocus
        placeholder='What needs doing?'
        error={
          error && !task.title.trim() ? "Give your task a title." : undefined
        }
      />
      <Field
        label='Note (optional)'
        value={task.note}
        maxLength={4000}
        multiline
        onChangeText={(note) => patch({ note })}
        placeholder='Keep the useful details here'
      />
      <Field
        label='Due date (optional, YYYY-MM-DD)'
        value={task.due}
        maxLength={10}
        onChangeText={(due) => patch({ due })}
        placeholder='2026-11-20'
        error={
          !validDate(task.due)
            ? "Enter a real date, or leave this empty."
            : undefined
        }
      />
      <Preference
        label='Plan for today'
        value={task.planned === dayKey()}
        onChange={(on) =>
          patch({
            planned: on ? dayKey() : "",
            reviewedOn: on ? "" : task.reviewedOn,
          })
        }
      />
      <Field
        label='Waiting on (optional)'
        value={task.waiting}
        maxLength={240}
        onChangeText={(waiting) => patch({ waiting })}
        placeholder='A person, decision, or delivery'
      />
      {task.waiting.trim() ? (
        <Field
          label='Follow-up date (optional, YYYY-MM-DD)'
          value={task.followUp}
          maxLength={10}
          onChangeText={(followUp) => patch({ followUp })}
          placeholder='2026-11-21'
          error={
            !validDate(task.followUp)
              ? "Enter a real date, or leave this empty."
              : undefined
          }
        />
      ) : null}
      {error ? (
        <ThemedText accessibilityRole='alert' themeColor='danger'>
          {error}
        </ThemedText>
      ) : null}
      <View style={ui.row}>
        <Action
          label={saving ? "Saving…" : existing ? "Save task" : "Add task"}
          primary
          disabled={saving || hub.busy}
          onPress={() => void save()}
        />
        <Action label='Cancel' onPress={close} />
      </View>
    </View>
  );
}
