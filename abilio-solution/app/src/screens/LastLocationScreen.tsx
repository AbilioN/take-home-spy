import { View, Text, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getLastLocation } from '../api/locations';
import { useUserId } from '../hooks/useUserId';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function LastLocationScreen() {
  const userId = useUserId();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['lastLocation', userId],
    queryFn: () => getLastLocation(userId!),
    enabled: userId !== null,
  });

  if (userId === null || isLoading) return <Loading />;
  if (isError) return <ErrorMessage message={String(error)} />;

  const empty = data == null || (typeof data === 'object' && Object.keys(data).length === 0);

  if (empty) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Last Location</Text>
        <Text style={styles.empty}>No location recorded yet.</Text>
      </View>
    );
  }

  const loc = data as { latitude: number; longitude: number; createdAt: string };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Last Location</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Latitude</Text>
        <Text style={styles.value}>{loc.latitude}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Longitude</Text>
        <Text style={styles.value}>{loc.longitude}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Recorded at</Text>
        <Text style={styles.value}>{formatDate(loc.createdAt)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 24 },
  section: { marginBottom: 20 },
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  value: { fontSize: 16 },
  empty: { color: '#666' },
});
