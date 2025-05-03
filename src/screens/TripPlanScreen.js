import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { autoPlanTripUsingGemini } from '../helpers/gemini';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
 // This might work depending on your build setup
 import { Asset } from 'expo-asset';
 import Navbar from '../components/Navbar';


function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

//const logoPath = require('../../assets/img/Logo.png');
const logo = Asset.fromModule(require('../../assets/img/Logo.png')).uri;

export default function TripPlanScreen({ route, navigation }) {
  const { trip } = route.params;
  const userId = trip.userId;
  const tripId = trip.tripId;

  const [tripPlan, setTripPlan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previousTripData, setPreviousTripData] = useState(null);

  const db = getFirestore();



  useEffect(() => {
    if (userId && trip && tripId) {
      fetchExistingTripPlan();
    } else {
      Alert.alert('Error', 'Missing required userId or tripId');
    }
  }, [route.params, trip.tripId, userId]);

  const fetchExistingTripPlan = async () => {
    try {
      const docRef = doc(db, 'trip_plans', `${userId}-${trip.tripId}`);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const savedPlan = docSnap.data();
        if (savedPlan.plan) {
          setTripPlan(savedPlan.plan);
          setPreviousTripData(savedPlan.plan);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch trip plan');
    }
  };

  const hasTripDataChanged = () => {
    if (!previousTripData) return true;
    return JSON.stringify(previousTripData) !== JSON.stringify(trip);
  };

  const suggestTripPlan = async () => {
    if (!hasTripDataChanged()) return;

    setLoading(true);
    try {
      const days = calculateDays(trip.startDate, trip.endDate);
      const people = parseInt(trip.travelers, 10);

      const tripDetails = {
        destination: trip.destination,
        budget: trip.budget,
        transportModes: Array.isArray(trip.transportModes)
          ? trip.transportModes
          : trip.transportModes
          ? [trip.transportModes]
          : [],
        days,
        people,
      };

      if (days <= 0) {
        Alert.alert('Invalid Dates', 'Start date must be before end date.');
        return;
      }

      const generatedPlan = await autoPlanTripUsingGemini(tripDetails, trip.tripId);

      if (generatedPlan && generatedPlan.length > 0) {
        setTripPlan(generatedPlan);
        setPreviousTripData(trip);
        saveGeneratedPlanToDB(generatedPlan, tripDetails);
      } else {
        Alert.alert('Plan Generation Failed', 'No trip plan generated.');
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveGeneratedPlanToDB = async (generatedPlan, tripDetails) => {
    try {
      const docRef = doc(db, 'trip_plans', `${userId}-${trip.tripId}`);
      await setDoc(docRef, {
        tripData: tripDetails,
        plan: generatedPlan,
        userId,
        tripId,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const downloadTripPlan = async () => {
    try {
      const docRef = doc(db, 'trip_plans', `${userId}-${trip.tripId}`);
      const docSnap = await getDoc(docRef);
  
      if (!docSnap.exists()) {
        Alert.alert('Not Found', 'No saved trip plan found.');
        return;
      }
      const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };
      
      const { tripData, plan } = docSnap.data();
  
      let htmlContent = `
        <html>
          <head>
            <style>
            @page {
              margin: 30px;
            }
              body {
                font-family: Arial, sans-serif;
                background-color: #F0F8FF;
                padding: 20px;
                color: #333;
              }
              .heading {
                font-size: 22px;
                font-weight: bold;
                color: #007AFF;
                text-align: center;
                margin-bottom: 10px;
              }
              .subheading {
                text-align: center;
                font-size: 16px;
                color: #555;
                margin-bottom: 30px;
              }
              .day-block {
                position: relative;
                margin-bottom: 40px;
                padding-left: 20px;
              }
              .day-header {
                background-color: #fff;
                border: 1px solid #007AFF;
                border-radius: 10px;
                padding: 10px;
                margin-bottom: 10px;
                display: inline-block;
              }
              .day-title {
                font-size: 18px;
                font-weight: bold;
                color: #007AFF;
                margin: 0;
              }
              .date-label {
                font-size: 14px;
                color: #555;
                margin: 2px 0 0 0;
              }
              .activity {
                display: flex;
                align-items: flex-start;
                background-color: #e6f0ff;
                border-radius: 10px;
                padding: 10px;
                margin: 6px 0;
                margin-left: 15px;
              }
              .activity-time {
                font-size: 14px;
                font-weight: 600;
                color: #007AFF;
              }
              .activity-desc {
                font-size: 15px;
                color: #333;
                margin: 2px 0;
              }
              .activity-distance {
                font-size: 13px;
                color: #555;
              }
                .logo {
          display: block;
          margin: 0 auto 20px;
          width: 120px;
          height: 120px;
          border-radius: 50%;  /* Circular shape */
          object-fit: cover;  /* Ensures the logo maintains aspect ratio */
        }
              .footer {
                margin-top: 50px;
                text-align: center;
                font-style: italic;
                font-size: 13px;
                color: #888;
                border-top: 1px solid #ccc;
                padding-top: 10px;
              }
            </style>
          </head>
          <body>
            <img src="${logo}" class="logo" alt="Company Logo" />
            <div class="heading">Trip Plan: ${trip.tripName || tripData.destination}</div>
            <div class="subheading">${formatDate(trip.startDate)} to ${formatDate(trip.endDate)}</div>

      `;
  
      plan.forEach((day) => {
        htmlContent += `
          <div class="day-block">
            <div class="day-header">
              <div class="day-title">Day ${day.day}</div>
              <div class="date-label">${day.date}</div>
            </div>
        `;
  
        day.plan?.forEach((activity) => {
          htmlContent += `
            <div class="activity">
              <div>
                <div class="activity-time">🕒 ${activity.time}</div>
                <div class="activity-desc">${activity.activity}</div>
                <div class="activity-distance">🧭 ${activity.distance}</div>
              </div>
            </div>
          `;
        });
  
        htmlContent += `</div>`;
      });
  
      htmlContent += `
          <div class="footer">Plan generated by IniyaPayanam ✈️</div>
          </body>
        </html>
      `;
  
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
  
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Sharing Unavailable', 'Cannot share the PDF on this device.');
      }
  
    } catch (error) {
      console.error('PDF generation error:', error);
      Alert.alert('Error', 'Failed to generate and share trip plan.');
    }
  };
  

  const renderRoadMapDay = (item) => (
    <View style={styles.roadMapStep}>
      <View style={styles.connectorLine} />
      <View style={styles.dayNode}>
        <Text style={styles.dayBadge}>Day {item.day}</Text>
        <Text style={styles.dateLabel}>{item.date}</Text>
      </View>
      {item.plan && Array.isArray(item.plan) ? (
        item.plan.map((activity, index) => (
          <View key={index} style={styles.activityBubble}>
            <Ionicons name="location-sharp" size={20} color="#007AFF" style={{ marginRight: 6 }} />
            <View>
              <Text style={styles.activityTime}>{activity.time}</Text>
              <Text style={styles.activityText}>{activity.activity}</Text>
              <Text style={styles.activityDistance}>🧭 {activity.distance}</Text>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noActivitiesText}>No activities planned for this day.</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Trip Plan: {trip.tripName || trip.destination}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : tripPlan.length > 0 ? (
        <FlatList
          data={tripPlan}
          renderItem={({ item }) => renderRoadMapDay(item)}
          keyExtractor={(item) => item.day.toString()}
        />
      ) : (
        <View style={styles.noPlan}>
          <Text style={styles.noPlanText}>No plan added yet.</Text>
          <TouchableOpacity style={styles.suggestButton} onPress={suggestTripPlan}>
            <Text style={styles.suggestText}>✨ Suggest Trip Plan</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.downloadButton} onPress={downloadTripPlan}>
        <Text style={styles.downloadText}>📄 Download Trip Plan</Text>
      </TouchableOpacity>
<Navbar/>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 70,
    backgroundColor: '#F0F8FF',
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#007AFF',
    textAlign: 'center',
  },
  loader: {
    marginTop: 30,
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
    width: '100%',
  },
  noPlan: {
    marginTop: 40,
    alignItems: 'center',
  },
  noPlanText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: '#888',
  },
  suggestButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  suggestText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 15,
  },
  downloadText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  roadMapStep: {
    marginBottom: 30,
    paddingLeft: 20,
    position: 'relative',
  },
  connectorLine: {
    position: 'absolute',
    top: 0,
    left: 10,
    width: 2,
    height: '100%',
    backgroundColor: '#007AFF',
    zIndex: -1,
  },
  dayNode: {
    backgroundColor: '#fff',
    borderColor: '#007AFF',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  dayBadge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  dateLabel: {
    fontSize: 14,
    color: '#555',
  },
  activityBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#e6f0ff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 6,
    marginLeft: 15,
  },
  activityTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  activityText: {
    fontSize: 15,
    color: '#333',
  },
  activityDistance: {
    fontSize: 13,
    color: '#555',
  },
});
