import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { blankState, decodeState, validateSettings, validateTask, type HubState, type Task } from '@/lib/model';
import { readState, updateState } from '@/lib/storage';
import { fixture, type FixtureMode } from '@/lib/fixtures';

type Hub = { state: HubState; ready: boolean; error: string; busy: boolean; mode: FixtureMode; retry: () => void; change: (update: (s: HubState) => HubState) => Promise<void>; saveTask: (task: Task, expected?: Task) => Promise<void> };
const Context = createContext<Hub | null>(null);
export function HubProvider({ children, mode = 'live' }: { children: ReactNode; mode?: FixtureMode }) {
  const [state, setState] = useState(blankState), [ready, setReady] = useState(false), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const current = useRef(state), queue = useRef(Promise.resolve());
  const load = useCallback(() => {
    setReady(false); setError('');
    if (mode !== 'live') { const s = fixture(mode); current.current = s; setState(s); setReady(true); return; }
    readState().then(raw => {
      const s = raw === null ? blankState() : decodeState(raw);
      current.current = s; setState(s); setReady(true);
    }).catch(() => setError('Local data could not be opened. Your saved data has not been replaced. Close other tabs, check available storage, and retry.'));
  }, [mode]);
  useEffect(load, [load]);
  const change = useCallback((update: (s: HubState) => HubState) => {
    const operation = queue.current.catch(() => {}).then(async () => {
      if (!ready) throw new Error('Wait for local data to load before making changes.');
      setBusy(true);
      let latest: HubState | undefined;
      try {
        let next: HubState;
        if (mode === 'live') {
          const saved = await updateState(raw => {
            latest = raw === null ? blankState() : decodeState(raw);
            const changed = update(latest);
            const serialized = JSON.stringify(changed);
            decodeState(serialized);
            return serialized;
          });
          next = decodeState(saved);
        } else {
          next = update(current.current);
          validateSettings(next.settings);
        }
        current.current = next; setState(next); setError('');
      } catch (e) {
        if (latest) { current.current = latest; setState(latest); }
        const message = e instanceof Error ? e.message : 'Change could not be saved.';
        setError(`${message} Your previous saved data is unchanged.`); throw e;
      } finally { setBusy(false); }
    });
    queue.current = operation;
    return operation;
  }, [ready, mode]);
  const saveTask = (task: Task, expected?: Task) => change(s => {
    validateTask(task);
    const stored = s.tasks.find(t => t.id === task.id);
    if (stored && (!expected || JSON.stringify(stored) !== JSON.stringify(expected))) throw new Error('This task changed in another view. Close and reopen the editor to use the latest saved version.');
    if (task.priority && s.tasks.filter(t => t.id !== task.id && t.priority === task.priority).length >= 3) throw new Error('You already have three priorities. Unpin one before adding another.');
    return { ...s, tasks: s.tasks.some(t => t.id === task.id) ? s.tasks.map(t => t.id === task.id ? task : t) : [...s.tasks, task] };
  });
  return <Context.Provider value={{ state, ready, error, busy, mode, retry: load, change, saveTask }}>{children}</Context.Provider>;
}
export function useHub() { const hub = useContext(Context); if (!hub) throw new Error('HubProvider is missing'); return hub; }
