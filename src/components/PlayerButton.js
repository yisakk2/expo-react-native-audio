import * as React from 'react';
import Icon from 'react-native-vector-icons/Entypo'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

export const FavoriteButton = props => {
  const { iconType, size = 32 } = props
  const getIconName = type => {
    switch (type) {
      case 'YES':
        return 'heart'
      case 'NO':
        return 'heart-outlined'
    }
  }
  const getIconColor = type => {
    switch (type) {
      case 'YES':
        return 'cornflowerblue'
      case 'NO':
        return 'black'
    }
  }
  return (
    <Icon 
      {...props}
      name={getIconName(iconType)}
      size={size}
      color={getIconColor(iconType)}
    />
  )
}

export const RepeatButton = props => {
  const { iconType, size = 32, onPress } = props
  const getIconName = type => {
    switch (type) {
      case 'norepeat':
        return 'repeat';
      case 'repeat':
        return 'repeat';
      case 'repeatone':
        return 'repeat-one';
    }
  }
  const getIconColor = type => {
    switch (type) {
      case 'norepeat':
        return 'grey'
      case 'repeat':
        return 'cornflowerblue'
      case 'repeatone':
        return 'cornflowerblue'
    }
  }
  return (
    <MaterialIcons
      {...props}
      onPress={onPress}
      name={getIconName(iconType)}
      size={size}
      color={getIconColor(iconType)}
    />
  );
}

export const PlayerButton = props => {
  const { iconType, size = 32, iconColor = 'black', onPress } = props;
  const getIconName = type => {
    switch (type) {
      case 'PLAY':
        // return 'controller-paus';
        return 'pause'
      case 'PAUSE':
        // return 'controller-play';
        return 'play-arrow'
      case 'NEXT':
        // return 'controller-next';
        return 'skip-next'
      case 'PREV':
        // return 'controller-jump-to-start';
        return 'skip-previous'
      case 'LIST':
        return 'playlist-play'
    }
  };
  return (
    // <Icon
    <MaterialIcons
      {...props}
      onPress={onPress}
      name={getIconName(iconType)}
      size={size}
      color={iconColor}
    />
  );
};