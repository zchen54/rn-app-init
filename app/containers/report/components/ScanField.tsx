import React, {Component, useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Image as RNImage,
  TextInput,
  Text,
  Platform,
  Animated,
  Easing,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import {Icon, Modal} from '@ant-design/react-native';
import {PlatFormAndroid, PlatFormIOS} from '../../../env';
import {
  deviceWidth,
  deviceHeight,
  statusBarHeight,
  titleHeight,
  searchType,
  requestApiV2,
  API_v2,
} from '../../../common/utils';
import {
  searchUserByEmail,
  inviteFriendsToCompany,
  joinCompany,
  initReportImmediate,
} from '../../../store/actions';
import {RNCamera} from 'react-native-camera';
import {FONT_FAMILY, DColors} from '../../../common/styles';
import {styles} from '../../template/style';
import {fieldTypes} from '../../../common/constants';

interface Props {
  FieldValue: string;
  FieldType: string;
  placeholder?: string;
  maxLength?: number;
  handleChangeText: (text: string) => void;
  handleBlur?: () => void;
  isWarn?: boolean;
  decimalPlaces?: number;
}

export const ScanField = (props: Props) => {
  const {FieldType, FieldValue, handleChangeText, placeholder, isWarn} = props;

  const [scanModal, setScanModal] = useState(false);
  const [moveAnim, setMoveAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    startAnimation();
    return () => {};
  }, []);

  const startAnimation = () => {
    moveAnim.setValue(0);
    Animated.timing(moveAnim, {
      toValue: 195,
      duration: 2000,
      easing: Easing.linear,
    }).start(() => startAnimation());
  };

  const barCodeReceived = (e: any) => {
    if (e && e.data && scanModal) {
      const {data} = e;
      console.log(data);
      handleChangeText(data);
      setScanModal(false);
    }
  };

  const warnStyle: ViewStyle = {
    borderColor: '#ed2f31',
    borderWidth: 1,
  };
  let keyboardType: any = 'default';
  const barCodeOrQrCode = FieldType === fieldTypes.ScanBarCode;
  const barCodeHeight = 240;
  const RNCameraProps =
    Platform.OS === PlatFormAndroid
      ? {
          captureAudio: false,
          style: {flex: 1},
          type: RNCamera.Constants.Type.back,
          googleVisionBarcodeType:
            RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.QR_CODE,
          flashMode: RNCamera.Constants.FlashMode.auto,
          barcodeScannerEnabled: true,
          onBarCodeRead: (e: any) => barCodeReceived(e),
          androidCameraPermissionOptions: {
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          },
          androidRecordAudioPermissionOptions: {
            title: 'Permission to use audio recording',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          },
        }
      : {
          captureAudio: false,
          style: {flex: 1},
          type: RNCamera.Constants.Type.back,
          barcodeScannerEnabled: true,
          // barCodeTypes: [RNCamera.Constants.BarCodeType.qr],
          flashMode: RNCamera.Constants.FlashMode.auto,
          onBarCodeRead: (e: any) => barCodeReceived(e),
        };

  return (
    <View
      style={
        isWarn
          ? {...styles.TextAreaWrap, ...warnStyle}
          : {...styles.TextAreaWrap}
      }>
      <TextInput
        keyboardType={keyboardType}
        multiline={true}
        textAlignVertical="top"
        placeholder={placeholder ? placeholder : ''}
        value={
          FieldValue || (FieldType === 'Number' && FieldValue !== '')
            ? FieldValue
            : undefined
        }
        style={{...styles.formInput, marginBottom: 30}}
        onChangeText={handleChangeText}
      />
      <Icon
        name="scan"
        style={styles.scanFieldIcon}
        onPress={() => {
          setScanModal(true);
        }}
      />
      <Modal
        popup
        visible={scanModal}
        transparent={false}
        animationType="slide-up"
        onClose={() => {
          setScanModal(false);
        }}>
        <View
          style={{
            width: deviceWidth,
            height: deviceHeight,
            backgroundColor: '#666',
          }}>
          <TouchableOpacity
            style={
              Platform.OS === PlatFormIOS
                ? {...cameraStyles.closeButton, top: 70}
                : cameraStyles.closeButton
            }
            onPress={() => {
              setScanModal(false);
            }}>
            <Icon name="close" size={18} color="#fff" />
          </TouchableOpacity>
          <RNCamera {...RNCameraProps}>
            <View
              style={{
                height: (deviceHeight - statusBarHeight - titleHeight) / 3,
                width: deviceWidth,
                backgroundColor: 'rgba(0,0,0,0.5)',
              }}
            />
            <View style={{flexDirection: 'row'}}>
              <View
                style={
                  barCodeOrQrCode
                    ? {...cameraStyles.itemStyle, height: barCodeHeight}
                    : cameraStyles.itemStyle
                }
              />
              <View
                style={
                  barCodeOrQrCode
                    ? {...cameraStyles.rectangle, height: barCodeHeight}
                    : cameraStyles.rectangle
                }>
                <RNImage
                  resizeMode="stretch"
                  style={
                    barCodeOrQrCode
                      ? {...cameraStyles.rectangleImg, height: barCodeHeight}
                      : cameraStyles.rectangleImg
                  }
                  source={require('../../images/Me/icon_scan_rect.png')}
                />
                <Animated.Image
                  source={require('../../images/Me/scan_QR.png')}
                  style={[
                    cameraStyles.border,
                    {transform: [{translateY: moveAnim}]},
                  ]}
                />
              </View>
              <View
                style={
                  barCodeOrQrCode
                    ? {...cameraStyles.itemStyle, height: barCodeHeight}
                    : cameraStyles.itemStyle
                }
              />
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                width: deviceWidth,
                alignItems: 'center',
              }}>
              <Text style={cameraStyles.textStyle}>
                {barCodeOrQrCode ? 'Scan Bar Code' : 'Scan Qr Code'}
              </Text>
            </View>
          </RNCamera>
        </View>
      </Modal>
    </View>
  );
};

const cameraStyles = StyleSheet.create({
  itemStyle: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: (deviceWidth - 240) / 2,
    height: 240,
  },
  textStyle: {
    color: '#fff',
    marginTop: 20,
    fontSize: 18,
  },
  animatedStyle: {
    height: 2,
    backgroundColor: '#00c050',
  },
  rectangle: {
    height: 240,
    width: 240,
  },
  rectangleImg: {
    height: 240,
    width: 240,
    position: 'absolute',
    left: 0,
    top: 0,
    tintColor: DColors.mainColor,
  },
  border: {
    width: 240,
    resizeMode: 'contain',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(43,43,43,0.7)',
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 999,
  },
});
