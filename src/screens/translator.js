import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { AudioPlayer } from './Audioplayer';

const VoiceToVoiceScreen = () => {
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
      const { sound } = await Audio.Sound.createAsync({ uri: recordedUri });
      setPlaybackObj(sound);
      await sound.playAsync();
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
    <View style={styles.container}>
      <Text style={styles.title}>🎤 Voice-to-Voice Translator</Text>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.redDot} />
          <Text style={styles.timerText}>Recording... {formatMillis(durationMillis)}</Text>
        </View>
      )}

      {recording ? (
        <Button title="Stop Recording" onPress={stopRecording} color="#FF6347" />
      ) : !recordedUri ? (
        <Button title="Start Recording" onPress={startRecording} color="#4169E1" />
      ) : (
        <View style={styles.controlGroup}>
          <Button title="▶ Play Recording" onPress={playRecordedAudio} color="#4169E1" />
          <Button title="🔁 Re-record" onPress={startRecording} color="#FFA500" />
          <Button title="🚀 Translate" onPress={uploadAudio} color="#28A745" />
        </View>
      )}

      {loading && <ActivityIndicator size="large" color="#4169E1" style={{ marginTop: 20 }} />}

      {audioResults && (
        <View style={styles.results}>
          <Text style={styles.label}>Spanish:</Text>
          <AudioPlayer uri={audioResults.spanish} />
          <Text style={styles.label}>Turkish:</Text>
          <AudioPlayer uri={audioResults.turkish} />
          <Text style={styles.label}>Japanese:</Text>
          <AudioPlayer uri={audioResults.japanese} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#f2f2f2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
  },
  redDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    marginRight: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#444',
  },
  controlGroup: {
    gap: 10,
    marginTop: 20,
    flexDirection: 'column',
    alignItems: 'center',
  },
  label: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  results: {
    marginTop: 30,
  },
});

export default VoiceToVoiceScreen;
