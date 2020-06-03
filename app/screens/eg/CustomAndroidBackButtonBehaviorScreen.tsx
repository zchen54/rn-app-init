import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  BackHandler,
} from 'react-native';
import {Toast, Icon, Modal, Button} from '@ant-design/react-native';
import {NavigationContainer, useFocusEffect} from '@react-navigation/native';
import {createStackNavigator, HeaderBackButton} from '@react-navigation/stack';
import HeaderButtons from '../../routes/HeaderButtons';

interface Props {
  navigation: any;
  route: any;
}

const CustomAndroidBackButtonBehaviorScreen = (props: Props) => {
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        console.log('物理返回键被拦截了！');
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );
  return (
    <View style={styles.container}>
      <Text>AndroidBackHandlerScreen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CustomAndroidBackButtonBehaviorScreen;
