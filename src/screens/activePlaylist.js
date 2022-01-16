import * as React from 'react'
import { StyleSheet, SafeAreaView, FlatList, View, Text, StatusBar, Dimensions, ScrollView, TouchableOpacity } from 'react-native'
import { PlayerButton } from '../components/PlayerButton'
import { AudioContext } from '../context/AudioProvider'
import Icon from 'react-native-vector-icons/Feather'
import AudioListItem from '../components/AudioListItem'
import { extractFilenameOnly } from '../misc/helper'
import { selectAudio, changeAudio } from '../misc/audioController'
import OptionModal from '../components/OptionModal'

const ActivePlaylist = ({ navigation }) => {
  const context = React.useContext(AudioContext);
  const [selectedItem, setSelectedItem] = React.useState({})
  const [modalVisible, setModalVisible] = React.useState(false)

  const handlePlayFromOption = async () => {
    await selectAudio(selectedItem, context)
    setModalVisible(false)
  }

  const handleAudioPress = async audio => {
    if (context.isPlaylistRunning) {
      await selectAudio(audio, context, {
        activePlaylist: context.activePlaylist,
        isPlaylistRunning: true,
      })
    } else {
      await selectAudio(audio, context)
    }
  }

  const handlePrevious = async () => {
    await changeAudio(context, 'previous')
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
  }

  const addPlaylistNavigator = () => {
    setModalVisible(false)
    context.updateState(context, {
      addToPlaylist: selectedItem
    })
    navigation.navigate('AddPlaylist')
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.pop()}
        >
          <Icon name="x" size={28} />
        </TouchableOpacity>
        <Text style={{fontSize: 20, fontWeight: 'bold'}}>재생목록</Text>
      </View>
      <View style={styles.main}>
        {context.isPlaylistRunning && context.activePlaylist ? 
        <FlatList 
          data={context.activePlaylist.audios}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={{height: 70, justifyContent: 'center'}}>
              <AudioListItem
                title={extractFilenameOnly(item.filename)}
                duration={item.duration}
                isPlaying={context.isPlaying}
                activeListItem={item.id === context.currentAudio.id}
                onAudioPress={() => handleAudioPress(item)}
                onOptionPress={() => {
                  setSelectedItem(item);
                  setModalVisible(true);
                }}
              />
            </View>
          )}
        />
        : 
        (
          <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontSize: 16}}>현재 재생중인 플레이리스트가 없습니다.</Text>
            
          </View>
        )
        }
      </View>
      <View style={styles.musicTabBox}>
        <View style={styles.audioController}>
          <PlayerButton
            onPress={handlePrevious}
            iconType='PREV' 
          />
          <PlayerButton 
            onPress={handlePlayPause}
            iconType={context.isPlaying ? 'PLAY' : 'PAUSE'}
            size={40}
          />
          <PlayerButton 
            onPress={handleNext}
            iconType='NEXT'
          />
          <TouchableOpacity 
            style={styles.thumbnail}
            onPress={() => {
              // navigation.pop()
              navigation.navigate("Stream")
            }}
          >
            <Text style={{fontSize:22, fontWeight: 'bold'}}>{context.currentAudio ? context.currentAudio.filename[0] : ''}</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* 모달입니다 */}
      <OptionModal
        onPlayPress={handlePlayFromOption}
        onPlaylistPress={addPlaylistNavigator}
        visible={modalVisible}
        onClose={() => {
          setSelectedItem({})
          setModalVisible(false)
        }}
        currentItem={selectedItem}
      />
    </SafeAreaView>
  )
}

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0
  },
  header: {
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
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
  musicTabBox: {
    width: width,
    // height: 73,
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderColor: '#f0efef'
  },
  audioController: {
    alignItems: 'center',
    // justifyContent: 'space-between',
    justifyContent: 'space-between',
    flexDirection: 'row',
    padding: 16
  },
  thumbnail: {
    height: 40,
    flexBasis: 40,
    backgroundColor: 'lightgrey',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
});
export default ActivePlaylist