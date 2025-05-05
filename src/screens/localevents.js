import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';


export default function LocalEvent(){
    const categories = ['Music', 'Food', 'Arts', 'Business', 'Health', 'Sports'];
    const categoryMap = {
        'Music': '103',
        'Food': '110',
        'Arts': '105',
        'Business': '101',
        'Health': '107',
        'Sports': '108',
      };
      
const [selectedCategory, setSelectedCategory] = useState('');
const getUserCity = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required to find local events.');
      return;
    }
  
    const location = await Location.getCurrentPositionAsync({});
    const geocode = await Location.reverseGeocodeAsync(location.coords);
    return geocode[0]?.city || 'Chennai';
  };
  const fetchEvents = async (city, categoryKeyword) => {
    const apiKey = 'YOUR_TICKETMASTER_API_KEY'; // Replace with your actual key
  
    try {
      const response = await fetch(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&city=${city}&keyword=${categoryKeyword}`
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      const events = data._embedded?.events || [];
      console.log('Ticketmaster Events:', events);
      return events;
    } catch (error) {
      console.error('Error fetching Ticketmaster events:', error);
      Alert.alert('Error', 'Could not load events at this time.');
      return [];
    }
  };
      const [events, setEvents] = useState([]);

  const loadEvents = async () => {
    const city = await getUserCity();
    const eventsData = await fetchEvents(city, categories);
    setEvents(eventsData);
  };
  
  useEffect(() => {
    if (selectedCategory) {
      loadEvents();
    }
  }, [selectedCategory]);
  
    
  

    return(
    <View>
        <View style={styles.categoryContainer}>
  {categories.map((category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryChip,
        selectedCategory === category && styles.selectedChip,
      ]}
      onPress={() => setSelectedCategory(category)}
    >
      <Text style={styles.categoryText}>{category}</Text>
    </TouchableOpacity>
  ))}
</View>
<FlatList
  data={events}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <View style={styles.eventCard}>
      <Text style={styles.eventTitle}>{item.name.text}</Text>
      <Text style={styles.eventDate}>{new Date(item.start.local).toLocaleString()}</Text>
      <Text style={styles.eventVenue}>{item.venue?.name}</Text>
    </View>
  )}
/>



    </View>)
}
const styles = StyleSheet.create({
    categoryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginVertical: 10,
    },
    categoryChip: {
      backgroundColor: '#ddd',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      margin: 5,
    },
    selectedChip: {
      backgroundColor: '#2196F3',
    },
    categoryText: {
      color: '#000',
      fontWeight: 'bold',
    },
    eventCard: {
      backgroundColor: '#fff',
      margin: 10,
      padding: 15,
      borderRadius: 10,
      elevation: 3,
    },
    eventTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    eventDate: {
      fontSize: 14,
      color: '#555',
    },
    eventVenue: {
      fontSize: 14,
      color: '#888',
    },
  });
  