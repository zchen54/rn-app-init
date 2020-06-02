import React from 'react';
import {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SectionList,
  Image,
  TouchableOpacity,
  StatusBar,
  TextStyle,
  Keyboard,
} from 'react-native';
import {
  setSize, // 设置宽高
  deviceHeight, // 设备高度
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
  statusBarHeight,
  getIn,
  backgroundColorEnum,
  requestApiV2,
  API_v2,
} from '../../common/utils';
import {NetworkStateBar} from '../../common/components';
import {
  fetchDynamic,
  fetchSystemTemplates,
  copyTemplateAddToMine,
  addSystemTemplateToCompany,
  copyReportAddToMine,
  previewTemplate,
  previewReport,
  fetchDynamicFulfilled,
} from '../../store/actions';
import {DColors, DFontSize, FONT_FAMILY} from '../../common/styles';
import moment from 'moment';
import {toastTips} from '../../common/constants';
import {Toast, Modal} from '@ant-design/react-native';
import {formatServiceTemplateToLocal} from '../../store/sagas/template';
import {formatServiceReportToLocal} from '../../store/sagas/report';
import {Action} from '@ant-design/react-native/lib/modal/PropsType';
import {
  TemplateType,
  ModelType,
  ReportType,
} from '../../common/constants/ModeTypes';
import {SystemTemplateList, TemplateItem} from './components';
import {canUploadTemplateToOrg} from '../template/judgement';

interface State {
  hadFetch: boolean;
  refreshing: boolean;
}
interface Props {
  navigation: any;
  authToken: string;
  currentUserInfo: any;
  dynamicList: Array<any>;
  templates: Array<ModelType & TemplateType>;
  companyTemplates: Array<ModelType & TemplateType>;
  systemTemplates: Array<ModelType & TemplateType>;
  dispatch: Function;
}
const Page = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor,
  titleColor: DColors.title,
  templateMargin: 8,
};
const Icon = {
  headerImageIcon: require('../images/Me/Portrait.png'),
  blankpage3: require('../images/template/blankpage3.png'),
};

export class DynamicList extends Component<Props, State> {
  viewDidAppear: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      hadFetch: false,
      refreshing: false,
    };
  }

  componentWillMount() {}

  componentDidMount() {
    this.viewDidAppear = this.props.navigation.addListener(
      'willFocus',
      (navigationProps: any) => {
        // console.log("页面将要显示", navigationProps);
        StatusBar.setBarStyle('light-content', true);
        this.handleFetchNewDynamic();
      },
    );
  }

  componentWillUnmount() {
    this.viewDidAppear.remove();
  }

  componentWillReceiveProps(nextProps: Props) {
    this.handleFetchList(nextProps);
  }

  handleFetchNewDynamic = () => {
    const {authToken} = this.props;
    this.setState({hadFetch: true, refreshing: true});
    requestApiV2(API_v2.getDynamic, null, authToken)
      .then(res => {
        this.setState({refreshing: false});
        if (res.result === 'Success') {
          this.props.dispatch(fetchDynamicFulfilled(res.data));
        } else if (res.error) {
          this.setState({refreshing: false});
          Toast.fail(res.error, 2);
        } else {
          this.setState({refreshing: false});
        }
      })
      .catch(error => {
        Toast.fail(error, 2);
      });
  };

  handleFetchList = (props: Props, refresh = false) => {
    const {authToken, dynamicList, systemTemplates, currentUserInfo} = props;
    const {hadFetch} = this.state;
    if (!hadFetch || refresh) {
      if (!dynamicList.length || refresh) {
        this.setState({hadFetch: true, refreshing: true});
        this.props.dispatch(
          fetchDynamic(authToken, () => {
            this.setState({refreshing: false});
          }),
        );
      }
      if (
        (!systemTemplates.length || refresh) &&
        canUploadTemplateToOrg(currentUserInfo)
      ) {
        this.setState({hadFetch: true, refreshing: true});
        this.props.dispatch(
          fetchSystemTemplates(authToken, () => {
            this.setState({refreshing: false});
          }),
        );
      }
    } else {
      this.setState({refreshing: false});
    }
  };

  handlePreviewTemplate = (dynamicItem: any) => {
    let localTemplate = formatServiceTemplateToLocal(
      getIn(dynamicItem, ['payload', 'templateId'], null),
    );
    this.props.dispatch(
      previewTemplate({
        ...localTemplate,
        CreatorName: dynamicItem.initiatorId.nickName,
        CreatorPic: dynamicItem.initiatorId.userPic,
      }),
    );
    this.props.navigation.navigate('TemplatePreview', {
      isDynamicTemplate: true,
    });
  };

  handlePreviewData = (dynamicItem: any) => {
    let localReport = formatServiceReportToLocal(
      getIn(dynamicItem, ['payload', 'reportId'], null),
    );
    this.props.dispatch(
      previewReport({
        ...localReport,
        templateName: getIn(
          dynamicItem,
          ['payload', 'reportId', 'template', 'name'],
          '',
        ),
        CreatorName: getIn(dynamicItem, ['initiatorId', 'nickName'], ''),
        CreatorPic: getIn(dynamicItem, ['initiatorId', 'userPic'], ''),
      }),
    );
    this.props.navigation.navigate('ReportPreview', {
      readOnly: true,
    });
  };

  handlePreviewSystemTemplate = (templateItem: any) => {
    this.props.dispatch(
      previewTemplate({
        ...templateItem,
      }),
    );
    this.props.navigation.navigate('TemplatePreview', {
      isSystemTemplate: true,
    });
  };

  handleCopy = (pKey: string, name: string, templateOrReport: boolean) => {
    let {authToken, templates} = this.props;
    if (templateOrReport) {
      Modal.prompt(
        'Add template',
        '',
        [
          {
            text: 'Cancel',
            onPress: () => {
              Keyboard.dismiss();
            },
          },
          {
            text: 'OK',
            onPress: (value: string) => {
              Keyboard.dismiss();
              if (value) {
                let sameTemplates = templates.filter(
                  item => item.Name === value,
                );
                if (sameTemplates.length > 0) {
                  Modal.alert(
                    'Add template failed !',
                    'The template with the same name already exists, please rename to add.',
                    [
                      {
                        text: 'OK',
                        onPress: () => {},
                      },
                    ],
                  );
                } else {
                  this.props.dispatch(
                    copyTemplateAddToMine(
                      authToken,
                      {templatePkey: pKey, templateName: value || ''},
                      () => {
                        Toast.success(toastTips.SuccessAdd, 1);
                      },
                    ),
                  );
                }
              } else {
                Toast.fail('Template Name is required !', 1, undefined, false);
              }
            },
          },
        ] as Action<TextStyle>[],
        'default',
        name,
        ['please input name'],
      );
    } else {
      // this.props.dispatch(
      //   copyReportAddToMine(authToken, { reportpKey: pKey }, () => {
      //     Toast.success(toastTips.SuccessAdd, 1);
      //   })
      // );
    }
  };

  render() {
    const {
      dynamicList,
      systemTemplates,
      navigation,
      currentUserInfo,
    } = this.props;
    const {refreshing} = this.state;
    // console.log("render dynamic", systemTemplates);

    const topSysTemplateLabel = 'Top System Template',
      emptyDefaultLabel = 'Others';
    let templateLabelList = [
      ...new Set(
        systemTemplates.map((item: any) =>
          item.isTop
            ? topSysTemplateLabel
            : item.label
            ? item.label
            : emptyDefaultLabel,
        ),
      ),
    ];
    templateLabelList = templateLabelList.sort();

    let sectionData = [];

    if (Array.isArray(dynamicList) && dynamicList.length) {
      sectionData.push({
        type: 'dynamic',
        title: 'Dynamic Information',
        data: dynamicList,
      });
    }

    if (canUploadTemplateToOrg(currentUserInfo)) {
      let topTwoSystemTemplate: any = [];
      if (systemTemplates.length <= 2) {
        topTwoSystemTemplate = systemTemplates;
      } else {
        let filterTopTwo = systemTemplates.filter((item: any) => item.isTop);
        topTwoSystemTemplate = topTwoSystemTemplate.concat(
          filterTopTwo.slice(0, 2),
        );
        if (topTwoSystemTemplate.length < 2) {
          topTwoSystemTemplate = topTwoSystemTemplate.concat(
            systemTemplates.slice(0, 2 - topTwoSystemTemplate.length),
          );
        }
      }
      if (topTwoSystemTemplate.length) {
        sectionData.unshift({
          type: 'systemTemplate',
          title: 'System Template',
          data: topTwoSystemTemplate.length
            ? [
                {
                  topTwoData: topTwoSystemTemplate,
                },
              ]
            : [],
        });
      }
    }

    const _renderSectionHeader = ({section}: any) => {
      return canUploadTemplateToOrg(currentUserInfo) ? (
        <View style={styles.sectionHeader}>
          <Text style={{lineHeight: 50, fontSize: 16, color: '#2E2E2E'}}>
            {section.title}
          </Text>
          {section.type === 'systemTemplate' && systemTemplates.length ? (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('SystemTemplate');
              }}>
              <Text style={{fontSize: 12, color: '#1E9DFC'}}>More</Text>
            </TouchableOpacity>
          ) : (
            <View />
          )}
        </View>
      ) : (
        <View style={{marginBottom: 8}} />
      );
    };

    const _renderSectionFooter = ({section}: any) => {
      return section.type === 'systemTemplate' ? (
        <View style={styles.sectionFooter} />
      ) : (
        <View />
      );
    };

    const _renderItem = (data: any) => {
      const {index, item, section} = data;
      const {topTwoData} = item;
      if (section.type === 'systemTemplate') {
        return (
          <View style={styles.sysTemplateRow}>
            {topTwoData.map((templateItem: any, index: number) => {
              const templateLabel = templateItem.isTop
                ? topSysTemplateLabel
                : templateItem.label
                ? templateItem.label
                : emptyDefaultLabel;
              const dIndex = templateLabelList.indexOf(templateLabel);
              const itemColor =
                dIndex > -1
                  ? backgroundColorEnum[dIndex % 14]
                  : backgroundColorEnum[index % 14];
              return (
                <TemplateItem
                  key={templateItem.pKey ? templateItem.pKey + index : index}
                  templateData={templateItem}
                  index={index}
                  onPress={() => {
                    this.handlePreviewSystemTemplate(templateItem);
                  }}
                  showCategory={true}
                  category={templateLabel}
                  bgColor={itemColor}
                />
              );
            })}
          </View>
        );
      } else if (section.type === 'dynamic') {
        const shareData = getIn(item, ['payload', 'templateId'], null)
            ? getIn(item, ['payload', 'templateId'])
            : getIn(item, ['payload', 'reportId'], null)
            ? getIn(item, ['payload', 'reportId'])
            : null,
          initiator = getIn(item, ['initiatorId'], null),
          templateOrData = getIn(item, ['payload', 'templateId'], null)
            ? true
            : false;

        const renderDynamicItem = () => {
          const userPic = initiator.userPic,
            userName = initiator.nickName,
            title = shareData.name,
            createAt = item.createdAt;
          const previewAction = templateOrData
            ? () => {
                if (
                  typeof getIn(item, ['payload', 'templateId'], null) ===
                  'object'
                ) {
                  this.handlePreviewTemplate(item);
                }
              }
            : () => {
                if (
                  typeof getIn(item, ['payload', 'reportId'], null) === 'object'
                ) {
                  this.handlePreviewData(item);
                }
              };
          const copyAction = templateOrData
            ? () => {
                this.handleCopy(shareData._id, shareData.name, templateOrData);
              }
            : null;
          return (
            <TouchableOpacity onPress={previewAction}>
              <View style={styles.itemWrapper}>
                {userPic ? (
                  <Image style={styles.imageStyle} source={{uri: userPic}} />
                ) : (
                  <Image
                    style={styles.imageStyle}
                    source={Icon.headerImageIcon}
                  />
                )}

                <View style={{marginLeft: 10}}>
                  <View style={styles.infoStyle}>
                    <Text numberOfLines={1} style={styles.share}>
                      {userName +
                        ' ' +
                        (templateOrData ? 'Share Template' : 'Share Data')}
                    </Text>
                    {copyAction && (
                      <TouchableOpacity onPress={copyAction}>
                        <View style={styles.shareButton}>
                          <Text style={styles.shareText}>+ ADD</Text>
                        </View>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.timeStyle}>
                    {moment(createAt).format('MMM D,YYYY HH:mm')}
                  </Text>
                  <View style={styles.nameStyle}>
                    <Text numberOfLines={2} style={styles.Title}>
                      {title}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        };

        return shareData ? renderDynamicItem() : null;
      } else {
        return null;
      }
    };

    let emptyTip = (
      <View style={styles.emptyWrapper}>
        <Image source={Icon.blankpage3} />
        <Text style={styles.emptyText}>There's no dynamics here.</Text>
      </View>
    );

    console.log('sectionData', sectionData);

    return (
      <View style={styles.normal}>
        <View>
          <View style={styles.topWrapper}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.topText}>Dynamic</Text>
            </View>
          </View>
          <NetworkStateBar />
        </View>
        {sectionData.length === 1 &&
        sectionData[0].type === 'systemTemplate' ? (
          <SystemTemplateList
            refreshing={refreshing}
            systemTemplates={systemTemplates}
            handleFetchList={() => {
              this.handleFetchList(this.props, true);
            }}
            handlePreviewSystemTemplate={(templateItem: any) => {
              this.handlePreviewSystemTemplate(templateItem);
            }}
          />
        ) : (
          <SectionList
            sections={sectionData}
            renderSectionHeader={_renderSectionHeader}
            renderSectionFooter={_renderSectionFooter}
            renderItem={sectionItem => _renderItem(sectionItem)}
            keyExtractor={(item, index) => item + index}
            refreshing={refreshing}
            onRefresh={() => {
              this.handleFetchList(this.props, true);
            }}
            ListEmptyComponent={emptyTip}
            contentContainerStyle={{
              paddingBottom: setSizeWithPx(80),
            }}
            style={styles.sectionList}
          />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  sectionList: {},
  topWrapper: {
    flexDirection: 'row',
    width: deviceWidth,
    height: 48 + statusBarHeight,
    backgroundColor: DColors.mainColor,
    paddingTop: statusBarHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topText: {
    fontFamily: Page.font_family,
    fontSize: 18,
    color: '#FFFFFF',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  sectionFooter: {
    marginHorizontal: 17,
    marginTop: 8,
    marginBottom: 0,
    height: 1,
    backgroundColor: '#E3E4E5',
  },
  sysTemplateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Page.templateMargin,
  },
  templateItemWrapper: {
    width: (deviceWidth - Page.templateMargin * 6) / 2,
    marginHorizontal: Page.templateMargin,
    marginBottom: Page.templateMargin,
    borderRadius: 7,
    overflow: 'hidden',
    height: 100,
    padding: 10,
  },
  templateTitle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    lineHeight: 18,
    color: '#fff',
  },
  creatorInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  creatorText: {
    fontFamily: Page.font_family,
    fontSize: 14,
    marginLeft: 10,
    width: 100,
    color: '#fff',
  },
  infoText: {
    fontFamily: Page.font_family,
    fontSize: 12,
    color: '#fff',
    textAlign: 'right',
  },
  itemWrapper: {
    flexDirection: 'row',
    flex: 1,
    marginVertical: 8,
    width: deviceWidth - 34,
    paddingLeft: 12,
    paddingRight: 10,
    paddingTop: 16,
    paddingBottom: 13,
    backgroundColor: '#FFFFFF',
    marginLeft: 17,
    borderRadius: 7,
    minHeight: 107,
  },
  imageStyle: {
    width: 40,
    height: 40,
    backgroundColor: '#20a0ff',
    borderRadius: 20,
  },
  infoStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  share: {
    fontFamily: Page.font_family,
    fontSize: 18,
    color: Page.mainColor,
    width: deviceWidth - 160,
  },
  Title: {
    width: deviceWidth - 110,
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#2E2E2E',
  },
  shareButton: {
    width: 50,
    height: 20,
    backgroundColor: Page.mainColor,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareText: {
    fontFamily: Page.font_family,
    fontSize: 12,
    color: '#FFFFFF',
  },
  timeStyle: {
    fontFamily: Page.font_family,
    fontSize: 14,
    color: '#757575',
  },
  nameStyle: {
    marginTop: 8,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyWrapper: {
    width: '100%',
    flex: 1,
    marginTop: (deviceHeight - statusBarHeight - 48 - 223) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#96D0FC',
  },
});

const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
    currentUserInfo: state.loginInfo.currentUserInfo,
    templates: state.template.templates,
    companyTemplates: state.template.companyTemplates,
    systemTemplates: state.template.systemTemplates,
    dynamicList: state.dynamic.dynamicList,
  };
};

export default connect(mapStateToProps)(DynamicList);
