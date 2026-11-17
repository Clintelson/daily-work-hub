export function registerOffline() {
  if (!__DEV__ && 'serviceWorker' in navigator) {
    void navigator.serviceWorker.register('/sw.js').catch(() => { /* Offline caching is unavailable; local data is kept in IndexedDB. */ });
  }
}
