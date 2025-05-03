import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase'; // Firebase setup
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { collection, getDocs } from 'firebase/firestore';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);

  // Fetch current user authentication status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchTrips(); // Fetch trips data from Firestore after user is authenticated
      } else {
        navigation.replace('Login');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

 const fetchTrips = async () => {
  try {
    const tripsRef = collection(db, 'trip_plans'); // Reference to Firestore collection
    const tripSnapshot = await getDocs(tripsRef);
    const tripList = tripSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Filter trips to only include the current user's trips
    const userTrips = tripList.filter(trip => trip.userId === user.uid);

    setTrips(userTrips); // Set filtered trips to the state
  } catch (error) {
    console.error('Error fetching trips:', error);
  }
};

  

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.replace('Login');
    } catch (error) {
      console.error('Logout error:', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      <Header />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.welcome}>Hi, {user ? user.displayName || user.email : 'Guest'}</Text>
            <Text style={styles.subtitle}>Where are you traveling today?</Text>
          </View>
         
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.tileGrid}>
            <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('Map')}>
              <Ionicons name="map" size={30} color="#007AFF" />
              <Text style={styles.tileText}>Map</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('Translator')}>
              <Ionicons name="language" size={30} color="#4CAF50" />
              <Text style={styles.tileText}>Voice Translator</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('Expense')}>
              <Ionicons name="wallet" size={30} color="#FF9800" />
              <Text style={styles.tileText}>Expense Tracker</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('ComplaintFeedback')}>
              <MaterialCommunityIcons name="comment-question" size={30} color="#FF5722" />
              <Text style={styles.tileText}>Complaint/Feedback</Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal scroll view for trip tiles */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.tripRow}>
              {trips.map((trip) => (
                <TouchableOpacity
                  key={trip.id}
                  style={styles.tripTile}
                  onPress={() => navigation.navigate('TripPlan', { tripId: trip.id })}
                >
                  <Text style={styles.tripTileText}>{trip.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Logout button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      <Navbar />
    </>
  );
}

const tileSize = (Dimensions.get('window').width - 60) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 70,
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  welcome: {
    fontSize: 24,
    fontWeight: '700',
    color: '#007AFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  tile: {
    backgroundColor: '#E3F2FD',
    width: tileSize,
    height: tileSize,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  tileText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  tripRow: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 30,
  },
  tripTile: {
    backgroundColor: '#E1F5FE',
    padding: 12,
    borderRadius: 12,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripTileText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#607D8B',
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
