import React, {Component, useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  BackHandler,
  NativeModules,
  Platform,
} from 'react-native';
import {PlatFormAndroid, setReleaseMode, serverURL} from './env';
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
import {Toast, Icon, Modal, Button, Portal} from '@ant-design/react-native';
import {NewVersionModal, ActionSheet, ImagePreview} from './common/components';
import {InitialState as CommonStateType} from './store/reducers/commonReducer';
import {closeActionSheet, closeImagePreview} from './store/actions';
const iOSToolModule = NativeModules.ToolModule;

interface Props {
  initialProperties: any;
  commonState: CommonStateType;
  dispatch: any;
}

const AppWrapper = (props: Props) => {
  const {commonState, dispatch} = props;
  const [versionName, setVersionName] = useState('');
  const [versionCode, setVersionCode] = useState(0);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [newVersion, setNewVersion] = useState({});

  useEffect(() => {
    const {isDebugMode, isBetaMode} = props.initialProperties;
    console.log('isDebugMode', isDebugMode);
    console.log('isBetaMode', isBetaMode);
    if (Platform.OS === PlatFormAndroid) {
      let isRelease = !isDebugMode && !isBetaMode;
      setReleaseMode(isRelease);
    } else {
    }

    // getVersion();
  }, []);

  // 获取版本号
  function getVersion() {
    if (Platform.OS === PlatFormAndroid) {
      const {versionName, versionCode} = props.initialProperties;
      handleCheckNewVersion(versionName, versionCode);
      setVersionName(versionName);
      setVersionCode(versionCode);
    } else {
      iOSToolModule.getAppVersion(
        (error: any, versionName: string, versionCode: any) => {
          console.log('getAppVersion---', error, versionName, versionCode);
          if (error) {
            console.log(error);
          } else {
            handleCheckNewVersion(versionName, versionCode);
            setVersionName(versionName);
            setVersionCode(versionCode);
          }
        },
      );
    }
  }

  function handleCheckNewVersion(versionName: string, versionCode: number) {
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
              setNewVersion(res.data);
              setUpdateModalVisible(true);
            }
          }
        }
      })
      .catch(error => {
        Portal.remove(toastKey);
      });
  }

  // 关闭操作弹窗
  function closeControllerModal() {
    setUpdateModalVisible(false);
  }

  console.log('render props---', props);
  console.log('serverURL is: ', serverURL);
  const iphoneSafeAreaStyle = {
    flex: 1,
    // backgroundColor: '#f2f2f2',
    // paddingBottom: isIphoneX() || isIphoneXsMax() ? 30 : 0,
  };

  const {
    actionSheetVisible,
    actionSheetTitle,
    actionSheetActions,
    imagePreviewVisible,
    imagePreviewIndex,
    imagePreviewUrls,
  } = commonState;

  return (
    <SafeAreaView style={iphoneSafeAreaStyle}>
      <AppContainer
      // screenProps={this.props}
      // ref={navigatorRef => {
      //   NavigationService.setTopLevelNavigator(navigatorRef);
      // }}
      />
      <ActionSheet
        visible={actionSheetVisible}
        title={actionSheetTitle}
        actions={actionSheetActions}
        onClose={() => {
          dispatch(closeActionSheet());
        }}
      />
      <ImagePreview
        visible={imagePreviewVisible}
        imageUrls={imagePreviewUrls}
        index={imagePreviewIndex}
        onClose={() => {
          dispatch(closeImagePreview());
        }}
      />
      <NewVersionModal
        visible={updateModalVisible}
        newVersion={newVersion}
        handleCloseModal={closeControllerModal}
      />
    </SafeAreaView>
  );
};

const mapStateToProps = (state: any) => {
  return {
    commonState: state.common,
  };
};

export default connect(mapStateToProps)(AppWrapper);
