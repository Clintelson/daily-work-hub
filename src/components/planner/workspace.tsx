import { router } from "expo-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useHub } from "@/hooks/use-hub";
import { useTheme } from "@/hooks/use-theme";
import { dayKey } from "@/lib/model";
import { Action, ui } from "./controls";

export function useToday() {
  const [today, setToday] = useState(dayKey());
  useEffect(() => {
    const id = setInterval(() => setToday(dayKey()), 1000);
    return () => clearInterval(id);
  }, []);
  return today;
}

export function Workspace({
  title,
  subtitle,
  children,
  capture = true,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  capture?: boolean;
}) {
  const hub = useHub(),
    t = useTheme(),
    { width } = useWindowDimensions();
  const wide = width >= 850;
  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
        <ScrollView
          keyboardShouldPersistTaps='handled'
          contentContainerStyle={styles.scroll}
        >
          <View
            style={[
              styles.content,
              {
                maxWidth: capture ? 1160 : 760,
                paddingHorizontal: wide ? 32 : 20,
              },
            ]}
          >
            <View
              style={[ui.row, styles.brand, { borderBottomColor: t.border }]}
            >
              <View style={styles.wordmark}>
                <View
                  accessibilityElementsHidden
                  importantForAccessibility='no-hide-descendants'
                  style={[styles.brandMark, { backgroundColor: t.accent }]}
                />
                <ThemedText type='smallBold' style={styles.brandName}>
                  Daily Work Hub
                </ThemedText>
              </View>
              <Action
                compact
                label='Settings'
                onPress={() => router.push("/settings")}
              />
            </View>
            <View style={styles.header}>
              <View style={styles.heading}>
                <ThemedText
                  accessibilityRole='header'
                  style={[styles.title, wide && styles.titleWide]}
                >
                  {title}
                </ThemedText>
                <ThemedText themeColor='textSecondary' style={styles.subtitle}>
                  {subtitle}
                </ThemedText>
              </View>
              {capture && (
                <Action
                  label='Add task'
                  primary
                  onPress={() => router.push("/capture")}
                />
              )}
            </View>
            {hub.mode !== "live" && (
              <ThemedText type='small' themeColor='accent'>
                Preview data. Changes here are never saved.
              </ThemedText>
            )}
            {hub.error ? (
              <View
                style={[
                  styles.error,
                  {
                    borderColor: t.danger,
                    backgroundColor: t.backgroundSelected,
                  },
                ]}
              >
                <ThemedText accessibilityRole='alert' themeColor='danger'>
                  {hub.error}
                </ThemedText>
                {!hub.ready && (
                  <Action label='Retry opening data' onPress={hub.retry} />
                )}
              </View>
            ) : null}
            {!hub.ready ? (
              <ThemedText themeColor='textSecondary'>
                {hub.error
                  ? "Your existing data is preserved."
                  : "Opening your workspace…"}
              </ThemedText>
            ) : (
              children
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: __DEV__ ? 176 : 112 },
  content: { width: "100%", alignSelf: "center", paddingTop: 16, gap: 28 },
  brand: {
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  wordmark: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  brandMark: { width: 4, height: 20, borderRadius: 2 },
  brandName: { fontSize: 15, letterSpacing: -0.2 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
    paddingVertical: 8,
  },
  heading: { gap: 10, flexShrink: 1 },
  title: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: "500",
    letterSpacing: -1.6,
  },
  titleWide: { fontSize: 54, lineHeight: 64, letterSpacing: -2 },
  subtitle: { maxWidth: 560, fontSize: 15, lineHeight: 24 },
  error: { padding: 20, gap: 12, borderWidth: 1, borderRadius: 12 },
});
