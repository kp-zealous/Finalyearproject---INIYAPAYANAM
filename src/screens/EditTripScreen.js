import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  StyleSheet
} from 'react-native';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import Navbar from '../components/Navbar';
import Header from '../components/Header';

export default function EditTripScreen({ route, navigation }) {
  const { tripId } = route.params;
  const [loading, setLoading] = useState(true);

  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [budget, setBudget] = useState('');
  const [travelers, setTravelers] = useState('');
  const [transportModes, setTransportModes] = useState({});
  const [travelStyle, setTravelStyle] = useState('fast');
  const [places, setPlaces] = useState('');
  const [notes, setNotes] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const transportOptions = ['bus', 'train', 'flight', 'cab', 'auto', 'owncar', 'metro'];

  useEffect(() => {
    if (!tripId) {
      Alert.alert('Error', 'Trip ID is missing');
      navigation.goBack();
      return;
    }

    const loadTrip = async () => {
      try {
        if (route.params?.trip) {
          populateState(route.params.trip);
          setLoading(false);
          return;
        }

        const docRef = doc(db, 'trips', tripId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          populateState(docSnap.data());
          setLoading(false);
        } else {
          Alert.alert('Error', 'Trip not found');
          navigation.goBack();
        }
      } catch (err) {
        Alert.alert('Error loading trip', err.message);
        navigation.goBack();
      }
    };

    const populateState = (data) => {
      setTripName(data.tripName || '');
      setDestination(data.destination || '');
      setStartDate(new Date(data.startDate));
      setEndDate(new Date(data.endDate));
      setBudget(data.budget || '');
      setTravelers(data.travelers || '');
      setTravelStyle(data.travelStyle || 'fast');
      setPlaces(typeof data.places === 'string' ? data.places : (Array.isArray(data.places) ? data.places.join(', ') : ''));
      setNotes(data.notes || '');

      const modes = {};
      if (Array.isArray(data.transportModes)) {
        data.transportModes.forEach((mode) => modes[mode] = true);
      } else {
        Object.assign(modes, data.transportModes || {});
      }
      setTransportModes(modes);
    };

    loadTrip();
  }, []);

  const toggleTransport = (mode) => {
    setTransportModes((prev) => ({
      ...prev,
      [mode]: !prev[mode],
    }));
  };

  const handleUpdateTrip = async () => {
    try {
      await updateDoc(doc(db, 'trips', tripId), {
        tripName,
        destination,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        budget,
        travelers,
        transportModes,
        travelStyle,
        places: places.split(',').map(p => p.trim()),
        notes,
        updatedAt: new Date().toISOString(),
      });

      Alert.alert('Success', 'Trip updated successfully');
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to update trip');
    }
  };

  const formatDate = (date) => date.toISOString().split('T')[0];

  if (loading) return <Text style={{ margin: 20 }}>Loading trip...</Text>;

  return (
    <>
      <Header />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        <Text style={styles.title}>✏️ Edit Trip</Text>

        <TextInput
          style={styles.input}
          placeholder="Trip Name"
          value={tripName}
          onChangeText={setTripName}
        />
        <TextInput
          style={styles.input}
          placeholder="Destination"
          value={destination}
          onChangeText={setDestination}
        />

        {/* Date Pickers */}
        <TouchableOpacity onPress={() => setShowStartPicker(true)}>
          <Text style={styles.input}>Start Date: {formatDate(startDate)}</Text>
        </TouchableOpacity>
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(e, date) => {
              setShowStartPicker(false);
              if (date) setStartDate(date);
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
            onChange={(e, date) => {
              setShowEndPicker(false);
              if (date) setEndDate(date);
            }}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Budget"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Number of Travelers"
          value={travelers}
          onChangeText={setTravelers}
          keyboardType="numeric"
        />

        {/* Transport Modes */}
        <Text style={styles.sectionTitle}>Transport Modes</Text>
        <View style={styles.checkboxGroup}>
          {transportOptions.map(mode => (
            <View key={mode} style={styles.checkboxRow}>
              <Checkbox
                value={!!transportModes[mode]}
                onValueChange={() => toggleTransport(mode)}
                color={transportModes[mode] ? '#007AFF' : undefined}
              />
              <Text style={styles.checkboxLabel}>
                {mode === 'owncar' ? 'Own Car' : mode.charAt(0).toUpperCase() + mode.slice(1)}
              </Text>
            </View>
          ))}
        </View>

        {/* Travel Style */}
        <Text style={styles.sectionTitle}>Travel Style</Text>
        <View style={styles.radioGroup}>
          {['fast', 'comfort'].map((style) => (
            <TouchableOpacity key={style} style={styles.radioOption} onPress={() => setTravelStyle(style)}>
              <View style={styles.radioCircle}>
                {travelStyle === style && <View style={styles.radioSelected} />}
              </View>
              <Text>{style === 'fast' ? 'Fastest Route' : 'Comfort Trip'}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Places & Notes */}
        <TextInput
          style={styles.input}
          placeholder="Places to visit (comma separated)"
          value={places}
          onChangeText={setPlaces}
        />
        <TextInput
          style={[styles.input, { height: 60 }]}
          placeholder="Notes / Preferences"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <Button title="Update Trip" onPress={handleUpdateTrip} />
      </ScrollView>
      <Navbar />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 70,
    padding: 20,
    backgroundColor: '#f9f9f9',
    paddingBottom: 240,
    marginBottom:90, // Adjusted padding to ensure button visibility
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#007AFF' },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 5,
    marginTop: 10,
  },
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 10,
  },
  checkboxLabel: { marginLeft: 4 },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioCircle: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  radioSelected: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
});
