import { Image } from "expo-image";
import { router } from "expo-router";
import {
  useEffect,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useHub } from "@/hooks/use-hub";
import { useTaskReminders } from "@/hooks/use-task-reminders";
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
  const reminders = useTaskReminders();
  const wide = width >= 850;
  const rootRef = useRef<ComponentRef<typeof View>>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  return (
    <ThemedView style={styles.fill}>
      <View
        ref={rootRef}
        style={styles.fill}
        onLayout={() => {
          rootRef.current?.measureInWindow((_x, y) => setHeaderHeight(y));
        }}
      >
        <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
          <KeyboardAvoidingView
            style={styles.fill}
            enabled={Platform.OS !== "web"}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={headerHeight}
          >
            <ScrollView
              style={styles.fill}
              keyboardDismissMode={
                Platform.OS === "ios" ? "interactive" : "on-drag"
              }
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
                  style={[
                    ui.row,
                    styles.brand,
                    { borderBottomColor: t.border },
                  ]}
                >
                  <View style={styles.wordmark}>
                    <Image
                      source={require("@/assets/branding/dailyWorkHubLogo.png")}
                      contentFit="contain"
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                      style={styles.brandMark}
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
                    <ThemedText
                      themeColor='textSecondary'
                      style={styles.subtitle}
                    >
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
                {reminders.error && (
                  <View style={styles.error}>
                    <ThemedText accessibilityRole='alert' themeColor='danger'>
                      {reminders.error} Task management remains available.
                    </ThemedText>
                    <Action label='Retry reminders' onPress={reminders.retry} />
                  </View>
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
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 112 },
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
  brandMark: { width: 48, height: 48 },
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
