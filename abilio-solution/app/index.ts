import { registerRootComponent } from 'expo';
// Load background location task so defineTask runs at startup (required by expo-task-manager)
import './src/services/backgroundLocationService';
import App from './App';
registerRootComponent(App);
