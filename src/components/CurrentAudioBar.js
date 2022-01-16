import * as React from 'react';
import { TouchableOpacity, StyleSheet, Text, View } from "react-native";
import { extractFilenameOnly } from '../misc/helper';
import { PlayerButton } from '../components/PlayerButton'

const CurrentAudioBar = ({ navigateStream, navigateActivePlaylist, title, handlePrevious, handlePlayPause, handleNext, isPlaying }) => {
  return (
    <TouchableOpacity
      style={styles.musicTabBox}
      onPress={navigateStream}
    >
      <Text style={styles.audioTitle}>{title}</Text>
      <View style={styles.audioController}>
        <PlayerButton
          onPress={handlePrevious}
          iconType='PREV' 
          size={28} 
        />
        <PlayerButton 
          onPress={handlePlayPause}
          iconType={isPlaying ? 'PLAY' : 'PAUSE'}
        />
        <PlayerButton 
          onPress={handleNext}
          iconType='NEXT' 
          size={28} 
        />
        <PlayerButton 
          onPress={navigateActivePlaylist}
          iconType='LIST'
        />
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  musicTabBox: {
    flexDirection: 'row',
    width: '100%',
    height: 60,
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderColor: '#f0efef'
  },
  audioTitle: {
    width: '45%',
    height: '100%',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 28,
    padding: 16,
  },
  audioController: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flexDirection: 'row',
  }
});

export default CurrentAudioBar