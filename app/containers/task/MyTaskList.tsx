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
import {initReport} from '../../store/actions';
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
  staffMap: any;
  departmentMap: any;
  dispatch: Function;
}
let timestampInput = new Date().getTime();
let initObj: any = {};

const MyTaskList = (props: Props) => {
  const {navigation, authToken, currentUserInfo, staffMap, dispatch} = props;

  const [taskList, setTaskList] = useState([]);

  useEffect(() => {
    if (currentUserInfo.staffId) {
      handleFetchList();
    }
  }, []);

  async function handleFetchList() {
    const taskListRes = await requestApiV2(
      API_v2.getTaskList,
      {
        page: 1,
        pageSize: 500,
        firstExecutors: [currentUserInfo.staffId],
      },
      authToken,
    );
    console.log('taskListRes', taskListRes);
    if (taskListRes.result === 'Success') {
      if (Array.isArray(taskListRes.data)) {
        setTaskList(taskListRes.data);
      }
    }
  }

  async function handleSelectTask(task: any) {
    let network = await isNetworkConnected();
    if (network) {
      let templateData: any = {pKey: task.template._id, task: task};
      props.dispatch(
        initReport(authToken, templateData, () => {
          props.navigation.navigate('CollectData', {
            type: 'Create',
          });
        }),
      );
    } else {
      Toast.offline(ErrorMessage_Network_Offline, 1);
    }
  }

  const _renderItem = (data: any) => {
    const {index, item} = data;
    const renderHeaderImg = (src: string) =>
      src ? {uri: src} : DIcon.defaultHeaderIcon;
    const {creatorStaff, createdAt, name, state, template} = item;
    const createUser = creatorStaff && staffMap[creatorStaff._id];
    const userPic = createUser && getIn(createUser, ['user', 'userPic']);
    let stateColor = DColors.mainColor;
    if (state === 0) {
      // stop
      stateColor = '#aaa';
    } else if (state === 1) {
      // processing
      stateColor = DColors.mainColor;
    } else if (state === 2) {
      // new
      stateColor = '#FABF40';
    }
    return (
      <TouchableOpacity
        onPress={() => {
          if (state && template && template._id) {
            handleSelectTask(item);
          }
        }}>
        <View style={styles.taskItem}>
          <View>
            <Image
              style={styles.taskCreatorImg}
              source={renderHeaderImg(userPic)}
            />
          </View>
          <View style={{marginLeft: 14, flex: 1}}>
            <View style={styles.taskItemRow}>
              <View
                style={{...styles.taskStatus, backgroundColor: stateColor}}
              />
              <Text numberOfLines={1} style={styles.taskCreatorName}>
                {(creatorStaff && creatorStaff.staffName) || ''}
              </Text>
            </View>
            <Text numberOfLines={1} style={styles.taskTemplate}>
              {name}
            </Text>
            <Text numberOfLines={1} style={styles.taskDate}>
              {'Create At: ' + moment(createdAt).format(DATE_FORMAT)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const DATE_FORMAT = 'DD/MM/YYYY HH:mm';

  return (
    <View style={styles.normal}>
      <TitleBarNew title={'My Task'} navigation={navigation} />
      <FlatList
        data={taskList}
        renderItem={data => _renderItem(data)}
        keyExtractor={(item, index) => '' + index}
        ItemSeparatorComponent={() => <View style={styles.middleLine} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  taskItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  taskItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskCreatorImg: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  taskStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#aaa',
    marginRight: 8,
  },
  taskCreatorName: {
    fontSize: 16,
    color: '#757575',
  },
  taskTemplate: {
    fontSize: 14,
    color: '#2e2e2e',
    marginBottom: 8,
  },
  taskDate: {
    fontSize: 12,
    color: '#757575',
  },
  middleLine: {
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
});

function mapStateToProps(state: any) {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
    currentUserInfo: state.loginInfo.currentUserInfo,
    staffMap: state.company.staffMap,
    departmentMap: state.company.departmentMap,
  };
}

export default connect(mapStateToProps)(MyTaskList);
