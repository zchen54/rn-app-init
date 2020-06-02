import React, {Component, Fragment, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  BackHandler,
  FlatList,
} from 'react-native';
import {Toast, Modal, Icon, Steps} from '@ant-design/react-native';
import moment from 'moment';
import {TitleBarNew} from '../../common/components';
import {
  getIn,
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
  requestApiV2,
  API_v2,
  isNetworkConnected,
} from '../../common/utils';
import {
  ReportType,
  TemplateType,
  ModelType,
} from '../../common/constants/ModeTypes';
import {logout} from '../../store/actions';
import {DColors, DFontSize, FONT_FAMILY} from '../../common/styles';
import {ErrorMessage_Network_Offline} from '../../env';

const DIcon = {
  approversIcon: require('../images/template/Approver.png'),
  ccIcon: require('../images/template/CC.png'),
  defaultHeaderIcon: require('../images/Me/Portrait.png'),
};

interface Props {
  navigation: any;
  authToken: string;
  currentUserInfo: any;
  dispatch: Function;
}
let initObj: any = {};

const PersonalGuideScreen = (props: Props) => {
  const {navigation, authToken, currentUserInfo} = props;

  const [taskList, setTaskList] = useState([]);

  useEffect(() => {}, []);

  function handleLogout() {
    const {navigation, currentUserInfo} = props;
    props.dispatch(
      logout(currentUserInfo.authToken, () => {
        navigation.navigate('Login');
      }),
    );
  }

  return (
    <View style={styles.normal}>
      <TitleBarNew
        title={'Guide'}
        navigation={null}
        hideLeftArrow={true}
        right="Log Out"
        pressRight={handleLogout}
      />
      <View style={styles.container}>
        <TouchableOpacity
          style={[styles.btn_sq, styles.first_btn]}
          onPress={() => {
            props.navigation.navigate('CreateOrganization');
          }}>
          <Text>Create Organization</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btn_sq}
          onPress={() => {
            props.navigation.navigate('AddOrganization');
          }}>
          <Text>Join Organization</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn_sq: {
    width: deviceWidth / 2,
    height: deviceWidth / 2,
    borderWidth: 1,
    borderColor: '#dfe0f8',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  first_btn: {
    marginBottom: deviceWidth / 6,
  },
});

function mapStateToProps(state: any) {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
    currentUserInfo: state.loginInfo.currentUserInfo,
  };
}

export default connect(mapStateToProps)(PersonalGuideScreen);
