import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, Button, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Navbar from '../components/Navbar';
import { Asset } from 'expo-asset';
import Header from '../components/Header';

export default function Emergency_Contact_Screen() {
  const [selectedCountry, setSelectedCountry] = useState('India');
const logo = Asset.fromModule(require('../../assets/img/Logo.png')).uri;
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
  

  const generatePDF = async () => {
    const contactHTML = Object.entries(Contacts[selectedCountry])
      .map(([key, value]) => `<tr><td>${key}</td><td>${value}</td></tr>`)
      .join("");

    const html = `
      <html>
        <head>
          <style>
            .logo {
          display: block;
          margin: 0 auto 20px;
          width: 120px;
          height: 120px;
          border-radius: 50%;  /* Circular shape */
          object-fit: cover;  /* Ensures the logo maintains aspect ratio */
        }
            body { font-family: Arial; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .logo { width: 80px; height: 80px; margin: auto; }
            .title { font-size: 24px; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; }
            th { background-color: #f0f0f0; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${logo}" class="logo" alt="Company Logo" />
            <div class="title">IniyaPayanam - Emergency Contacts (${selectedCountry})</div>
          </div>
          <table>
            <tr><th>Service</th><th>Contact</th></tr>
            ${contactHTML}
          </table>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/img/Logo.png')}
            style={styles.logo}
          />
          <Text style={styles.companyName}>IniyaPayanam</Text>
          <Text style={styles.title}>Emergency Contacts</Text>
        </View>

        {/* Move the Generate PDF Button here */}
        <Button title="Generate PDF" onPress={generatePDF} color="#3b82f6" />

        <View style={styles.pickerContainer}>
          <Text style={styles.label}>Select Country:</Text>
          <Picker
            selectedValue={selectedCountry}
            onValueChange={(itemValue) => setSelectedCountry(itemValue)}
            style={styles.picker}
          >
            {Object.keys(Contacts).map((country) => (
              <Picker.Item label={country} value={country} key={country} />
            ))}
          </Picker>
        </View>

        <View style={styles.card}>
          {Object.entries(Contacts[selectedCountry]).map(([label, number]) => (
            <View style={styles.row} key={label}>
              <Text style={styles.label}>{label}</Text>
              <Text style={styles.number}>{number}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <Navbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom:60,
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
     // Ensures the content inside ScrollView can grow
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    height: 60,
    width: 60,
    borderRadius: 30,
  },
  companyName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2563eb',
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 5,
  },
  picker: {
    height: 60,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
  },
  number: {
    fontWeight: '600',
    color: '#111827',
  },
});
