import * as React from 'react'
import { StyleSheet, View, Text, Modal, FlatList, Dimensions, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import GestureRecognizer from 'react-native-swipe-gestures'
import { extractFilenameOnly, convertTime }  from '../misc/helper'
import { AudioContext } from '../context/AudioProvider'
import Icon from 'react-native-vector-icons/Entypo'
import AsyncStorage from '@react-native-async-storage/async-storage'

const PlaylistDetail = ({ visible, playlist, onClose, play }) => {
  const context = React.useContext(AudioContext);

  const remove = async currentItem => {
    let oldList = context.playlist
    let index = 0

    oldList.filter(list => {
      if (list.id === playlist.id) {
        for (let audio of list.audios) {
          if (audio.id === currentItem.id) break
          index++
        }

        list.audios.pop(index)
      }
    })

    context.updateState(context, {playlist: [...oldList]})
    await AsyncStorage.setItem('playlist', JSON.stringify([...oldList]))
  }
  
  return (
    <GestureRecognizer
      onSwipeDown={onClose}
    >
      <Modal visible={visible} animationType='slide' transparent>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{fontSize: 22, lineHeight: 50}}>{playlist.title}</Text>
              <TouchableOpacity 
                onPress={play}
                style={styles.playlistController}
              >
                <Icon name='controller-play' color={'white'} size={24} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.main}>
            {playlist.audios && playlist.audios.length > 0 ? 
            <FlatList 
              contentContainerStyle={{paddingHorizontal: 10}}
              data={playlist.audios}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.audioBox}>
                  <View style={styles.leftContainer}>
                    <Text style={{fontSize: 16}}>{extractFilenameOnly(item.filename)}</Text>
                    <Text style={{fontSize: 14, color: 'grey'}}>{convertTime(item.duration)}</Text>
                  </View>
                  <View style={styles.rightContainer}>
                    <Icon 
                      onPress={() => remove(item)}
                      name="cross" 
                      color={'dimgrey'} 
                      size={24} 
                    />
                  </View>
                </View>
              )}
            />
            : (
              <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
                <Text>플레이리스트에 곡이 없습니다.</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[StyleSheet.absoluteFillObject, styles.modalBG]} />
        </TouchableWithoutFeedback>
      </Modal>
    </GestureRecognizer>
  )
}

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    height: '92%',
    backgroundColor: '#fff',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    zIndex: 1000,
  },
  leftContainer: {
    justifyContent: 'center',
    flex: 1,
    marginLeft: 16,
  },
  rightContainer: {
    flexBasis: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBG: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: -1,
  },
  header: {
    padding: 32
  },
  main: {
    flex: 1,
  },
  playlistController: {
    height: 50,
    flexBasis: 50,
    backgroundColor: 'cornflowerblue',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  audioBox: {
    flexDirection: 'row',
    paddingVertical: 10,
  }
});

export default PlaylistDetail