import * as React from 'react'
import { StyleSheet, View, Text, Dimensions, TouchableWithoutFeedback } from 'react-native'
import Icon from 'react-native-vector-icons/Entypo'
import { extractFilenameOnly}  from '../misc/helper'

const getThumbnailText = (filename) => filename[0]

const convertTime = minutes => {
  if (minutes) {
    const hrs = minutes / 60;
    const minute = hrs.toString().split('.')[0];
    const percent = parseInt(hrs.toString().split('.')[1].slice(0, 2));
    const sec = Math.ceil((60 * percent) / 100);

    if (parseInt(minute) < 10 && sec < 10) {
      return `0${minute}:0${sec}`;
    }

    if (parseInt(minute) < 10) {
      return `0${minute}:${sec}`;
    }

    if (sec < 10) {
      return `${minute}:0${sec}`;
    }

    return `${minute}:${sec}`;
  }
};

const renderPlayPauseIcon = (isPlaying) => {
  if (isPlaying) return <Icon name="controller-paus" color={'white'} size={24} />
  return <Icon name="controller-play" color={'white'} size={24} />
}

const AudioListItem = ({ 
  title, 
  duration, 
  onOptionPress, 
  onAudioPress,
  isPlaying,
  activeListItem,
}) => {
  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={onAudioPress}>
        <View style={styles.leftContainer}>
          <View style={[styles.thumbnail, {backgroundColor: activeListItem ? 'cornflowerblue' : 'lightgrey'}]}>
            <Text style={styles.thumbnailText}>
              {/* {getThumbnailText(title)} */}
              {activeListItem ? renderPlayPauseIcon(isPlaying) : getThumbnailText(title)}
            </Text>
          </View>
          <View style={styles.titleContainer}>
            <Text numberOfLines={1} style={styles.title}>
              {extractFilenameOnly(title)}
            </Text>
            <Text numberOfLines={1} style={styles.timeText}>
              {convertTime(duration)}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <View style={styles.rightContainer}>
        <Icon onPress={onOptionPress} name="dots-three-vertical" size={24} />
      </View>
    </View>
  )
}

const { width } = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  rightContainer: {
    flexBasis: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    height: 50,
    flexBasis: 50,
    backgroundColor: 'lightgrey',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  thumbnailText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  titleContainer: {
    width: width - 180,
    paddingLeft: 10,
  },
  title: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 14,
    color: 'grey'
  },
})

export default AudioListItem