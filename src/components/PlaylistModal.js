import * as React from 'react'
import { View, StyleSheet, Modal, TextInput, Dimensions, TouchableWithoutFeedback, Text, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'

const PlaylistModal = ({ visible, title, onClose, create, edit }) => {
  const [playlistName, setPlaylistName] = React.useState('');

  const handleOnSubmit = () => {
    if (!playlistName.trim()) {
      onClose();
    } else {
      // onSubmit(playlistName);
      if ({title} === 'Create New Playlist') create(playlistName)
      else edit(playlistName)
      setPlaylistName('');
      onClose();
    }
  };

  return (
    <Modal visible={visible} animationType='fade' transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.inputContainer}>
          <Text style={{ color: 'cornflowerblue' }}>{title}</Text>
          <TextInput
            value={playlistName}
            onChangeText={text => setPlaylistName(text)}
            style={styles.input}
          />
          <TouchableOpacity
            style={styles.submitIcon}
            onPress={handleOnSubmit}
          >
            <Icon
              name='check'
              size={24}
              color={'white'}
            />
          </TouchableOpacity>
        </View>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={[StyleSheet.absoluteFillObject, styles.modalBG]} />
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  modalContainer: {
    // position: 'absolute',
    // left: 10,
    // bottom: height / 2 - 100,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    width: width - 20,
    height: 200,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: width - 60,
    borderBottomWidth: 1,
    borderBottomColor: 'cornflowerblue',
    fontSize: 18,
    paddingVertical: 5,
  },
  submitIcon: {
    // flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    backgroundColor: 'cornflowerblue',
    borderRadius: 25,
    marginTop: 24,
  },
  modalBG: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: -1,
  },
});

export default PlaylistModal;