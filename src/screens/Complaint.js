import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { auth } from '../config/firebase';
import countriesData from '../../countries.json';
import Header from '../components/Header';
import Navbar from '../components/Navbar';

export default function FeedbackComplaintScreen() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isFeedback, setIsFeedback] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) setEmail(user.email);
  }, []);

  const handleToggle = (feedback) => {
    setIsFeedback(feedback);
    setSelectedCountry('');
    setSelectedState('');
    setSelectedCity('');
    setMessage('');
  };

  const handleSubmit = () => {
    if (!selectedCountry || !selectedState || !selectedCity || !message.trim()) {
      Alert.alert('Missing Information', 'Please fill in all the fields.');
      return;
    }

    const country = countriesData.countries.find(c => c.name === selectedCountry);
    const state = country?.states.find(s => s.name === selectedState);
    const city = state?.cities.find(c => c.name === selectedCity);

    if (!city) {
      Alert.alert('Error', 'Invalid city selection');
      return;
    }

    const recipientEmail = isFeedback ? city.feedback_email : city.complaint_email;
    const subject = isFeedback ? 'Feedback' : 'Complaint';
    const body = `${subject} Message:\n\n${message}\n\nFrom: ${email}`;

    // Send email using backend/email API here (not implemented in this snippet)

    Alert.alert('Submitted', `Email sent!`);
    setMessage('');
  };

  return (
    <>
    <Header/>
    <View style={styles.container}>
      <Text style={styles.title}>{isFeedback ? 'Submit Feedback' : 'Submit Complaint'}</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, isFeedback && styles.activeButton]}
          onPress={() => handleToggle(true)}
        >
          <Text style={isFeedback ? styles.activeButtonText : styles.buttonText}>Feedback</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, !isFeedback && styles.activeButton]}
          onPress={() => handleToggle(false)}
        >
          <Text style={!isFeedback ? styles.activeButtonText : styles.buttonText}>Complaint</Text>
        </TouchableOpacity>
      </View>

      <Picker
        selectedValue={selectedCountry}
        style={styles.input}
        onValueChange={(val) => {
          setSelectedCountry(val);
          setSelectedState('');
          setSelectedCity('');
        }}
      >
        <Picker.Item label="Select Country" value="" />
        {countriesData.countries.map((country, idx) => (
          <Picker.Item key={idx} label={country.name} value={country.name} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedState}
        style={styles.input}
        onValueChange={(val) => {
          setSelectedState(val);
          setSelectedCity('');
        }}
        enabled={selectedCountry !== ''}
      >
        <Picker.Item label="Select State" value="" />
        {selectedCountry &&
          countriesData.countries
            .find(c => c.name === selectedCountry)
            ?.states.map((state, idx) => (
              <Picker.Item key={idx} label={state.name} value={state.name} />
            ))}
      </Picker>

      <Picker
        selectedValue={selectedCity}
        style={styles.input}
        onValueChange={(val) => setSelectedCity(val)}
        enabled={selectedState !== ''}
      >
        <Picker.Item label="Select City" value="" />
        {selectedState &&
          countriesData.countries
            .find(c => c.name === selectedCountry)
            ?.states.find(s => s.name === selectedState)
            ?.cities.map((city, idx) => (
              <Picker.Item key={idx} label={city.name} value={city.name} />
            ))}
      </Picker>

      <TextInput
        style={styles.textarea}
        placeholder={`Enter your ${isFeedback ? 'feedback' : 'complaint'} message`}
        value={message}
        onChangeText={setMessage}
        multiline
      />

      <Button title="Submit" onPress={handleSubmit} />
    </View>
    <Navbar/>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  toggleButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    width: '45%',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#007bff',
  },
  buttonText: {
    color: '#333',
    fontWeight: '600',
  },
  activeButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  input: {
    height: 60,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  textarea: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
});
