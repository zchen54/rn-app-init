/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';

import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {Button, Provider, Toast} from '@ant-design/react-native';
import {Root} from './app/Root';

declare var global: {HermesInternal: null | {}};

const App = (props: any) => {
  const a = {
    b: {
      c: 123,
    },
  };

  let temp = a?.b?.c;
  console.log('===', temp);

  return (
    <>
      <Provider>
        <Root initialProperties={props || {}}></Root>
      </Provider>
    </>
  );
};

export default App;
