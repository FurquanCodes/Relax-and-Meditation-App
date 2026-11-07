import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Breathing: undefined;
  Meditation: undefined;
  Sounds: undefined;
  Settings: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

