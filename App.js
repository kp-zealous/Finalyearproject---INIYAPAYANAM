import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Platform } from 'react-native'; 
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ExpenseScreen from './src/screens/ExpenseTrackerScreen'; // if it exists
import NewTripScreen from './src/screens/NewTripScreen';
import TripListScreen from './src/screens/TripListScreen';
import TripDetailsScreen from './src/screens/TripDetailsScreen';
import EditTripScreen from './src/screens/EditTripScreen'; // ✅ Adjust path as needed
import Map from'./src/screens/map';
import VoiceToVoiceScreen from './src/screens/translator';
import TripPlanScreen from './src/screens/TripPlanScreen'; 
import Emergency_Contact_Screen from './src/screens/emergency_contact';
import ProfileScreen from './src/screens/ProfileScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Expense" component={ExpenseScreen} />
          <Stack.Screen name="NewTrip" component={NewTripScreen} options={{ title: 'Start Trip' }} />
          <Stack.Screen name="TripList" component={TripListScreen} />
          <Stack.Screen name="EditTrip" component={EditTripScreen} />    
          <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
          <Stack.Screen name="Map" component={Map} />
          <Stack.Screen name="translator" component={VoiceToVoiceScreen} />
          <Stack.Screen name="TripPlan" component={TripPlanScreen} />
          <Stack.Screen name="emergency_contact" component={Emergency_Contact_Screen} />
          <Stack.Screen name="Profile" component={ProfileScreen} /> 
     
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
