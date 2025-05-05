import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Navbar from '../components/Navbar';
import Header from '../components/Header';
import { collection, getDocs } from 'firebase/firestore';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    console.log('[Auth] Checking authentication status...');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log('[Auth] User is logged in:', currentUser.uid);
        setUser(currentUser);
      } else {
        console.log('[Auth] No user detected. Redirecting to login...');
        navigation.replace('Login');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);




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
            <TouchableOpacity style={styles.tile} onPress={() => navigation.navigate('LocalEvent')}>
  <Ionicons name="calendar" size={30} color="#9C27B0" />
  <Text style={styles.tileText}>Local Events</Text>
</TouchableOpacity>

          </View>


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
});
