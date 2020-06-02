import React, {Component, useEffect} from 'react';
import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
// import CodePush from 'react-native-code-push';
import RNBootSplash from 'react-native-bootsplash';
import CodePushUpdateModal from './CodePushUpdateModal.js';
import {Button, Provider, Toast} from '@ant-design/react-native';
import {Root} from './app/Root';
import {releaseMode, PlatFormAndroid} from './app/env';

console.disableYellowBox = true;

const Data2Go = props => {
  useEffect(() => {
    if (Platform.OS === PlatFormAndroid) {
      RNBootSplash.hide({duration: 250});
    }
  }, []);

  return (
    <Provider>
      <Root initialProperties={props || {}}></Root>
      <CodePushUpdateModal></CodePushUpdateModal>
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => Data2Go);

// let codePushOptions = {
//   //设置检查更新的频率
//   //ON_APP_RESUME APP恢复到前台的时候
//   //ON_APP_START APP开启的时候
//   //MANUAL 手动检查
//   checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
// };

// AppRegistry.registerComponent(appName, () =>
//   CodePush(codePushOptions)(Data2Go),
// );
