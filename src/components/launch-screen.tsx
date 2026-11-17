import { Image } from "expo-image";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export function LaunchScreen({ onFinish }: { onFinish: () => void }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const artSize = Math.max(
    48,
    Math.min(width - 48, height - insets.top - insets.bottom - 112, 512),
  );
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const [failed, setFailed] = useState(false);
  const [displayedKey, setDisplayedKey] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finished = useRef(false);
  const finish = useCallback(() => {
    if (finished.current) return;
    finished.current = true;
    if (timer.current) clearTimeout(timer.current);
    void SplashScreen.hideAsync().catch(() => {});
    onFinish();
  }, [onFinish]);
  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReducedMotion(value);
      })
      .catch(() => {
        if (active) setReducedMotion(true);
      });
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReducedMotion,
    );
    // Never trap startup if the image decoder or its display callback fails.
    const watchdog = setTimeout(finish, 7000);
    return () => {
      active = false;
      sub.remove();
      clearTimeout(watchdog);
      if (timer.current) clearTimeout(timer.current);
    };
  }, [finish]);
  // The original 100-frame GIF lasts four seconds. Native decoders play it;
  // React only schedules the bounded exit, never individual animation frames.
  const still = reducedMotion !== false || failed;
  const sourceKey = still ? "logo" : "animation";
  useEffect(() => {
    if (reducedMotion === null || displayedKey !== sourceKey) return;
    timer.current = setTimeout(finish, reducedMotion || failed ? 350 : 4000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
    };
  }, [reducedMotion, failed, displayedKey, sourceKey, finish]);
  const displayed = () => {
    void SplashScreen.hideAsync().catch(() => {});
    setDisplayedKey(sourceKey);
  };
  return (
    <SafeAreaView style={styles.screen} accessibilityViewIsModal>
      <StatusBar style='dark' />
      <View style={styles.center}>
        <Image
          key={sourceKey}
          source={
            still
              ? require("@/assets/branding/dailyWorkHubLogo.png")
              : require("@/assets/branding/flashscreen.gif")
          }
          accessibilityLabel='Daily Work Hub'
          contentFit='contain'
          style={{ width: artSize, height: artSize }}
          autoplay={!still}
          transition={0}
          onDisplay={displayed}
          onError={() => {
            if (failed) finish();
            else setFailed(true);
          }}
        />
      </View>
      <Pressable
        accessibilityRole='button'
        accessibilityLabel='Skip launch animation'
        onPress={finish}
        style={({ pressed }) => [styles.skip, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Text style={styles.label}>Skip</Text>
      </Pressable>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  screen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    backgroundColor: "#F1EDE7",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  skip: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignSelf: "center",
    marginBottom: 16,
  },
  label: { fontSize: 16, lineHeight: 24, color: "#302023" },
});
