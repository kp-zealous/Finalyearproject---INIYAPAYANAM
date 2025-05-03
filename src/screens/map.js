import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, Linking, StatusBar, Picker } from "react-native";
import MapView, { Marker, Polyline, Callout } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { StyleSheet } from 'react-native';
import Navbar from '../components/Navbar';
import Header from '../components/Header';

export default function Map() {
  const [location, setLocation] = useState(null);
  const [currlocation, setCurrLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [desaddress, setdesAddress] = useState("");
  const [srcaddress, setsrcAddress] = useState("");
  const [srcCoords, setSrcCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [showstartLocation, setshowstartLocation] = useState(false);
  const [placeInfo, setPlaceInfo] = useState(null);
  const [srcSuggestions, setSrcSuggestions] = useState([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef(null);
  const [travelTime, setTravelTime] = useState(null);
  const [distance, setDistance] = useState(null);
  const [arrivalTime, setArrivalTime] = useState(null);
  const [transportMode, setTransportMode] = useState('car'); // Default transport mode

  useEffect(
    useCallback(() => {
      const getPermissions = async () => {
        let { status } = await Location.getForegroundPermissionsAsync();

        if (status === "granted") {
          let currentLocation = await Location.getCurrentPositionAsync({});
          setCurrLocation(currentLocation);
          setRegion({
            latitude: currentLocation?.coords?.latitude || 37.78825,
            longitude: currentLocation?.coords?.longitude || -122.4324,
            latitudeDelta: 0.0522,
            longitudeDelta: 0.0421,
          });
          return;
        }

        let { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== "granted") {
          setErrorMsg("Permission to access location was denied");
          showPermissionDeniedAlert();
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
        setCurrLocation(currentLocation);
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      };

      getPermissions();
    }, [])
  );

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const showPermissionDeniedAlert = () => {
    Alert.alert(
      "Location Permission Required",
      "This app needs access to your location to function properly. Please enable location permissions in settings.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Open Settings", onPress: () => Linking.openSettings() },
      ]
    );
  };

  const handleClear = () => {
    setdesAddress("");
    setSuggestions([]);
    setRouteCoords([]);
    setDestCoords(null);
    setSrcSuggestions([]);
    setTravelTime(null);
    setDistance(null);
    setArrivalTime(null);
    setRouteCoords(null);
  };

  const getAddressSuggestions = async (query) => {
    const url =
      "https://autosuggest.search.hereapi.com/v1/autosuggest?" +
      "at=" + currlocation?.coords.latitude + "," + currlocation?.coords.longitude +
      "&limit=5&q=" + encodeURIComponent(query) +
      "&apiKey=POEKk48VtQlfNLrBNRi2hhisA2gCvxdkdPABNpsvsck";

    try {
      const response = await axios.get(url);
      setSuggestions(response.data.items || []);
      return response.data.items || [];
    } catch (error) {
      console.error("Autocomplete API Error:", error.response?.data || error.message);
      return [];
    }
  };

  const getStartLocationSuggestions = async (query) => {
    const url =
      "https://autosuggest.search.hereapi.com/v1/autosuggest?" +
      "at=" + currlocation?.coords.latitude + "," + currlocation?.coords.longitude +
      "&limit=5&q=" + encodeURIComponent(query) +
      "&apiKey=POEKk48VtQlfNLrBNRi2hhisA2gCvxdkdPABNpsvsck";

    try {
      const response = await axios.get(url);
      setSrcSuggestions(response.data.items || []);
    } catch (error) {
      console.error('Error fetching suggestions for start location:', error);
    }
  };

  const getRoute = async () => {
    if (!srcCoords || !destCoords) return;

    const apiKey = "POEKk48VtQlfNLrBNRi2hhisA2gCvxdkdPABNpsvsck";
    const apiUrl =
      `https://fleet.ls.hereapi.com/2/calculateroute.json` +
      `?apiKey=${apiKey}` +
      `&mode=fastest;${transportMode};traffic:enabled` +
      `&waypoint0=${srcCoords.latitude},${srcCoords.longitude}` +
      `&waypoint1=${destCoords.latitude},${destCoords.longitude}`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (!data.response || !data.response.route) {
        console.error("Invalid response from HERE Maps API");
        return;
      }

      const routeSummary = data.response.route[0].summary;
      const travelTimeInMinutes = Math.round(routeSummary.travelTime / 60);
      const distanceInKilometers = Math.round(routeSummary.distance / 1000);
      setTravelTime(travelTimeInMinutes);
      setDistance(distanceInKilometers);

      // Calculate time of arrival
      const currentTime = new Date();
      currentTime.setMinutes(currentTime.getMinutes() + travelTimeInMinutes);
      const arrivalTime = currentTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      setArrivalTime(arrivalTime);

      const routeLeg = data.response.route[0].leg[0];
      let routeCoords = [];

      routeLeg.link.forEach((link) => {
        const shape = link.shape;
        for (let i = 0; i < shape.length; i += 2) {
          routeCoords.push({
            latitude: parseFloat(shape[i]),
            longitude: parseFloat(shape[i + 1]),
          });
        }
      });

      setRouteCoords(routeCoords);
    } catch (error) {
      console.error("Error fetching route:", error);
    }
  };

  return (
    <>
    <Header/>
    <View style={styles.container}>
      {region && (
        <MapView style={styles.map} initialRegion={region} zoomControlEnabled showsTraffic showsUserLocation showsMyLocationButton={true}>
          {srcCoords && <Marker coordinate={srcCoords} title="source" pinColor="#4169E1" description={srcaddress} />}
          {destCoords && (
            <Marker coordinate={destCoords} pinColor="#FF6347">
              <Callout>
                <View style={{ padding: 8, maxWidth: 250 }}>
                  <Text style={{ fontSize: 14, color: '#333' }}>Destination: {desaddress || 'Loading...'}</Text>
                </View>
              </Callout>
            </Marker>
          )}
          {routeCoords?.length > 0 && (
            <Polyline coordinates={routeCoords} strokeWidth={5} strokeColor="blue" />
          )}
        </MapView>
      )}

      <View style={styles.searchBoxContainer}>
        <View style={{ position: 'relative', width: '100%' }}>
          <TextInput
            ref={searchInputRef}
            placeholder="Search for a location"
            value={desaddress}
            onChangeText={(text) => {
              getAddressSuggestions(text);
              setdesAddress(text);
            }}
            style={styles.desinput}
            onSubmitEditing={() => setshowstartLocation(true)}
          />
          {desaddress && (
            <TouchableOpacity style={styles.clearButton} onPress={() => setdesAddress('')}>
              <Text style={styles.clearText}>✖</Text>
            </TouchableOpacity>
          )}
        </View>

        {suggestions.length > 0 && (
          <FlatList
            data={suggestions.slice(0, 10)}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setQuery(item.title);
                  setdesAddress(item.title);
                  setDestCoords({ latitude: item.position.lat, longitude: item.position.lng });
                  setSuggestions([]);
                }}
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#ddd",
                  backgroundColor: "#fff",
                }}
              >
                <Text style={{ fontSize: 16, color: "#333" }}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {showstartLocation && (
          <View style={{ position: 'relative', width: '100%' }}>
            <TextInput
              ref={searchInputRef}
              placeholder="Search for a start location"
              value={srcaddress}
              onChangeText={(text) => {
                getStartLocationSuggestions(text);
                setsrcAddress(text);
                setShowDropdown(true);
              }}
              onSubmitEditing={getRoute}
              style={styles.srcinput}
              onFocus={() => setShowDropdown(true)}
            />
            {srcaddress && (
              <TouchableOpacity style={styles.clearButton} onPress={() => setsrcAddress('')}>
                <Text style={styles.clearText}>✖</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {srcSuggestions.length > 0 && (
          <FlatList
            data={srcSuggestions.slice(0, 10)}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setsrcAddress(item.title);
                  setSrcCoords({ latitude: item.position.lat, longitude: item.position.lng });
                  setSrcSuggestions([]);
                }}
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: '#ddd',
                  backgroundColor: '#fff',
                }}
              >
                <Text style={{ fontSize: 16, color: '#333' }}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        )}

        {showDropdown && (
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setsrcAddress('Your Location');
                setSrcCoords({
                  latitude: currlocation?.coords.latitude || 37.78825,
                  longitude: currlocation?.coords.longitude || -122.4324,
                });
                setShowDropdown(false);
              }}
            >
              <Text>Your Location</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.routeContainer}>
        {travelTime && distance && (
          <View style={styles.routeDetailsCard}>
            <Text style={styles.infoText}>Estimated Time: {travelTime} min</Text>
            <Text style={styles.infoText}>Distance: {distance} km</Text>
            {arrivalTime && (
              <Text style={styles.infoText}>Estimated Arrival: {arrivalTime}</Text>
            )}
          </View>
        )}
      </View>

      
    </View>
    <Navbar />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff',paddingTop:50,marginTop:50 },
  map: { flex: 1 },
  searchBoxContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 1,
  },
  desinput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingRight: 35,
  },
  srcinput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingRight: 35,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    padding: 5,
    zIndex: 1,
  },
  clearText: {
    fontSize: 18,
    color: "#888",
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
  },
  dropdownItem: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  routeContainer: {
    margin: 16,
    alignItems: "center",
  },
  routeDetailsCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    alignItems: "flex-start",
    marginBottom:90,
  },
  infoText: {
    fontSize: 16,
    color: "#333",
    marginVertical: 4,
  },
});
