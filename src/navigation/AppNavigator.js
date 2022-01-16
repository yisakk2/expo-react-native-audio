import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Icon from 'react-native-vector-icons/Feather'

import ActivePlaylist from '../screens/activePlaylist'
import AddPlaylist from '../screens/addPlaylist'
import Playlist from '../screens/playlist'
import Home from '../screens/home'
import Stream from '../screens/stream'

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()
// const DeepStack = createStackNavigator()

// const PlaylistStack = () => {
//   return (
//     <DeepStack.Navigator>
//       <DeepStack.Screen 
//         name="PLAYLIST MAIN" 
//         component={Playlist} 
//         options={{
//           headerTitle: 'PLAYLIST',
//           headerTitleAlign: 'center',
//         }}
//       />
//       <DeepStack.Screen
//         name="PLAYLIST DETAIL"
//         component={PlaylistDetail}
//         options={{
//           headerTitle: 'PLAYLIST',
//           headerTitleAlign: 'center',
//           headerShown: false
//         }}
//       />
//     </DeepStack.Navigator>
//   )
// }

const Tabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="HOME" 
        component={Home} 
        options={{
          headerTitleAlign: 'center',
          tabBarIcon: ({color, size}) => (
            <Icon name="radio" color={color} size={size} />
          ),
          tabBarActiveTintColor: '#f00',
        }}
      />
      <Tab.Screen 
        name="PLAYLIST" 
        component={Playlist} 
        options={{
          headerTitleAlign: 'center',
          tabBarIcon: ({color, size}) => (
            <Icon name="folder" color={color} size={size} />
          ),
          tabBarActiveTintColor: '#f00',
          // headerShown: false
        }}
      />
    </Tab.Navigator>
  );
}

const AppNavigator = () => {
  return (
    <NavigationContainer screenOptions={{}}>
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS
        }}
      >
        <Stack.Screen 
          name="List"
          component={Tabs}
        />
        <Stack.Screen 
          name="Stream"
          component={Stream}
          options={{
            gestureDirection: 'vertical',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen 
          name="AddPlaylist"
          component={AddPlaylist}
          options={{
            gestureDirection: 'vertical',
            headerShadowVisible: false,
          }}
        />
        <Stack.Screen 
          name="ActivePlaylist"
          component={ActivePlaylist}
          options={{
            gestureDirection: 'vertical',
            headerShadowVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;