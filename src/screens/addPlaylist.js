import * as React from 'react'
import { StyleSheet, View, Text, StatusBar, Dimensions, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'
import { AudioContext } from '../context/AudioProvider'
import PlaylistModal from '../components/PlaylistModal'
import AsyncStorage from '@react-native-async-storage/async-storage'

const AddPlaylist = ({ navigation }) => {
  const [modalVisible, setModalVisible] = React.useState(false);

  const context = React.useContext(AudioContext);
  const { playlist, addToPlaylist, updateState, loadPlaylist } = context;

  const createPlaylist = async playlistName => {
    const newList = {
      id: Date.now(),
      title: playlistName,
      audios: [],
    };

    const updatedList = [...playlist, newList]
    updateState(context, { playlist: updatedList })
    await AsyncStorage.setItem('playlist', JSON.stringify(updatedList))

    setModalVisible(false);
  };

  React.useEffect(() => {
    if (!playlist.length) {
      loadPlaylist();
    }
  }, []);

  const handleBanner = async playlist => {
    // update playlist if there is any selected playlist
    if (addToPlaylist) {
      // we want to check is that same audio is already inside our list or not
      const result = await AsyncStorage.getItem('playlist')

      let oldList = []
      let updatedList = []
      let sameAudio = false

      if (result !== null) {
        oldList = JSON.parse(result)
        updatedList = oldList.filter(list => {
          if (list.id === playlist.id) {
            for (let audio of list.audios) {
              if (audio.id === addToPlaylist.id) {
                // already with some message
                sameAudio = true
                return
              }
            }

            // update playlist
            list.audios = [...list.audios, addToPlaylist]
          }

          return list
        })
      }

      if (sameAudio) {
        Alert.alert('found same audio!', `${addToPlaylist.filename} is already inside the list`)
        sameAudio = false
        updateState(context, {addToPlaylist: null})
      } else {
        updateState(context, {addToPlaylist: null, playlist: [...updatedList]})
        AsyncStorage.setItem('playlist', JSON.stringify([...updatedList]))
      }
    }

    return navigation.pop()
  }

  const handleExit = () => {
    updateState(context, {addToPlaylist: null})
    return navigation.pop()
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더입니다 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => handleExit()}
        >
          <Icon name="x" size={28} />
        </TouchableOpacity>
      </View>
      {/* 메인입니다 */}
      <ScrollView style={{padding: 16}}>
        <TouchableOpacity 
          style={{marginBottom: 8}}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addPlaylistBtn}>+ Add New Playlist</Text>
        </TouchableOpacity>
        {/* PLAYLIST PART */}
        {playlist.length > 1 ? playlist.slice(1).reverse().map(item => (
          <TouchableOpacity 
            style={[styles.playlistBanner, {marginTop: 12}]}
            key={item.id}
            onPress={() => handleBanner(item)}
          >
          <Text>{item.title}</Text>
          <Text style={styles.audioCount}>
            {item.audios.length > 1
              ? `${item.audios.length} Songs`
              : `${item.audios.length} Song`}
          </Text>
          </TouchableOpacity>
        )): null}
      </ScrollView>
      <PlaylistModal
        visible={modalVisible}
        title={'Create New Playlist'}
        onClose={() => setModalVisible(false)}
        create={createPlaylist}
      />
    </SafeAreaView>
  )
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
  addPlaylistBtn: {
    color: 'cornflowerblue',
    letterSpacing: 1,
    fontWeight: 'bold',
    fontSize: 16,
  },
  playlistBanner: {
    padding: 16,
    backgroundColor: 'rgba(204, 204, 204, 0.3)',
    borderRadius: 10
  },
});


export default AddPlaylist