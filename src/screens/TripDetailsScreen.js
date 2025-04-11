    import React from 'react';
    import {
        View,
        Text,
        StyleSheet,
        ScrollView,
        TouchableOpacity,
        Alert, // ✅ ADDED THIS
      } from 'react-native';
    import { useNavigation } from '@react-navigation/native';
    import { doc, deleteDoc } from 'firebase/firestore'; // ✅ ADDED THIS
    import { db } from '../config/firebase'; // ✅ make sure this is correct path

    export default function TripDetailsScreen({ route }) {
    const { trip, tripId } = route.params;
    const navigation = useNavigation();

    const handleEdit = () => {
        console.log('Navigating to EditTrip with tripId:', tripId); // 👈 Add this
        navigation.navigate('EditTrip', { tripId, trip }); // pass both
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
                  navigation.goBack(); // ✅ Go back after deleting
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
          metro: 'Metro'
        };
      
        const modes = trip.transportModes;
      
        if (!modes) return 'N/A';
      
        if (Array.isArray(modes)) {
          // If transportModes is stored as array like ['bus', 'train']
          return modes.map(mode => modeLabels[mode] || mode).join(', ');
        }
      
        if (typeof modes === 'object') {
          // If stored as { bus: true, train: false, ... }
          const selected = Object.entries(modes)
            .filter(([_, isSelected]) => isSelected)
            .map(([mode]) => modeLabels[mode] || mode);
          return selected.length > 0 ? selected.join(', ') : 'N/A';
        }
      
        return 'N/A';
      };
      

    return (
        <ScrollView style={styles.container}>
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
            <Text style={[styles.value, { whiteSpace: 'pre-line' }]}>{renderPlaces()}</Text>
        </View>

        <View style={styles.section}>
            <Text style={styles.label}>Notes / Preferences:</Text>
            <Text style={styles.value}>{trip.notes || 'None'}</Text>
        </View>

        <TouchableOpacity onPress={handleEdit} style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Trip</Text>
        </TouchableOpacity>
        
      <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
        <Text style={styles.deleteButtonText}>Delete Trip</Text>
      </TouchableOpacity>
        </ScrollView>
    );
    }

    const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, color: '#007AFF' },
    date: { fontSize: 16, marginBottom: 20 },
    section: { marginBottom: 15 },
    label: { fontWeight: 'bold', fontSize: 16 },
    value: { fontSize: 15, marginTop: 4 },
    editButton: {
        marginTop: 20,
        backgroundColor: '#007AFF',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    deleteButton: {
        marginTop: 10,
        backgroundColor: '#FF3B30',
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
      },
      deleteButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
      },
    });
