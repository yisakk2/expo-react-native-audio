import * as React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Dimensions, StatusBar } from "react-native";
import Icon from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import normalize from 'react-native-normalize';
import { AudioContext } from '../context/AudioProvider'
import Slider from '@react-native-community/slider'
import { PlayerButton, RepeatButton, FavoriteButton } from '../components/PlayerButton'
import { convertTime, extractFilenameOnly, findAudioIndex, createRandomOrderList } from '../misc/helper'
import { selectAudio, changeAudio, moveAudio } from '../misc/audioController'
import GestureRecognizer from 'react-native-swipe-gestures'
import AsyncStorage from '@react-native-async-storage/async-storage'

const stream = ({ navigation }) => {
  const [currentPosition, setCurrentPosition] = React.useState(0);
  const context = React.useContext(AudioContext);
  const { playbackPosition, playbackDuration, currentAudio, currentAudioIndex, repeat, shuffle, shuffleOrder, loadFavorite, handleFavorite } = context
  
  const calculateSeebBar = () => {
    if (playbackPosition !== null && playbackDuration !== null) {
      return playbackPosition / playbackDuration
    }
    return 0
  }

  React.useEffect(() => {
    context.loadPreviousAudio()
    if (!context.playlist.length) context.loadPlaylist()
    if (context.playlist.length > 0) loadFavorite(context.currentAudio)
  }, [])

  const switchIconType = () => {
    switch (repeat) {
      case 0:
        return 'norepeat'
      case 1:
        return 'repeat'
      case 2:
        return 'repeatone'
    }
  }

  const handleRepeat = async () => {
    let number = (repeat + 1) % 3
    context.updateState(context, {repeat: number})
    await AsyncStorage.setItem('repeatAndShuffle', JSON.stringify({repeat: number, shuffle: shuffle, shuffleOrder: shuffleOrder}))
  }

  const handleShuffle = async () => {
    let tf = shuffle ? false : true
    let order = tf ? 
                (context.isPlaylistRunning ? 
                  createRandomOrderList(context.activePlaylist.audios.length, findAudioIndex(context.activePlaylist.audios, currentAudioIndex))
                   : createRandomOrderList(context.totalAudioCount, currentAudioIndex) ) 
                : []
    context.updateState(context, {shuffle: tf, shuffleOrder: order})
    await AsyncStorage.setItem('repeatAndShuffle', JSON.stringify({repeat: repeat, shuffle: tf, shuffleOrder: order}))
  }

  const handlePrevious = async () => {
    await changeAudio(context, 'previous')
  }

  const handlePlayPause = async () => {
    await selectAudio(context.currentAudio, context)
  }

  const handleNext = async () => {
    await changeAudio(context, 'next');
  }

  const renderCurrentTime = () => {
    if (!context.soundObj && currentAudio.lastPosition) {
      return convertTime(currentAudio.lastPosition / 1000);
    }
    return convertTime(context.playbackPosition / 1000);
  };

  return (
    <GestureRecognizer
      style={{flex: 1}}
      onSwipeDown={ () => navigation.pop() }
    >
      <SafeAreaView style={styles.container}>
        {/* 헤더입니다 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.pop()}
          >
            <Icon name="chevron-thin-down" size={32} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={() => context.currentAudio ? handleFavorite(context.currentAudio) : {}}
          >
            <FavoriteButton iconType={context.isFavorite ? 'YES' : 'NO'} />
          </TouchableOpacity>
        </View>
        {/* 메인입니다 */}
        <View style={styles.main}>
          <View style={styles.midBannerContainer}>
            <Ionicons name="musical-note" color={'white'} size={normalize(125)} />
          </View>
        </View>
        {/* 타이틀, 시간, 컨트롤러 */}
        <View style={styles.audioPlayerContainer}>
          <Text style={styles.audioTitle}>{context.currentAudio ? extractFilenameOnly(context.currentAudio.filename) : '재생중인 곡이 없습니다.'}</Text>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 15,
            }}
          >
            <Text>{context.currentAudio ? currentPosition ? currentPosition : renderCurrentTime() : '00:00'}</Text>
            <Text>{context.currentAudio ? convertTime(context.currentAudio.duration) : '00:00'}</Text>
          </View>
          <Slider 
            style={{width: Platform.OS === 'android' ? width : width - 12, height: 40}}
            minimumValue={0}
            maximumValue={1}
            value={currentPosition ? currentPosition : calculateSeebBar()}
            minimumTrackTintColor='cornflowerblue'
            maxmiumTrackTintColor="#000"
            thumbTintColor='black'
            disabled={context.currentAudio ? false : true}
            onValueChange={value => {
              setCurrentPosition(
                convertTime(value * context.currentAudio.duration)
              );
            }}
            onSlidingStart={async () => {
              if (!context.isPlaying) return;

              try {
                // await pause(context.playbackObj);
              } catch (error) {
                console.log('error inside onSlidingStart callback', error);
              }
            }}
            onSlidingComplete={async value => {
              await moveAudio(context, value);
              setCurrentPosition(0);
            }}
          />
          {/* 플레이버튼입니다 */}
          <View style={styles.audioController}>
            <RepeatButton 
              onPress={handleRepeat}
              iconType={switchIconType()}
            />
            <PlayerButton iconType='PREV' onPress={handlePrevious} />
            <PlayerButton 
              onPress={handlePlayPause}
              iconType={context.isPlaying ? 'PLAY' : 'PAUSE'}
              size={40} 
            />
            <PlayerButton iconType='NEXT' onPress={handleNext} />
            <MaterialIcons 
              name='shuffle'
              onPress={handleShuffle}
              color={context.shuffle ? 'cornflowerblue' : 'grey'}
              size={32} 
            />
          </View>
        </View>
      </SafeAreaView>
    </GestureRecognizer>
  );
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
  header: {
    width: '100%',
    height: 50,
  },
  main: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    width: 60,
    height: 50,
  },
  favoriteBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 0,
    width: 60,
    height: 50,
  },
  midBannerContainer: {
    width: normalize(250),
    height: normalize(250),
    backgroundColor: 'cornflowerblue',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(125),
  },
  audioTitle: {
    fontSize: 16,
    padding: 15,
  },
  audioPlayerContainer: {
  },
  audioController: {
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 16
  }
});

export default stream