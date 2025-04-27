import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons'; // ✅ Make sure expo/vector-icons is installed

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
      <Text style={styles.title}>🧳 My Planned Trips</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by destination or date"
        value={search}
        onChangeText={setSearch}
      />

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
            <Text style={styles.tripName}>{item.destination}</Text>
            <Text style={styles.date}>
              {formatDate(item.startDate)} → {formatDate(item.endDate)}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.noTrips}>No trips found.</Text>}
      />

      {/* 👇 Floating Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewTrip')} // 👈 make sure this screen exists in your navigator
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
                {/* Bottom Navigation */}
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
  container: { flex: 1, padding: 20, backgroundColor: '#f5f7fa' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007AFF',
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
    width: '110%',
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  card: {
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tripName: { fontSize: 18, fontWeight: 'bold' },
  date: { color: '#555', marginTop: 4 },
  noTrips: { textAlign: 'center', marginTop: 50, color: '#999' },

  // 👇 Floating Action Button Styles
  fab: {
    position: 'absolute',
    bottom: 65,
    right: 30,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
});
