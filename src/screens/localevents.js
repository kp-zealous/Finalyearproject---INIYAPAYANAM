import * as Location from 'expo-location';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert,ActivityIndicator  } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';


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
      
      const [selectedCategory, setSelectedCategory] = useState('Music'); // default category
      const [loading, setLoading] = useState(false);
const [cachedEvents, setCachedEvents] = useState({});


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
  const fetchGeminiEvents = async (city, category) => {
    const today = new Date().toISOString().split('T')[0];

    const prompt = `List 3 upcoming ${category} events in ${city} after today's date in JSON format.give dates after ${today}. Each event should include name, date (after today), and venue. If you don't know real events, generate realistic sample data. Do not add explanations or extra text—only valid JSON.`;
      
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=AIzaSyDNjEOlO7jE-huHBqROYR1PBiimO_kOFuw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      });
  
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log(text);

  
      // Extract JSON string from response text
      const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/); // Matches either an object or an array
      if (jsonMatch) {
        const events = JSON.parse(jsonMatch[0]);
        return events;
      } else {
        throw new Error("Couldn't parse JSON from response");
      }
  
    } catch (error) {
      console.error('Gemini API error:', error);
      Alert.alert('Error', 'Failed to fetch events from Gemini.');
      return [];
    }
  };
        const [events, setEvents] = useState([]);

        const loadEvents = async () => {
          if (cachedEvents[selectedCategory]) {
            setEvents(cachedEvents[selectedCategory]);
            return;
          }
        
          setLoading(true);

          const city = await getUserCity();
          const eventsData = await fetchGeminiEvents(city, selectedCategory);
          setEvents(eventsData);
          setCachedEvents((prev) => ({ ...prev, [selectedCategory]: eventsData }));

          setLoading(false);

        };
          
  useEffect(() => {
    if (selectedCategory) {
      loadEvents();
    }
  }, [selectedCategory]);
  
    
  

    return(
<>
<Header/>
      <View style={styles.container}>
      <Text style={styles.header}>🎉 Discover Local Events</Text>

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
            <Text style={[
              styles.categoryText,
              selectedCategory === category && styles.selectedText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={styles.loader} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <View style={styles.cardHeader}>
                <Ionicons name="calendar-outline" size={20} color="#2196F3" />
                <Text style={styles.eventDate}>{item.date}</Text>
              </View>
              <Text style={styles.eventTitle}>
                <MaterialCommunityIcons name="music-note" size={18} /> {item.name}
              </Text>
              <View style={styles.venueRow}>
                <Ionicons name="location-outline" size={18} color="#666" />
                <Text style={styles.eventVenue}>{item.venue}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
    </>)
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 100, // space for navbar
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 15,
    paddingHorizontal: 10,
  },
  categoryChip: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 5,
  },
  selectedChip: {
    backgroundColor: '#2196F3',
  },
  categoryText: {
    fontWeight: '600',
    color: '#444',
  },
  selectedText: {
    color: '#fff',
  },
  eventCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 10,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#222',
  },
  eventDate: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventVenue: {
    marginLeft: 6,
    color: '#777',
    fontSize: 14,
  },
  loader: {
    marginTop: 40,
  },
});
