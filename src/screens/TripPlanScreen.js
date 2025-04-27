import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { autoPlanTripUsingGemini } from '../helpers/gemini'; // Correct import
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore'; // Firebase SDK for Firestore

// Function to calculate the number of days between start and end dates
function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)); // Returns the number of days
}

export default function TripPlanScreen({ route, navigation }) {
  const { trip, userId } = route.params; // Assumed userId is passed from the previous screen
  console.log('UserID:', userId);
  console.log('TripID:', trip.tripId);

  const [tripPlan, setTripPlan] = useState([]); // Holds the trip plan
  const [loading, setLoading] = useState(false);
  const [previousTripData, setPreviousTripData] = useState(null); // To check if trip data has changed

  const db = getFirestore(); // Initialize Firestore

  useEffect(() => {
    console.log('Route Params:', route.params); // Add this to check what is being passed
    if (route.params) {
      const { trip, userId } = route.params;
      console.log('UserID:', userId);
      console.log('TripID:', trip.tripId);
    }
    if (userId && trip && trip.tripId) {
      fetchExistingTripPlan();
    } else {
      console.error('userId or trip.tripId is missing');
      Alert.alert('Error', 'Missing required userId or tripId');
    }
  }, [route.params, trip.tripId, userId]);
  
  

  // Fetch existing trip plan from Firestore
  const fetchExistingTripPlan = async () => {
    try {
      if (!userId || !trip.tripId) {
        console.error('userId or trip.tripId is missing');
        return; // Early exit if required data is missing
      }
  
      const docRef = doc(db, 'trip_plans', `${userId}-${trip.tripId}`);
      console.log(`Fetching data for: ${userId}-${trip.tripId}`);
  
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        const savedPlan = docSnap.data();
        console.log('Fetched data:', savedPlan);
        
        if (savedPlan.plan && savedPlan.tripDetails) {
          setTripPlan(savedPlan.plan);
          setPreviousTripData(savedPlan.tripDetails);
        } else {
          console.log('Missing plan or tripDetails in the data');
        }
      } else {
        console.log('No document found for this trip.');
        // Handle the case when no data is found (you could show a message or create a new plan)
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to fetch trip plan');
    }
  };
  

  // Check if the trip data has changed
  const hasTripDataChanged = () => {
    if (!previousTripData) return true;
    return JSON.stringify(previousTripData) !== JSON.stringify(trip);
  };

  // Suggest a new trip plan using Gemini API
  const suggestTripPlan = async () => {
    if (!hasTripDataChanged()) {
      console.log('Trip data has not changed, skipping plan regeneration');
      return;
    }

    setLoading(true);
    try {
      if (!trip || !trip.destination || !trip.budget || !trip.transportModes || !trip.startDate || !trip.endDate || !trip.travelers || !trip.tripName) {
        Alert.alert('Missing Required Fields', 'Please check that all required trip details are provided.');
        return;
      }

      const days = calculateDays(trip.startDate, trip.endDate);
      const people = parseInt(trip.travelers, 10);

      const tripDetails = {
        destination: trip.destination,
        budget: trip.budget,
        transportModes: trip.transportModes,
        days: days,
        people: people,
      };

      if (days <= 0) {
        Alert.alert('Invalid Dates', 'The trip start date must be before the end date.');
        return;
      }

      const generatedPlan = await autoPlanTripUsingGemini(tripDetails, trip.tripId); // Using the imported function

      if (!generatedPlan || generatedPlan.length === 0) {
        console.error('No trip plan generated.');
        Alert.alert('Plan Generation Failed', 'No trip plan generated. Please check the input or the service.');
      } else {
        setTripPlan(generatedPlan);
        console.log('Generated Plan:', generatedPlan);
        setPreviousTripData(trip);
        saveGeneratedPlanToDB(generatedPlan, tripDetails);
      }
    } catch (error) {
      console.error('Error generating trip plan:', error);
      Alert.alert('Error', 'Error generating trip plan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Save generated trip plan to Firestore
  const saveGeneratedPlanToDB = async (generatedPlan, tripDetails) => {
    try {
      const docRef = doc(db, 'trip_plans', `${userId}-${trip.tripId}`);
      await setDoc(docRef, {
        tripData: tripDetails,
        plan: generatedPlan,
        userId: userId,
        tripId: trip.tripId,
        createdAt: new Date().toISOString(),
      });
      console.log('Trip plan saved successfully!');
    } catch (error) {
      console.error('Error saving trip plan:', error);
      Alert.alert('Error', 'Error saving trip plan: ' + error.message);
    }
  };

  // Render a day of the trip
  const renderRoadMapDay = (item) => {
    return (
      <View style={styles.dayCard}>
        <View style={styles.roadMapHeader}>
          <Text style={styles.dayTitle}>Day {item.day}</Text>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
        {item.activities && Array.isArray(item.activities) && item.activities.length > 0 ? (
          item.activities.map((activity, index) => (
            <View key={index} style={styles.placeItem}>
              <Text style={styles.timeText}>{activity.time}</Text>
              <Text style={styles.placeText}>{activity.activity}</Text>
              <Text style={styles.placeDetails}>Distance: {activity.distance}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.placeText}>No activities for this day.</Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Trip Plan: {trip.tripName || trip.destination}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : tripPlan.length > 0 ? (
        <FlatList
          data={tripPlan}
          renderItem={({ item }) => renderRoadMapDay(item)} // Use renderRoadMapDay function here
          keyExtractor={(item) => item.day.toString()}
        />
      ) : (
        <View style={styles.noPlan}>
          <Text style={styles.noPlanText}>No plan added yet.</Text>
          <TouchableOpacity style={styles.suggestButton} onPress={suggestTripPlan}>
            <Text style={styles.suggestText}>✨ Suggest Trip Plan</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Expense')}>
          <Ionicons name="wallet" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Map')}>
          <Ionicons name="map" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('translator')}>
          <Ionicons name="mic" size={24} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('TripList')}>
          <Ionicons name="airplane" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 50,
    paddingBottom: 560,
    backgroundColor: '#F9F9F9',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007AFF',
    textAlign: 'center',
  },
  loader: {
    marginTop: 30,
  },
  navbar: {
    position: 'absolute',
    bottom: 0,
    height: 60,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '130%',
  },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  roadMapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#777',
  },
  placeItem: {
    flexDirection: 'column',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
  },
  placeText: {
    fontSize: 16,
    color: '#444',
  },
  placeDetails: {
    fontSize: 14,
    color: '#777',
  },
  noPlan: {
    marginTop: 40,
    alignItems: 'center',
  },
  noPlanText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#888',
  },
  suggestButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  suggestText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
