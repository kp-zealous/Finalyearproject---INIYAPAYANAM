// Updated NewTripScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getAuth } from 'firebase/auth';
import { db } from '../config/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

export default function NewTripScreen({ navigation }) {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [budget, setBudget] = useState('');
  const [travelers, setTravelers] = useState('');
  const [tripName, setTripName] = useState('');
  const [transportModes, setTransportModes] = useState({
    bus: false,
    train: false,
    flight: false,
    cab: false,
    auto: false,
    owncar: false,
  });
  const [travelStyle, setTravelStyle] = useState('fast');
  const [places, setPlaces] = useState('');
  const [notes, setNotes] = useState('');

  const toggleTransport = (mode) => {
    setTransportModes((prev) => ({ ...prev, [mode]: !prev[mode] }));
  };

  const formatDate = (date) => date.toISOString().split('T')[0];

  const handleStartTrip = async () => {
    if (!destination || !budget || !travelers) {
      Alert.alert('Missing Info', 'Please fill in all required fields.');
      return;
    }

    const selectedModes = Object.keys(transportModes)
      .filter((key) => transportModes[key])
      .map((k) => (k === 'owncar' ? 'Own Car' : k.charAt(0).toUpperCase() + k.slice(1)));

    const tripRef = doc(collection(db, 'trips'));
    const tripId = tripRef.id;

    const tripData = {
      tripId,
      tripName: tripName || `Trip to ${destination}`,
      destination,
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      budget,
      travelers,
      transportModes: selectedModes,
      travelStyle,
      places,
      notes,
      createdAt: new Date().toISOString(),
      userId: getAuth().currentUser?.uid || 'guest',
    };

    try {
      await setDoc(tripRef, tripData);
      Alert.alert('Success', 'Trip saved successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding trip:', error);
      Alert.alert('Error', 'Failed to save trip. Try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🚀 Plan Your Trip</Text>
      <TextInput style={styles.input} placeholder="Trip Name" value={tripName} onChangeText={setTripName} />
      <TextInput style={styles.input} placeholder="Destination" value={destination} onChangeText={setDestination} />
      <TouchableOpacity onPress={() => setShowStartPicker(true)}>
        <Text style={styles.input}>Start Date: {formatDate(startDate)}</Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, selectedDate) => {
            setShowStartPicker(false);
            if (selectedDate) setStartDate(selectedDate);
          }}
        />
      )}
      <TouchableOpacity onPress={() => setShowEndPicker(true)}>
        <Text style={styles.input}>End Date: {formatDate(endDate)}</Text>
      </TouchableOpacity>
      {showEndPicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, selectedDate) => {
            setShowEndPicker(false);
            if (selectedDate) setEndDate(selectedDate);
          }}
        />
      )}
      <TextInput style={styles.input} placeholder="Budget (₹)" value={budget} onChangeText={setBudget} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Number of People" value={travelers} onChangeText={setTravelers} keyboardType="numeric" />

      <Text style={styles.sectionTitle}>Preferred Transport</Text>
      <View style={styles.checkboxGroup}>
        {['bus', 'train', 'flight', 'cab', 'auto', 'owncar'].map((mode) => (
          <View key={mode} style={styles.checkboxRow}>
            <Checkbox
              value={transportModes[mode]}
              onValueChange={() => toggleTransport(mode)}
              color={transportModes[mode] ? '#007AFF' : undefined}
            />
            <Text style={styles.checkboxLabel}>{mode === 'owncar' ? 'Own Car' : mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Travel Style</Text>
      <View style={styles.radioGroup}>
        {['fast', 'comfort'].map((style) => (
          <TouchableOpacity key={style} style={styles.radioOption} onPress={() => setTravelStyle(style)}>
            <View style={styles.radioCircle}>{travelStyle === style && <View style={styles.radioSelected} />}</View>
            <Text>{style === 'fast' ? 'Fastest Route' : 'Comfort Trip'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={styles.input} placeholder="Places to visit (optional)" value={places} onChangeText={setPlaces} />
      <TextInput style={[styles.input, { height: 60 }]} placeholder="Notes / Preferences (optional)" value={notes} onChangeText={setNotes} multiline />

      <Button title="Start Trip" onPress={handleStartTrip} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#f5f7fa', flexGrow: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#007AFF' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#ccc' },
  sectionTitle: { fontWeight: '600', fontSize: 16, marginBottom: 5, marginTop: 10 },
  checkboxGroup: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginRight: 15, marginBottom: 10 },
  checkboxLabel: { marginLeft: 4 },
  radioGroup: { flexDirection: 'row', marginBottom: 15 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  radioCircle: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#007AFF', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  radioSelected: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#007AFF' },
});