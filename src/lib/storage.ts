import Storage from 'expo-sqlite/kv-store';
const KEY = 'daily-work-hub-v1';
export const readState = () => Storage.getItem(KEY);
export const writeState = (value: string) => Storage.setItem(KEY, value);
export async function updateState(update: (raw: string | null) => string) {
  const next = update(await readState());
  await writeState(next);
  return next;
}
