import { isLoaded } from "expo-font";
import {
  Platform,
  StyleSheet,
  Text,
  type TextProps,
  type TextStyle,
} from "react-native";

import { Fonts, ThemeColor } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export type ThemedTextProps = TextProps & {
  type?:
    | "default"
    | "title"
    | "small"
    | "smallBold"
    | "subtitle"
    | "link"
    | "linkPrimary"
    | "code";
  themeColor?: ThemeColor;
};

export function ThemedText({
  style,
  type = "default",
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const resolved: TextStyle = StyleSheet.flatten([styles[type], style]) ?? {};
  const bold =
    resolved.fontWeight === "bold" ||
    Number(resolved?.fontWeight ?? 400) >= 600;
  const font =
    type === "code" || !isLoaded(bold ? "LatoBold" : "LatoRegular")
      ? undefined
      : {
          fontFamily: bold ? "LatoBold" : "LatoRegular",
          fontWeight: "normal" as const,
        };

  return (
    <Text
      style={[
        {
          color:
            theme[themeColor ?? (type === "linkPrimary" ? "accent" : "text")],
        },
        styles[type],
        style,
        font,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 600,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
