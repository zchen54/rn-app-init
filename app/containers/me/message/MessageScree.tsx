import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {
  View,
  StyleSheet,
  SectionList,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import {
  deviceWidth,
  setSizeWithPx,
  getIn,
  isNetworkConnected,
} from '../../../common/utils';
import {TitleBarNew, ActionSheet} from '../../../common/components';
import {
  fetchMessage,
  updateMessageIsRead,
  handleFriendRequest,
  handleGroupRequest,
  handleCompanyJoinRequest,
  handleCompanyExitRequest,
  fetchReportInfo,
  initReport,
} from '../../../store/actions';
import {FONT_FAMILY} from '../../../common/styles';
import {Toast} from '@ant-design/react-native';
import {ReportType, ModelType} from '../../../common/constants/ModeTypes';
import {ErrorMessage_Network_Offline} from '../../../env';

const headerImageIcon = require('../../images/Me/Portrait.png');
const companyImageIcon = require('../../images/Me/Portrait_company.png');

enum MessageAudit {
  /**
   * 拒绝
   */
  Reject = 2,
  /**
   * 接受
   */
  Agree = 1,
  /**
   * 未答复
   */
  Unanswered = 0,
}

interface State {
  hadFetch: boolean;
  refreshing: boolean;
  modalVisible: boolean;
  currentMessage: any;
}
interface Props {
  navigation: any;
  authToken: string;
  message: Array<any>;
  dispatch: any;
}

const Page = {
  font_family: FONT_FAMILY,
};
export class MeScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hadFetch: false,
      refreshing: false,
      modalVisible: false,
      currentMessage: {},
    };
  }

  componentWillMount() {
    this.handleFetchList(this.props, true);
  }

  componentWillReceiveProps(nextProps: any) {
    this.handleFetchList(nextProps);
  }

  handleFetchList = (props: any, refresh = false) => {
    const {authToken, message} = props;
    const {hadFetch} = this.state;
    if ((!hadFetch && !message.length) || refresh) {
      this.props.dispatch(
        fetchMessage(authToken, () => {
          this.props.dispatch(updateMessageIsRead(authToken));
        }),
      );
      this.setState({hadFetch: true, refreshing: true});
    } else {
      this.setState({refreshing: false});
    }
  };

  handleOpenModal = (messageItem: any) => {
    this.setState({
      modalVisible: true,
      currentMessage: messageItem,
    });
  };

  handleAgree = () => {
    const {authToken} = this.props;
    const {currentMessage} = this.state;
    // type  1:好友邀请  2:群组邀请  3:企业邀请  4:通知  5:主动加入企业  6:群组群发分享模板  7.退出公司
    if (currentMessage.type === 1) {
      this.props.dispatch(
        handleFriendRequest(
          authToken,
          {
            messageId: currentMessage._id,
            accept: true,
          },
          () => {
            this.props.dispatch(fetchMessage(authToken));
          },
        ),
      );
    } else if (currentMessage.type === 2) {
      this.props.dispatch(
        handleGroupRequest(
          authToken,
          {
            messageId: currentMessage._id,
            accept: true,
          },
          () => {
            this.props.dispatch(fetchMessage(authToken));
          },
        ),
      );
    } else if (currentMessage.type === 3 || currentMessage.type === 5) {
      this.props.dispatch(
        handleCompanyJoinRequest(
          authToken,
          {
            messagePkey: currentMessage._id,
            // departmentPkey:
            // role:
            audit: true,
          },
          () => {
            this.props.dispatch(fetchMessage(authToken));
          },
        ),
      );
    } else if (currentMessage.type === 7) {
      this.props.dispatch(
        handleCompanyExitRequest(
          authToken,
          {
            messagePkey: currentMessage._id,
            audit: true,
          },
          () => {
            this.props.dispatch(fetchMessage(authToken));
          },
        ),
      );
    }
    this.setState({
      modalVisible: false,
    });
  };

  handleDisagree = () => {
    const {authToken} = this.props;
    const {currentMessage} = this.state;
    if (currentMessage.type === 1) {
      this.props.dispatch(
        handleFriendRequest(
          authToken,
          {
            messageId: currentMessage._id,
            accept: false,
          },
          () => {
            this.props.dispatch(fetchMessage(authToken));
          },
        ),
      );
    } else if (currentMessage.type === 2) {
      this.props.dispatch(
        handleGroupRequest(
          authToken,
          {
            messageId: currentMessage._id,
            accept: false,
          },
          () => {
            this.props.dispatch(fetchMessage(authToken));
          },
        ),
      );
    } else if (currentMessage.type === 3 || currentMessage.type === 5) {
      this.props.dispatch(
        handleCompanyJoinRequest(
          authToken,
          {
            messagePkey: currentMessage._id,
            // departmentPkey:
            // role:
            audit: false,
          },
          () => {
            this.props.dispatch(fetchMessage(authToken));
          },
        ),
      );
    } else if (currentMessage.type === 7) {
      this.props.dispatch(
        handleCompanyExitRequest(
          authToken,
          {
            messagePkey: currentMessage._id,
            audit: false,
          },
          () => {
            this.props.dispatch(fetchMessage(authToken));
          },
        ),
      );
    }

    this.setState({
      modalVisible: false,
    });
  };

  handleTaskDetail = async (messageItem: any) => {
    const {authToken} = this.props;
    let reportId = getIn(messageItem, ['payload', 'reportId']);
    let task = getIn(messageItem, ['payload', 'taskId']);

    if (reportId) {
      const navigateFunction = (report: ReportType & ModelType) => {
        const approvalState = getIn(report, ['approval', 'state']);
        if (approvalState === -1) {
          this.props.navigation.navigate('ReportPreview', {});
        } else {
          this.props.navigation.navigate('CollectData', {
            type: 'Edit',
          });
        }
      };
      this.props.dispatch(
        fetchReportInfo(authToken, reportId, navigateFunction),
      );
    } else if (task && task.template) {
      let network = await isNetworkConnected();
      if (network) {
        let templateData: any = {pKey: task.template, task: task};
        this.props.dispatch(
          initReport(authToken, templateData, () => {
            this.props.navigation.navigate('CollectData', {
              type: 'Create',
            });
          }),
        );
      } else {
        Toast.offline(ErrorMessage_Network_Offline, 1);
      }
    } else {
      Toast.fail('Task invalid !');
    }
  };

  handleApprovalDetail = (messageItem: any) => {
    const {authToken} = this.props;
    let reportId = getIn(messageItem, ['payload', 'reportId']);
    if (reportId) {
      const navigateFunction = () => {
        this.props.navigation.navigate('ReportPreview', {});
      };
      this.props.dispatch(
        fetchReportInfo(authToken, reportId, navigateFunction),
      );
    } else {
      Toast.fail('Task invalid !');
    }
  };

  render() {
    let {navigation, message} = this.props;
    const {hadFetch, refreshing, modalVisible} = this.state;
    // console.log("render message", hadFetch, refreshing, message);

    let sectionObj: any = {},
      sectionData: any = [];
    message.forEach((messageItem: any) => {
      let timeDiff = moment(messageItem.createdAt).fromNow();
      if (sectionObj[timeDiff]) {
        sectionObj[timeDiff].push(messageItem);
      } else {
        sectionObj[timeDiff] = [messageItem];
      }
    });
    for (const key in sectionObj) {
      sectionData.push({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        data: sectionObj[key],
      });
    }

    const renderSectionHeader = ({section}: any) => {
      return (
        <View style={{paddingHorizontal: 17}}>
          <Text style={{fontSize: 12, color: '#757575', lineHeight: 33}}>
            {section.name}
          </Text>
        </View>
      );
    };

    const _renderItem = (data: any) => {
      let {item, index} = data;
      const companyMsgOrPerson = !item.initiatorId;

      let ActionDom: any = null;
      if (item.type === 12) {
        // reject approve
        ActionDom = (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              this.handleTaskDetail(item);
            }}>
            <Text style={styles.dealWithText}>Detail</Text>
          </TouchableOpacity>
        );
      } else if (item.type === 11) {
        // Approval todo
        ActionDom = (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              this.handleApprovalDetail(item);
            }}>
            <Text style={styles.dealWithText}>Detail</Text>
          </TouchableOpacity>
        );
      } else if (item.type === 10) {
        // Cc todo
        ActionDom = (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              this.handleApprovalDetail(item);
            }}>
            <Text style={styles.dealWithText}>Detail</Text>
          </TouchableOpacity>
        );
      } else if (item.type === 9) {
        // Task
        ActionDom = (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              this.handleTaskDetail(item);
            }}>
            <Text style={styles.dealWithText}>Detail</Text>
          </TouchableOpacity>
        );
      } else if (item.type === 4) {
        // 无需处理的消息
      } else if (!item.isHandled) {
        // 待处理的消息
        ActionDom = (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              this.handleOpenModal(item);
            }}>
            <Text style={styles.dealWithText}>Action</Text>
          </TouchableOpacity>
        );
      } else {
        ActionDom = (
          <Text
            style={
              item.audit === MessageAudit.Agree
                ? styles.processedAgree
                : item.audit === MessageAudit.Reject
                ? styles.processedReject
                : styles.processedText
            }>
            {item.audit === MessageAudit.Agree
              ? 'Approved'
              : item.audit === MessageAudit.Reject
              ? 'Disapproved'
              : 'Processed'}
          </Text>
        );
      }

      return (
        <View
          style={
            item.isRead
              ? styles.itemWrapper
              : {...styles.itemWrapper, backgroundColor: '#E6E6E6'}
          }>
          <View style={styles.itemContent}>
            {companyMsgOrPerson ? (
              <Image style={styles.imageStyle} source={companyImageIcon} />
            ) : getIn(item, ['initiatorId', 'userPic'], '') ? (
              <Image
                style={styles.imageStyle}
                source={{uri: getIn(item, ['initiatorId', 'userPic'], '')}}
              />
            ) : (
              <Image style={styles.imageStyle} source={headerImageIcon} />
            )}
            <View style={styles.itemMiddle}>
              <Text numberOfLines={1} style={styles.initiatorName}>
                {companyMsgOrPerson
                  ? item.title
                  : getIn(item, ['initiatorId', 'nickName'], '')}
              </Text>
              <Text numberOfLines={1} style={styles.messageTextStyle}>
                {item.remark}
              </Text>
            </View>
            <View style={styles.itemRight}>{ActionDom}</View>
          </View>
        </View>
      );
    };

    return (
      <View style={styles.normal}>
        <TitleBarNew title={'Message'} navigation={navigation} />
        <SectionList
          sections={sectionData}
          renderSectionHeader={renderSectionHeader}
          renderItem={sectionItem => _renderItem(sectionItem)}
          keyExtractor={(item, index) => '' + index}
          refreshing={refreshing}
          onRefresh={() => {
            this.handleFetchList(this.props, true);
          }}
          contentContainerStyle={{
            paddingBottom: setSizeWithPx(80),
          }}
          style={styles.sectionList}
        />
        <ActionSheet
          visible={modalVisible}
          onClose={() => {
            this.setState({
              modalVisible: false,
            });
          }}
          selections={['Agree', 'Disagree']}
          functions={[this.handleAgree, this.handleDisagree]}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    alignItems: 'center',
  },
  sectionList: {
    width: deviceWidth,
  },
  headerText: {
    fontFamily: Page.font_family,
    fontSize: 12,
    color: '#757575',
  },
  itemWrapper: {
    backgroundColor: '#FFFFFF',
    paddingLeft: 16,
  },
  itemContent: {
    width: deviceWidth - 16,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    paddingRight: 16,
  },
  imageStyle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    // backgroundColor: "#F38900"
  },
  itemMiddle: {
    width: deviceWidth - 182,
  },
  itemRight: {
    width: 100,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  rightText: {
    fontSize: 16,
  },
  processedText: {
    fontSize: 16,
    color: '#ccc',
  },
  processedReject: {
    fontSize: 16,
    color: '#ED2F31',
  },
  processedAgree: {
    fontSize: 16,
    color: '#01CB9C',
  },
  actionBtn: {
    width: 68,
    height: 30,
    backgroundColor: '#1E9DFC',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  dealWithText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  initiatorName: {
    fontFamily: Page.font_family,
    color: '#2E2E2E',
    fontSize: 16,
  },
  messageTextStyle: {
    fontFamily: Page.font_family,
    color: '#757575',
    fontSize: 12,
  },
});

const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
    message: state.message.message,
  };
};

export default connect(mapStateToProps)(MeScreen);
