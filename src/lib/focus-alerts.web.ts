import type { FocusSession } from './model';
let audio: AudioContext | undefined;
export async function allowAlerts() { throw new Error('Background alerts are not available on web. Sound works while this page is active.'); }
export async function cancelAlerts(_sessionId: string, _completed = false) {}
export async function scheduleAlerts(_session: FocusSession) {}
export async function enterFocus() {
  try { audio ??= new AudioContext(); await audio.resume(); } catch { /* Sound may be unsupported; timer remains usable. */ }
  try { await document.documentElement.requestFullscreen?.(); } catch { /* Browser fullscreen is optional. */ }
}
export async function exitFocus() {
  try { if (document.fullscreenElement) await document.exitFullscreen(); } catch { /* Already outside fullscreen. */ }
}
export function foregroundSignal(session: FocusSession, _boundary: number) {
  if (session.config.vibration && 'vibrate' in navigator) navigator.vibrate(300);
  if (!session.config.sound || !audio || audio.state !== 'running') return;
  const oscillator = audio.createOscillator(), gain = audio.createGain();
  oscillator.frequency.value = 660; gain.gain.setValueAtTime(0.12, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.35);
  oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(); oscillator.stop(audio.currentTime + 0.35);
}
