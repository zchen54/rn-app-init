import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Progress from './CodePushProgress.js';
import {
  releaseMode,
  PlatFormAndroid,
  ANDROID_CODE_PUSH_STAGING_KEY,
  ANDROID_CODE_PUSH_PRODUCTION_KEY,
  IOS_CODE_PUSH_STAGING_KEY,
  IOS_CODE_PUSH_PRODUCTION_KEY,
} from './app/env';
import {deviceWidth, deviceHeight} from './app/common/utils';
import {DColors} from './app/common/styles';
import CodePush from 'react-native-code-push';

let CODE_PUSH_KEY = '';
// const= {
//   //设置检查更新的频率
//   //ON_APP_RESUME APP恢复到前台的时候
//   //ON_APP_START APP开启的时候
//   //MANUAL 手动检查
//   checkFrequency: CodePush.CheckFrequency.ON_APP_RESUME,
// };

class CodePushUpdateModal extends Component {
  constructor(props) {
    super(props);
    this.currProgress = 0.3;
    this.syncMessage = '';
    this.state = {
      modalVisible: false,
      isMandatory: false,
      immediateUpdate: false,
      updateInfo: {},
    };
  }

  codePushStatusDidChange = syncStatus => {
    console.log(
      'codePushStatusDidChange-------',
      syncStatus,
      CodePush.SyncStatus,
    );
    if (this.state.immediateUpdate) {
      switch (syncStatus) {
        case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
          this.syncMessage = 'Checking for update';
          this.setState({modalVisible: false});
          break;
        case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
          this.syncMessage = 'Downloading package';
          break;
        case CodePush.SyncStatus.AWAITING_USER_ACTION:
          this.syncMessage = 'Awaiting user action';
          break;
        case CodePush.SyncStatus.INSTALLING_UPDATE:
          this.syncMessage = 'Installing update';
          break;
        case CodePush.SyncStatus.UP_TO_DATE:
          this.syncMessage = 'App up to date.';
          this.setState({modalVisible: false});
          break;
        case CodePush.SyncStatus.UPDATE_IGNORED:
          this.syncMessage = 'Update cancelled by user';
          break;
        case CodePush.SyncStatus.UPDATE_INSTALLED:
          this.syncMessage = 'Update installed and will be applied on restart.';
          this.setState({modalVisible: false});
          CodePush.restartApp();
          break;
        case CodePush.SyncStatus.UNKNOWN_ERROR:
          this.syncMessage = 'An unknown error occurred';
          this.setState({modalVisible: false});
          break;
        default:
          this.setState({modalVisible: false});
      }
    }
  };

  codePushDownloadDidProgress = progress => {
    console.log('codePushDownloadDidProgress-------', progress);

    if (this.state.immediateUpdate) {
      this.currProgress = parseFloat(
        progress.receivedBytes / progress.totalBytes,
      ).toFixed(2);
      if (this.currProgress >= 1) {
        this.setState({modalVisible: false});
      } else {
        this.refs.progressBar.progress = this.currProgress;
      }
    }
  };

  syncImmediate() {
    CodePush.checkForUpdate(CODE_PUSH_KEY).then(update => {
      console.log('syncImmediate-------', update);
      if (!update) {
        console.log('App is already the latest version');
      } else {
        this.setState({
          modalVisible: true,
          updateInfo: update,
          isMandatory: update.isMandatory,
        });
      }
    });
  }

  componentWillMount() {
    if (Platform.OS === PlatFormAndroid) {
      if (releaseMode) {
        // Android release
        CODE_PUSH_KEY = ANDROID_CODE_PUSH_PRODUCTION_KEY;
      } else {
        // Android beta
        CODE_PUSH_KEY = ANDROID_CODE_PUSH_STAGING_KEY;
      }
    } else {
      if (releaseMode) {
        // iOS release
        CODE_PUSH_KEY = IOS_CODE_PUSH_PRODUCTION_KEY;
      } else {
        // iOS beta
        CODE_PUSH_KEY = IOS_CODE_PUSH_STAGING_KEY;
      }
    }
    CodePush.disallowRestart();
    this.syncImmediate();
  }

  componentDidMount() {
    CodePush.allowRestart();
  }

  _immediateUpdate = () => {
    this.setState({immediateUpdate: true});
    CodePush.sync(
      {
        deploymentKey: CODE_PUSH_KEY,
        updateDialog: {},
        installMode: CodePush.InstallMode.IMMEDIATE,
      },
      this.codePushStatusDidChange,
      this.codePushDownloadDidProgress,
    );
  };

  renderModal() {
    const {isMandatory} = this.state;
    // const isMandatory = false;
    return (
      <Modal
        animationType={'none'}
        transparent={true}
        visible={this.state.modalVisible}
        onRequestClose={() => alert('Modal has been closed.')}>
        <View style={styles.modal}>
          <View style={styles.modalContainer}>
            {!this.state.immediateUpdate ? (
              <View>
                <View style={{backgroundColor: '#fff'}}>
                  <View style={{marginHorizontal: 15}}>
                    <Text
                      style={{
                        marginVertical: 20,
                        fontSize: 17,
                        color: '#434343',
                        fontWeight: 'bold',
                      }}>
                      An update is available
                    </Text>
                    <Text style={{lineHeight: 20}}>
                      {this.state.updateInfo.description}
                    </Text>
                  </View>
                  {releaseMode && isMandatory ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        height: 60,
                        alignItems: 'center',
                        marginTop: 20,
                        borderTopColor: '#ccc',
                        borderTopWidth: 1,
                        width: deviceWidth - 60,
                      }}>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          width: deviceWidth - 60,
                          height: 50,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => this._immediateUpdate()}>
                        <View
                          style={{
                            flex: 1,
                            height: 40,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 20,
                            marginHorizontal: 40,
                          }}>
                          <Text
                            style={{
                              fontSize: 17,
                              color: '#3496FA',
                              fontWeight: 'bold',
                            }}>
                            Download
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View
                      style={{
                        flexDirection: 'row',
                        height: 50,
                        alignItems: 'center',
                        marginTop: 20,
                        borderTopColor: '#ccc',
                        borderTopWidth: 1,
                      }}>
                      <TouchableOpacity
                        onPress={() => this.setState({modalVisible: false})}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            width: (deviceWidth - 60) / 2,
                            height: 50,
                            borderRightColor: '#ccc',
                            borderRightWidth: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                          <Text
                            style={{
                              fontSize: 17,
                              fontWeight: 'bold',
                              color: '#757575',
                              marginLeft: 10,
                            }}>
                            Ignore
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          width: (deviceWidth - 60) / 2,
                          height: 50,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onPress={() => this._immediateUpdate()}>
                        <View
                          style={{
                            flex: 1,
                            height: 40,
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: 10,
                            borderRadius: 20,
                          }}>
                          <Text
                            style={{
                              fontSize: 17,
                              color: '#3496FA',
                              fontWeight: 'bold',
                            }}>
                            Download
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View>
                <View
                  style={{
                    backgroundColor: '#fff',
                    paddingVertical: 20,
                    backgroundColor: '#fff',
                    alignItems: 'center',
                  }}>
                  <Progress
                    ref="progressBar"
                    progressColor={'#89C0FF'}
                    style={{
                      marginTop: 20,
                      height: 10,
                      width: deviceWidth - 100,
                      backgroundColor: '#ddd',
                      borderRadius: 10,
                    }}
                  />
                  <View
                    style={{
                      alignItems: 'center',
                      marginVertical: 20,
                    }}>
                    <Text
                      style={{
                        fontSize: 14,
                        color: '#757575',
                      }}>
                      Downloading...
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  }

  render() {
    return this.renderModal();
  }
}

const styles = StyleSheet.create({
  modal: {
    height: deviceHeight,
    width: deviceWidth,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContainer: {
    marginHorizontal: 60,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

// export default CodePushUpdateModal;
export default CodePush(CodePushUpdateModal);
