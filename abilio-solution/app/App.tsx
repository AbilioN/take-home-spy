import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

const DEBUG = true; // set false to disable debug logs

export default function App() {
  const [Body, setBody] = useState<React.ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (DEBUG) console.log('[App] render', { hasBody: !!Body, error });

  useEffect(() => {
    if (DEBUG) console.log('[App] useEffect: loading AppBody…');
    import('./AppBody')
      .then((m) => {
        if (DEBUG) console.log('[App] AppBody loaded');
        setBody(() => m.default);
      })
      .catch((e) => {
        if (DEBUG) console.error('[App] AppBody load failed', e);
        setError(String(e?.message ?? e));
      });
  }, []);

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Failed to load app</Text>
        <Text style={styles.message}>{error}</Text>
      </View>
    );
  }
  if (!Body) {
    return (
      <View style={styles.centered}>
        <Text style={styles.label}>Starting…</Text>
        <ActivityIndicator size="large" style={styles.spinner} />
      </View>
    );
  }
  return <Body />;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  label: { fontSize: 18, marginBottom: 12 },
  spinner: { marginTop: 8 },
  error: { fontSize: 18, fontWeight: '600', color: '#c00', marginBottom: 8 },
  message: { fontSize: 14, color: '#333', textAlign: 'center' },
});
