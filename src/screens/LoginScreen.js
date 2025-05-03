import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Login successful");
      navigation.navigate('Home');
    } catch (error) {
      console.error(error);
      Alert.alert("Login error", error.message);
    }
  };

  const handleRegister = async () => {
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters long.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      Alert.alert("Registered & logged in");
      navigation.navigate('Home');
    } catch (error) {
      console.error(error);
      Alert.alert("Registration error", error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Image
          source={require('../../assets/img/Logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Iniyapayanam</Text>

        {isRegistering && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Button
          title={isRegistering ? "Register" : "Login"}
          onPress={isRegistering ? handleRegister : handleLogin}
        />

        <TouchableOpacity onPress={() => setIsRegistering(!isRegistering)}>
          <Text style={styles.link}>
            {isRegistering ? "Already have an account? Login" : "New user? Sign up"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 10, borderRadius: 5
  },
  link: {
    marginTop: 15,
    color: '#007AFF',
    textAlign: 'center',
    fontSize: 16
  },
  logo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 20
  }
});
