import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  StyleSheet,
  Image as RNImage,
  Text,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import {Buffer} from 'buffer';
import Jimp from 'jimp';
import {PlatFormAndroid} from '../../env';
import {TitleBarNew} from '../../common/components';
import {Modal, Toast, Portal, Icon} from '@ant-design/react-native';
import ImagePicker from 'react-native-image-picker';
// import LocalBarcodeRecognizer from "react-native-local-barcode-recognizer";
// import QRReader from 'qrcode-reader';
import {
  deviceWidth,
  deviceHeight,
  statusBarHeight,
  titleHeight,
  searchType,
  requestApiV2,
  API_v2,
} from '../../common/utils';
import {
  searchUserByEmail,
  inviteFriendsToCompany,
  joinCompany,
  initReportImmediate,
} from '../../store/actions';
import {RNCamera} from 'react-native-camera';
import {FONT_FAMILY, DColors} from '../../common/styles';
import {formatServiceTemplateToLocal} from '../../store/sagas/template';

interface State {
  hadSearch: boolean;
  moveAnim: any;
}
interface Props {
  navigation: any;
  currentUserInfo: any;
  dispatch: Function;
}
const Page = {
  font_family: FONT_FAMILY,
};

export class ScanQRCode extends Component<Props, State> {
  viewDidAppear: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      hadSearch: false,
      moveAnim: new Animated.Value(0),
    };
  }

  startAnimation = () => {
    this.state.moveAnim.setValue(0);
    Animated.timing(this.state.moveAnim, {
      toValue: 195,
      duration: 2000,
      easing: Easing.linear,
    }).start(() => this.startAnimation());
  };

  componentDidMount() {
    this.viewDidAppear = this.props.navigation.addListener(
      'willFocus',
      (navigationProps: any) => {
        console.log('willFocus');
        this.setState({
          hadSearch: false,
        });
      },
    );
    this.startAnimation();
  }

  componentWillUnmount() {
    this.viewDidAppear.remove();
  }

  barcodeReceived = (e: any) => {
    let {hadSearch} = this.state;
    if (e && !hadSearch) {
      const {data} = e;
      this.handleAnalysisQRData(data);
    }
  };

  handleAnalysisQRData = (data: string) => {
    console.log('scan data', data);
    let type = this.props.navigation.getParam('type');
    if (data[0] === '{' && data[data.length - 1] === '}') {
      if (type === 'InviteOrganization') {
        // 邀请好友进公司那个页面进入扫码
        let {currentUserInfo, navigation} = this.props;
        let {authToken} = currentUserInfo;
        let email = JSON.parse(data).email;
        this.props.dispatch(
          inviteFriendsToCompany(
            authToken,
            {
              receiverEmails: [email],
              companyPkey: '',
            },
            () => {
              navigation.navigate('Organization');
            },
          ),
        );
      } else {
        // 个人中心进入扫码
        let {currentUserInfo, navigation} = this.props;
        let {authToken} = currentUserInfo;
        let Data = JSON.parse(data);
        if (Data.type === 'organization') {
          // 扫到公司
          if (currentUserInfo.companyName) {
            this.setState({
              hadSearch: true,
            });
            Modal.alert(
              'Join organization failed !',
              "You've joined a organization",
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.goBack();
                  },
                },
              ],
            );
            return;
          }
          this.props.dispatch(
            joinCompany(authToken, Data.Pkey, () => {
              navigation.goBack();
            }),
          );
        } else if (Data.type === 'person') {
          // 扫到个人
          this.props.dispatch(
            searchUserByEmail(authToken, Data.email, () => {
              navigation.navigate('FriendInfo', {
                type: searchType.FriendEmail,
              });
            }),
          );
        }
      }
    } else if (data.indexOf('code=') > -1) {
      // S扫码登陆web端
      this.props.navigation.navigate('WebLogin', {
        data: data,
      });
    } else if (data.includes('/reportEdit/qr_user/')) {
      // 扫码填写报表
      this.handlePrepareCollectData(data);
    } else {
      this.setState({
        hadSearch: true,
      });
      Modal.alert('Unable to identify qr code', '', [
        {
          text: 'OK',
          onPress: () => {
            this.setState({
              hadSearch: false,
            });
          },
        },
      ]);
      return;
    }
    this.setState({
      hadSearch: true,
    });
    return;
  };

  handlePrepareCollectData = (templateLink: string) => {
    let templateId = templateLink.substr(
      templateLink.indexOf('/reportEdit/qr_user/') +
        '/reportEdit/qr_user/'.length,
    );
    const toastKey = Toast.loading('Loading...', 0);
    const handleGetTemplateError = (error?: string) => {
      Modal.alert(error ? error : 'Request template failed !', '', [
        {
          text: 'OK',
          onPress: () => {
            this.setState({
              hadSearch: false,
            });
          },
        },
      ]);
    };
    requestApiV2(
      API_v2.getTemplateByShare,
      {
        templateId,
      },
      '',
    )
      .then(res => {
        Portal.remove(toastKey);
        if (res.data && Array.isArray(res.data.sections)) {
          let localTemplate = formatServiceTemplateToLocal(res.data);
          this.props.dispatch(initReportImmediate(localTemplate));
          this.props.navigation.navigate('CollectData', {
            type: 'Create',
            source: 'ByShareTemplate',
          });
        } else {
          handleGetTemplateError(res.error);
        }
      })
      .catch(error => {
        Portal.remove(toastKey);
        handleGetTemplateError(error);
        console.error(error);
      });
  };

  handleGallery = () => {
    console.log('handleGallery');
    const options: any = {
      title: 'Choose Image',
      cancelButtonTitle: 'Cancel',
      takePhotoButtonTitle: 'Take Photo',
      chooseFromLibraryButtonTitle: 'Choose from Gallery',
      cameraType: 'back',
      mediaType: 'photo',
      quality: 0.5,
      angle: 0,
      allowsEditing: false,
      noData: false,
      storageOptions: {
        skipBackup: true,
        path: 'LcpImages',
      },
    };
    ImagePicker.launchImageLibrary(options, (response: any) => {
      console.log('Response = ', response);

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        if (response.fileSize / 1024 / 1024 > 5) {
          Toast.fail('Images cannot be larger than 100M', 2, undefined, false);
        } else {
          this.recognizeImage(response.uri);
        }
      }
    });
  };

  recognizeImage = async (base64Data: any) => {
    // let result = await LocalBarcodeRecognizer.decode(base64Data, {
    //   codeTypes: ["ean13", "qr"]
    // });
    // console.log("recognize result --->", result);
    // this.handleAnalysisQRData(result);
    // const qr = new QRReader();
    // Jimp.read(base64Data, function(err, image) {
    //   console.log('Jimp.read', image);
    //   if (err) {
    //     console.error(err);
    //     // TODO handle error
    //   }
    //   let qr = new QRReader();
    //   qr.callback = function(err, value) {
    //     if (err) {
    //       console.error(err);
    //     }
    //     console.log('-----------', value, err);
    //   };
    //   qr.decode(image.bitmap);
    // });
    // const img = await Jimp.read(base64Data);
    // const qr = new QRReader();
    // const value = await new Promise((resolve, reject) => {
    //   qr.callback = (err, v) => (err != null ? reject(err) : resolve(v));
    //   qr.decode(img.bitmap);
    // });
    // console.log('-----------', img, value);
  };

  render() {
    let {navigation} = this.props;
    // console.log("RNCamera", RNCamera);

    const RNCameraProps =
      Platform.OS === PlatFormAndroid
        ? {
            captureAudio: false,
            style: styles.preview,
            type: RNCamera.Constants.Type.back,
            googleVisionBarcodeType:
              RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType
                .QR_CODE,
            flashMode: RNCamera.Constants.FlashMode.auto,
            onBarCodeRead: (e: any) => this.barcodeReceived(e),
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
            style: styles.preview,
            type: RNCamera.Constants.Type.back,
            barCodeTypes: [RNCamera.Constants.BarCodeType.qr],
            flashMode: RNCamera.Constants.FlashMode.auto,
            onBarCodeRead: (e: any) => this.barcodeReceived(e),
          };
    // console.log("RNCameraProps---", RNCameraProps);

    return (
      <View style={styles.container}>
        <TitleBarNew
          title={'Scan QR code'}
          navigation={navigation}
          // right={<Icon name="picture" color="#fff"></Icon>}
          // pressRight={this.handleGallery}
        />
        <RNCamera {...RNCameraProps}>
          <View
            style={{
              height: (deviceHeight - statusBarHeight - titleHeight) / 3,
              width: deviceWidth,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />
          <View style={{flexDirection: 'row'}}>
            <View style={styles.itemStyle} />
            <View style={styles.rectangle}>
              <RNImage
                style={[
                  styles.rectangle,
                  {
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    tintColor: DColors.mainColor,
                  },
                ]}
                source={require('../images/Me/icon_scan_rect.png')}
              />
              <Animated.Image
                source={require('../images/Me/scan_QR.png')}
                style={[
                  styles.border,
                  {transform: [{translateY: this.state.moveAnim}]},
                ]}
              />
            </View>
            <View style={styles.itemStyle} />
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              width: deviceWidth,
              alignItems: 'center',
            }}>
            <Text style={styles.textStyle}>Scan QR Code</Text>
          </View>
        </RNCamera>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
  },
  itemStyle: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: (deviceWidth - 200) / 2,
    height: 200,
  },
  textStyle: {
    fontFamily: Page.font_family,
    color: '#fff',
    marginTop: 20,
    fontSize: 18,
  },
  animatedStyle: {
    height: 2,
    backgroundColor: '#00c050',
  },
  rectangle: {
    height: 200,
    width: 200,
  },
  border: {
    width: 200,
    resizeMode: 'contain',
  },
});

const mapStateToProps = (state: any) => {
  return {
    currentUserInfo: state.loginInfo.currentUserInfo,
  };
};

export default connect(mapStateToProps)(ScanQRCode);
