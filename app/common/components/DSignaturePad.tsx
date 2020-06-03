import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal as RnModal,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import SignatureCapture from 'react-native-signature-capture';
import {
  Button,
  Modal,
  WhiteSpace,
  WingBlank,
  Toast,
  Provider,
} from '@ant-design/react-native';
import Orientation from 'react-native-orientation';
import {DColors, DFontSize, FONT_FAMILY} from '../styles';
import {
  statusBarHeight,
  setSize, // 设置宽高
  deviceHeight, // 设备高度
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
  uploadImage,
  API_v2,
  isNetworkConnected,
} from '../utils';
import {ErrorMessage_Network_Offline, PlatFormAndroid} from '../../env';
import {TitleBarNew} from './TitleBarNew';

const deleteImg = require('../../assets/images/template/delete-gray.png');

interface State {
  modalVisible: boolean;
  connected: boolean;
}
interface Props {
  source: string;
  pickerStyle?: any;
  handleConfirm: (source: string) => void;
  authToken: string;
}
export class DSignaturePad extends React.Component<Props, State> {
  SignatureDom: any;
  constructor(props: Props) {
    super(props);
    this.state = {modalVisible: false, connected: false};
  }

  componentWillMount() {}

  handleOpen = () => {
    isNetworkConnected()
      .then(isConnected => {
        if (isConnected) {
          // Orientation.getOrientation((err, orientation) => {
          //   // console.log("getOrientation", err, orientation);
          //   if (orientation === "PORTRAIT") {
          //     Orientation.lockToLandscape();
          //   } else {
          //     Orientation.lockToPortrait();
          //     Orientation.lockToLandscape();
          //   }
          // });

          this.setState({modalVisible: true, connected: true});
        } else {
          this.setState({modalVisible: true, connected: false});
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  handleClose = () => {
    // Orientation.getOrientation((err, orientation) => {
    //   // console.log("getOrientation", err, orientation);
    //   if (orientation === "PORTRAIT") {
    //     Orientation.lockToLandscape();
    //     Orientation.lockToPortrait();
    //   } else {
    //     Orientation.lockToPortrait();
    //   }
    // });

    this.setState({modalVisible: false});
  };

  handleDelete = () => {
    Modal.alert('Delete signature ?', '', [
      {
        text: 'Cancel',
        onPress: () => {
          console.log('cancel');
        },
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          this.props.handleConfirm('');
        },
      },
    ]);
  };

  saveSign = () => {
    this.SignatureDom.saveImage();
  };

  resetSign = () => {
    this.SignatureDom.resetImage();
  };

  _onSaveEvent = (result: any) => {
    const {authToken} = this.props;
    const {connected} = this.state;
    // console.log(result);
    if (connected) {
      uploadImage(
        API_v2.uploadFile,
        ['file://' + result.pathName],
        authToken,
      ).then((res: any) => {
        console.log('Response =---- ', res);
        if (res.result === 'Success') {
          this.props.handleConfirm(res.data[0]);
        }
      });
    } else {
      this.props.handleConfirm('file://' + result.pathName);
    }
    this.handleClose();
  };

  render() {
    const {modalVisible} = this.state;
    const {source, pickerStyle} = this.props;
    // console.log("render signature", source, deviceWidth, deviceHeight);
    return (
      <View style={styles.container}>
        {!source || source === '' ? (
          <TouchableOpacity
            style={
              pickerStyle
                ? [styles.defaultView, pickerStyle]
                : styles.defaultView
            }
            onPress={this.handleOpen}>
            <Text>Click here to sign</Text>
          </TouchableOpacity>
        ) : (
          <View
            style={
              pickerStyle
                ? [styles.signatureView, pickerStyle]
                : styles.signatureView
            }>
            <Image
              style={
                pickerStyle
                  ? [styles.signatureImage, pickerStyle]
                  : styles.signatureImage
              }
              source={{
                uri: source,
              }}
            />
            <TouchableOpacity
              key="newPicker"
              onPress={() => {
                this.handleDelete();
              }}
              style={styles.deleteBtn}>
              <Image style={styles.deleteIcon} source={deleteImg} />
            </TouchableOpacity>
          </View>
        )}
        {/* <Modal
          popup
          transparent={false}
          visible={modalVisible}
          animationType="slide-up"
          onClose={this.handleClose}
        >
          <View style={styles.signatureWrap}>
            <Text style={styles.labelText}>Please sign below</Text>
            <View style={styles.signature}>
              <SignatureCapture
                ref={(dom: any) => {
                  this.SignatureDom = dom;
                }}
                style={styles.SignatureCaptureView}
                onSaveEvent={this._onSaveEvent}
                // onDragEvent={this._onDragEvent} // 涂画时的回调
                showBorder={true} // 是否显示虚线边框（边框仅在iOS上显示）
                saveImageFileInExtStorage={true} // 将图像文件保存在外部存储中
                showNativeButtons={false} // 是否显示本机按钮“Save”和“Reset”
                showTitleLabel={false} // 是否显示“x_ _ _ _ _ _ _ _ _ _”占位符，指示要签名的位置
                // viewMode={"landscape"} // 'portrait' | 'landscape' 设置屏幕方向
                // maxSize ：设置图像的最大尺寸保持纵横比，默认为500
              />
            </View>
            <View style={{ flexDirection: "row" }}>
              <Button style={styles.buttonStyle} onPress={this.handleClose}>
                <Text>Exit</Text>
              </Button>
              <Button style={styles.buttonStyle} onPress={this.resetSign}>
                <Text>Reset</Text>
              </Button>
              <Button style={styles.buttonStyle} onPress={this.saveSign}>
                <Text>Save</Text>
              </Button>
            </View>
          </View>
        </Modal> */}
        <RnModal
          visible={modalVisible}
          transparent={true}
          animationType="slide">
          <View style={styles.modalWrapper}>
            <TitleBarNew
              title={'Signature'}
              navigation={null}
              pressLeft={this.handleClose}
              isStatusBAr={Platform.OS === PlatFormAndroid ? true : false}
            />
            <View style={styles.signature}>
              <SignatureCapture
                ref={(dom: any) => {
                  this.SignatureDom = dom;
                }}
                style={styles.SignatureCaptureView}
                onSaveEvent={this._onSaveEvent}
                // onDragEvent={this._onDragEvent} // 涂画时的回调
                showBorder={false} // 是否显示虚线边框（边框仅在iOS上显示）
                saveImageFileInExtStorage={true} // 将图像文件保存在外部存储中
                showNativeButtons={false} // 是否显示本机按钮“Save”和“Reset”
                showTitleLabel={false} // 是否显示“x_ _ _ _ _ _ _ _ _ _”占位符，指示要签名的位置
                // viewMode={"landscape"} // 'portrait' | 'landscape' 设置屏幕方向
                // maxSize ：设置图像的最大尺寸保持纵横比，默认为500
              />
            </View>
            <View style={styles.buttonWrapper}>
              <TouchableWithoutFeedback onPress={this.resetSign}>
                <View style={styles.button}>
                  <Text style={styles.text}>Reset</Text>
                </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={this.saveSign}>
                <View style={styles.button}>
                  <Text style={styles.text}>Save</Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </RnModal>
      </View>
    );
  }
}
export const signatureHeight = (500 / 984) * (deviceWidth - 32);
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    // borderColor: "red",
    // borderWidth: 1
  },
  defaultView: {
    width: deviceWidth - 32,
    height: signatureHeight,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    // borderColor: "green",
    // borderWidth: 1
  },
  signatureView: {
    width: deviceWidth - 32,
    height: signatureHeight,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  signatureImage: {
    width: deviceWidth - 32,
    height: signatureHeight,
  },
  SignatureCaptureView: {
    flex: 1,
  },
  labelText: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  signature: {
    width: deviceWidth - 32,
    height: signatureHeight,
    marginTop: 54,
    marginBottom: 30,
    marginLeft: 16,
    borderWidth: 1,
    borderColor: '#9D9D9D',
  },
  signatureWrap: {
    width: deviceWidth,
    height: deviceHeight,
    paddingVertical: 100,
  },
  buttonStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#f2f2f2',
    margin: 10,
  },
  deleteBtn: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  deleteIcon: {
    width: setSizeWithPx(60),
    height: setSizeWithPx(60),
  },
  modalWrapper: {
    width: deviceWidth,
    height: deviceHeight,
    backgroundColor: '#F2F2F2',
  },
  buttonWrapper: {
    marginTop: 40,
    width: deviceWidth,
    paddingLeft: 33,
    paddingRight: 33,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    width: 95,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: DColors.mainColor,
    borderRadius: 3.33,
  },
  text: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});
