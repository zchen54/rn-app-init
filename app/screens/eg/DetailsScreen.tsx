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

const DetailsScreen = (props: Props) => {
  // 通过 props.route.params 接收参数
  const {navigation, route} = props;
  const {itemId, otherParam} = route.params;
  return (
    <View style={styles.container}>
      <Text>Details Screen</Text>
      <Text>itemId: {itemId}</Text>
      <Text>otherParam: {otherParam}</Text>
      <Button
        type="primary"
        // 返回上一页
        onPress={() => navigation.goBack()}>
        Go back
      </Button>
      <Button
        type="primary"
        // 如果返回上一个页面需要传递参数，请使用 navigate 方法
        onPress={() => navigation.navigate('HomeScreen', {author: '杨俊宁'})}>
        Go back with Params
      </Button>
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

export default DetailsScreen;
