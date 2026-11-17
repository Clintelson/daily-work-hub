import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useHub } from "@/hooks/use-hub";
import {
  cancelAlerts,
  exitFocus,
  foregroundSignal,
  scheduleAlerts,
} from "@/lib/focus-alerts";
import { clockLabel, deriveFocus } from "@/lib/model";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  AppState,
  BackHandler,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const palette = Colors.dark;
export default function TimerScreen() {
  const hub = useHub(),
    session = hub.state.focus,
    { width, height, fontScale } = useWindowDimensions();
  const [now, setNow] = useState(Date.now()),
    [error, setError] = useState(""),
    [stopping, setStopping] = useState(false);
  const signalKey = useRef(""),
    ending = useRef(false);
  const result = session ? deriveFocus(session, now) : null;
  const finish = async (completed = false) => {
    if (ending.current) return;
    ending.current = true;
    setStopping(true);
    try {
      if (completed && session && result)
        await foregroundSignal(session, result.boundary);
      if (hub.mode === "live" && session)
        await cancelAlerts(session.id, completed);
      await hub.change((s) => {
        if (s.focus && s.focus.id !== session?.id)
          throw new Error(
            "The active Focus session changed in another view. The latest session has been preserved.",
          );
        return { ...s, focus: null };
      });
      await exitFocus();
      router.replace({
        pathname: "/focus",
        params: completed ? { completed: "1" } : {},
      });
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not stop safely. Try again.",
      );
      ending.current = false;
      setStopping(false);
    }
  };
  useEffect(() => {
    if (!session) return;
    const schedule = () => {
      if (!ending.current && hub.mode === "live")
        void scheduleAlerts(session).catch(() =>
          setError("Background alerts unavailable. The timer still works."),
        );
    };
    schedule();
    const interval = setInterval(() => setNow(Date.now()), 250);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setNow(Date.now());
        schedule();
      }
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
  }, [session?.id, hub.mode]);
  useEffect(() => {
    if (!session || !result) return;
    const key = `${result.cycle}-${result.phase}`;
    if (
      result.phase !== "complete" &&
      signalKey.current &&
      signalKey.current !== key &&
      AppState.currentState !== "background"
    ) {
      const boundary =
        result.boundary -
        (result.phase === "work" ? session.config.work : session.config.rest) *
          60000;
      void foregroundSignal(session, boundary);
    }
    signalKey.current = key;
    if (result.phase === "complete") void finish(true);
  }, [result?.phase, result?.cycle]);
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      void finish();
      return true;
    });
    return () => {
      sub.remove();
      void exitFocus();
    };
  }, [session?.id]);
  if (!hub.ready) return <View style={styles.screen} />;
  if (!session)
    return (
      <SafeAreaView style={styles.screen}>
        <Pressable
          accessibilityRole='button'
          onPress={() => router.replace("/focus")}
          style={styles.stop}
        >
          <ThemedText style={styles.stopText}>Return to Focus</ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  const size = Math.min(
    180,
    (width - 48) / (3.3 * Math.max(1, fontScale)),
    (height - 150) / (1.3 * Math.max(1, fontScale)),
  );
  return (
    <SafeAreaView style={styles.screen}>
      <Stack.Screen
        options={{
          headerShown: false,
          gestureEnabled: false,
          orientation: "landscape",
          statusBarHidden: true,
          navigationBarHidden: true,
        }}
      />
      <StatusBar hidden />
      <View style={styles.center}>
        <ThemedText
          accessibilityLabel={`${result?.phase === "break" ? "Break" : "Work"} timer, ${clockLabel(result?.remaining ?? 0)} remaining`}
          style={[
            styles.timer,
            {
              fontSize: Math.max(30, size),
              lineHeight: Math.max(40, size * 1.3),
              color: result?.phase === "break" ? palette.accent : palette.text,
            },
          ]}
        >
          {clockLabel(result?.remaining ?? 0)}
        </ThemedText>
      </View>
      {error ? (
        <ThemedText accessibilityRole='alert' style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
      <Pressable
        accessibilityRole='button'
        accessibilityLabel='Stop Focus and exit timer'
        disabled={stopping}
        onPress={() => void finish()}
        style={({ pressed }) => [
          styles.stop,
          { opacity: pressed || stopping ? 0.5 : 1 },
        ]}
      >
        <ThemedText style={styles.stopText}>
          {stopping ? "Stopping…" : "Stop Focus"}
        </ThemedText>
      </Pressable>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: palette.focusBackground,
    justifyContent: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  timer: {
    fontWeight: "400",
    fontVariant: ["tabular-nums"],
    textAlign: "center",
  },
  stop: {
    minHeight: 48,
    padding: 12,
    marginBottom: 16,
    alignSelf: "center",
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  stopText: { color: palette.textSecondary, fontSize: 14 },
  error: {
    color: palette.danger,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 24,
  },
});
