import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AuthStack, MainStack } from './src/navigation';
import { Loading } from './src/components/Loading';
import { startBackgroundTracking, stopBackgroundTracking } from './src/services/backgroundLocationService';

const queryClient = new QueryClient();

function RootNavigator() {
  const { userId, isLoading } = useAuth();
  useEffect(() => {
    if (userId) {
      startBackgroundTracking();
    } else {
      stopBackgroundTracking();
    }
  }, [userId]);
  if (isLoading) return <Loading />;
  return userId ? <MainStack /> : <AuthStack />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
