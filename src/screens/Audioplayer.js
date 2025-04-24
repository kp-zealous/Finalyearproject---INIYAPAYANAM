import React from 'react';
import { Audio } from 'expo-av';
import { Button } from 'react-native';

export const AudioPlayer = ({ uri }) => {
  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
  };

  return <Button title="Play" onPress={playSound} />;
};
