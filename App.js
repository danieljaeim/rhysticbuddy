import HomeScreen from './HomeScreen.js';
import GameScreen from './GameScreen.js';
import { GuessScreen } from './GuessScreen.js';
import { StyleSheet, Text, View } from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Game" component={GameScreen} />
          {/* <Stack.Screen name="Guess" component={GuessScreen}/> */}
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
