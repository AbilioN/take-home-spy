import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { postLocation } from '../api/locations';

const isExpoGo = Constants.expoGoConfig != null;
const DEBUG = __DEV__;

const LOCATION_TASK_NAME = 'background-location-task';
const USER_ID_KEY = '@user_id';
/** Interval between location updates sent to the server (seconds). First update soon after start. */
const LOCATION_INTERVAL_SECONDS = 30;

/** Foreground polling interval ID (used when background location isn't available, e.g. Expo Go). */
let foregroundIntervalId: ReturnType<typeof setInterval> | null = null;

async function sendLocationToBackend(latitude: number, longitude: number): Promise<void> {
  const userId = await AsyncStorage.getItem(USER_ID_KEY);
  if (!userId) return;
  const payload = { userId, latitude, longitude };
  if (DEBUG) {
    console.log('[backgroundLocation] POST /locations', {
      userId: userId.slice(0, 8) + '…',
      latitude,
      longitude,
    });
  }
  try {
    await postLocation(payload);

    if (DEBUG) console.log('[backgroundLocation] sent OK', { latitude, longitude });
  } catch (err) {
    const msg = (err as Error)?.message ?? String(err);
    const ax = err as { response?: { status?: number; data?: unknown }; code?: string };
    if (DEBUG) {
      console.warn('[backgroundLocation] POST /locations failed', {
        message: msg,
        status: ax.response?.status,
        data: ax.response?.data,
        code: ax.code,
      });
    }
  }
}

// Must be defined at app load (see index.ts import). Do not move into a dynamic import.
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    if (DEBUG) console.log('[backgroundLocation] task error', error);
    return;
  }
  if (!data || typeof data !== 'object' || !('locations' in data) || !Array.isArray((data as { locations: unknown }).locations)) {
    return;
  }
  const locations = (data as { locations: Location.LocationObject[] }).locations;
  if (locations.length === 0) return;
  const latest = locations[locations.length - 1];
  const { latitude, longitude } = latest.coords;
  await sendLocationToBackend(latitude, longitude);
});

export async function startBackgroundTracking(): Promise<boolean> {
  if (isExpoGo) {
    if (DEBUG) console.log('[backgroundLocation] using foreground fallback (Expo Go)');
    return startForegroundFallback();
  }
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      if (DEBUG) console.log('[backgroundLocation] foreground permission denied');
      return false;
    }
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      if (DEBUG) console.log('[backgroundLocation] background permission denied, using foreground fallback');
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Background location',
          'Background location permission was denied. Location will only be sent while the app is open.'
        );
      }
      return startForegroundFallback();
    }
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (started) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
    const options: Location.LocationTaskOptions = {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: LOCATION_INTERVAL_SECONDS * 1000,
      distanceInterval: 0,
      showsBackgroundLocationIndicator: false,
      pausesUpdatesAutomatically: false,
    };
    if (Platform.OS === 'android') {
      options.foregroundService = {
        notificationTitle: 'Cat Finder is active',
        notificationBody: 'Tracking location to find cats nearby.',
        killServiceOnDestroy: false,
      };
    }
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, options);
    if (DEBUG) console.log('[backgroundLocation] started, interval', LOCATION_INTERVAL_SECONDS, 's');
    return true;
  } catch (e) {
    if (DEBUG) console.warn('[backgroundLocation] start failed', (e as Error)?.message ?? e);
    return false;
  }
}

async function startForegroundFallback(): Promise<boolean> {
  stopForegroundFallback();
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      if (DEBUG) console.log('[backgroundLocation] foreground fallback: permission denied');
      return false;
    }
    const send = async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const { latitude, longitude } = loc.coords;
        await sendLocationToBackend(latitude, longitude);
      } catch {
        // ignore
      }
    };
    await send(); // send immediately
    foregroundIntervalId = setInterval(send, LOCATION_INTERVAL_SECONDS * 1000);
    if (DEBUG) console.log('[backgroundLocation] foreground fallback started, interval', LOCATION_INTERVAL_SECONDS, 's');
    return true;
  } catch (e) {
    if (DEBUG) console.warn('[backgroundLocation] foreground fallback failed', (e as Error)?.message ?? e);
    return false;
  }
}

function stopForegroundFallback(): void {
  if (foregroundIntervalId) {
    clearInterval(foregroundIntervalId);
    foregroundIntervalId = null;
    if (DEBUG) console.log('[backgroundLocation] foreground fallback stopped');
  }
}

export async function stopBackgroundTracking(): Promise<void> {
  stopForegroundFallback();
  try {
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (started) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  } catch {
    // ignore
  }
}
