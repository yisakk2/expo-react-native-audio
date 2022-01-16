import AsyncStorage from '@react-native-async-storage/async-storage';

export const storeAudioForNextOpening = async (audio, index) => {
  await AsyncStorage.setItem(
    'previousAudio',
    JSON.stringify({ audio, index })
  );
};

export const convertTime = minutes => {
  if (minutes) {
    const hrs = minutes / 60;
    const minute = hrs.toString().split('.')[0];
    const percent = parseInt(hrs.toString().split('.')[1].slice(0, 2));
    const sec = Math.ceil((60 * percent) / 100);
    if (parseInt(minute) < 10 && sec < 10) {
      return `0${minute}:0${sec}`;
    }

    if (sec == 60) {
      return `${minute + 1}:00`;
    }

    if (parseInt(minute) < 10) {
      return `0${minute}:${sec}`;
    }

    if (sec < 10) {
      return `${minute}:0${sec}`;
    }

    return `${minute}:${sec}`;
  } else {
    return '00:00'
  }
};

export const extractFilenameOnly = filename => {
  if (filename === undefined) return ''
  return filename.split('.')[0]
}

export const findAudioIndex = (audios, currentAudio) => {
  return audios.findIndex(({ id }) => id === currentAudio.id)
}

export const createRandomOrderList = (length, currentAudioIndex) => {
  const array = [...Array(length)].map((u, i) => i)
  array.sort(() => Math.random() - 0.5)
  if (currentAudioIndex !== -1) {
    const temporaryValue = array[0]
    const index = array.findIndex((i) => i === currentAudioIndex)
    array[0] = currentAudioIndex
    array[index] = temporaryValue
  }

  return array
}