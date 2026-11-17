import { LaunchScreen } from "@/components/launch-screen";
import { Colors } from "@/constants/theme";
import { HubProvider, useHub } from "@/hooks/use-hub";
import { TaskRemindersProvider } from "@/hooks/use-task-reminders";
import { registerOffline } from "@/lib/offline";
import { isLoaded, useFonts } from "expo-font";
import {
  DarkTheme,
  router,
  Stack,
  ThemeProvider,
  usePathname,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { Platform, View } from "react-native";
const palette = Colors.dark;
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: palette.accent,
    background: palette.background,
    card: palette.backgroundElement,
    text: palette.text,
    border: palette.border,
    notification: palette.accent,
  },
};
void SplashScreen.preventAutoHideAsync();
export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    LatoRegular: require("@/assets/fonts/Lato-Regular.ttf"),
    LatoBold: require("@/assets/fonts/Lato-Bold.ttf"),
  });
  const [launchDone, setLaunchDone] = useState(Platform.OS === "android");
  const [startupWaitExpired, setStartupWaitExpired] = useState(false);
  const finishLaunch = useCallback(() => setLaunchDone(true), []);
  useEffect(() => {
    if (Platform.OS !== "android") return;
    // Reveal the existing loading/retry UI and system fonts if startup stalls.
    const timeout = setTimeout(() => setStartupWaitExpired(true), 7000);
    return () => clearTimeout(timeout);
  }, []);
  useEffect(() => {
    registerOffline();
  }, []);
  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      {launchDone ? (
        <ThemeProvider value={navigationTheme}>
          <HubProvider>
            <TaskRemindersProvider>
              <Content
                fontsReady={fontsLoaded || !!fontError || startupWaitExpired}
                startupWaitExpired={startupWaitExpired}
              />
            </TaskRemindersProvider>
          </HubProvider>
        </ThemeProvider>
      ) : <LaunchScreen onFinish={finishLaunch} />}
    </View>
  );
}

function Content({ fontsReady, startupWaitExpired }: {
  fontsReady: boolean;
  startupWaitExpired: boolean;
}) {
  const { state, ready, error } = useHub(),
    path = usePathname();
  const [laidOut, setLaidOut] = useState(false);
  // The fullscreen timer has no storage-recovery UI. A failed cold timer link
  // must reach the normal workspace before the native splash is dismissed.
  const recoveringTimer = Platform.OS === "android" && path === "/timer"
    && !ready && (!!error || startupWaitExpired);
  useEffect(() => {
    if (recoveringTimer) router.replace("/");
    else if (ready && state.focus && path !== "/timer") router.replace("/timer");
  }, [recoveringTimer, ready, state.focus?.id, path]);
  useEffect(() => {
    const restoringFocus = ready && state.focus && path !== "/timer";
    if (Platform.OS === "android" && (ready || error || startupWaitExpired)
        && fontsReady && laidOut && !recoveringTimer
        && (!restoringFocus || startupWaitExpired)) {
      void SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready, error, fontsReady, laidOut, recoveringTimer, startupWaitExpired, state.focus?.id, path]);
  return (
    <View
      style={{ flex: 1, backgroundColor: palette.background }}
      onLayout={() => setLaidOut(true)}
    >
      <StatusBar style='light' />
      <Stack
        screenOptions={{
          headerShown: false,
          orientation: "portrait",
          animation: "none",
          contentStyle: { backgroundColor: palette.background },
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.text,
          headerShadowVisible: false,
          headerTitleStyle: { fontFamily: isLoaded("LatoBold") ? "LatoBold" : undefined },
        }}
      >
        <Stack.Screen name='(tabs)' />
        <Stack.Screen
          name='capture'
          options={{ headerShown: true, title: "Task", presentation: "modal" }}
        />
        <Stack.Screen
          name='settings'
          options={{ headerShown: true, title: "Settings" }}
        />
        <Stack.Screen
          name='timer'
          options={{
            orientation: "landscape",
            gestureEnabled: false,
            statusBarHidden: true,
            navigationBarHidden: true,
          }}
        />
      </Stack>
    </View>
  );
}
