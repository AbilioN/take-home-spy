const DEBUG = false;
const PREFIX = '[DEBUG]';

export function log(label: string, data?: unknown) {
  if (!DEBUG) return;
  if (data !== undefined) {
    console.log(PREFIX, label, data);
  } else {
    console.log(PREFIX, label);
  }
}

// How to use: run "npx expo start" and watch the Metro terminal (or device logs).
// Look for [DEBUG] lines. If you see MOUNT/UNMOUNT repeating → screen is remounting (e.g. navigation or parent re-mounting).
// If you see RootNavigator with userId flipping null → auth state is changing (AsyncStorage or setState).
// If you see onSwipedAll or seed changed in a loop → swiper callbacks are firing without user input.
// Set DEBUG = false above when done debugging.
