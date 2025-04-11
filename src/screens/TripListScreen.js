import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';

export default function TripListScreen({ navigation }) {
  const [trips, setTrips] = useState([]);
  const [filteredTrips, setFilteredTrips] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'trips'), orderBy('startDate', 'desc'));
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
      return date.toLocaleDateString('en-GB'); // Format: dd/mm/yyyy
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
                  tripId: item.id, // ✅ Add this line
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
});
