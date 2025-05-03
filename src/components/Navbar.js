import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const Navbar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Ionicons name="home" size={24} color="#007AFF" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Expense')}>
        <Ionicons name="wallet" size={24} color="#007AFF" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Map')}>
        <Ionicons name="map" size={24} color="#007AFF" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Translator')}>
        <Ionicons name="mic" size={24} color="#007AFF" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('TripList')}>
        <Ionicons name="airplane" size={24} color="#007AFF" />
      </TouchableOpacity>
    </View>
  );
};

export default Navbar;

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderColor: '#ccc',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10, // shadow for Android
    shadowColor: '#000', // shadow for iOS
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom:35,
  },
});
