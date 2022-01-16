import * as React from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Dimensions } from "react-native";
import { AudioContext } from '../context/AudioProvider'
import AudioListItem from '../components/AudioListItem'
import OptionModal from '../components/OptionModal'
import { LayoutProvider, RecyclerListView } from 'recyclerlistview'
import { selectAudio, changeAudio } from '../misc/audioController'
import { extractFilenameOnly } from '../misc/helper';
import { PlayerButton } from '../components/PlayerButton'

export class Home extends React.Component {
  static contextType = AudioContext

  constructor(props) {
    super(props)
    this.state = {
      optionModalVisible: false,
    }

    this.currentItem = {}
  }

  layoutProvider = new LayoutProvider(
    (i) => 'audio', 
    (type, dim) => {
      switch(type) {
        case 'audio':
          dim.width = Dimensions.get('window').width
          dim.height = 70
          break
        default: 
          dim.width = 0
          dim.height = 0
      }
    }
  )

  handlePlayFromOption = async () => {
    await selectAudio(this.currentItem, this.context)
    this.setState({ ...this.state, optionModalVisible: false })
  }

  handleAudioPress = async audio => {
    await selectAudio(audio, this.context)
  }

  handlePrevious = async () => {
    await changeAudio(this.context, 'previous')
  }

  handlePlayPause = async () => {
    if (this.context.isPlaylistRunning) {
      await selectAudio(this.context.currentAudio, this.context, {
        activePlaylist: this.context.activePlaylist,
        isPlaylistRunning: true,
      })
    } else {
      await selectAudio(this.context.currentAudio, this.context)
    }
  }

  handleNext = async () => {
    await changeAudio(this.context, 'next');
  }

  addPlaylistNavigator = () => {
    this.state.optionModalVisible = false
    this.context.updateState(this.context, {
      addToPlaylist: this.currentItem
    })
    this.props.navigation.navigate('AddPlaylist')
  }

  componentDidMount() {
    this.context.loadPreviousAudio()
    this.context.loadActivePlaylist()
  }

  rowRenderer = (type, item, index, extendedState) => {
    return <AudioListItem 
      title={item.filename} 
      isPlaying={extendedState.isPlaying}
      activeListItem={this.context.isPlaylistRunning ? false : this.context.currentAudioIndex === index}
      duration={item.duration} 
      onAudioPress={() => this.handleAudioPress(item)}
      onOptionPress={() => {
        this.currentItem = item
        this.setState({ ...this.state, optionModalVisible: true })
      }}
    />
  }

  render() {
    return (
      <View style={styles.container}>
        <AudioContext.Consumer>
          {({ dataProvider, isPlaying }) => {
            if (!dataProvider._data.length) {
              return (
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                  <Text style={{fontSize: 16, letterSpacing: 1}}>곡이 없습니다.</Text>
                </View>
              )
            }
            return (
              <RecyclerListView 
                dataProvider={dataProvider} 
                layoutProvider={this.layoutProvider} 
                rowRenderer={this.rowRenderer} 
                extendedState={{isPlaying}}
              />
            )
          }}
        </AudioContext.Consumer>
        <AudioContext.Consumer>
          {({ currentAudio, isPlaying }) => {
            return (
              <>
                <OptionModal 
                  onPlayPress={this.handlePlayFromOption}
                  onPlaylistPress={this.addPlaylistNavigator}
                  currentItem={this.currentItem}
                  onClose={() =>
                    this.setState({ ...this.state, optionModalVisible: false })
                  }
                  visible={this.state.optionModalVisible} 
                />
                <TouchableOpacity
                  style={styles.musicTabBox}
                  onPress={() => this.props.navigation.navigate("Stream")}
                >
                  <Text style={styles.audioTitle}>{currentAudio ? extractFilenameOnly(currentAudio.filename) : '재생중인 곡이 없습니다.'}</Text>
                  <View style={styles.audioController}>
                    <PlayerButton
                      onPress={this.handlePrevious}
                      iconType='PREV' 
                      size={28} 
                    />
                    <PlayerButton 
                      onPress={this.handlePlayPause}
                      iconType={isPlaying ? 'PLAY' : 'PAUSE'}
                    />
                    <PlayerButton 
                      onPress={this.handleNext}
                      iconType='NEXT' 
                      size={28} 
                    />
                    <PlayerButton 
                      onPress={() => this.props.navigation.navigate('ActivePlaylist')}
                      iconType='LIST'
                    />
                  </View>
                </TouchableOpacity>
              </>
            )
          }}
        </AudioContext.Consumer>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    // justifyContent: 'center',
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

export default Home