import 'react-native-gesture-handler';
import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
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
import {PlatFormAndroid, setReleaseMode, serverURL} from './env';
import {Button, Toast} from '@ant-design/react-native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/lib/integration/react';
import {store, persistor} from './store';
import Orientation from 'react-native-orientation';
import ObjectID from 'bson-objectid';
import QRCode from 'react-native-qrcode-svg';
import {DImagePicker, DSignaturePad, MapScreen} from './common/components';
import {mediaPicker} from './common/utils';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import Swiper from 'react-native-swiper';

import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

function HomeScreen() {
  // 打开时获取数据
  useEffect(() => {
    const initial = Orientation.getInitialOrientation();
    console.log('Orientation', initial);
    console.log('ObjectID', ObjectID.generate());
  }, []);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = date => {
    console.warn('A date has been picked: ', date);
    hideDatePicker();
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}>
        <Header />
        {global.HermesInternal == null ? null : (
          <View style={styles.engine}>
            <Text style={styles.footer}>Engine: Hermes</Text>
          </View>
        )}
        <View style={styles.body}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Ant Design Mobile RN</Text>
            <Button
              type="ghost"
              onPress={() => {
                let reqObj = {
                  width: 300,
                  height: 300,
                  cropping: true,
                  cropperCircleOverlay: true,
                };
                mediaPicker({selectType: 'camera', reqObj}, (res: any) => {
                  console.log('mediaPicker', res);
                });
                Toast.info('This is a toast tips');
              }}
              style={{marginBottom: 10}}>
              Pick Image From Camera
            </Button>
            <Button
              type="ghost"
              onPress={() => {
                let options = {
                  width: 300,
                  height: 300,
                  cropping: true,
                  cropperCircleOverlay: true,
                };
                mediaPicker({selectType: 'gallery', options}, (res: any) => {
                  console.log('mediaPicker', res);
                });
                Toast.info('This is a toast tips');
              }}
              style={{marginBottom: 10}}>
              Pick Image From Gallery
            </Button>
            <Button type="ghost" onPress={showDatePicker}>
              Show Date Picker
            </Button>
            <DateTimePickerModal
              isVisible={isDatePickerVisible}
              mode="date"
              onConfirm={handleConfirm}
              onCancel={hideDatePicker}
            />
          </View>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Signature</Text>
            <DSignaturePad
              // pickerStyle={{ width: deviceWidth * 0.8, height: deviceWidth * 0.4 }}
              source={''}
              handleConfirm={(uri: string) => {
                console.log('SignaturePad', uri);
              }}
              authToken={''}
            />
          </View>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Image Picker</Text>
            <DImagePicker
              pickerStyle={{width: 64, height: 64}}
              source={''}
              handleSelect={(uri: string, response: any) => {
                console.log('Pick image', uri, response);
              }}
              authToken={''}
              isCollectData={true}
            />
          </View>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>QR Code</Text>
            <QRCode value="http://awesome.link.qr" />
          </View>
          <Swiper style={styles.wrapper} showsButtons={true}>
            <View style={styles.slide1}>
              <Text style={styles.text}>Hello Swiper</Text>
            </View>
            <View style={styles.slide2}>
              <Text style={styles.text}>Beautiful</Text>
            </View>
            <View style={styles.slide3}>
              <Text style={styles.text}>And simple</Text>
            </View>
          </Swiper>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Settings!</Text>
    </View>
  );
}

declare var global: {HermesInternal: null | {}};

const Tab = createBottomTabNavigator();

export const Root = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          <Tab.Navigator>
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Map" component={MapScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  wrapper: {
    height: 200,
  },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
});
