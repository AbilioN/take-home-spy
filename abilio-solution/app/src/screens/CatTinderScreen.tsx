import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { fetchRandomCatProfile, type CatProfile } from '../api/cats';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.88;
const CARD_HEIGHT = CARD_WIDTH * 1.2;
const CARD_IMAGE_HEIGHT = Math.round(CARD_HEIGHT * 0.72);

const QUERY_STALE_MS = 5 * 60 * 1000;
const DEBUG = true;

export function CatTinderScreen() {
  const { clearUserId } = useAuth();
  const [seed, setSeed] = useState(0);

  if (DEBUG) console.log('[CatTinderScreen] render');
  const currentQuery = useQuery({
    queryKey: ['catProfile', seed],
    queryFn: fetchRandomCatProfile,
    staleTime: QUERY_STALE_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  useQuery({
    queryKey: ['catProfile', seed + 1],
    queryFn: fetchRandomCatProfile,
    enabled: !!currentQuery.data,
    staleTime: QUERY_STALE_MS,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const cat = currentQuery.data;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [cat?.id]);

  const handleLike = () => {
    if (cat) console.log('Liked:', cat.name);
    setSeed((s) => s + 1);
  };

  const handleSkip = () => {
    if (cat) console.log('Skipped:', cat.name);
    setSeed((s) => s + 1);
  };

  if (currentQuery.isLoading && !currentQuery.data) {
    if (DEBUG) console.log('[CatTinderScreen] showing Loading (fetching cat)');
    return <Loading />;
  }
  if (currentQuery.isError) {
    if (DEBUG) console.log('[CatTinderScreen] showing Error', currentQuery.error?.message);
    const msg = String(currentQuery.error?.message ?? currentQuery.error);
    const isNetworkError = /network error|failed to fetch|timeout/i.test(msg);
    const friendlyMessage = isNetworkError
      ? 'Could not load cats. Check your internet connection and try again.'
      : msg;
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Cat Spotter</Text>
          <TouchableOpacity onPress={() => clearUserId()}>
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <ErrorMessage message={friendlyMessage} />
          <TouchableOpacity style={styles.retryButton} onPress={() => currentQuery.refetch()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  if (!cat) {
    if (DEBUG) console.log('[CatTinderScreen] showing Loading (no cat yet)');
    return <Loading />;
  }
  if (DEBUG) console.log('[CatTinderScreen] showing card for', cat.name);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cat Spotter</Text>
        <TouchableOpacity onPress={() => clearUserId()}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <View style={styles.cardImageWrap}>
            {!imageError && cat.imageUrl ? (
              <Image
                source={{ uri: cat.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <View style={styles.cardImagePlaceholder}>
                <Text style={styles.cardImagePlaceholderText}>🐱</Text>
              </View>
            )}
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{cat.name}, {cat.age}</Text>
            <Text style={styles.cardDescription}>{cat.description}</Text>
          </View>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={[styles.button, styles.skipButton]} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>NOPE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.likeButton]} onPress={handleLike}>
            <Text style={styles.likeButtonText}>♥ Like</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: '600' },
  logoutText: { fontSize: 14, color: '#666' },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: '#333',
    borderRadius: 12,
  },
  retryButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cardContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  cardImageWrap: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    backgroundColor: '#eee',
  },
  cardImage: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImagePlaceholderText: { fontSize: 64 },
  cardInfo: { padding: 20, flex: 1, justifyContent: 'center' },
  cardName: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  cardDescription: { fontSize: 15, color: '#555', lineHeight: 22 },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 32,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  skipButton: {
    borderWidth: 4,
    borderColor: '#e53935',
  },
  skipButtonText: { color: '#e53935', fontSize: 20, fontWeight: '800' },
  likeButton: {
    borderWidth: 4,
    borderColor: '#43a047',
    backgroundColor: '#43a047',
  },
  likeButtonText: { color: '#fff', fontSize: 20, fontWeight: '800' },
});
