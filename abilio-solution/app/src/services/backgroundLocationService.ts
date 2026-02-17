import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';
import { postLocation } from '../api/locations';

const LOCATION_TASK_NAME = 'background-location-task';
const USER_ID_KEY = '@user_id';
const LOCATION_INTERVAL_MINUTES = 5;

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    return;
  }
  if (!data || typeof data !== 'object' || !('locations' in data) || !Array.isArray((data as { locations: unknown }).locations)) {
    return;
  }
  const locations = (data as { locations: Location.LocationObject[] }).locations;
  if (locations.length === 0) return;
  const latest = locations[locations.length - 1];
  const { latitude, longitude } = latest.coords;
  try {
    const userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) return;
    await postLocation({ userId, latitude, longitude });
  } catch (err) {
    // Log silently, continue on next interval
  }
});

export async function startBackgroundTracking(): Promise<boolean> {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus !== 'granted') {
      return false;
    }
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    if (backgroundStatus !== 'granted') {
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Background location',
          'Background location permission was denied. Location will only be sent while the app is open.'
        );
      }
      return false;
    }
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (started) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
    const options: Location.LocationTaskOptions = {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: LOCATION_INTERVAL_MINUTES * 60 * 1000,
      distanceInterval: 0,
      showsBackgroundLocationIndicator: false,
      pausesUpdatesAutomatically: false,
    };
    if (Platform.OS === 'android') {
      options.foregroundService = {
        notificationTitle: 'Cat Spotter',
        notificationBody: 'Sending your location to find cats nearby.',
      };
    }
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, options);
    return true;
  } catch {
    return false;
  }
}

export async function stopBackgroundTracking(): Promise<void> {
  try {
    const started = await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
    if (started) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    }
  } catch {
    // ignore
  }
}
