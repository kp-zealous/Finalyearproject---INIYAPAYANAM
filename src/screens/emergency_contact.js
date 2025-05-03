import React, { useState, useEffect } from 'react';
import { View, Text,  Button, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Navbar from '../components/Navbar';
import { StyleSheet } from 'react-native';


 export default function Emergency_Contact_Screen(){
    const [selectedCountry, setSelectedCountry] = useState('India');

    const Contacts={
        "India": {
          "Emergency": "112",
          "Police": "100",
          "Fire": "101",
          "Ambulance": "102",
          "Women Helpline": "1091",
          "Child Helpline": "1098",
          "Senior Citizen Helpline": "14567",
          "Cyber Crime Helpline": "1930",
          "Tourist Helpline": "1363",
          "Mental Health Helpline": "18005990019"
        },
        "USA": {
          "Emergency": "911",
          "Police": "911",
          "Fire": "911",
          "Ambulance": "911",
          "Women Helpline": "1-800-799-7233",
          "Child Helpline": "1-800-422-4453",
          "Senior Citizen Helpline": "1-855-500-3537",
          "Cyber Crime Helpline": "1-844-878-2274",
          "Tourist Helpline": "1-888-407-4747",
          "Mental Health Helpline": "988"
        },
        "UK": {
          "Emergency": "999",
          "Police": "999",
          "Fire": "999",
          "Ambulance": "999",
          "Women Helpline": "0808 2000 247",
          "Child Helpline": "0800 1111",
          "Senior Citizen Helpline": "0800 678 1602",
          "Cyber Crime Helpline": "0300 123 2040",
          "Tourist Helpline": "020 7087 9300",
          "Mental Health Helpline": "116 123"
        },
        "Australia": {
          "Emergency": "000",
          "Police": "000",
          "Fire": "000",
          "Ambulance": "000",
          "Women Helpline": "1800 737 732",
          "Child Helpline": "1800 55 1800",
          "Senior Citizen Helpline": "1800 200 422",
          "Cyber Crime Helpline": "1300 292 371",
          "Tourist Helpline": "1300 555 135",
          "Mental Health Helpline": "13 11 14"
        },
        "Canada": {
          "Emergency": "911",
          "Police": "911",
          "Fire": "911",
          "Ambulance": "911",
          "Women Helpline": "1-800-363-9010",
          "Child Helpline": "1-800-668-6868",
          "Senior Citizen Helpline": "1-800-277-9914",
          "Cyber Crime Helpline": "1-888-495-8501",
          "Tourist Helpline": "1-800-267-8376",
          "Mental Health Helpline": "1-833-456-4566"
        },
        "Ireland": {
          "Emergency": "112",
          "Police": "112",
          "Fire": "112",
          "Ambulance": "112",
          "Women Helpline": "1800 341 900",
          "Child Helpline": "1800 66 66 66",
          "Senior Citizen Helpline": "1800 80 45 91",
          "Cyber Crime Helpline": "1800 265 165",
          "Tourist Helpline": "1800 66 66 66",
          "Mental Health Helpline": "1800 247 247"
        },
        
        "Russia": {
              "Emergency": "112",
              "Police": "102",
              "Fire": "101",
              "Ambulance": "103",
              "Women Helpline": "8-800-7000-600",
              "Child Helpline": "8-800-2000-122",
              "Senior Citizen Helpline": "8-800-200-34-11",
              "Cyber Crime Helpline": "8-800-555-49-43",
              "Tourist Helpline": "8-800-707-93-39",
              "Mental Health Helpline": "8-800-2000-122"
            },
            "UAE": {
              "Emergency": "999",
              "Police": "999",
              "Fire": "997",
              "Ambulance": "998",
              "Women Helpline": "800-7283",
              "Child Helpline": "800-700",
              "Senior Citizen Helpline": "800-7676",
              "Cyber Crime Helpline": "800-2626",
              "Tourist Helpline": "800-4438",
              "Mental Health Helpline": "800-4673"
            },
            "Brazil": {
              "Emergency": "190",
              "Police": "190",
              "Fire": "193",
              "Ambulance": "192",
              "Women Helpline": "180",
              "Child Helpline": "100",
              "Senior Citizen Helpline": "100",
              "Cyber Crime Helpline": "127",
              "Tourist Helpline": "61-2023-5000",
              "Mental Health Helpline": "188"
            },
            "South Africa": {
              "Emergency": "10111",
              "Police": "10111",
              "Fire": "10177",
              "Ambulance": "10177",
              "Women Helpline": "0800 150 150",
              "Child Helpline": "0800 055 555",
              "Senior Citizen Helpline": "0800 203 027",
              "Cyber Crime Helpline": "0860 101 101",
              "Tourist Helpline": "083 123 2345",
              "Mental Health Helpline": "0800 567 567"
            },
            "China": {
              "Emergency": "110",
              "Police": "110",
              "Fire": "119",
              "Ambulance": "120",
              "Women Helpline": "12338",
              "Child Helpline": "12355",
              "Senior Citizen Helpline": "12349",
              "Cyber Crime Helpline": "110",
              "Tourist Helpline": "12301",
              "Mental Health Helpline": "800-810-1117"
            },
            "Japan": {
              "Emergency": "110",
              "Police": "110",
              "Fire": "119",
              "Ambulance": "119",
              "Women Helpline": "0570-070810",
              "Child Helpline": "189",
              "Senior Citizen Helpline": "03-3506-6000",
              "Cyber Crime Helpline": "03-3431-8109",
              "Tourist Helpline": "050-3816-2787",
              "Mental Health Helpline": "0570-064-556"
            },
            "Italy": {
              "Emergency": "112",
              "Police": "112",
              "Fire": "115",
              "Ambulance": "118",
              "Women Helpline": "1522",
              "Child Helpline": "114",
              "Senior Citizen Helpline": "800 995 988",
              "Cyber Crime Helpline": "113",
              "Tourist Helpline": "039 039 323222",
              "Mental Health Helpline": "800 833 833"
            },
            "France": {
              "Emergency": "112",
              "Police": "17",
              "Fire": "18",
              "Ambulance": "15",
              "Women Helpline": "3919",
              "Child Helpline": "119",
              "Senior Citizen Helpline": "3977",
              "Cyber Crime Helpline": "0810 203 405",
              "Tourist Helpline": "01 45 55 80 00",
              "Mental Health Helpline": "3114"
            },
            "Germany": {
              "Emergency": "112",
              "Police": "110",
              "Fire": "112",
              "Ambulance": "112",
              "Women Helpline": "08000 116 016",
              "Child Helpline": "116 111",
              "Senior Citizen Helpline": "0800 470 8090",
              "Cyber Crime Helpline": "0800 266 4357",
              "Tourist Helpline": "030 25 00 23 33",
              "Mental Health Helpline": "0800 111 0111"
            }
          
          
      }
      
      const countryList = Object.keys(Contacts);
      const currentContacts = Contacts[selectedCountry];
    
      const generateHTML = () => {
        let html = `<h1>Emergency Contacts - ${selectedCountry}</h1><ul>`;
        for (const key in currentContacts) {
          html += `<li><strong>${key}:</strong> ${currentContacts[key]}</li>`;
        }
        html += '</ul>';
        return html;
      };
    
      const downloadPDF = async () => {
        const html = generateHTML();
        const { uri } = await Print.printToFileAsync({ html });
        await Sharing.shareAsync(uri);
      };
    
      return (
<ScrollView style={styles.container}>
  <Text style={styles.heading}>Select a Country</Text>

  <Picker
    selectedValue={selectedCountry}
    onValueChange={(itemValue) => setSelectedCountry(itemValue)}
    style={styles.picker}
  >
    {countryList.map((country) => (
      <Picker.Item key={country} label={country} value={country} />
    ))}
  </Picker>

  <Text style={styles.contactSectionTitle}>
    Emergency Contacts for {selectedCountry}
  </Text>

  {Object.entries(currentContacts).map(([key, value]) => (
    <Text key={key} style={styles.contactItem}>
      {key}: {value}
    </Text>
  ))}

  <View style={styles.downloadButton}>
    <Button title="Download as PDF" onPress={downloadPDF} />
  </View>
  <Navbar/>
</ScrollView>
      );
    }
    const styles = StyleSheet.create({
        container: {
          padding: 20,
          backgroundColor: '#f9f9f9',
          flex: 1,
        },
        heading: {
          fontSize: 22,
          fontWeight: 'bold',
          marginBottom: 15,
          color: '#333',
        },
        picker: {
          backgroundColor: '#fff',
          borderRadius: 8,
          marginBottom: 20,
          elevation: 2,
          paddingHorizontal: 10,
        },
        contactSectionTitle: {
          fontSize: 18,
          fontWeight: 'bold',
          marginBottom: 10,
          color: '#444',
        },
        contactItem: {
          fontSize: 16,
          marginBottom: 8,
          backgroundColor: '#fff',
          padding: 12,
          borderRadius: 8,
          elevation: 1,
          color: '#222',
        },
        downloadButton: {
          marginTop: 30,
          borderRadius: 8,
          overflow: 'hidden',
        }
      });
      
 