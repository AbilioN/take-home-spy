import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postLocation } from '../api/locations';
import { fetchCats } from '../api/cats';
import { useUserId } from '../hooks/useUserId';
import { requestPermissionAndGetLocation } from '../services/locationService';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export function CatHomeScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const userId = useUserId();
  const [coords, setCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const result = await requestPermissionAndGetLocation();
      if (result) setCoords(result);
      else setLocationError('Location permission denied');
    })();
  }, []);

  const catsQuery = useQuery({
    queryKey: ['cats'],
    queryFn: () => fetchCats(10),
  });

  const sendMutation = useMutation({
    mutationFn: postLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lastLocation', userId!] });
    },
  });

  const handleSendLocation = () => {
    if (!userId || !coords) return;
    sendMutation.mutate({
      userId,
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  };

  const handleViewLastLocation = () => {
    navigation.navigate('LastLocation');
  };

  if (userId === null) return <Loading />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Cat Spotter</Text>

      {locationError && <ErrorMessage message={locationError} />}
      {coords && (
        <View style={styles.section}>
          <Text style={styles.label}>Your location</Text>
          <Text style={styles.coords}>
            {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
          </Text>
        </View>
      )}

      <Text style={styles.sectionTitle}>Cats nearby</Text>
      {catsQuery.isLoading && <Loading />}
      {catsQuery.isError && (
        <ErrorMessage message={String(catsQuery.error)} />
      )}
      {catsQuery.data?.map((cat) => (
        <Image
          key={cat.id}
          source={{ uri: cat.url }}
          style={styles.catImage}
          contentFit="cover"
        />
      ))}

      {sendMutation.isError && (
        <ErrorMessage message={String(sendMutation.error)} />
      )}
      {sendMutation.isSuccess && (
        <View style={styles.success}>
          <Text>Location sent.</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSendLocation}
        disabled={!coords || sendMutation.isPending}
      >
        <Text style={styles.buttonText}>
          {sendMutation.isPending ? 'Sending…' : 'Send My Location'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.buttonSecondary}
        onPress={handleViewLastLocation}
      >
        <Text style={styles.buttonTextSecondary}>View Last Location</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 16 },
  section: { marginBottom: 16 },
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  coords: { fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '500', marginTop: 24, marginBottom: 12 },
  catImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: 8 },
  success: { padding: 16, marginBottom: 16, backgroundColor: '#efe' },
  button: {
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  buttonText: { color: '#fff', fontSize: 16 },
  buttonSecondary: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  buttonTextSecondary: { color: '#333', fontSize: 16 },
});
