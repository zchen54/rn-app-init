import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  BackHandler,
} from 'react-native';
import {NavigationContainer, useFocusEffect} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator, HeaderBackButton} from '@react-navigation/stack';
import {IconOutline} from '@ant-design/icons-react-native';
import {Toast, Icon, Modal, Button} from '@ant-design/react-native';
import IconWithBadge from './IconWithBadge';
import getActiveRouteName from './getActiveRouteName';
import getScreenOptions from './getScreenOptions';
import {navigationRef} from './NavigationService';

// eg
import HomeScreen from '../screens/eg/HomeScreen';
import SafeAreaViewScreen from '../screens/eg/SafeAreaViewScreen';
import DetailsScreen from '../screens/eg/DetailsScreen';
import SettingsScreen from '../screens/eg/SettingsScreen';
import CustomAndroidBackButtonBehaviorScreen from '../screens/eg/CustomAndroidBackButtonBehaviorScreen';

// collect data
import CollectDataScreen from '../screens/collectData/CollectDataScreen';

const Stack = createStackNavigator();
const BottomTab = createBottomTabNavigator();

const BottomTabScreen = () => (
  <BottomTab.Navigator
    screenOptions={({route}) => ({
      tabBarIcon: ({focused, color, size}) => {
        let iconName: any;
        if (route.name === 'HomeScreen') {
          iconName = focused ? 'fund' : 'fund';
          return (
            <IconWithBadge badgeCount={90}>
              <Icon name={iconName} size={size} color={color} />
            </IconWithBadge>
          );
        } else if (route.name === 'SettingsScreen') {
          iconName = focused ? 'appstore' : 'appstore';
        }
        return <Icon name={iconName} size={size} color={color} />;
      },
    })}
    tabBarOptions={{
      activeTintColor: 'tomato',
      inactiveTintColor: 'gray',
    }}>
    <Stack.Screen
      name="HomeScreen"
      component={HomeScreen}
      options={{tabBarLabel: 'Dashboard'} as any}
    />
    <Stack.Screen
      name="SettingsScreen"
      component={CollectDataScreen}
      options={{tabBarLabel: 'App'} as any}
    />
  </BottomTab.Navigator>
);

const App = () => {
  const routeNameRef = React.useRef();
  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={state => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = getActiveRouteName(state);
        if (previousRouteName !== currentRouteName) {
          console.log('[onStateChange]', currentRouteName);
          if (currentRouteName === 'HomeScreen') {
            StatusBar.setBarStyle('dark-content'); // 修改 StatusBar
          } else {
            StatusBar.setBarStyle('dark-content'); // 修改 StatusBar
          }
        }
        // Save the current route name for later comparision
        routeNameRef.current = currentRouteName;
      }}>
      <Stack.Navigator
        initialRouteName="HomeScreen"
        // 页面共享的配置
        screenOptions={getScreenOptions()}>
        <Stack.Screen
          name="BottomTabScreen"
          component={BottomTabScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="DetailsScreen"
          component={DetailsScreen}
          options={{headerTitle: '详情'}} // headerTitle 用来设置标题栏
          initialParams={{itemId: 42}} // 默认参数
        />
        <Stack.Screen
          name="SafeAreaViewScreen"
          component={SafeAreaViewScreen}
          options={{headerTitle: 'SafeAreaView'}}
        />
        <Stack.Screen
          name="CustomAndroidBackButtonBehaviorScreen"
          component={CustomAndroidBackButtonBehaviorScreen}
          options={{headerTitle: '拦截安卓物理返回键'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
