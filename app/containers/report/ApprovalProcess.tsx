import React, {Component, Fragment} from 'react';
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
} from 'react-native';
import {Toast, Modal, Icon, Steps} from '@ant-design/react-native';
import moment from 'moment';
import {TitleBarNew} from '../../common/components';
import {
  getIn,
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
} from '../../common/utils';
import {
  ReportType,
  TemplateType,
  ModelType,
} from '../../common/constants/ModeTypes';
import {
  deleteUserReport,
  deleteCompanyReport,
  deleteUserReportDraft,
  deleteCompanyReportDraft,
  clearEditingReport,
} from '../../store/actions';
import {DColors, DFontSize, FONT_FAMILY} from '../../common/styles';

const DIcon = {
  approversIcon: require('../images/template/Approver.png'),
  ccIcon: require('../images/template/CC.png'),
  defaultHeaderIcon: require('../images/Me/Portrait.png'),
};

interface Props {
  navigation: any;
  editingReport: ModelType & ReportType & any;
  authToken: string;
  currentUserInfo: any;
  staffMap: any;
  departmentMap: any;
  dispatch: Function;
}
let timestampInput = new Date().getTime();
let initObj: any = {};

const ApprovalProcess = (props: Props) => {
  const {
    navigation,
    editingReport,
    authToken,
    currentUserInfo,
    staffMap,
    dispatch,
  } = props;

  const DATE_FORMAT = 'DD/MM/YYYY HH:mm';
  const {task, approval} = editingReport;
  const hasTask = task && Array.isArray(task.staffs) && task.staffs.length;
  const hasProcess = task && Array.isArray(task.process) && task.process.length;
  const hasApproval =
    approval && Array.isArray(approval.staffs) && approval.staffs.length;
  interface StepObj {
    title: string;
    description?: string;
    icon: any;
    users?: any[];
    status: 'finish' | 'process' | 'error' | 'wait';
    processTime?: string;
  }

  let stepData: StepObj[] = []; // 流程
  let dataCreatorInfo = getIn(staffMap, [editingReport.creatorStaffId]); // 创建者
  let taskStaffList: any =
    task && Array.isArray(task.staffs)
      ? task.staffs.map((id: string) => staffMap[id])
      : []; // 执行者
  let approversList: any = []; // 审批者
  let ccList: any = []; // 抄送
  const renderHeaderImg = (src: string) =>
    src ? {uri: src} : DIcon.defaultHeaderIcon;
  let ccDate = '';
  let taskComplete = false;

  if (taskStaffList.length && Array.isArray(task.process)) {
    let restartIndex = -1;
    task.process.forEach((processStaff: any, index: number) => {
      if (processStaff.result === 'restart') {
        restartIndex = index;
      }
    });
    let newProcess: any[] = [...task.process];
    if (restartIndex >= 0) {
      newProcess = newProcess.slice(restartIndex);
    }
    taskStaffList.forEach((tasker: any) => {
      let userPic = getIn(tasker, ['user', 'userPic']);
      let endDate = '';
      let taskStatus: any = '';
      task.state > 0 &&
        newProcess.forEach((processStaff: any) => {
          if (
            (processStaff.result === 'next' || processStaff.result === 'end') &&
            processStaff.staff === tasker._id
          ) {
            taskStatus = 'finish';
            endDate = processStaff.endDate
              ? moment(processStaff.endDate).format(DATE_FORMAT)
              : '';
          }
          if (processStaff.result === 'end') {
            ccDate = moment(processStaff.endDate).format(DATE_FORMAT);
            taskComplete = true;
          }
        });
      stepData.push({
        title: 'Originator',
        description: tasker.staffName,
        icon: userPic,
        status: taskStatus
          ? taskStatus
          : approval.state < 1
          ? 'wait'
          : 'finish',
        processTime: endDate,
      });
    });
  }

  if (approval) {
    const {cc, currentStaff, process, staffs, state, type} = approval;
    approversList = Array.isArray(approval.staffs)
      ? approval.staffs.map((id: string) => staffMap[id])
      : [];
    ccList = Array.isArray(approval.cc)
      ? approval.cc.map((id: string) => staffMap[id])
      : [];
    console.log('=======', task, approval, approversList, ccList);
    if (!taskStaffList.length && dataCreatorInfo) {
      let userPic = getIn(dataCreatorInfo, ['user', 'userPic']);
      let dataCreateDate =
        approval.state > 0 && editingReport.createdAt
          ? moment(editingReport.createdAt).format(DATE_FORMAT)
          : '';
      stepData.push({
        title: 'Originator',
        description: dataCreatorInfo.staffName,
        icon: userPic,
        status: approval.state < 1 ? 'wait' : 'finish',
        processTime: dataCreateDate,
      });
    }
    if (approversList.length) {
      ccDate = '';
      taskComplete = false;
      if (approval.type === 'and') {
        let denyIndex = -1;
        process.forEach((processStaff: any, index: number) => {
          if (processStaff.result === 'deny') {
            denyIndex = index;
          }
        });
        let newProcess: any[] = [...process];
        if (denyIndex >= 0) {
          newProcess = process.slice(denyIndex + 1);
        }
        approversList.forEach((approver: any) => {
          const userPic = getIn(approver, ['user', 'userPic']);
          let isFinish = false;
          let endDate = '';
          newProcess.forEach((processStaff: any) => {
            if (
              approval.state > 0 &&
              (processStaff.result === 'next' ||
                processStaff.result === 'end') &&
              processStaff.staff === approver._id
            ) {
              isFinish = true;
              endDate = processStaff.endDate
                ? moment(processStaff.endDate).format(DATE_FORMAT)
                : '';
            }
            if (processStaff.result === 'end') {
              ccDate = moment(processStaff.endDate).format(DATE_FORMAT);
            }
          });

          stepData.push({
            title: 'Approver',
            description: approver.staffName,
            icon: userPic,
            status: isFinish ? 'finish' : 'wait',
            processTime: endDate,
          });
        });
      } else if (approval.type === 'or') {
        if (approval.state === 2) {
          let handler = process[process.length - 1];
          if (handler.result === 'next' && handler.staff) {
            const approver = staffMap[handler.staff];
            const userPic = getIn(approver, ['user', 'userPic']);
            ccDate = moment(handler.endDate).format(DATE_FORMAT);
            if (approver) {
              stepData.push({
                title: 'Approver',
                description: approver.staffName,
                icon: userPic,
                status: 'finish',
                processTime: moment(handler.endDate).format(DATE_FORMAT),
              });
            }
          }
        } else {
          stepData.push({
            title: 'Approver',
            description: 'Need one of them to approve',
            icon: DIcon.approversIcon,
            users: approversList,
            status: 'wait',
            processTime: '',
          });
        }
      }
    }
    if (ccList.length) {
      stepData.push({
        title: 'CC People',
        description: `CC ${ccList.length} People`,
        icon: DIcon.ccIcon,
        users: ccList,
        status: taskComplete || approval.state === 2 ? 'finish' : 'wait',
        processTime: ccDate,
      });
    } else if (!hasTask && !hasApproval && ccList.length) {
      // 只有抄送时
      let dataCreateDate = editingReport.createdAt
        ? moment(editingReport.createdAt).format(DATE_FORMAT)
        : '';
      stepData.push({
        title: 'CC People',
        description: `CC ${ccList.length} People`,
        icon: DIcon.ccIcon,
        users: ccList,
        status: 'finish',
        processTime: dataCreateDate,
      });
    }
  }

  console.log('render step', stepData);

  return (
    <View style={styles.normal}>
      <TitleBarNew title={'Approval Process'} navigation={navigation} />
      <ScrollView style={{flex: 1}}>
        <View style={styles.container}>
          {stepData.map((item: StepObj, index: number) => {
            let processColor = '#E6E6E6';
            let StatusIcon: any = null;
            if (item.status === 'finish') {
              processColor = DColors.mainColor;
              StatusIcon = (
                <View
                  style={{
                    ...styles.stepStatusIconWrap,
                    backgroundColor: '#39da7b',
                  }}>
                  <Icon name="check" color="#fff" size={10} />
                </View>
              );
            } else if (item.status === 'wait') {
              StatusIcon = (
                <View
                  style={{
                    ...styles.stepStatusIconWrap,
                    backgroundColor: '#FABF40',
                  }}>
                  <Icon name="dash" color="#fff" size={10} />
                </View>
              );
            } else if (item.status === 'error') {
              StatusIcon = (
                <View
                  style={{
                    ...styles.stepStatusIconWrap,
                    backgroundColor: '#ed2f31',
                  }}>
                  <Icon name="close" color="#fff" size={10} />
                </View>
              );
            }
            if (index === stepData.length - 1) {
              processColor = '#fff';
            }
            console.log('i', item, processColor);
            return (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconWrap}>
                    <Image
                      source={
                        Array.isArray(item.users)
                          ? item.icon
                          : renderHeaderImg(item.icon)
                      }
                      style={styles.stepIcon}
                    />
                    {StatusIcon}
                  </View>
                  <View style={styles.stepHeaderContent}>
                    <View style={styles.stepTitleWrap}>
                      <Text style={styles.stepTitle}>{item.title}</Text>
                      <Text style={styles.stepTime}>{item.processTime}</Text>
                    </View>
                    <Text style={styles.stepDesc}>{item.description}</Text>
                  </View>
                </View>
                <View
                  style={{...styles.stepFooter, borderLeftColor: processColor}}>
                  {Array.isArray(item.users)
                    ? item.users.map((staff: any, index: number) => {
                        let userPic = getIn(staff, ['user', 'userPic']);
                        return (
                          <View key={index} style={styles.userItem}>
                            <Image
                              source={renderHeaderImg(userPic)}
                              style={styles.userItemImg}
                            />
                            <Text numberOfLines={1} style={styles.userItemName}>
                              {staff.staffName}
                            </Text>
                          </View>
                        );
                      })
                    : null}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  container: {
    marginVertical: 12,
    marginHorizontal: 17,
    paddingVertical: 20,
    paddingLeft: 20,
    paddingRight: 10,
    backgroundColor: '#fff',
  },
  stepItem: {},
  stepHeader: {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepHeaderContent: {
    height: 44,
    flex: 1,
    marginLeft: 16,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  stepFooter: {
    minHeight: 34,
    marginVertical: 3,
    marginLeft: 18.5,
    paddingHorizontal: 17,
    paddingBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: 'blue',
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  userItem: {
    width: 50,
    marginVertical: 12,
    marginHorizontal: 8,
    flexDirection: 'column',
    alignItems: 'center',
  },
  userItemImg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 5,
  },
  userItemName: {
    fontSize: 12,
    color: '#757575',
  },
  stepTitleWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 16,
    color: '#2E2E2E',
  },
  stepTime: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  stepDesc: {
    fontSize: 16,
    color: '#757575',
  },
  stepIconWrap: {
    width: 40,
    height: 40,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  stepStatusIconWrap: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderColor: '#fff',
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

function mapStateToProps(state: any) {
  return {
    editingReport: state.report.editingReport,
    authToken: state.loginInfo.currentUserInfo.authToken,
    currentUserInfo: state.loginInfo.currentUserInfo,
    staffMap: state.company.staffMap,
    departmentMap: state.company.departmentMap,
  };
}

export default connect(mapStateToProps)(ApprovalProcess);
