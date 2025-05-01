import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Ionicons } from '@expo/vector-icons';
import { Dimensions } from 'react-native'; // Added for responsive design

export default function TripDetailsScreen({ route }) {
  const { trip, tripId, userId } = route.params;  // Added userId here
  const navigation = useNavigation();

  // Get screen width
  const screenWidth = Dimensions.get('window').width;

  const handleEdit = () => {
    console.log('Navigating to EditTrip with tripId:', tripId);
    navigation.navigate('EditTrip', { tripId, trip });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Trip',
      'Are you sure you want to delete this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'trips', tripId));
              navigation.goBack();
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Could not delete trip.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const renderPlaces = () => {
    if (Array.isArray(trip.places)) {
      return trip.places.map((p, i) => `Day ${i + 1}: ${p}`).join('\n');
    } else if (typeof trip.places === 'string') {
      return trip.places;
    } else {
      return 'AI will suggest your itinerary';
    }
  };

  const renderTransportModes = () => {
    const modeLabels = {
      bus: 'Bus',
      train: 'Train',
      flight: 'Flight',
      cab: 'Cab',
      auto: 'Auto',
      owncar: 'Own Car',
      metro: 'Metro',
    };

    const modes = trip.transportModes;

    if (!modes) return 'N/A';

    if (Array.isArray(modes)) {
      return modes.map(mode => modeLabels[mode] || mode).join(', ');
    }

    if (typeof modes === 'object') {
      const selected = Object.entries(modes)
        .filter(([_, isSelected]) => isSelected)
        .map(([mode]) => modeLabels[mode] || mode);
      return selected.length > 0 ? selected.join(', ') : 'N/A';
    }

    return 'N/A';
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>🌍 {trip.destination}</Text>
        <Text style={styles.date}>
          {formatDate(trip.startDate)} → {formatDate(trip.endDate)}
        </Text>

        <View style={styles.section}>
          <Text style={styles.label}>Trip Name:</Text>
          <Text style={styles.value}>{trip.tripName || 'Untitled Trip'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Budget:</Text>
          <Text style={styles.value}>₹{trip.budget}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>No. of People:</Text>
          <Text style={styles.value}>{trip.travelers}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Transport:</Text>
          <Text style={styles.value}>{renderTransportModes()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Travel Style:</Text>
          <Text style={styles.value}>
            {trip.travelStyle === 'fast' ? 'Fast Route' : 'Comfort Trip'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Places to Visit:</Text>
          <Text style={[styles.value, { whiteSpace: 'pre-line' }]}>
            {renderPlaces()}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Notes / Preferences:</Text>
          <Text style={styles.value}>{trip.notes || 'None'}</Text>
        </View>

        {/* View Trip Map Button (Always on top) */}
        <TouchableOpacity
          onPress={() => navigation.navigate('TripPlan', { trip, tripId, userId })}  // Passing userId here
          style={styles.mapButton}
        >
          <Text style={styles.mapButtonText}>🗺️ View Trip Map</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Expense', { tripId, userId })} style={styles.mapButton}
        >
          <Text style={styles.mapButtonText}>🗺️ View Trip Expense</Text>
          </TouchableOpacity>

        {/* Buttons Section: Edit and Delete */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={handleEdit} style={styles.button}>
            <Ionicons name="create" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Edit Trip</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDelete} style={styles.buttonDelete}>
            <Ionicons name="trash" size={20} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>Delete Trip</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Navbar */}
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
  container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20, marginBottom: 60 },
  scrollViewContent: {
    paddingBottom: 80, // Space at the bottom for the navbar
  },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 10, color: '#007AFF' },
  date: { fontSize: 18, marginBottom: 20, color: '#666' },
  section: { marginBottom: 15 },
  label: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  value: { fontSize: 16, marginTop: 4, color: '#555' },
  mapButton: {
    marginTop: 20,
    backgroundColor: '#34C759', // Apple green 💚
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  mapButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  // Buttons Section Styling
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '48%', // Ensures they sit side-by-side on large screens
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonDelete: {
    backgroundColor: '#FF3B30',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  // Navbar Styling
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
    width: '100%',
  },
});
