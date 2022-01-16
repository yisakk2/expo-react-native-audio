import React from 'react'
import { View, StyleSheet, Modal, Text, TouchableWithoutFeedback } from 'react-native'
import { extractFilenameOnly}  from '../misc/helper'
import GestureRecognizer from 'react-native-swipe-gestures';

const PlaylistOptionModal = ({ visible, playlist, onClose, edit, remove }) => {
  return (
    <GestureRecognizer
      onSwipeDown={onClose}
    >
      {/* <StatusBar hidden /> */}
      <Modal animationType='slide' transparent visible={visible}>
        <View style={styles.modal}>
          <Text numberOfLines={2} style={styles.title}>{playlist ? playlist.title : ''}</Text>
          <View style={styles.optionContainer}>
            <TouchableWithoutFeedback onPress={edit}>
              <Text style={styles.option}>제목 수정</Text>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={remove}>
              <Text style={styles.option}>삭제</Text>
            </TouchableWithoutFeedback>
          </View>
        </View>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalBg} />
        </TouchableWithoutFeedback>
      </Modal>
    </GestureRecognizer>
  )
}

const styles = StyleSheet.create({
  modal: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
    backgroundColor: '#fff',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    zIndex: 500,
  },
  optionContainer: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    padding: 20,
    paddingBottom: 0,
  },
  option: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 10,
    letterSpacing: 1,
  },
  modalBg: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
});

export default PlaylistOptionModal
