import React, { Component, createContext } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import * as MediaLibrary from 'expo-media-library'
import { DataProvider } from 'recyclerlistview'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Audio } from 'expo-av'
import { playNext } from '../misc/audioController'
import { storeAudioForNextOpening, findAudioIndex } from '../misc/helper';

export const AudioContext = createContext();

export class AudioProvider extends Component {
  constructor(props) {
    super(props)
    this.state = {
      audioFiles: [],
      playlist: [],
      activePlaylist: {},
      addToPlaylist: null,
      permissionError: false,
      dataProvider: new DataProvider((r1, r2) => r1 !== r2),
      playbackObj: null,
      soundObj: null,
      currentAudio: {},
      isPlaying: false,
      isPlaylistRunning: false,
      currentAudioIndex: null,
      playbackPosition: null,
      playbackDuration: null,
      repeat: 0,
      shuffle: false,
      shuffleOrder: [],
      isFavorite: false,
    }
    this.totalAudioCount = 0
  }

  permissionAllert = () => {
    Alert.alert('Permission Required', 'This app needs to read audio files!', [
      {
        text: 'I am ready',
        onPress: () => this.getPermission(),
      },
      {
        text: 'cancle',
        onPress: () => this.permissionAllert(),
      },
    ]);
  };

  getAudioFiles = async () => {
    const { dataProvider, audioFiles } = this.state
    let media = await MediaLibrary.getAssetsAsync({
      mediaType: 'audio',
    })
    media = await MediaLibrary.getAssetsAsync({
      mediaType: 'audio',
      first: media.totalCount
    })
    this.totalAudioCount = media.totalCount

    this.setState({ 
      ...this.state, 
      dataProvider: dataProvider.cloneWithRows([
        ...audioFiles, 
        ...media.assets,
      ]), 
      audioFiles: [...audioFiles, ...media.assets] 
    })
  }

  getPermission = async () => {
    const permission = await MediaLibrary.getPermissionsAsync()

    if (permission.granted) {
      // we want to get all the audio files
      this.getAudioFiles()
    }

    if (!permission.canAskAgain && !permission.granted) {
      this.setState({ ...this.state, permissionError: true })
    }

    if (!permission.granted && permission.canAskAgain) {
      const {status, canAskAgain} =  await MediaLibrary.requestPermissionsAsync()
      if (status === 'denied' && canAskAgain) {
        // we are going to display alert that user must allow this permission to work this app
        this.permisionAlert()
      }

      if (status === 'granted') {
        // we want to get all the audio files
        this.getAudioFiles()
      }

      if (status === 'denied' && !canAskAgain) {
        // we want to display some error to the user
        this.setState({...this.state, permissionError: true})
      }
    }
  }

  onPlaybackStatusUpdate = async playbackStatus => {
    if (playbackStatus.isLoaded && playbackStatus.isPlaying) {
      this.updateState(this.state, {
        playbackPosition: playbackStatus.positionMillis,
        playbackDuration: playbackStatus.durationMillis,
      })
    }
    
    if (playbackStatus.didJustFinish) {
      let audio
      let index
      let lastIndex

      if (this.state.shuffle) index = this.state.shuffleOrder.findIndex((i) => i === this.state.currentAudioIndex) 
      else index = this.state.isPlaylistRunning ? this.state.activePlaylist.audios.findIndex(({ id }) => id === this.state.currentAudio.id) : this.state.currentAudioIndex

      if (this.state.shuffle) lastIndex = this.state.shuffleOrder.length
      else lastIndex = this.state.isPlaylistRunning ? this.state.activePlaylist.audios.length : this.state.totalAudioCount
      if (index + 1 >= lastIndex) {
        if (this.state.repeat === 0) {
          this.state.playbackObj.unloadAsync()
          return this.updateState(this.state, {
            soundObj: null,
            isPlaying: false,
            playbackPosition: 0,
            playbackDuration: null,
          })
        } else if (this.state.repeat === 1) {
          index = -1
        }
      }
      if (this.state.repeat !== 2) {
        if (this.state.shuffle) audio = this.state.isPlaylistRunning ? this.state.activePlaylist.audios[this.state.shuffleOrder[index + 1]] : this.state.audioFiles[this.state.shuffleOrder[index + 1]]
        else audio = this.state.isPlaylistRunning ? this.state.activePlaylist.audios[index + 1] : this.state.audioFiles[index + 1];
      } else audio = this.state.currentAudio
      const status = await playNext(this.state.playbackObj, audio.uri)
      const nextAudioIndex = this.state.audioFiles.findIndex(({ id }) => id === audio.id)
      const flag = this.checkFavorite(audio)
      this.updateState(this.state, {
        soundObj: status,
        currentAudio: audio,
        isPlaying: true,
        isFavorite: flag,
        currentAudioIndex: nextAudioIndex
      })
      await storeAudioForNextOpening(audio, nextAudioIndex)
    }
  }

  updateState = (prevState, newState = {}) => {
    this.setState({ ...prevState, ...newState })
  }

  loadPlaylist = async () => {
    let result = await AsyncStorage.getItem('playlist');
    // result = null
    if (result === null) {
      const defaultPlaylist = {
        id: Date.now(),
        title: 'My Favorite',
        audios: [],
      };

      const newPlaylist = [...this.state.playlist, defaultPlaylist]
      this.setState({ ...this.state, playlist: [...newPlaylist] })
      return await AsyncStorage.setItem(
        'playlist',
        JSON.stringify([...newPlaylist])
      );
    }

    this.setState({ ...this.state, playlist: JSON.parse(result) })
  }

  loadPreviousAudio = async () => {
    let previousAudio = await AsyncStorage.getItem('previousAudio')
    let currentAudio;
    let currentAudioIndex;

    if (previousAudio === null) {
      currentAudio = this.state.audioFiles[0]
      currentAudioIndex = 0
    } else {
      previousAudio = JSON.parse(previousAudio)
      currentAudio = previousAudio.audio
      currentAudioIndex = previousAudio.index
    }
    this.setState({ ...this.state, currentAudio, currentAudioIndex })
  }

  loadRepeatAndShuffle = async () => {
    let previousData = await AsyncStorage.getItem('repeatAndShuffle')

    if (previousData !== null) {
      previousData = JSON.parse(previousData)
      this.setState({ ...this.state, repeat: previousData.repeat, shuffle: previousData.shuffle, shuffleOrder: previousData.shuffleOrder })
    }
  }

  loadFavorite = (currentAudio) => {
    let flag = false

    for (let audio of this.state.playlist[0].audios) {
      if (audio.id === currentAudio.id) flag = true
    }

    this.setState({ ...this.state, isFavorite: flag })
  }

  checkFavorite = currentAudio => {
    let flag = false

    for (let audio of this.state.playlist[0].audios) {
      if (audio.id === currentAudio.id) flag = true
    }

    return flag
  }

  loadActivePlaylist = async () => {
    let previousPlaylist = await AsyncStorage.getItem('activePlaylist')
    if (previousPlaylist !== null) {
      this.setState({ ...this.state, activePlaylist: JSON.parse(previousPlaylist), isPlaylistRunning: true })
    }
  }

  handleFavorite = async currentAudio => {
    let oldList = this.state.playlist
    let index = -1
    let count = 0

    for (let audio of oldList[0].audios) {
      if (audio.id === currentAudio.id) index = count
      count++
    }
    
    // update playlist
    if (index === -1) {
      oldList[0].audios = [...oldList[0].audios, currentAudio]
      this.setState({ ...this.state, playlist: [...oldList], isFavorite: true })
    } else {
      oldList[0].audios.pop(index)
      this.setState({ ...this.state, playlist: [...oldList], isFavorite: false })
    }

    AsyncStorage.setItem('playlist', JSON.stringify([...oldList]))
  }

  componentDidMount() {
    this.getPermission()
    if (this.state.playbackObj === null) {
      this.setState({  ...this.state, playbackObj: new Audio.Sound() })
    }
    this.loadRepeatAndShuffle()
    this.loadPlaylist()
    this.loadActivePlaylist()
  }

  render() {
    const {
      audioFiles,
      playlist,
      activePlaylist,
      addToPlaylist,
      permissionError,
      dataProvider,
      playbackObj,
      soundObj,
      currentAudio,
      isPlaying,
      isPlaylistRunning,
      currentAudioIndex,
      playbackPosition,
      playbackDuration,
      repeat,
      shuffle,
      shuffleOrder,
      isFavorite,
    } = this.state
    if (permissionError) return <View style={styles.container}>
      <Text>It looks like you haven't accept the permission.</Text>
    </View>
    return (
      <AudioContext.Provider value={{
        audioFiles,
        playlist,
        activePlaylist,
        addToPlaylist,
        dataProvider,
        playbackObj,
        soundObj,
        currentAudio,
        isPlaying,
        isPlaylistRunning,
        currentAudioIndex,
        totalAudioCount: this.totalAudioCount,
        playbackPosition,
        playbackDuration,
        repeat,
        shuffle,
        shuffleOrder,
        isFavorite,
        updateState: this.updateState,
        loadPreviousAudio: this.loadPreviousAudio,
        loadPlaylist: this.loadPlaylist,
        loadActivePlaylist: this.loadActivePlaylist,
        loadFavorite: this.loadFavorite,
        handleFavorite: this.handleFavorite,
        onPlaybackStatusUpdate: this.onPlaybackStatusUpdate,
        checkFavorite: this.checkFavorite,
      }}>
        {this.props.children}
      </AudioContext.Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AudioProvider