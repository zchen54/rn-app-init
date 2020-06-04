import React, {Component, useState, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  Platform,
  NativeModules,
  TextInput,
  Text,
} from 'react-native';
import {PlatFormAndroid, setReleaseMode, serverURL} from './env';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/lib/integration/react';
import {store, persistor} from './store';
// import AppContainer from './containers/App';
import {Modal, Toast, Portal} from '@ant-design/react-native';
import AppWrapper from './AppWrapper';

// 使text和input字体不随系统变化而变化
Text.defaultProps = Object.assign({}, Text.defaultProps, {
  allowFontScaling: false,
});
TextInput.defaultProps.allowFontScaling = false;

export const Root = (props: any) => {
  console.log('root props', props);
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppWrapper {...props} />
      </PersistGate>
    </Provider>
  );
};
