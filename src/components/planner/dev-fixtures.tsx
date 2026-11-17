import { Colors } from "@/constants/theme";
import { fixtureModes, type FixtureMode } from "@/lib/fixtures";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, ScrollView, StyleSheet, View } from "react-native";
import { Action } from "./controls";
const labels = {
  live: "My data",
  demo: "Demo data",
  worst: "Worst case",
  empty: "Empty",
  one: "One",
  huge: "1,000 rows",
};
export function DevFixtures({ mode }: { mode: FixtureMode }) {
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardOpen(true),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardOpen(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);
  if (!__DEV__ || keyboardOpen) return null;
  return (
    <View style={styles.outer}>
      <ScrollView horizontal contentContainerStyle={styles.track}>
        {fixtureModes.map((value) => (
          <Action
            compact
            key={value}
            label={labels[value]}
            selected={mode === value}
            onPress={() => router.setParams({ data: value })}
          />
        ))}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  outer: {
    position: "absolute",
    bottom: 80,
    left: 8,
    right: 8,
    alignItems: "center",
  },
  track: {
    backgroundColor: Colors.dark.backgroundElevated,
    padding: 4,
    borderRadius: 12,
    gap: 4,
  },
});
