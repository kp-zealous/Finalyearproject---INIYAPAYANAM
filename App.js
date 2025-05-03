import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ExpenseScreen from './src/screens/ExpenseTrackerScreen';
import NewTripScreen from './src/screens/NewTripScreen';
import TripListScreen from './src/screens/TripListScreen';
import TripDetailsScreen from './src/screens/TripDetailsScreen';
import EditTripScreen from './src/screens/EditTripScreen';
import Map from './src/screens/map';
import VoiceToVoiceScreen from './src/screens/translator';
import TripPlanScreen from './src/screens/TripPlanScreen';
import EmergencyContactScreen from './src/screens/emergency_contact';
import ProfileScreen from './src/screens/ProfileScreen';
import CompanyProfileScreen from './src/screens/companyprofilescreen'; 
import FeedbackScreen from './src/screens/Complaint';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
          
          {/* Authentication Screens */}
          <Stack.Screen name="Login" component={LoginScreen} />
          
          {/* Main Screens */}
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Expense" component={ExpenseScreen} />
          <Stack.Screen name="NewTrip" component={NewTripScreen} options={{ title: 'Start Trip' }} />
          <Stack.Screen name="TripList" component={TripListScreen} />
          <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
          <Stack.Screen name="EditTrip" component={EditTripScreen} />
          
          {/* Special Screens */}
          <Stack.Screen name="Map" component={Map} />
          <Stack.Screen name="Translator" component={VoiceToVoiceScreen} />
          <Stack.Screen name="TripPlan" component={TripPlanScreen} />
          <Stack.Screen name="EmergencyContact" component={EmergencyContactScreen} options={{ title: 'Emergency Contacts' }} />
          
          {/* Profile Screens */}
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
          <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} options={{ title: 'Company Profile' }} />
          
          {/* Feedback Screen */}
          <Stack.Screen name="ComplaintFeedback" component={FeedbackScreen} options={{ title: 'ComplaintFeedback' }} />
          
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
