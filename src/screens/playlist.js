import * as React from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Alert, ScrollView } from "react-native";
import { AudioContext } from '../context/AudioProvider'
import { selectAudio, changeAudio } from '../misc/audioController'
import { extractFilenameOnly, createRandomOrderList } from '../misc/helper';
import { PlayerButton } from '../components/PlayerButton'
import AsyncStorage from '@react-native-async-storage/async-storage'
import Icon from 'react-native-vector-icons/Feather'
import PlaylistModal from '../components/PlaylistModal'
import PlaylistOptionModal from '../components/PlaylistOptionModal'
import PlaylistDetail from './playlistDetail'

const Playlist = ({ navigation }) => {
  const [modalVisible, setModalVisible] = React.useState(false)
  const [modalTitle, setModalTitle] = React.useState('')
  const [optionVisible, setOptionVisible] = React.useState(false)
  const [detailVisible, setDetailVisible] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState({});

  const context = React.useContext(AudioContext);
  const { playlist, updateState, loadPlaylist, repeat, shuffle } = context;

  const createPlaylist = async playlistName => {
    const newList = {
      id: Date.now(),
      title: playlistName,
      audios: [],
    }

    const updatedList = [...playlist, newList]
    updateState(context, { playlist: updatedList })
    await AsyncStorage.setItem('playlist', JSON.stringify(updatedList))
  };

  const editPlaylist = async playlistName => {
    const updatedList = playlist

    for (let list of updatedList) {
      if (list.id === selectedItem.id) {
        list.title = playlistName
      }
    }
    
    updateState(context, { playlist: updatedList })
    await AsyncStorage.setItem('playlist', JSON.stringify(updatedList))
  }

  React.useEffect(() => {
    if (!playlist.length) {
      loadPlaylist();
    }
  }, []);

  const handlePrevious = async () => {
    await changeAudio(context, 'previous')
    // loadFavorite(context.currentAudio)
  }

  const handlePlayPause = async () => {
    if (context.isPlaylistRunning) {
      await selectAudio(context.currentAudio, context, {
        activePlaylist: context.activePlaylist,
        isPlaylistRunning: true,
      })
    } else {
      await selectAudio(context.currentAudio, context)
    }
  }

  const handleNext = async () => {
    await changeAudio(context, 'next');
    // loadFavorite(context.currentAudio)
  }

  const showPlaylistDetail = playlist => {
    setSelectedItem(playlist)
    setDetailVisible(true)
  }

  const handleOption = playlist => {
    setSelectedItem(playlist)
    setOptionVisible(true)
  }

  const removePlaylist = async () => {
    let oldPlaylist = playlist
    let count = 0

    for (let item of oldPlaylist) {
      if (item.id === selectedItem.id) break
      count++
    }

    oldPlaylist.pop(count)
    context.updateState(context, {playlist: [...oldPlaylist]})
    await AsyncStorage.setItem('playlist', JSON.stringify([...oldPlaylist]))
    setSelectedItem({})
    setOptionVisible(false)
  }

  const playPlaylist = async item => {
    if (item.audios.length === 0) {
      Alert.alert(
        "안내",
        "선택한 플레이리스트의 곡이 없습니다."
      )
    } else {
      let index = 0
      let array
      if (shuffle) {
        array = createRandomOrderList(item.audios.length, -1)
        index = array[0]
        context.updateState(context, {shuffleOrder: array})
        await AsyncStorage.setItem('repeatAndShuffle', JSON.stringify({repeat, shuffle, shuffleOrder: array}))
      }
      await AsyncStorage.setItem('activePlaylist', JSON.stringify(item))
      await selectAudio(item.audios[index], context, {
        activePlaylist: item,
        isPlaylistRunning: true,
      })
      setSelectedItem({})
      setDetailVisible(false)
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={{padding: 16}}>
          {/* MY FAVORITE PART */}
          {playlist.length > 0 ? (
            <TouchableOpacity 
              style={styles.playlistBanner}
              key={playlist[0].id}
              onPress={() => showPlaylistDetail(playlist[0])}
            >
              <Text>{playlist[0].title}</Text>
              <Text style={styles.audioCount}>
                {playlist[0].audios.length > 1
                  ? `${playlist[0].audios.length} Songs`
                  : `${playlist[0].audios.length} Song`}
              </Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity 
            style={{marginTop: 16, marginBottom: 8}}
            onPress={() => {
              setModalTitle('Create New Playlist')
              setModalVisible(true)
            }}
          >
            <Text style={styles.addPlaylistBtn}>+ Add New Playlist</Text>
          </TouchableOpacity>
          {/* PLAYLIST PART */}
          {playlist.length > 1 ? playlist.slice(1).reverse().map(item => (
            <TouchableOpacity 
              style={[styles.playlistBanner, {marginTop: 12}]}
              key={item.id.toString()}
              onPress={() => showPlaylistDetail(item)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View>
                  <Text>{item.title}</Text>
                  <Text style={styles.audioCount}>
                    {item.audios.length > 1
                      ? `${item.audios.length} Songs`
                      : `${item.audios.length} Song`}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <TouchableOpacity
                    onPress={() => playPlaylist(item)}
                  >
                    <Icon 
                      name='play' 
                      size={20}
                    />
                  </TouchableOpacity>
                  <View style={{width: 20}}></View>
                  <TouchableOpacity
                    onPress={() => {
                      setModalTitle('Edit Playlist Name')
                      handleOption(item)
                    }}
                  >
                    <Icon 
                      name='more-vertical' 
                      size={20}
                      color={'dimgrey'}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          )): null}
        </View>
      </ScrollView>
      <TouchableOpacity
        style={styles.musicTabBox}
        onPress={() => navigation.navigate("Stream")}
      >
        <Text style={styles.audioTitle}>{context.currentAudio ? extractFilenameOnly(context.currentAudio.filename) : '재생중인 곡이 없습니다.'}</Text>
        <View style={styles.audioController}>
          <PlayerButton
            onPress={handlePrevious}
            iconType='PREV' 
            size={28} 
          />
          <PlayerButton 
            onPress={handlePlayPause}
            iconType={context.isPlaying ? 'PLAY' : 'PAUSE'}
          />
          <PlayerButton 
            onPress={handleNext}
            iconType='NEXT' 
            size={28} 
          />
          <PlayerButton 
            onPress={() => navigation.navigate('ActivePlaylist')}
            iconType='LIST'
          />
        </View>
      </TouchableOpacity>
      {/* 모달입니다 */}
      <PlaylistModal
        visible={modalVisible}
        title={modalTitle}
        onClose={() => {
          setModalVisible(false)
          setSelectedItem({})
        }}
        create={createPlaylist}
        edit={editPlaylist}
      />
      <PlaylistDetail 
        visible={detailVisible}
        onClose={() => {
          setSelectedItem({})
          setDetailVisible(false)
        }}
        playlist={selectedItem}
        play={() => playPlaylist(selectedItem)}
      />
      <PlaylistOptionModal 
        visible={optionVisible}
        onClose={() => {
          setSelectedItem({})
          setOptionVisible(false)
        }}
        playlist={selectedItem}
        edit={() => {
          setOptionVisible(false)
          setModalVisible(true)
        }}
        remove={removePlaylist}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  playlistBanner: {
    padding: 16,
    backgroundColor: 'rgba(204, 204, 204, 0.3)',
    borderRadius: 10
  },
  audioCount: {
    marginTop: 3,
    opacity: 0.5,
    fontSize: 14,
  },
  addPlaylistBtn: {
    color: 'cornflowerblue',
    letterSpacing: 1,
    fontWeight: 'bold',
    fontSize: 14,
  },
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

export default Playlist