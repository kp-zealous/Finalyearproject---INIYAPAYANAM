import React, { useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import { AudioPlayer } from './Audioplayer'; 
import { Ionicons } from '@expo/vector-icons'; 
import Navbar from '../components/Navbar';// Don't forget this import
import Header from '../components/Header';

const VoiceToVoiceScreen = ({ navigation }) => {
  const [recording, setRecording] = useState(null);
  const [recordedUri, setRecordedUri] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [durationMillis, setDurationMillis] = useState(0);
  const [loading, setLoading] = useState(false);
  const [audioResults, setAudioResults] = useState(null);
  const [playbackObj, setPlaybackObj] = useState(null);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => setDurationMillis(status.durationMillis)
      );

      setRecording(recording);
      setIsRecording(true);
      setRecordedUri(null);
      setAudioResults(null);
    } catch (err) {
      console.error('Recording error:', err);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
      setIsRecording(false);
    } catch (err) {
      console.error('Stop error:', err);
    }
  };

  const playRecordedAudio = async () => {
    try {
      if (playbackObj) {
        await playbackObj.unloadAsync();
        setPlaybackObj(null);
      }
      const { sound } = await Audio.Sound.createAsync(
        { uri: recordedUri },
        { shouldPlay: true }
      );
      setPlaybackObj(sound);
    } catch (err) {
      console.error('Play error:', err);
    }
  };

  const uploadAudio = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', {
        uri: recordedUri,
        name: 'recorded_audio.wav',
        type: 'audio/wav',
      });

      const response = await fetch("http://192.168.29.234:5000/translate", {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      setAudioResults(result);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatMillis = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header/>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>🎤 Voice-to-Voice Translator</Text>

          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.redDot} />
              <Text style={styles.timerText}>Recording... {formatMillis(durationMillis)}</Text>
            </View>
          )}

          {!isRecording && !recordedUri && (
            <TouchableOpacity style={styles.recordButton} onPress={startRecording}>
              <Text style={styles.recordButtonText}>🎙️ Start Recording</Text>
            </TouchableOpacity>
          )}

          {isRecording && (
            <TouchableOpacity style={styles.stopButton} onPress={stopRecording}>
              <Text style={styles.stopButtonText}>⏹️ Stop Recording</Text>
            </TouchableOpacity>
          )}

          {recordedUri && !isRecording && (
            <View style={styles.controlGroup}>
              <TouchableOpacity style={styles.controlButton} onPress={playRecordedAudio}>
                <Text style={styles.controlButtonText}>▶ Play Recording</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={startRecording}>
                <Text style={styles.controlButtonText}>🔁 Re-record</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.controlButton} onPress={uploadAudio}>
                <Text style={styles.controlButtonText}>🚀 Translate</Text>
              </TouchableOpacity>
            </View>
          )}

          {loading && <ActivityIndicator size="large" color="#4169E1" style={{ marginTop: 30 }} />}

          {audioResults && (
            <View style={styles.results}>
              <Text style={styles.resultsTitle}>🌍 Translated Audios</Text>
              {Object.keys(audioResults).filter(key => key !== 'transcript').map((lang) => (
                <View key={lang} style={styles.translationItem}>
                  <Text style={styles.label}>{lang.toUpperCase()}:</Text>
                  <AudioPlayer uri={`http://192.168.29.234:5000/audio/${audioResults[lang].split('/').pop()}`} />
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <Navbar/>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    
  },
  container: {
    flex: 1,
    position: 'relative',
    marginTop:30,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80, // Give space for navbar
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    marginTop:40,
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  redDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'red',
    marginRight: 10,
  },
  timerText: {
    fontSize: 18,
    color: '#444',
  },
  recordButton: {
    backgroundColor: '#4169E1',
    padding: 15,
    borderRadius: 50,
    marginVertical: 20,
  },
  recordButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#FF6347',
    padding: 15,
    borderRadius: 50,
    marginVertical: 20,
  },
  stopButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  controlGroup: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: '#4169E1',
    padding: 15,
    marginVertical: 8,
    width: '80%',
    borderRadius: 10,
    alignItems: 'center',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  results: {
    marginTop: 30,
    width: '100%',
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
  },
  translationItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  navbar: {
    height: 60,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
  },
});

export default VoiceToVoiceScreen;
