import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { CatTinderScreen } from '../screens/CatTinderScreen';
import { LastLocationScreen } from '../screens/LastLocationScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  LastLocation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const noHeader = { headerShown: false as const };
const DEBUG = true;

export function AuthStack() {
  if (DEBUG) console.log('[AuthStack] render');
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export function MainStack() {
  if (DEBUG) console.log('[MainStack] render');
  return (
    <Stack.Navigator screenOptions={noHeader}>
      <Stack.Screen name="Home" component={CatTinderScreen} />
      <Stack.Screen name="LastLocation" component={LastLocationScreen} />
    </Stack.Navigator>
  );
}
