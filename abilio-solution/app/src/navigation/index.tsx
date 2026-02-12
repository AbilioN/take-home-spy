import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { CatHomeScreen } from '../screens/CatHomeScreen';
import { LastLocationScreen } from '../screens/LastLocationScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  LastLocation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const noHeader = { headerShown: false as const };

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export function MainStack() {
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="Home" component={CatHomeScreen} />
      <Stack.Screen name="LastLocation" component={LastLocationScreen} />
    </Stack.Navigator>
  );
}
