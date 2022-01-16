import AppNavigator from './src/navigation/AppNavigator'
import AudioProvider from './src/context/AudioProvider'

export default function App() {
  return (
    <AudioProvider>
      <AppNavigator />
    </AudioProvider>
  );
}
