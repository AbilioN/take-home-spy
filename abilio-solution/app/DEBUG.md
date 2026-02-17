# Debugging the app

## 1. Console logs (Metro terminal)

With `DEBUG = true` in `App.tsx`, `AppBody.tsx`, and `AuthContext.tsx`, you’ll see logs in the **same terminal where you run `npx expo start`** (Metro bundler).

- **`[App] render`** – Root component rendered (with/without Body, error).
- **`[App] useEffect: loading AppBody…`** – Started loading the main app bundle.
- **`[App] AppBody loaded`** – Dynamic import of AppBody finished.
- **`[App] AppBody load failed`** – Import failed (error is logged).
- **`[AppBody] mount`** – AppBody component mounted.
- **`[AuthProvider] mount, reading AsyncStorage…`** – Auth context mounted, reading stored user.
- **`[AuthProvider] AsyncStorage got userId` / `null`** – Stored user id or none.
- **`[RootNavigator] render`** – Navigation decided (userId, isLoading).
- **`[RootNavigator] rendering MainStack` / `AuthStack`** – Which stack is being rendered.
- **`[MainStack] render`** – Main (logged-in) stack mounted.
- **`[AuthStack] render`** – Auth (login) stack mounted.
- **`[CatTinderScreen] render`** – Home screen mounted.
- **`[CatTinderScreen] showing Loading (fetching cat)`** – Waiting for cat API.
- **`[CatTinderScreen] showing card for <name>`** – Card UI visible.
- **`[LoginScreen] render`** – Login screen mounted.
- **`[cats API] fetchRandomCatProfile start`** – Cat API request started.
- **`[cats API] fetchRandomCatProfile success <name>`** – Cat loaded.
- **`[cats API] fetchRandomCatProfile error <msg>`** – Cat API failed (check key/network).

**Where it stops tells you where the problem is:**

- Stuck after `loading AppBody…` and never `AppBody loaded` → something in `AppBody` or its imports (e.g. gesture-handler, navigation) blocks or throws during load.
- Stuck after `AppBody loaded` but no `[AppBody] mount` → crash or hang before AppBody’s first render.
- You see `[AppBody] mount` and `[AuthProvider] mount` but no `[RootNavigator] render` → crash inside AuthProvider/RootNavigator.
- You see `[RootNavigator] render` → app is running; if the UI is wrong, the issue is in screens or navigation state.
- **Stuck on `[CatTinderScreen] showing Loading (fetching cat)`** – Cat API request is hanging or never completes. Check: `EXPO_PUBLIC_CAT_API_KEY` in `.env` (get a free key at [thecatapi.com](https://thecatapi.com)), device/simulator network, and whether you see `[cats API] fetchRandomCatProfile start` and then `success` or `error`.

To reduce noise, set `DEBUG = false` in those files when you’re done debugging.

---

## 2. Dev menu (device / simulator)

- **iOS Simulator:** `Cmd + D`
- **Android Emulator:** `Cmd + M` (Mac) or `Ctrl + M` (Windows/Linux)
- **Physical device:** Shake the device

From the dev menu you can:

- **Reload** – Reload the JS bundle.
- **Debug** – Open debugger (see below).
- **Show Element Inspector** – Tap a component to see its props (similar to React DevTools).
- **Enable Fast Refresh** – Keep it on during development.

---

## 3. React DevTools

Inspect component tree and state:

```bash
npx expo start
# In another terminal:
npx react-devtools
```

Connect the app (Expo/device), then in React DevTools you can see the tree and select components to view props/state. Helps to see if AuthProvider/RootNavigator/screens mount and what data they have.

---

## 4. Breakpoints (Chrome / Flipper)

- From the dev menu, choose **Debug** (or “Open JS Debugger”).  
  This opens Chrome; in **Sources** you can set breakpoints in your code (after it’s loaded).  
  Note: “Debug with Chrome” is deprecated on Hermes; prefer **Hermes debugger** or Flipper.
- **Flipper** (optional): Install [Flipper](https://fbflipper.com/), add React Native / Hermes plugins, connect the app to set breakpoints and inspect network/AsyncStorage.

---

## 5. Error overlay (LogBox)

Uncaught errors and many warnings show as a **red/yellow full-screen overlay** in the app. Read the message and stack; the file/line point to the failing code. Our **ErrorBoundary** turns uncaught render errors into the “Something went wrong” screen with the error message.

---

## 6. Clear cache

If the app behaves as if old code is still running:

```bash
npx expo start -c
```

Then reload the app from the dev menu. `-c` clears Metro’s cache.

---

## 7. Quick checklist when the app “doesn’t start”

1. **Metro terminal** – Any red error or stack trace? Fix that first.
2. **Last debug log** – What’s the last `[App]` / `[AppBody]` / `[AuthProvider]` / `[RootNavigator]` log? That narrows down where it hangs or crashes.
3. **ErrorBoundary** – Do you see “Something went wrong” + message? That’s the thrown error.
4. **“Failed to load app”** in App – The dynamic `import('./AppBody')` failed; the message on screen and `[App] AppBody load failed` in Metro give the reason.
5. **Clear cache** – `npx expo start -c` and reload.
