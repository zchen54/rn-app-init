import React, {Component} from 'react';
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
import AppContainer from './routes/AppContainer';
import {
  NavigationService,
  isIphoneX,
  isIphoneXsMax,
  deviceHeight,
  deviceWidth,
  checkNewVersion,
  clearUserInfo,
} from './common/utils';
import {NewVersionModal} from './common/components';
import {Modal, Toast, Portal} from '@ant-design/react-native';

const iOSToolModule = NativeModules.ToolModule;

interface State {
  versionName: string;
  versionCode: number;
  updateModalVisible: boolean;
  newVersion: any;
}
interface Props {
  initialProperties: any;
}

// 使text和input字体不随系统变化而变化
Text.defaultProps = Object.assign({}, Text.defaultProps, {
  allowFontScaling: false,
});
TextInput.defaultProps.allowFontScaling = false;

export class Root extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      versionName: '',
      versionCode: 0,
      updateModalVisible: false,
      newVersion: {},
    };
  }

  componentWillMount() {
    const {isDebugMode, isBetaMode} = this.props.initialProperties;
    console.log('isDebugMode', isDebugMode);
    console.log('isBetaMode', isBetaMode);
    if (Platform.OS === PlatFormAndroid) {
      let isRelease = !isDebugMode && !isBetaMode;
      setReleaseMode(isRelease);
    } else {
    }
    // this.getVersion();
  }

  // 获取版本号
  getVersion = () => {
    if (Platform.OS === PlatFormAndroid) {
      const {versionName, versionCode} = this.props.initialProperties;
      this.handleCheckNewVersion(versionName, versionCode);
      this.setState({
        versionName,
        versionCode,
      });
    } else {
      iOSToolModule.getAppVersion(
        (error: any, versionName: string, versionCode: any) => {
          console.log('getAppVersion---', error, versionName, versionCode);
          if (error) {
            console.log(error);
          } else {
            this.handleCheckNewVersion(versionName, versionCode);
            this.setState({
              versionName,
              versionCode,
            });
          }
        },
      );
    }
  };

  handleCheckNewVersion = (versionName: string, versionCode: number) => {
    const toastKey = Toast.loading('Loading...', 0);
    checkNewVersion(versionName, versionCode, true)
      .then((res: any) => {
        Portal.remove(toastKey);
        if (res.result === 'Success') {
          if (res.data) {
            if (res.data.versionName && res.data.versionCode > versionCode) {
              if (res.data.forceUpdate) {
                clearUserInfo();
                console.log('Login again after install new version');
                NavigationService.navigate('Login', {
                  action: 'Authentication expired',
                });
              }
              this.setState({
                newVersion: res.data,
                updateModalVisible: true,
              });
            }
          }
        }
      })
      .catch(error => {
        Portal.remove(toastKey);
      });
  };

  // 关闭操作弹窗
  closeControllerModal = () => {
    this.setState({
      updateModalVisible: false,
    });
  };

  render() {
    console.log('render props---', this.props);
    console.log('serverURL is: ', serverURL);
    const {updateModalVisible, newVersion} = this.state;
    const iphoneSafeAreaStyle = {
      flex: 1,
      // backgroundColor: '#f2f2f2',
      // paddingBottom: isIphoneX() || isIphoneXsMax() ? 30 : 0,
    };
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <SafeAreaView style={iphoneSafeAreaStyle}>
            <AppContainer
            // screenProps={this.props}
            // ref={navigatorRef => {
            //   NavigationService.setTopLevelNavigator(navigatorRef);
            // }}
            />
            <NewVersionModal
              visible={updateModalVisible}
              newVersion={newVersion}
              handleCloseModal={this.closeControllerModal}
            />
          </SafeAreaView>
        </PersistGate>
      </Provider>
    );
  }
}
