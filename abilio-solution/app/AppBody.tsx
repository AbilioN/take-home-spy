import 'react-native-gesture-handler';
import { useEffect, useRef } from 'react';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AuthStack, MainStack } from './src/navigation';
import { Loading } from './src/components/Loading';
import { ErrorBoundary } from './src/components/ErrorBoundary';

const queryClient = new QueryClient();
const DEBUG = true;

function RootNavigator() {
  const { userId, isLoading } = useAuth();
  const trackingStarted = useRef(false);
  if (DEBUG) console.log('[RootNavigator] render', { userId: !!userId, isLoading });
  useEffect(() => {
    if (Constants.expoGoConfig != null) return;
    if (!userId) {
      trackingStarted.current = false;
      import('./src/services/backgroundLocationService').then((m) => m.stopBackgroundTracking());
      return;
    }
    if (trackingStarted.current) return;
    trackingStarted.current = true;
    import('./src/services/backgroundLocationService').then((m) => m.startBackgroundTracking());
  }, [userId]);
  if (isLoading) return <Loading />;
  const showingMain = !!userId;
  if (DEBUG) console.log('[RootNavigator] rendering', showingMain ? 'MainStack' : 'AuthStack');
  return (
    <NavigationContainer>
      {showingMain ? <MainStack /> : <AuthStack />}
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

function AppBody() {
  if (DEBUG) console.log('[AppBody] mount');
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <RootNavigator />
            </AuthProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

export default AppBody;
