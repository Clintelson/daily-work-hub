import { DevFixtures } from "@/components/planner/dev-fixtures";
import { Colors } from "@/constants/theme";
import { HubProvider, useHub } from "@/hooks/use-hub";
import { fixtureModes, type FixtureMode } from "@/lib/fixtures";
import { registerOffline } from "@/lib/offline";
import {
  DarkTheme,
  router,
  Stack,
  ThemeProvider,
  useGlobalSearchParams,
  usePathname,
} from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
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
  const params = useGlobalSearchParams<{ data?: string }>();
  const [mode, setMode] = useState<FixtureMode>("live");
  useEffect(() => {
    if (__DEV__ && fixtureModes.includes(params.data as FixtureMode))
      setMode(params.data as FixtureMode);
  }, [params.data]);
  useEffect(() => {
    void SplashScreen.hideAsync();
    registerOffline();
  }, []);
  return (
    <ThemeProvider value={navigationTheme}>
      <HubProvider key={mode} mode={mode}>
        <Content mode={mode} />
      </HubProvider>
    </ThemeProvider>
  );
}
function Content({ mode }: { mode: FixtureMode }) {
  const { state, ready } = useHub(),
    path = usePathname();
  useEffect(() => {
    if (ready && state.focus && path !== "/timer") router.replace("/timer");
  }, [ready, state.focus?.id, path]);
  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
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
      {__DEV__ && path !== "/timer" && <DevFixtures mode={mode} />}
    </View>
  );
}
