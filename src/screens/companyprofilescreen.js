import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Navbar from '../components/Navbar';
import Header from '../components/Header';

export default function CompanyProfileScreen({ navigation }) {
  return (<>
  <Header/>
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image
            source={require('../../assets/img/Logo.png')} // Replace with your logo
            style={styles.logo}
          />
          <Text style={styles.companyName}>IniyaPayanam</Text>
        </View>
      </View>

      {/* About the App */}
      <View style={styles.section}>
        <Text style={styles.title}>About the App</Text>
        <Text style={styles.text}>
          IniyaPayanam is your intelligent travel companion. Our app blends modern technology with cultural insights to create memorable journeys. With features like mood-based itinerary planning (MoodMate), voice translation, local experience discovery, real-time expense tracking, and emergency support — we ensure every trip is smooth, secure, and personalized.
        </Text>
      </View>

      {/* Company Mission */}
      <View style={styles.section}>
        <Text style={styles.title}>Our Mission</Text>
        <Text style={styles.text}>
          We aim to redefine travel through innovation and empathy. Whether you're a solo adventurer or a family explorer, IniyaPayanam brings everything you need for a safe, budget-friendly, and fulfilling journey.
        </Text>
      </View>

      {/* Developer Details */}
      <View style={styles.section}>
        <Text style={styles.title}>Meet the Founders</Text>

        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://example.com/krithika.jpg' }} // Replace with Krithika's photo
            style={styles.profileImage}
          />
          <View style={styles.profileText}>
            <Text style={styles.name}>Krithika Priya P.R.</Text>
            <Text style={styles.role}>Co-Founder & Developer</Text>
            <Text style={styles.text}>
              Krithika is a full-stack developer, creative thinker, and AI enthusiast. She leads the app’s design and logic, ensuring a seamless and intuitive travel experience for users worldwide.
            </Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://example.com/sandhya.jpg' }} // Replace with Sandhya's photo
            style={styles.profileImage}
          />
          <View style={styles.profileText}>
            <Text style={styles.name}>Sandhya A</Text>
            <Text style={styles.role}>Co-Founder & Developer</Text>
            <Text style={styles.text}>
              Sandhya specializes in backend systems, data architecture, and integration. Her dedication to building secure, scalable features helps bring the app’s powerful tools to life.
            </Text>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.title}>Contact Us</Text>
        <Text style={styles.text}>Phone: +91 98765 43210</Text>
        <Text style={styles.text}>Email: support@iniyapayanam.com</Text>
        <Text style={styles.text}>Website: www.iniyapayanam.com</Text>
      </View>
    </ScrollView>
    <Navbar/>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    marginTop:80,
    paddingBottom:180,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    marginLeft: 10,
  },
  headerContent: {
    alignItems: 'center',
    flex: 1,
    marginRight: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  section: {
    marginBottom: 25,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2563eb',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
    color: '#444',
  },
  profileCard: {
    flexDirection: 'row',
    marginTop: 15,
    backgroundColor: '#f1f5f9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'flex-start',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  profileText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  role: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
});
