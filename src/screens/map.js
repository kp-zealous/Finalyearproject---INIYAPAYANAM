import React, { useState, useEffect, useRef,useCallback } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, Alert, Linking, StatusBar } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import { StyleSheet } from 'react-native';
import { useFocusEffect } from "@react-navigation/native";

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
  const token = "5bfce60b-d4f0-4ebc-a6e6-096905bad227";

  useEffect(
    useCallback(() => {
      const getPermissions = async () => {
        let { status } = await Location.getForegroundPermissionsAsync();

        if (status === "granted") {
          let currentLocation = await Location.getCurrentPositionAsync({});
          console.log('Map screen focused');
    
          setCurrLocation(currentLocation);
  
          const defaultLatitude = 37.78825;
          const defaultLongitude = -122.4324;
  
          setRegion({
            latitude: currentLocation?.coords?.latitude || defaultLatitude,
            longitude: currentLocation?.coords?.longitude || defaultLongitude,
            latitudeDelta: 0.0922,
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
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      };
  
      getPermissions();
    }, []) // <- empty dependency array to run only on focus
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

  };

  const getAddressSuggestions = async (query) => {
    const url1 =
      "https://autosuggest.search.hereapi.com/v1/autosuggest?" +
      "at=" +
      currlocation?.coords.latitude +
      "," +
      currlocation?.coords.longitude +
      "&limit=5" +
      "&q=" +
      encodeURIComponent(query) +
      "&apiKey=POEKk48VtQlfNLrBNRi2hhisA2gCvxdkdPABNpsvsck";

    try {
      const response = await axios.get(url1);
      setSuggestions(response.data.items || []);
      return response.data.items || [];
    } catch (error) {
      console.error("Autocomplete API Error:", error.response?.data || error.message);
      return [];
    }
  };
  const getStartLocationSuggestions = async (query) => {
    const url =       "https://autosuggest.search.hereapi.com/v1/autosuggest?" +
    "at=" +
    currlocation?.coords.latitude +
    "," +
    currlocation?.coords.longitude +
    "&limit=5" +
    "&q=" +
    encodeURIComponent(query) +
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
      `&mode=fastest;car;traffic:disabled` +
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

      console.log(`Travel Time: ${travelTimeInMinutes} min`);
      console.log(`Distance: ${distanceInKilometers} km`);

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

  const fetchPlaceInfo = async () => {
    if (!desaddress || !token) return;

    try {
      const response = await axios.get(
        `https://atlas.mappls.com/api/places/search/autocomplete?query=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Place Info Response:", response.data);
      setPlaceInfo(response.data);
    } catch (error) {
      console.error("Place info error:", error);
    }
  };

  return (
    <View style={styles.container}>
      {region && (
        <MapView style={styles.map} region={region}>
          {srcCoords && <Marker coordinate={srcCoords} title="Source" />}
          {destCoords && <Marker coordinate={destCoords} title="Destination" />}
          {routeCoords.length > 0 && (
            <Polyline coordinates={routeCoords} strokeWidth={5} strokeColor="blue" />
          )}
        </MapView>
      )}

      <View style={styles.searchBoxContainer}>
        <TextInput
          ref={searchInputRef}
          placeholder="Search for a location"
          value={desaddress}
          onChangeText={(text) => {
            getAddressSuggestions(text);
            setdesAddress(text);
          }}
          onSubmitEditing={fetchPlaceInfo}
          style={styles.desinput}
        />

        {suggestions.length > 0 && (
          <FlatList
            data={suggestions?.slice(0, 10) ?? []}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setQuery(item.title);
                  setdesAddress(item.title);
                  setDestCoords({
                    latitude: item.position.lat,
                    longitude: item.position.lng,
                  });
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
      )}

      {srcSuggestions.length > 0 && (
        <FlatList
          data={srcSuggestions.slice(0, 10)}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setsrcAddress(item.title);
                setSrcCoords({
                  latitude: item.position.lat,
                  longitude: item.position.lng,
                });
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

      {/* Dropdown for "Your Location" */}
      {showDropdown && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => {
              setsrcAddress('Your Location');
              setSrcCoords({
                latitude: currlocation?.coords.latitude||37.78825,
                longitude: currlocation?.coords.longitude||-122.4324,
              });
              setShowDropdown(false);
            }}
          >
            <Text>Your Location</Text>
          </TouchableOpacity>
        </View>
      )}

        {desaddress.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Text style={styles.clearText}>✖</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.routedetails}>
        <TouchableOpacity
          style={styles.routedetailsButton}
          onPress={() => setshowstartLocation(true)}
        >
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
      </View>

      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
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
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingRight: 35, // Ensure space for the ✖ button inside input

  },
  srcinput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingRight: 35, // Ensure space for the ✖ button inside input

  },

  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
  
  },
    clearButton: {
    position:'absolute',
    padding: 5,
    justifyContent:'flex-end',
    right: 8,
  },
  clearText: {
    fontSize: 18,
    color: "#888",
  },

  dropdownItem: {
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  routedetails:{
    backgroundColor:'#fff',
    borderTopEndRadius:30,
    borderStartStartRadius:30,

    height:200,
    position:'absolute',
    width:'100%',
    bottom:0 ,
    justifyContent:'center',

  },
  routedetailsButton:{
    backgroundColor: "#007bff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf:'center',
    borderRadius: 5,
    },
    buttonText: {
      color: "black",
      fontSize: 16,
      fontWeight: "bold",
    },
  
  error: { color: 'red', textAlign: 'center' },
});
