import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Platform, View } from 'react-native';
import { Workspace } from '@/components/planner/workspace';
import { Action, Empty, SectionTitle, ui } from '@/components/planner/controls';
import { FocusConfig } from '@/components/planner/focus-config';
import { ThemedText } from '@/components/themed-text';
import { useHub } from '@/hooks/use-hub';
import { newId, validateSettings, type Settings } from '@/lib/model';
import { enterFocus, exitFocus } from '@/lib/focus-alerts';
export default function FocusScreen() {
  const hub = useHub(), { completed } = useLocalSearchParams<{ completed?: string }>();
  return <Workspace title="Find your focus" subtitle="Choose one task. Give it your full attention." capture={false}>
    {completed === '1' && <SectionTitle title="Session complete" detail="Your planned work sessions are finished. Take a moment before choosing what comes next." />}
    {hub.state.focus ? <><SectionTitle title="A session is already running" /><Action label="Return to timer" primary onPress={() => router.push('/timer')} /></> : <FocusSetup key={JSON.stringify(hub.state.settings)} settings={hub.state.settings} />}
  </Workspace>;
}
function FocusSetup({ settings }: { settings: Settings }) {
  const hub = useHub(), params = useLocalSearchParams<{ task?: string }>();
  const tasks = hub.state.tasks.filter(t => t.status !== 'Done');
  const [selected, setSelected] = useState(params.task ?? tasks[0]?.id ?? ''), [config, setConfig] = useState(settings), [error, setError] = useState(''), [starting, setStarting] = useState(false), [page, setPage] = useState(0);
  useEffect(() => {
    if (params.task) {
      setSelected(params.task);
      const index = tasks.findIndex(t => t.id === params.task);
      if (index >= 0) setPage(Math.floor(index / 10));
    }
  }, [params.task]);
  const start = async () => {
    try {
      validateSettings(config);
      if (!tasks.some(t => t.id === selected)) throw new Error('Choose an unfinished task first.');
      setStarting(true); setError('');
      // Fullscreen and audio activation need the original browser gesture.
      await enterFocus();
      await hub.change(s => {
        if (s.focus) throw new Error('A Focus session is already running. Return to its timer.');
        if (!s.tasks.some(t => t.id === selected && t.status !== 'Done')) throw new Error('This task is no longer available for Focus. Choose another task.');
        return { ...s, focus: { id: newId(), taskId: selected, startedAt: Date.now(), config: { ...config } } };
      });
    } catch (e) { await exitFocus(); setError(e instanceof Error ? e.message : 'Could not start Focus.'); }
    finally { setStarting(false); }
  };
  return <View style={ui.column}>
    <SectionTitle title="What are you working on?" />
    {!tasks.length ? <Empty title="Start with a task" detail="Add a task before starting a Focus session." /> : tasks.slice(page * 10, page * 10 + 10).map(t => <Action key={t.id} label={t.title} selected={selected === t.id} onPress={() => { setSelected(t.id); router.setParams({ task: t.id }); }} />)}
    {tasks.length > 10 && <View style={ui.row}><Action label="Previous tasks" disabled={!page} onPress={() => setPage(page - 1)} /><Action label="More tasks" disabled={(page + 1) * 10 >= tasks.length} onPress={() => setPage(page + 1)} /></View>}
    <SectionTitle title="Your rhythm" />
    <FocusConfig value={config} onChange={setConfig} />
    <ThemedText themeColor="textSecondary">Set your device’s Focus or Do Not Disturb mode to silence other apps, and allow Daily Work Hub notifications. This app cannot silence other apps for you.</ThemedText>
    <ThemedText type="small" themeColor="textSecondary">{Platform.OS === 'web' ? 'Fullscreen depends on your browser. Rotate your device for a wider timer. Background sound is not reliable; reopening restores the correct time.' : 'Landscape is requested where supported. In a resizable tablet window the timer adapts to the available space. Enable background alerts in Settings for sound while away.'}</ThemedText>
    {config.alerts && <ThemedText type="small" themeColor="textSecondary">Up to 48 upcoming transitions are scheduled. Reopen the app to refresh alerts during a long session. Device settings may delay delivery.</ThemedText>}
    {error ? <ThemedText accessibilityRole="alert" themeColor="danger">{error}</ThemedText> : null}
    <Action label={starting ? 'Starting…' : 'Start Focus'} primary disabled={!tasks.length || starting || hub.busy} onPress={() => void start()} />
  </View>;
}
