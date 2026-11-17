import { useState } from 'react';
import { Platform, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { type Settings } from '@/lib/model';
import { Field, ui } from './controls';

export function FocusConfig({ value, onChange }: { value: Settings; onChange: (value: Settings) => void }) {
  return (
    <View style={ui.column}>
      <View style={styles.durations}>
        <View style={styles.duration}><NumberField label="Work minutes" value={value.work} onChange={work => onChange({ ...value, work })} /></View>
        <View style={styles.duration}><NumberField label="Break minutes" value={value.rest} onChange={rest => onChange({ ...value, rest })} /></View>
      </View>
      <Preference label="Continue until I stop" value={value.endless} onChange={endless => onChange({ ...value, endless })} />
      {!value.endless && <NumberField label="Work sessions" value={value.sessions} onChange={sessions => onChange({ ...value, sessions })} />}
      <ThemedText type="small" themeColor="textSecondary">Work: 1–180 minutes. Break: 1–60 minutes. Sessions: 1–24. The last work session ends without another break.</ThemedText>
    </View>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  return <Field label={label} keyboardType="number-pad" value={draft} maxLength={3} onChangeText={text => { setDraft(text); onChange(text.trim() ? Number(text) : NaN); }} />;
}

export function Preference({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const t = useTheme();
  // React Native Web has a separate active thumb color from native Switch.
  const webProps = Platform.OS === 'web' ? { activeThumbColor: t.text, style: styles.webSwitch } : {};
  return (
    <View style={[styles.preference, { borderBottomColor: t.border }]}>
      <ThemedText style={styles.preferenceLabel}>{label}</ThemedText>
      <Switch
        {...webProps}
        accessibilityLabel={label}
        hitSlop={8}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: t.controlBorder, true: t.primary }}
        thumbColor={t.text}
        ios_backgroundColor={t.controlBorder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  durations: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  duration: { flexGrow: 1, flexBasis: 200, minWidth: 0 },
  preference: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 24, paddingVertical: 12, borderBottomWidth: 1 },
  webSwitch: { width: 48, height: 24 },
  preferenceLabel: { flex: 1, fontSize: 15, lineHeight: 24 },
});
