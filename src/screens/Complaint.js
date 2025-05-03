import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Picker } from 'react-native';
import { auth } from '../config/firebase'; // assuming Firebase is used for authentication
import countriesData from '../../countries.json'; // Import the country-state-city data

export default function FeedbackScreen() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [email, setEmail] = useState('');
  const [feedbackType, setFeedbackType] = useState('feedback');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Set the authenticated email
    const user = auth.currentUser;
    if (user) {
      setEmail(user.email);
    }
  }, []);

  const handleSubmit = () => {
    const selectedCountryData = countriesData.countries.find(country => country.name === selectedCountry);
    const selectedStateData = selectedCountryData?.states.find(state => state.name === selectedState);
    const selectedCityData = selectedStateData?.cities.find(city => city.name === selectedCity);

    if (!selectedCityData) {
      Alert.alert('Error', 'Please select a valid city');
      return;
    }

    const recipientEmail = selectedCityData.email;
    const subject = feedbackType === 'feedback' ? 'Feedback' : 'Complaint';
    const body = `Feedback/Complaint Message:\n\n${message}\n\nFrom: ${email}`;

    // Use your method to send the email, for now just show the alert
    Alert.alert('Form Submitted', `Email sent to: ${recipientEmail}\nSubject: ${subject}`);
    // After sending email, you can reset the form
    setMessage('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Submit Feedback or Complaint</Text>

      {/* Country Dropdown */}
      <Picker
        selectedValue={selectedCountry}
        style={styles.input}
        onValueChange={itemValue => {
          setSelectedCountry(itemValue);
          setSelectedState('');
          setSelectedCity('');
        }}
      >
        <Picker.Item label="Select Country" value="" />
        {countriesData.countries.map((country, index) => (
          <Picker.Item key={index} label={country.name} value={country.name} />
        ))}
      </Picker>

      {/* State Dropdown */}
      <Picker
        selectedValue={selectedState}
        style={styles.input}
        onValueChange={itemValue => {
          setSelectedState(itemValue);
          setSelectedCity('');
        }}
      >
        <Picker.Item label="Select State" value="" />
        {selectedCountry &&
          countriesData.countries
            .find(country => country.name === selectedCountry)
            ?.states.map((state, index) => (
              <Picker.Item key={index} label={state.name} value={state.name} />
            ))}
      </Picker>

      {/* City Dropdown */}
      <Picker
        selectedValue={selectedCity}
        style={styles.input}
        onValueChange={itemValue => setSelectedCity(itemValue)}
      >
        <Picker.Item label="Select City" value="" />
        {selectedState &&
          countriesData.countries
            .find(country => country.name === selectedCountry)
            ?.states.find(state => state.name === selectedState)
            ?.cities.map((city, index) => (
              <Picker.Item key={index} label={city.name} value={city.name} />
            ))}
      </Picker>

      {/* Feedback/Complaint Type */}
      <Picker
        selectedValue={feedbackType}
        style={styles.input}
        onValueChange={itemValue => setFeedbackType(itemValue)}
      >
        <Picker.Item label="Feedback" value="feedback" />
        <Picker.Item label="Complaint" value="complaint" />
      </Picker>

      {/* Message Field */}
      <TextInput
        style={styles.textarea}
        placeholder="Enter your message"
        value={message}
        onChangeText={setMessage}
        multiline
      />

      {/* Submit Button */}
      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { height: 50, borderWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 10 },
  textarea: { height: 100, borderWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 10 },
});
