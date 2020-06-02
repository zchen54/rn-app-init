import React, {Component, Fragment, useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Image,
  StatusBar,
  TouchableWithoutFeedback,
  SectionList,
  ImageBackground,
  Modal as ReactModal,
  TextStyle,
  Clipboard,
} from 'react-native';
import {PlatFormAndroid} from '../../env';
import {DColors, FONT_FAMILY} from '../../common/styles';
import {
  requestApiV2,
  API_v2,
  requestMultiplePermission,
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
  statusBarHeight,
  searchType,
  deviceHeight,
  isIphoneX,
  isIphoneXsMax,
  getIsFirstBubble,
  setIsFirstBubble,
  isNetworkConnected,
  getAutoSubmitDraft,
  getIn,
  backgroundColorEnum,
} from '../../common/utils';
import {NetworkStateBar, DActionSheet} from '../../common/components';
import {Toast, Modal, Portal} from '@ant-design/react-native';
import {
  fetchUserTemplates,
  fetchCompanyTemplates,
  fetchSystemTemplates,
  fetchUserReports,
  fetchCompanyReports,
  previewTemplate,
  previewTemplateBySelect,
  uploadCompanyTemplate,
  deleteUserTemplateDraft,
  deleteUserTemplate,
  deleteCompanyTemplate,
  initReport,
  copyTemplateAddToMine,
  autoUploadCompanyReportDraft,
  fetchTemplateInfo,
} from '../../store/actions';
import {
  TemplateType,
  ModelType,
  ReportType,
} from '../../common/constants/ModeTypes';
import moment from 'moment';
import {
  canUploadTemplateToOrg,
  canDeleteTemplateFromOrg,
  canDownloadTemplateFromOrg,
  isStaffInCompany,
} from './judgement';
import {toastTips, LOGIN_IN} from '../../common/constants';
import {Action} from '@ant-design/react-native/lib/modal/PropsType';
import {TemplateItem} from './components';
import {isAdmin} from '../template/judgement';
import {serverURL} from '../../env';

const canIEditTemplate = (currentUserInfo: any) => {
  return isAdmin(currentUserInfo);
};

interface State {
  currentTab: number;
  hadFetch: boolean;
  refreshing: boolean;
  bubbleVisible: boolean;
  bubbleIndex: number;
}
interface Props {
  navigation: any;
  authToken: string;
  currentUserInfo: any;
  companyInfo: any;
  userTemplateDrafts: Array<ModelType & TemplateType>;
  templates: Array<ModelType & TemplateType>;
  organizationTemplates: Array<ModelType & TemplateType>;
  systemTemplates: Array<ModelType & TemplateType>;
  companyReportDrafts: Array<ModelType & ReportType>;
  dispatch: Function;
}

interface Bubble {
  [key: string]: any;
}

const Page = {
  font_family: FONT_FAMILY,
  templateMargin: 16,
};

const Icon = {
  searchIcon: require('../images/Me/search.png'),
  AdminIcon: require('../images/template/Administration.png'),
  upLoadIcon: require('../images/template/Upload.png'),
  deleteIcon: require('../images/template/Delete_red.png'),
  defaultIcon: require('../images/template/default.png'),
  write_grey: require('../images/template/write_grey.png'),
  write_blue: require('../images/template/write_blue.png'),
  submit_grey: require('../images/template/submit_grey.png'),
  submit_blue: require('../images/template/submit_blue.png'),
  upload_grey: require('../images/template/upload_grey.png'),
  upload_blue: require('../images/template/upload_blue.png'),
  downloadIcon: require('../images/template/download.png'),
  blankpage1: require('../images/template/blankpage1.png'),
  headerImageIcon: require('../images/Me/Portrait.png'),
  AddScanIcon: require('../images/Me/Add_scan.png'),
  d2gIcon: require('../images/Me/about.png'),
};

const Bubble: Bubble = {
  bubble1: require('../images/GuidePage/long1.png'),
  bubble2: require('../images/GuidePage/long3.png'),
  bubble3: require('../images/GuidePage/long_add.png'),
  button: require('../images/GuidePage/button.png'),
};

const tabs = ['organization', 'system'];
interface SectionItem {
  title: string;
  data: Array<ModelType & TemplateType>;
}
const initSectionData: Array<SectionItem> = [];
const initSectionTags: string[] = [];
const initSelectedTemplate: any = {};

// 模板列表
const TemplateList = (props: Props) => {
  const {
    navigation,
    authToken,
    currentUserInfo,
    companyInfo,
    userTemplateDrafts,
    organizationTemplates,
    systemTemplates,
    companyReportDrafts,
    dispatch,
  } = props;

  const [currentTab, setCurrentTab] = useState(tabs[0]);
  const [refreshing, setRefreshing] = useState(false);
  const [sectionData, setSectionData] = useState(initSectionData);
  const [sectionTags, setSectionTags] = useState(initSectionTags);
  const [selectedTags, setSelectedTags] = useState(initSectionTags);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleIndex, setBubbleIndex] = useState(1);
  const [controllerVisible, setControllerVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(
    initSelectedTemplate,
  );

  useEffect(() => {
    // Android 首次进入应用时请求权限
    if (Platform.OS === PlatFormAndroid) {
      requestMultiplePermission().then(res => {
        console.log('requestPermission---', res);
        // 显示气泡教程
        getIsFirstBubble()
          .then(res => {
            setBubbleVisible(false);
          })
          .catch(e => {
            setBubbleVisible(true);
          });
      });
    } else {
      // 显示气泡教程
      getIsFirstBubble()
        .then(res => {
          setBubbleVisible(false);
        })
        .catch(e => {
          setBubbleVisible(true);
        });
    }

    // 监听路由
    const viewDidAppear = navigation.addListener(
      'willFocus',
      (navigationProps: any) => {
        // console.log("页面将要显示", navigationProps);
        StatusBar.setBarStyle('light-content', true);
        getAutoSubmitDraft()
          .then(res => {
            if (res) {
              isNetworkConnected().then(isConnected => {
                if (isConnected) {
                  handleAutoUploadCompanyReportDraft();
                }
              });
            }
          })
          .catch(e => {
            console.log(e);
          });
      },
    );
    return () => {
      // 清除订阅
      viewDidAppear.remove();
    };
  }, []);

  function handleAutoUploadCompanyReportDraft() {
    const autoUploadDrafts = companyReportDrafts.filter(
      (item: any) => !item.error,
    );
    if (autoUploadDrafts.length) {
      dispatch(autoUploadCompanyReportDraft(authToken, autoUploadDrafts));
    }
  }

  useEffect(() => {
    console.log('useEffect currentTab', currentTab);
    generateSections();
  }, [currentTab]);

  useEffect(() => {
    console.log('useEffect organizationTemplates,systemTemplates');
    setRefreshing(false);
    generateSections();
  }, [organizationTemplates, systemTemplates, userTemplateDrafts]);

  function handleFetchList(refresh = false) {
    if (refresh) {
      if (currentTab === tabs[0]) {
        setRefreshing(true);
        dispatch(
          fetchCompanyTemplates(authToken, () => {
            setRefreshing(false);
          }),
        );
      } else if (currentTab === tabs[1]) {
        setRefreshing(true);
        dispatch(
          fetchSystemTemplates(authToken, () => {
            setRefreshing(false);
          }),
        );
      }
    } else {
      setRefreshing(false);
    }
  }

  function generateSections() {
    let sectionMap: any = {};
    let sections: Array<any> = [];
    const insertSectionMap = (
      key: string,
      dataItem: ModelType & TemplateType,
    ) => {
      if (!sectionMap[key]) {
        sectionMap[key] = {
          title: key,
          data: [],
        };
      }
      sectionMap[key].data.push(dataItem);
    };

    if (currentTab === tabs[0]) {
      if (
        Array.isArray(organizationTemplates) &&
        organizationTemplates.length
      ) {
        const defaultDepartmentText = 'All Departments';
        organizationTemplates.forEach((item: ModelType & TemplateType) => {
          if (item.departmentName) {
            insertSectionMap(item.departmentName, item);
          } else {
            insertSectionMap(defaultDepartmentText, item);
          }
        });

        // 草稿
        sectionMap['Local Drafts'] = {
          title: 'Local Drafts',
          data: [...userTemplateDrafts],
        };

        Object.keys(sectionMap).forEach((key: string) => {
          let tempData = {
            title: sectionMap[key].title,
            count: sectionMap[key].data.length,
            data: sectionMap[key].data,
          };
          if (sectionMap[key].data.length % 2 === 1) {
            tempData.data.push({});
          }
          sections.push(tempData);
        });
      }
    } else if (currentTab === tabs[1]) {
      if (Array.isArray(systemTemplates) && systemTemplates.length) {
        // 系统模板根据 isTop 和 label 分类
        const topSysTemplateLabel = 'Top System Template',
          emptyDefaultLabel = 'Others';
        systemTemplates.forEach((item: ModelType & TemplateType) => {
          if (item.isTop) {
            insertSectionMap(topSysTemplateLabel, item);
          }
          if (item.label) {
            insertSectionMap(item.label, item);
          } else {
            insertSectionMap(emptyDefaultLabel, item);
          }
        });

        // 将没label的模板放至末尾
        let topSectionItem: any = {};
        let lastSectionItem: any = {};
        Object.keys(sectionMap).forEach((key: string) => {
          let tempData = {
            title: sectionMap[key].title,
            count: sectionMap[key].data.length,
            data: sectionMap[key].data,
          };
          if (sectionMap[key].data.length % 2 === 1) {
            tempData.data.push({});
          }
          if (key === topSysTemplateLabel) {
            topSectionItem = tempData;
          } else if (key === emptyDefaultLabel) {
            lastSectionItem = tempData;
          } else {
            sections.push(tempData);
          }
        });
        if (topSectionItem && topSectionItem.title) {
          sections.unshift(topSectionItem);
        }
        if (lastSectionItem && lastSectionItem.title) {
          sections.push(lastSectionItem);
        }
      }
    }
    setSectionData(sections);
    setSectionTags(Object.keys(sectionMap));
    // setSelectedTags(Object.keys(sectionMap));
  }

  function handleTabChange(tabIndex: number) {
    navigation.setParams({tab: tabIndex});
    setCurrentTab(tabs[tabIndex]);
  }

  function handleEdit(item: ModelType & TemplateType) {
    dispatch(previewTemplate(item));
    navigation.navigate('CreateTemplate', {type: 'Edit'});
  }

  function handleCollectData(template: ModelType & TemplateType) {
    dispatch(
      initReport(authToken, template, () => {
        navigation.navigate('CollectData', {
          type: 'Create',
        });
      }),
    );
  }

  function handlePreviewSystemTemplate(templateItem: ModelType & TemplateType) {
    dispatch(
      previewTemplate({
        ...templateItem,
      }),
    );
    navigation.navigate('TemplatePreview', {
      isSystemTemplate: true,
    });
  }

  function handleDeleteTemplate() {
    closeControllerModal();
    if (selectedTemplate.UploadStatus && selectedTemplate.pKey) {
      Modal.alert('Are you sure to delete?', '', [
        {
          text: 'Cancel',
          onPress: () => {
            console.log('cancel');
          },
          style: 'cancel',
        },
        {
          text: 'Sure',
          onPress: () => {
            setTimeout(() => {
              submitDeleteCompanyTemplate(selectedTemplate);
            }, 500);
          },
        },
      ]);
    } else {
      dispatch(
        deleteUserTemplateDraft(currentUserInfo._id, selectedTemplate.pKey),
      );
    }
  }

  function submitDeleteUserTemplate(item: ModelType & TemplateType) {
    if (item.UploadStatus) {
      dispatch(deleteUserTemplate(authToken, item.pKey));
    } else {
      dispatch(deleteUserTemplateDraft(currentUserInfo._id, item.pKey));
    }
  }

  function submitDeleteCompanyTemplate(item: ModelType & TemplateType) {
    dispatch(deleteCompanyTemplate(authToken, item.pKey));
  }

  function handleUploadTemplateToCompany(item: ModelType & TemplateType) {
    const handleUploadFun = (
      templateData: ModelType & TemplateType,
      createOrUpdate: boolean,
    ) => {
      dispatch(
        uploadCompanyTemplate(authToken, templateData, createOrUpdate, () => {
          handleTabChange(1);
        }),
      );
    };
    requestApiV2(
      API_v2.templateNameIsExist,
      {name: item.Name, target: 'company'},
      authToken,
    )
      .then(res => {
        if (res.result === 'Success') {
          if (res.data) {
            Modal.alert(
              'Are you sure to upload?',
              'The organization already has a template of the same name. Are you sure to overwrite it?',
              [
                {
                  text: 'Cancel',
                  onPress: () => {
                    console.log('cancel');
                  },
                  style: 'cancel',
                },
                {
                  text: 'Sure',
                  onPress: () => {
                    organizationTemplates.forEach((orgItem: any) => {
                      if (orgItem.Name === item.Name) {
                        handleUploadFun(
                          {
                            ...orgItem,
                            Sections: [...item.Sections],
                          },
                          false,
                        );
                      }
                    });
                  },
                },
              ],
            );
          } else {
            handleUploadFun(item, true);
          }
        } else if (res.error) {
          Modal.alert('Request error !', res.error, [
            {text: 'OK', onPress: () => {}},
          ]);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  function handleDownloadCompanyToLocal(
    templateItem: ModelType & TemplateType,
    name?: string,
  ) {
    // let itemName = name ? name : templateItem.Name;
    // let sameTemplates = templates.filter(item => item.Name === itemName);
    // if (sameTemplates.length > 0) {
    //   Modal.prompt(
    //     'Download Failed!',
    //     'The template with the same name already exists, please rename to download.',
    //     [
    //       {
    //         text: 'Cancle',
    //         onPress: () => {},
    //       },
    //       {
    //         text: 'OK',
    //         onPress: (value: string) => {
    //           value
    //             ? handleDownloadCompanyToLocal(templateItem, value)
    //             : Toast.fail(
    //                 'Template Name is required !',
    //                 1,
    //                 undefined,
    //                 false,
    //               );
    //           return;
    //         },
    //       },
    //     ] as Action<TextStyle>[],
    //     'default',
    //     '',
    //     ['please input name'],
    //   );
    // } else {
    //   dispatch(
    //     copyTemplateAddToMine(
    //       authToken,
    //       {
    //         templatePkey: templateItem.pKey,
    //         templateName: name || '',
    //       },
    //       () => {
    //         Toast.success(toastTips.SuccessDownload, 1);
    //         handleTabChange(0);
    //       },
    //     ),
    //   );
    // }
  }

  function handleGotIt() {
    if (bubbleIndex < 3) {
      setBubbleIndex(bubbleIndex + 1);
    } else {
      setBubbleVisible(false);
      setIsFirstBubble(true);
    }
  }

  function handleEditTemplate() {
    closeControllerModal();
    if (selectedTemplate.UploadStatus && selectedTemplate.pKey) {
      dispatch(
        fetchTemplateInfo(
          currentUserInfo.authToken,
          selectedTemplate.pKey,
          () => {
            navigation.navigate('CreateTemplate', {
              type: 'Edit',
            });
          },
        ),
      );
    } else {
      handleEdit(selectedTemplate);
    }
  }

  function handleShareTemplate() {
    closeControllerModal();
    dispatch(
      fetchTemplateInfo(
        currentUserInfo.authToken,
        selectedTemplate.pKey,
        () => {
          navigation.navigate('CreateGroup', {
            title: 'Share',
            type: 'shareTemplate',
          });
        },
        'ShareTemplate',
      ),
    );
  }

  function handleShareTemplateByLink() {
    closeControllerModal();
    const baseUrl = serverURL.replace('/api/', '');
    const webUrl = `${baseUrl}/reportEdit/web_user/${selectedTemplate.pKey}`;
    const handleSuccess = () => {
      Clipboard.setString(webUrl);
      Modal.alert(
        'The link has been copied to the clipboard',
        'You can fill in the data by accessing the links.',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ],
      );
    };
    const handleFailed = () => {
      Modal.alert('Share template failed', 'Please try again later.', [
        {text: 'OK', onPress: () => {}},
      ]);
    };

    const toastKey = Toast.loading('Loading...', 0);
    requestApiV2(
      API_v2.shareTemplate,
      {
        templateId: selectedTemplate.pKey,
        isSharing: true,
      },
      authToken,
    )
      .then(res => {
        Portal.remove(toastKey);
        if (res.result === 'Success') {
          handleSuccess();
        } else {
          handleFailed();
        }
      })
      .catch(error => {
        Portal.remove(toastKey);
        console.error(error);
      });
  }

  function handleShareTemplateByQRCode() {
    closeControllerModal();

    const handleSuccess = () => {
      navigation.navigate('ShareTemplateByQRCode', {
        templateId: selectedTemplate.TemplatepKey,
        templateName: selectedTemplate.templateName,
        templateColor: selectedTemplate.color,
        companyName: selectedTemplate.companyName,
        templateCreatedAt: selectedTemplate.templateCreatedAt,
      });
    };
    const handleFailed = () => {
      Modal.alert('Share template failed', 'Please try again later.', [
        {text: 'OK', onPress: () => {}},
      ]);
    };

    const toastKey = Toast.loading('Loading...', 0);
    requestApiV2(
      API_v2.shareTemplate,
      {
        templateId: selectedTemplate.pKey,
        isSharing: true,
      },
      authToken,
    )
      .then(res => {
        Portal.remove(toastKey);
        if (res.result === 'Success') {
          handleSuccess();
        } else {
          handleFailed();
        }
      })
      .catch(error => {
        Portal.remove(toastKey);
        console.error(error);
      });
  }

  function closeControllerModal() {
    setSelectedTemplate(initSelectedTemplate);
    setControllerVisible(false);
  }

  function handlePressSectionTitle(title: string) {
    if (title) {
      let newSelectedTags = [...selectedTags];
      let index = newSelectedTags.indexOf(title);
      index === -1
        ? newSelectedTags.push(title)
        : newSelectedTags.splice(index, 1);
      setSelectedTags(newSelectedTags);
    }
  }

  if (Platform.OS === PlatFormAndroid) {
    StatusBar.setBackgroundColor('rgba(0,0,0,0)', true);
    StatusBar.setTranslucent(true);
  }
  const currentCompanyName = currentUserInfo.companyName || '';

  let dataSource =
    currentTab === tabs[0]
      ? [...organizationTemplates]
      : currentTab === tabs[1]
      ? [...systemTemplates]
      : [];

  // 部门分类设置颜色
  const defaultDepartmentText = 'All Departments';
  let departmentListForColor = [
    ...new Set(
      organizationTemplates.map(
        (templateItem: ModelType & TemplateType) =>
          templateItem.departmentName || defaultDepartmentText,
      ),
    ),
  ];
  departmentListForColor = departmentListForColor.sort();

  const _renderTabBar = () => {
    return (
      <View>
        <View style={styles.tabWrapper}>
          <TouchableWithoutFeedback
            onPress={() => navigation.navigate('ScanQRCode')}>
            <View
              style={
                isStaffInCompany(currentUserInfo)
                  ? [styles.imageWrapper, {marginRight: 16}]
                  : styles.imageWrapper
              }>
              <Image style={styles.imageStyle} source={Icon.AddScanIcon} />
            </View>
          </TouchableWithoutFeedback>
          <View style={styles.tabsStyle}>
            <TouchableWithoutFeedback onPress={() => handleTabChange(0)}>
              <View style={styles.tabStyle}>
                <Text
                  style={
                    currentTab === tabs[0]
                      ? styles.tabTextStyle
                      : {
                          ...styles.tabTextStyle,
                          color: '#E6E6E6',
                          fontSize: 12,
                        }
                  }>
                  ORGANIZATION
                </Text>
                {currentTab === tabs[0] ? (
                  <View style={styles.underLineStyle} />
                ) : (
                  <View
                    style={{
                      ...styles.underLineStyle,
                      backgroundColor: DColors.mainColor,
                    }}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={() => handleTabChange(1)}>
              <View style={styles.tabStyle}>
                <Text
                  style={
                    currentTab === tabs[1]
                      ? styles.tabTextStyle
                      : {
                          ...styles.tabTextStyle,
                          color: '#E6E6E6',
                          fontSize: 12,
                        }
                  }>
                  SYSTEM
                </Text>
                {isStaffInCompany(currentUserInfo) ? (
                  currentTab === tabs[1] ? (
                    <View style={styles.underLineStyle} />
                  ) : (
                    <View
                      style={{
                        ...styles.underLineStyle,
                        backgroundColor: DColors.mainColor,
                      }}
                    />
                  )
                ) : null}
              </View>
            </TouchableWithoutFeedback>
          </View>
          <TouchableWithoutFeedback
            onPress={() => {
              navigation.navigate('FuzzySearchAll', {
                type: searchType.TemplateName,
              });
            }}>
            <View style={styles.imageWrapper}>
              <Image style={styles.imageStyle} source={Icon.searchIcon} />
            </View>
          </TouchableWithoutFeedback>
        </View>
        <NetworkStateBar />
      </View>
    );
  };

  const _renderSectionHeader = ({section}: any) => {
    return (
      <TouchableOpacity
        onPress={() => {
          handlePressSectionTitle(section.title);
        }}
        style={styles.sectionHeader}>
        <Text style={{lineHeight: 40, fontSize: 16, color: '#2E2E2E'}}>
          {`${section.title}  (${section.count})`}
        </Text>
        <Text style={{fontSize: 12, color: '#757575'}}>
          {selectedTags.indexOf(section.title) >= 0 ? 'Hide' : 'Show'}
        </Text>
      </TouchableOpacity>
    );
  };

  const _renderSectionFooter = ({section}: any) => {
    return <View style={styles.sectionFooter} />;
  };

  const _renderItem = ({index, item, section}: any) => {
    const sectionTagsSorted = sectionTags.sort();
    let dIndex = sectionTagsSorted.indexOf(section.title);
    let itemColor =
      dIndex > -1
        ? backgroundColorEnum[dIndex % 14]
        : backgroundColorEnum[index % 14];
    return selectedTags.indexOf(section.title) >= 0 ? (
      <TemplateItem
        key={item.pKey + index}
        index={index}
        templateData={item}
        onPress={() => {
          if (currentTab === tabs[0]) {
            if (item.UploadStatus) {
              handleCollectData(item);
            } else {
              handleEdit(item);
            }
          } else {
            handlePreviewSystemTemplate(item);
          }
        }}
        handleMoreAction={
          currentTab === tabs[0] && !item.isDefault
            ? () => {
                setSelectedTemplate(item);
                setControllerVisible(true);
              }
            : undefined
        }
        isSystem={currentTab === tabs[1]}
        showCategory={true}
        category={section.title}
        bgColor={item.isDefault ? DColors.mainColor : itemColor}
      />
    ) : (
      <View />
    );
  };

  const _renderBubble = () => {
    let positionTop = 0;
    let positionBottom3 = 0;
    if (Platform.OS === PlatFormAndroid) {
      positionTop = -183;
      positionBottom3 = -120;
    } else {
      positionTop = isIphoneX() || isIphoneXsMax() ? -139 : -163;
      positionBottom3 = isIphoneX() || isIphoneXsMax() ? -90 : -120;
    }
    return (
      <ReactModal transparent={true} visible={bubbleVisible}>
        <Image
          style={
            bubbleIndex === 3
              ? {...styles.bubbleStyle, bottom: positionBottom3}
              : styles.bubbleStyle
          }
          source={Bubble['bubble' + bubbleIndex]}
        />
        <TouchableWithoutFeedback onPress={handleGotIt}>
          <Image style={styles.bubbleButton} source={Bubble.button} />
        </TouchableWithoutFeedback>
      </ReactModal>
    );
  };

  let emptyTip = (
    <View style={styles.emptyWrapper}>
      <Image source={Icon.blankpage1} style={{width: 252, height: 178}} />
      <Text style={styles.emptyText}>You don’t have a template yet.</Text>
      <Text style={styles.emptyText}>Create it.</Text>
    </View>
  );

  const renderControllerModal = () => {
    let controllers: any = [];
    if (canIEditTemplate(currentUserInfo)) {
      controllers.push({
        text: 'Edit Template',
        onPress: handleEditTemplate,
      });
      controllers.push({
        text: 'Delete Template',
        color: DColors.auxiliaryRed,
        onPress: handleDeleteTemplate,
      });
    }

    return (
      <DActionSheet
        visible={controllerVisible}
        onClose={closeControllerModal}
        actions={controllers}
      />
    );
  };

  return (
    <View style={styles.normal}>
      <StatusBar barStyle="light-content" translucent={true} />
      {_renderTabBar()}
      <SectionList
        sections={sectionData}
        renderSectionHeader={_renderSectionHeader}
        renderSectionFooter={_renderSectionFooter}
        renderItem={sectionItem => _renderItem(sectionItem)}
        keyExtractor={(item, index) => '' + index}
        refreshing={refreshing}
        onRefresh={() => {
          handleFetchList(true);
        }}
        ListEmptyComponent={emptyTip}
        contentContainerStyle={{
          paddingBottom: setSizeWithPx(80),
          flexWrap: 'wrap',
          flexDirection: 'row',
        }}
        style={styles.sectionList}
      />
      {_renderBubble()}
      {renderControllerModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#f3f3f3',
    // alignItems: "center"
  },
  sectionList: {},
  sectionHeader: {
    width: deviceWidth,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f3f3',
  },
  sectionFooter: {
    width: deviceWidth,
    height: 8,
  },
  sysTemplateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: Page.templateMargin,
  },
  tabWrapper: {
    flexDirection: 'row',
    width: deviceWidth,
    height: 48 + statusBarHeight,
    backgroundColor: DColors.mainColor,
    paddingTop: statusBarHeight,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabsStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: deviceWidth - 70 * 2,
    height: 48,
  },
  tabStyle: {
    width: (deviceWidth - 70 * 2) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabTextStyle: {
    fontFamily: Page.font_family,
    fontSize: 14,
    color: '#FFFFFF',
  },
  underLineStyle: {
    width: 40,
    height: 2,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  imageWrapper: {
    width: 54,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageStyle: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  itemContainer: {
    width: (deviceWidth - Page.templateMargin * 3) / 2,
    marginRight: Page.templateMargin,
    marginBottom: Page.templateMargin,
    borderRadius: 7,
    overflow: 'hidden',
  },
  itemWrapper: {
    height: 100,
    padding: 10,
  },
  templateTitle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    lineHeight: 18,
    color: '#fff',
  },
  defaultText: {
    fontSize: 14,
    color: '#2e2e2e',
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
  statusIcon: {
    position: 'absolute',
    top: 7,
    right: 7,
  },
  quickContainer: {
    flex: 1,
    height: 33,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  actionImageWrapper: {
    width: (deviceWidth - Page.templateMargin * 3) / 4 - 2,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionImage: {
    width: 21,
    height: 21,
  },
  emptyWrapper: {
    width: 260,
    marginTop: (deviceHeight - statusBarHeight - 48 - 100 - 223) / 2,
    marginHorizontal: (deviceWidth - 260) / 2 - Page.templateMargin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 5,
    fontFamily: Page.font_family,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#96D0FC',
  },
  bubbleStyle: {
    position: 'absolute',
    width: deviceWidth,
    resizeMode: 'stretch',
    bottom: isIphoneX() || isIphoneXsMax() ? 0 : -30,
  },
  bubbleButton: {
    position: 'absolute',
    bottom: 150,
    left: deviceWidth / 2 + 20,
  },
});

const mapStateToProps = (state: any) => {
  const userId = state.loginInfo.currentUserInfo._id;
  const userTemplateDraftsMap = getIn(
      state,
      ['draft', 'userIdIndexedDrafts', userId, 'userTemplateDraftsMap'],
      [],
    ),
    companyReportDraftsMap = getIn(
      state,
      ['draft', 'userIdIndexedDrafts', userId, 'companyReportDraftsMap'],
      [],
    );
  let userTemplateDrafts: Array<ModelType & TemplateType> = [],
    companyReportDrafts: Array<ModelType & ReportType> = [];
  if (userTemplateDraftsMap.length) {
    state.draft.userTemplateDrafts.forEach((item: ModelType & TemplateType) => {
      if (userTemplateDraftsMap.includes(item.pKey)) {
        userTemplateDrafts.unshift(item);
      }
    });
  }
  if (companyReportDraftsMap.length) {
    state.draft.companyReportDrafts.forEach((item: ModelType & ReportType) => {
      if (companyReportDraftsMap.includes(item.pKey)) {
        companyReportDrafts.unshift(item);
      }
    });
  }

  return {
    userTemplateDrafts,
    companyReportDrafts,
    authToken: state.loginInfo.currentUserInfo.authToken,
    currentUserInfo: state.loginInfo.currentUserInfo,
    companyInfo: state.company.companyInfo,
    organizationTemplates: state.template.companyTemplates,
    systemTemplates: state.template.systemTemplates,
  };
};

export default connect(mapStateToProps)(TemplateList);
