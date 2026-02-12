# How to run the Cat Spotter app

## Prerequisites

- Node.js (v18+)
- Backend running at `http://localhost:3000` (for Send My Location and View Last Location).
- **TheCatAPI**: Optional. Get a free key at [thecatapi.com](https://thecatapi.com/) and set `EXPO_PUBLIC_CAT_API_KEY` in `.env`. Without a key, the app still works with limited cat images.
- For **Send My Location** to succeed, the backend must have a user with the same ID as the app. Create that user in the backend DB (e.g. insert into `users` with the id your app uses — you can inspect device storage or backend logs, or create a user and set that id in the app).

## 1. Configure environment

In `abilio-solution/app` create or edit `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_CAT_API_KEY=YOUR_CAT_API_KEY
```

On a physical device, set `EXPO_PUBLIC_API_URL` to your machine’s LAN IP (e.g. `http://192.168.1.x:3000`) so the device can reach the backend.

## 2. Start the app

From the **repository root**:

```bash
cd abilio-solution/app
npx expo start
```

A **QR code** and a dev menu will appear in the terminal:

- **Scan the QR code** with your phone camera (iOS) or Expo Go (Android) to open the app on your device.
- Press **i** to open the iOS simulator, or **a** for the Android emulator.

If your phone and computer are on different networks (e.g. different Wi‑Fi), use tunnel mode so the QR code works:

```bash
npx expo start --tunnel
```

Restart Expo after changing `.env`.
