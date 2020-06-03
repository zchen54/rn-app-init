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

const HomeScreen = (props: Props) => {
  const {navigation, route} = props;
  navigation.setOptions({
    headerLeft: (props: any) => (
      <HeaderBackButton
        {...props}
        onPress={() => {
          console.log('不能再返回了！');
        }}
      />
    ),
    headerRight: () => (
      <HeaderButtons>
        {/* title、iconName、onPress、IconComponent、iconSize、color */}
        <HeaderButtons.Item
          title="添加"
          iconName="plus"
          onPress={() => console.log('点击了添加按钮')}
          iconSize={24}
          color="#ffffff"
        />
      </HeaderButtons>
    ),
  });

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, []),
  );
  const {author} = route.params || {};
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text>Home Screen</Text>
        <Text>{author}</Text>
        <Button
          type="warning"
          // 使用 setOptions 更新标题
          onPress={() => navigation.setOptions({headerTitle: 'Updated!'})}>
          Update the title
        </Button>
        <Button
          type="primary"
          onPress={() =>
            // 跳转到指定页面，并传递两个参数
            navigation.navigate('DetailsScreen', {
              otherParam: 'anything you want here',
            })
          }>
          Go to DetailsScreen
        </Button>
        <Button
          type="warning"
          onPress={() => navigation.navigate('SafeAreaViewScreen')}>
          Go SafeAreaViewScreen
        </Button>
        <Button
          type="primary"
          onPress={() =>
            navigation.navigate('CustomAndroidBackButtonBehaviorScreen')
          }>
          Go CustomAndroidBackButtonBehavior
        </Button>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
