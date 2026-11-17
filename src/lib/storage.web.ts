let connection: Promise<IDBDatabase> | undefined;
function database() {
  return (connection ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("daily-work-hub", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("state");
    request.onsuccess = () => {
      const db = request.result;
      db.onversionchange = () => {
        db.close();
        connection = undefined;
      };
      resolve(db);
    };
    request.onerror = () => {
      connection = undefined;
      reject(request.error);
    };
    request.onblocked = () => {
      connection = undefined;
      reject(new Error("Close other Daily Work Hub tabs and retry."));
    };
  }));
}
export async function readState(): Promise<string | null> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("state", "readonly");
    const req = tx.objectStore("state").get("hub");
    tx.oncomplete = () => resolve(req.result ?? null);
    tx.onerror = tx.onabort = () =>
      reject(tx.error ?? new Error("Local storage could not be opened."));
  });
}
export async function writeState(value: string): Promise<void> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("state", "readwrite");
    tx.objectStore("state").put(value, "hub");
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () =>
      reject(tx.error ?? new Error("Your change could not be saved."));
  });
}
// IndexedDB serializes read/write transactions across tabs. Read and write in the
// same transaction so another open workspace cannot overwrite intervening edits.
export async function updateState(
  update: (raw: string | null) => string,
): Promise<string> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("state", "readwrite");
    const store = tx.objectStore("state"),
      request = store.get("hub");
    let next: string, failure: unknown;
    request.onsuccess = () => {
      try {
        next = update(request.result ?? null);
        store.put(next, "hub");
      } catch (error) {
        failure = error;
        tx.abort();
      }
    };
    tx.oncomplete = () => resolve(next);
    tx.onerror = tx.onabort = () =>
      reject(
        failure ?? tx.error ?? new Error("Your change could not be saved."),
      );
  });
}
