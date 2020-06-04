import React, {Component} from 'react';
import {
  Image,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Linking,
  Modal,
} from 'react-native';
import {Toast, Portal} from '@ant-design/react-native';
import {requestApiV2, API_v2, deviceWidth, deviceHeight} from '../utils';
import {DColors} from '../styles';
import {PlatFormAndroid} from '../../env';

const updateBackground = require('../../assets/images/GuidePage/rocket.png');

interface Props {
  visible: boolean;
  newVersion: any;
  handleCloseModal: Function;
}

export const NewVersionModal = (props: Props) => {
  const {visible, newVersion, handleCloseModal} = props;

  function handleUpdateApp() {
    const googlePlayUrl =
        'http://play.google.com/store/apps/details?id=com.data2go',
      appStoreUrl = 'itms-apps://itunes.apple.com/cn/app/1474206224?mt=8';

    if (Platform.OS === PlatFormAndroid) {
      Linking.canOpenURL(googlePlayUrl)
        .then(supported => {
          if (!supported) {
            Toast.info("Can't handle url");
          } else {
            return Linking.openURL(googlePlayUrl);
          }
        })
        .catch(err => console.error('An error occurred', err));
    } else {
      Linking.canOpenURL(appStoreUrl)
        .then(supported => {
          if (!supported) {
            Toast.info("Can't handle url");
          } else {
            return Linking.openURL(appStoreUrl);
          }
        })
        .catch(err => console.error('An error occurred', err));
    }
  }

  let contentArray = newVersion.content
    ? newVersion.content.split(' /n ')
    : [''];

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalWrap}>
        <View style={styles.infoWrap}>
          <Image source={updateBackground} style={{width: 280, height: 132}} />
          <View style={styles.header}>
            <Text style={styles.title}>New version</Text>
            <Text style={styles.version}>{newVersion.versionName}</Text>
          </View>
          <View style={styles.content}>
            {contentArray.map((item: string, index: number) => (
              <Text key={index} style={styles.contentLine}>
                {item}
              </Text>
            ))}
            <View
              style={
                !newVersion.forceUpdate
                  ? styles.buttonGroup
                  : {...styles.buttonGroup, justifyContent: 'center'}
              }>
              {!newVersion.forceUpdate && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    handleCloseModal();
                  }}>
                  <Text style={styles.cancelButtonText}>Ignore</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleUpdateApp}>
                <Text style={styles.confirmButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalWrap: {
    height: deviceHeight,
    width: deviceWidth,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  infoWrap: {
    width: 280,
    borderRadius: 5,
    overflow: 'hidden',
  },
  header: {
    position: 'absolute',
    top: 0,
    width: 280,
    height: 132,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 20,
    color: '#fff',
  },
  version: {
    marginTop: 5,
    fontSize: 18,
    color: '#fff',
  },
  content: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  contentLine: {
    marginBottom: 10,
    fontSize: 16,
    color: '#434343',
  },
  buttonGroup: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cancelButton: {
    width: 112,
    height: 36,
    borderRadius: 5,
    borderColor: '#757575',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    borderColor: '#757575',
  },
  confirmButton: {
    width: 112,
    height: 36,
    borderRadius: 5,
    backgroundColor: DColors.mainColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});
