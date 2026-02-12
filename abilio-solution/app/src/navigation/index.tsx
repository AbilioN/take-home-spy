import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CatHomeScreen } from '../screens/CatHomeScreen';
import { LastLocationScreen } from '../screens/LastLocationScreen';

export type RootStackParamList = {
  Home: undefined;
  LastLocation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={CatHomeScreen} />
      <Stack.Screen name="LastLocation" component={LastLocationScreen} />
    </Stack.Navigator>
  );
}
