import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Dimensions,
} from 'react-native';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../components/Navbar';

const { width } = Dimensions.get('window');

export default function TripListScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return;

    const q = query(
      collection(db, 'trips'),
      where('userId', '==', user.uid),
      orderBy('startDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTrips(list);
      setFilteredTrips(list);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    const results = trips.filter(
      (trip) =>
        trip.destination.toLowerCase().includes(term) ||
        (trip.startDate && trip.startDate.includes(term))
    );
    setFilteredTrips(results);
  }, [search, trips]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB');
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <Text style={styles.title}>🧳 My Trips</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Search destination or date"
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredTrips}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate('TripDetails', {
                trip: item,
                tripId: item.id,
              })
            }
          >
            <View style={styles.cardTop}>
              <Ionicons name="location-sharp" size={20} color="#007AFF" />
              <Text style={styles.tripName}>{item.destination}</Text>
            </View>
            <View style={styles.cardBottom}>
              <Ionicons name="calendar" size={16} color="#666" />
              <Text style={styles.date}>
                {formatDate(item.startDate)} → {formatDate(item.endDate)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.noTrips}>No trips found. Plan your next adventure!</Text>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewTrip')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      <Navbar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F1FA',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  headerWrapper: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#005BBB',
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderColor: '#ccc',
    borderWidth: 1,
    fontSize: 16,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#005BBB',
    marginLeft: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
  },
  noTrips: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
    elevation: 5,
  },
});
