import { createRandomOrderList, storeAudioForNextOpening } from './helper';
import AsyncStorage from '@react-native-async-storage/async-storage'

// play audio
export const play = async ( playbackObj, uri ) => {
  try {
    return await playbackObj.loadAsync(
      {uri}, 
      {shouldPlay: true}
    )
  } catch (e) {
    console.log('error inside play helper moethod' , e.message)
  }
}

// pause audio
export const pause = async playbackObj => {
  try {
    return await playbackObj.setStatusAsync(
      {shouldPlay: false}
    )
  } catch (e) {
    console.log('error inside pause helper moethod' , e.message)
  }
}

// resume audio
export const resume = async playbackObj => {
  try {
    return await playbackObj.playAsync()
  } catch (e) {
    console.log('error inside resume helper moethod' , e.message)
  }
}

// select another audio
export const playNext = async ( playbackObj, uri ) => {
  try {
    await playbackObj.stopAsync()
    await playbackObj.unloadAsync()
    return await play(playbackObj, uri)
  } catch (e) {
    console.log('error inside playNext helper moethod' , e.message)
  }
}


export const selectAudio = async (audio, context, playlistInfo = {}) => {
  const {
    soundObj,
    playbackObj,
    currentAudio,
    updateState,
    audioFiles,
    onPlaybackStatusUpdate,
    checkFavorite,
    repeat,
    shuffle,
    isPlaylistRunning,
    activePlaylist,
    totalAudioCount,
  } = context;
  try {
    // playing audio for the first time.
    if (soundObj === null) {
      const status = await play(playbackObj, audio.uri, audio.lastPosition);
      const index = audioFiles.findIndex(({ id }) => id === audio.id);
      if (!playlistInfo.isPlaylistRunning && isPlaylistRunning) await AsyncStorage.setItem('activePlaylist', '')
      updateState(context, {
        currentAudio: audio,
        soundObj: status,
        isPlaying: true,
        currentAudioIndex: index,
        isPlaylistRunning: false,
        activePlaylist: [],
        ...playlistInfo,
      });
      playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      return storeAudioForNextOpening(audio, index);
    }

    // pause audio or play audio
    if (
      soundObj.isLoaded &&
      soundObj.isPlaying &&
      currentAudio.id === audio.id
    ) {
      if (!playlistInfo.isPlaylistRunning && isPlaylistRunning) {
        const status = await playNext(playbackObj, audio.uri)
        await AsyncStorage.setItem('activePlaylist', '')
        return updateState(context, {
          soundObj: status,
          isPlaylistRunning: false,
          activePlaylist: [],
        })
      } else {
        const status = await pause(playbackObj);
        return updateState(context, {
          soundObj: status,
          isPlaying: false,
          playbackPosition: status.positionMillis,
        });
      }
    }

    // resume audio
    if (
      soundObj.isLoaded &&
      !soundObj.isPlaying &&
      currentAudio.id === audio.id
    ) {
      const status = await resume(playbackObj);
      return updateState(context, { soundObj: status, isPlaying: true });
    }

    // select another audio
    if (soundObj.isLoaded && currentAudio.id !== audio.id) {
      const status = await playNext(playbackObj, audio.uri);
      const index = audioFiles.findIndex(({ id }) => id === audio.id);
      const flag = checkFavorite(audio)
      let array = []
      if (!playlistInfo.isPlaylistRunning && isPlaylistRunning) {
        // 플레이리스트 --> 홈
        if (shuffle) {
          array = createRandomOrderList(totalAudioCount, index)
        }
        await AsyncStorage.setItem('activePlaylist', '')
      } else if(!playlistInfo.isPlaylistRunning && !isPlaylistRunning) {
        // 홈에서 다른 노래
        if (shuffle) {
          array = createRandomOrderList(totalAudioCount, index)
        }
      } else {
        // 플레이리스트에서 다른 노래
        if (shuffle) {
          array = createRandomOrderList(playlistInfo.activePlaylist.audios.length, activePlaylist.audios.findIndex(({ id }) => id === audio.id))
        }
      }
      if (shuffle) await AsyncStorage.setItem('repeatAndShuffle', JSON.stringify({repeat, shuffle, shuffleOrder: array}))
      updateState(context, {
        currentAudio: audio,
        soundObj: status,
        isPlaying: true,
        isFavorite: flag,
        currentAudioIndex: index,
        shuffleOrder: array,
        isPlaylistRunning: false,
        activePlayList: [],
        ...playlistInfo,
      });
      return storeAudioForNextOpening(audio, index);
    }
  } catch (error) {
    console.log('error inside select audio method.', error.message);
  }
};

export const changeAudio = async (context, select) => {
  const {
    playbackObj,
    currentAudio,
    currentAudioIndex,
    totalAudioCount,
    audioFiles,
    activePlaylist,
    updateState,
    checkFavorite,
    isPlaylistRunning,
    onPlaybackStatusUpdate,
    repeat,
    shuffle,
    shuffleOrder,
  } = context;

  try {
    const { isLoaded } = await playbackObj.getStatusAsync();
    let isLastAudio = isPlaylistRunning ? currentAudioIndex + 1 >= activePlaylist.audios.length : currentAudioIndex + 1 === totalAudioCount;
    let isFirstAudio = currentAudioIndex <= 0;
    let audio;
    let index;
    let status;
    let flag;
    let realIndex;

    if (shuffle) {
      index = shuffleOrder.findIndex((i) => i === currentAudioIndex)
      isLastAudio = index + 1 === shuffleOrder.length 
      isFirstAudio = index === 0
    } else {
      index = isPlaylistRunning ? activePlaylist.audios.findIndex(({ id }) => id === currentAudio.id) : currentAudioIndex
      isLastAudio = isPlaylistRunning ? index + 1 === activePlaylist.audios.length : index + 1 === totalAudioCount;
      isFirstAudio = index === 0
    }

    // for next
    if (select === 'next') {
      if (shuffle) audio = isPlaylistRunning ? activePlaylist.audios[shuffleOrder[index + 1]] : audioFiles[shuffleOrder[index + 1]]
      else audio = isPlaylistRunning ? activePlaylist.audios[index + 1] : audioFiles[index + 1];
      if (!isLoaded && !isLastAudio) {
        // index = currentAudioIndex + 1;
        status = await play(playbackObj, audio.uri);
        playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      }

      if (isLoaded && !isLastAudio) {
        // index = currentAudioIndex + 1;
        status = await playNext(playbackObj, audio.uri);
      }

      if (isLastAudio) {
        index = 0;
        if (shuffle) audio = isPlaylistRunning ? activePlaylist.audios[shuffleOrder[index]] : audioFiles[shuffleOrder[index]]
        else audio = isPlaylistRunning ? activePlaylist.audios[index] : audioFiles[index];
        // audio = isPlaylistRunning ? activePlaylist.audios[index] : audioFiles[index];
        if (isLoaded) {
          status = await playNext(playbackObj, audio.uri);
        } else {
          status = await play(playbackObj, audio.uri);
        }
      }
    }

    // for previous
    if (select === 'previous') {
      if (shuffle) audio = isPlaylistRunning ? activePlaylist.audios[shuffleOrder[index - 1]] : audioFiles[shuffleOrder[index - 1]]
      else audio = isPlaylistRunning ? activePlaylist.audios[index - 1] : audioFiles[index - 1];
      // audio = isPlaylistRunning ? activePlaylist.audios[currentAudioIndex - 1] : audioFiles[currentAudioIndex - 1];
      if (!isLoaded && !isFirstAudio) {
        // index = currentAudioIndex - 1;
        status = await play(playbackObj, audio.uri);
        playbackObj.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      }

      if (isLoaded && !isFirstAudio) {
        // index = currentAudioIndex - 1;
        status = await playNext(playbackObj, audio.uri);
      }

      if (isFirstAudio) {
        index = isPlaylistRunning ? activePlaylist.audios.length - 1 : totalAudioCount - 1;
        if (shuffle) audio = isPlaylistRunning ? activePlaylist.audios[shuffleOrder[index]] : audioFiles[shuffleOrder[index]]
        else audio = isPlaylistRunning ? activePlaylist.audios[index] : audioFiles[index];
        // audio = isPlaylistRunning ? activePlaylist.audios[index] : audioFiles[index];
        if (isLoaded) {
          status = await playNext(playbackObj, audio.uri);
        } else {
          status = await play(playbackObj, audio.uri);
        }
      }
    }

    flag = checkFavorite(audio)
    realIndex = audioFiles.findIndex(({ id }) => id === audio.id)
    updateState(context, {
      currentAudio: audio,
      soundObj: status,
      isPlaying: true,
      isFavorite: flag,
      currentAudioIndex: realIndex,
      playbackPosition: null,
      playbackDuration: null,
    });
    storeAudioForNextOpening(audio, index);
  } catch (error) {
    console.log('error inside change audio method.', error.message);
  }
};

export const moveAudio = async (context, value) => {
  const { 
    soundObj, 
    isPlaying, 
    playbackObj, 
    updateState 
  } = context;
  if (soundObj === null || !isPlaying) return;

  try {
    const status = await playbackObj.setPositionAsync(
      Math.floor(soundObj.durationMillis * value)
    );
    updateState(context, {
      soundObj: status,
      playbackPosition: status.positionMillis,
    });

    await resume(playbackObj);
  } catch (error) {
    console.log('error inside onSlidingComplete callback', error);
  }
};
