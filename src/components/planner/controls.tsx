import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

type ActionProps = {
  label: string;
  onPress: () => void;
  primary?: boolean;
  disabled?: boolean;
  selected?: boolean;
  compact?: boolean;
};

export function Action({ label, onPress, primary = false, disabled = false, selected, compact = false }: ActionProps) {
  const t = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled, ...(selected === undefined ? {} : { selected }) }}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        {
          backgroundColor: primary
            ? pressed || hovered ? t.primaryPressed : t.primary
            : selected ? t.backgroundSelected
            : pressed || hovered ? t.backgroundElevated : compact ? 'transparent' : t.backgroundElement,
          borderColor: primary ? t.primary : selected ? t.accent : compact ? 'transparent' : t.controlBorder,
          opacity: disabled ? 0.45 : 1,
        },
      ]}>
      <ThemedText style={[styles.buttonText, { color: primary ? t.onAccent : selected ? t.accent : compact ? t.textSecondary : t.text }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function Field({ label, error, onFocus, onBlur, ...props }: TextInputProps & { label: string; error?: string }) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={t.textSecondary}
        selectionColor={t.accent}
        {...props}
        onFocus={event => { setFocused(true); onFocus?.(event); }}
        onBlur={event => { setFocused(false); onBlur?.(event); }}
        style={[
          styles.input,
          { color: t.text, backgroundColor: t.backgroundElement, borderColor: error ? t.danger : focused ? t.accent : t.controlBorder },
          props.multiline && styles.multiline,
          props.style,
        ]}
      />
      {error ? <ThemedText accessibilityRole="alert" themeColor="danger">{error}</ThemedText> : null}
    </View>
  );
}

export function Empty({ title, detail }: { title: string; detail: string }) {
  return (
    <View style={styles.empty}>
      <ThemedText style={styles.emptyTitle}>{title}</ThemedText>
      <ThemedText themeColor="textSecondary" style={styles.emptyDetail}>{detail}</ThemedText>
    </View>
  );
}

export function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <ThemedText accessibilityRole="header" style={styles.heading}>{title}</ThemedText>
      {detail ? <ThemedText type="small" themeColor="textSecondary">{detail}</ThemedText> : null}
    </View>
  );
}

export const ui = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  column: { gap: 24 },
  section: { gap: 16, marginBottom: 16 },
});

const styles = StyleSheet.create({
  button: { minHeight: 48, paddingHorizontal: 20, paddingVertical: 12, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 1 },
  compact: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  buttonText: { fontSize: 14, lineHeight: 22, fontWeight: '600', textAlign: 'center' },
  field: { gap: 10 },
  input: { minHeight: 54, borderWidth: 1, borderRadius: 12, padding: 16, fontSize: 16, lineHeight: 24 },
  multiline: { minHeight: 144, textAlignVertical: 'top' },
  empty: { gap: 8, paddingVertical: 24, alignItems: 'flex-start' },
  emptyTitle: { fontSize: 17, lineHeight: 26, fontWeight: '500' },
  emptyDetail: { maxWidth: 440, fontSize: 14, lineHeight: 22 },
  sectionTitle: { gap: 6 },
  heading: { fontSize: 21, lineHeight: 29, fontWeight: '600', letterSpacing: -0.4 },
});
