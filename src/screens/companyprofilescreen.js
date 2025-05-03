import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CompanyProfileScreen({ navigation }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Image
            source={require('../../assets/img/Logo.png') } // Replace with your logo
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

      {/* Company Description */}
      <View style={styles.section}>
        <Text style={styles.title}>Our Mission</Text>
        <Text style={styles.text}>
          We aim to redefine travel through innovation and empathy. Whether you're a solo adventurer or a family explorer, IniyaPayanam brings everything you need for a safe, budget-friendly, and fulfilling journey.
        </Text>
      </View>

      {/* Developer Details */}
      <View style={styles.section}>
        <Text style={styles.title}>Meet the Team</Text>

        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://example.com/developer.jpg' }} // Replace with developer photo
            style={styles.profileImage}
          />
          <View style={styles.profileText}>
            <Text style={styles.name}>Krithika R</Text>
            <Text style={styles.role}>Lead Developer</Text>
            <Text style={styles.text}>
              Krithika is a passionate full-stack developer and AI enthusiast. With a strong background in mobile app development and design thinking, she leads the creation of intuitive, user-friendly travel features.
            </Text>
          </View>
        </View>

        <View style={styles.profileCard}>
          <Image
            source={{ uri: 'https://example.com/owner.jpg' }} // Replace with owner photo
            style={styles.profileImage}
          />
          <View style={styles.profileText}>
            <Text style={styles.name}>S. Aravind</Text>
            <Text style={styles.role}>Founder & Visionary</Text>
            <Text style={styles.text}>
              Aravind brings the vision of smarter, safer travel to life. With a background in entrepreneurship and cultural research, he ensures the app stays rooted in traveler needs and values.
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
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
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
