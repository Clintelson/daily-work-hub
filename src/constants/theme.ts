/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import "@/global.css";

import { Platform } from "react-native";

// The requested charcoal/crimson identity is consistent in either system theme.
const workspacePalette = {
  text: "#F1EDE7",
  textSecondary: "#ABA8AD",
  background: "#141416",
  backgroundElement: "#1D1D20",
  backgroundElevated: "#262629",
  backgroundSelected: "#302023",
  accent: "#E77875",
  primary: "#B94349",
  primaryPressed: "#A43940",
  border: "#343438",
  controlBorder: "#6F6C74",
  success: "#C5C0BA",
  danger: "#F3A5A2",
  focusBackground: "#141416",
  onAccent: "#F1EDE7",
} as const;

export const Colors = {
  light: workspacePalette,
  dark: workspacePalette,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
