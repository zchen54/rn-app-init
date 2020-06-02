import React, {Component} from 'react';
import {connect} from 'react-redux';
import UUID from 'uuid/v1';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Image,
  BackHandler,
  Keyboard,
  StatusBar,
  Switch,
  Clipboard,
} from 'react-native';
import {Modal, Toast, Portal, NoticeBar, Icon} from '@ant-design/react-native';
import {TitleBarNew, DActionSheet} from '../../common/components';
import {fieldTypes, toastTips, codeTypeList} from '../../common/constants';
import {
  previewTemplate,
  createUserTemplateDraft,
  updateUserTemplateDraft,
  uploadUserTemplate,
  uploadCompanyTemplate,
  clearEditingTemplate,
  deleteUserTemplateDraft,
  deleteUserTemplate,
  deleteCompanyTemplate,
  saveEditingTemplate,
} from '../../store/actions';
import {DColors} from '../../common/styles';
import {
  getIn,
  API_v2,
  requestApiV2,
  randomTemplateColor,
  isFullScreen,
  isIphoneX,
  isIphoneXsMax,
} from '../../common/utils';
import {styles} from './style';
import {
  FieldType,
  SectionType,
  TemplateType,
  ModelType,
  TableFieldType,
  commonObj,
  newTemplate,
  newSection,
} from '../../common/constants/ModeTypes';
import {TemplateField} from './components';
import {serverURL} from '../../env';

const DIcon = {
  more: require('../images/Index-Login/more-operation.png'),
  addElement: require('../images/template/Add.png'),
  removeElement: require('../images/template/Reduce.png'),
  addSection: require('../images/template/add_section.png'),
  deleteSection: require('../images/template/Delete_grey.png'),
  Save: require('../images/template/Save.png'),
  Edit: require('../images/template/Edit.png'),
  Share: require('../images/template/Share.png'),
  Delete: require('../images/template/Delete.png'),
  Preview: require('../images/template/Preview.png'),
  rightIcon: require('../images/template/Right.png'),
};

interface State {
  templateData: ModelType & TemplateType;
  templateControllerVisible: boolean;
  codeTypeModalVisible: boolean;
  currentTableOrder: number;
  currentSectionOrder: number;
  errorMsg: string;
}
interface Props {
  userTemplateDraftsMap: Array<string>;
  templates: Array<ModelType & TemplateType>;
  navigation: any;
  currentUserInfo: any;
  authToken: string;
  editingTemplate: ModelType & TemplateType;
  dispatch: Function;
}

let isGoBackPopOpened = false;
let hasEdit = false;

export class CreateTemplateScreen extends Component<Props, State> {
  viewDidAppear: any;
  _didFocusSubscription: any;
  _willBlurSubscription: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      templateData: {...newTemplate, color: randomTemplateColor()},
      templateControllerVisible: false,
      codeTypeModalVisible: false,
      currentTableOrder: 0,
      currentSectionOrder: 1,
      errorMsg: '',
    };
    // 页面路由聚焦时绑定监听安卓返回键
    this._didFocusSubscription = props.navigation.addListener(
      'didFocus',
      (payload: any) =>
        BackHandler.addEventListener(
          'hardwareBackPress',
          this.onBackButtonPressAndroid,
        ),
    );
  }

  componentDidMount() {
    this.viewDidAppear = this.props.navigation.addListener(
      'willFocus',
      (navigationProps: any) => {
        // console.log("template页面将要显示", navigationProps);
        const templateAction = getIn(navigationProps, [
          'action',
          'params',
          'templateAction',
        ]);
        const fieldData = getIn(navigationProps, [
          'action',
          'params',
          'fieldData',
        ]);
        const currentSectionOrder = getIn(navigationProps, [
          'action',
          'params',
          'currentSectionOrder',
        ]);
        // console.log(templateAction, fieldData);
        if (templateAction === 'AddNewField' && fieldData) {
          this.addNewField(fieldData, currentSectionOrder);
        } else if (templateAction === 'EditField' && fieldData) {
          this.updateField(fieldData, currentSectionOrder);
        }
        this.setState(prevState => ({
          currentSectionOrder:
            currentSectionOrder || prevState.currentSectionOrder,
        }));
      },
    );
    this._willBlurSubscription = this.props.navigation.addListener(
      'willBlur',
      (payload: any) => {
        BackHandler.removeEventListener(
          'hardwareBackPress',
          this.onBackButtonPressAndroid,
        );
      },
    );
  }

  onBackButtonPressAndroid = () => {
    Keyboard.dismiss();
    this.closeControllerModal();
    const {navigation} = this.props;
    const {templateData} = this.state;
    // innactive ===
    const isSubmittedTemplate = true;
    // console.log("<---");

    if (!isGoBackPopOpened) {
      isGoBackPopOpened = true;
      if (hasEdit) {
        // 编辑过 退出前询问
        if (isSubmittedTemplate) {
          Modal.alert(
            'Quit Editing ?',
            'Your changes will be permanently lost.',
            [
              {
                text: 'Submit',
                onPress: () => {
                  isGoBackPopOpened = false;
                  this.handleCreateConfirm('Submit', true);
                },
              },
              {
                text: 'Quit',
                onPress: () => {
                  isGoBackPopOpened = false;
                  this.handleClear();
                  this.props.navigation.goBack();
                },
              },
              {
                text: 'Cancel',
                onPress: () => {
                  isGoBackPopOpened = false;
                  console.log('cancel');
                },
                style: 'cancel',
              },
            ],
          );
        } else {
          Modal.alert(
            'Quit Editing ?',
            'Your changes will be permanently lost.',
            [
              {
                text: 'Save',
                onPress: () => {
                  isGoBackPopOpened = false;
                  this.handleCreateConfirm('Save', true);
                },
              },
              {
                text: 'Quit',
                onPress: () => {
                  isGoBackPopOpened = false;
                  this.handleClear();
                  this.props.navigation.goBack();
                },
              },
              {
                text: 'Cancel',
                onPress: () => {
                  isGoBackPopOpened = false;
                  console.log('cancel');
                },
                style: 'cancel',
              },
            ],
          );
        }
      } else {
        // 未曾编辑 直接退出
        isGoBackPopOpened = false;
        hasEdit = false;
        this.handleClear();
        this.props.navigation.goBack();
      }
    }
    return true;
  };

  componentWillUnmount() {
    this.viewDidAppear.remove();
    this._didFocusSubscription && this._didFocusSubscription.remove();
    this._willBlurSubscription && this._willBlurSubscription.remove();
    isGoBackPopOpened = false;
    hasEdit = false;
  }

  componentWillMount() {
    isGoBackPopOpened = false;
    hasEdit = false;
    this.handleInitialState(this.props);
  }

  componentWillReceiveProps(nextProps: any) {
    this.handleInitialState(nextProps);
  }

  // 初始化 State
  handleInitialState = (props: any) => {
    const {editingTemplate, currentUserInfo} = props;
    if (editingTemplate && Array.isArray(editingTemplate.Sections)) {
      // Edit template
      this.setState({
        currentSectionOrder: editingTemplate.Sections[0].Order,
        templateData: {
          ...editingTemplate,
          Sections: editingTemplate.Sections.map((sItem: any) => ({
            ...sItem,
            Fields: sItem.Fields.map((fItem: any) => fItem),
          })),
        },
      });
    } else {
      // Add new template
      this.setState({
        currentSectionOrder: newSection.Order,
        templateData: {
          ...newTemplate,
          CreatorName: currentUserInfo.nickName,
          CreatorPic: currentUserInfo.userPic,
          pKey: UUID(),
          Name: '',
          color: randomTemplateColor(),
          Sections: [{...newSection}],
        },
      });
    }
  };

  handleClear = () => {
    setTimeout(() => {
      this.props.dispatch(clearEditingTemplate());
    }, 50);
  };

  // 修改 Template Name
  setEditTemplateName = (name: string) => {
    if (!hasEdit) {
      hasEdit = true;
    }
    this.setState(prevState => ({
      templateData: {
        ...prevState.templateData,
        Name: name,
      },
    }));
  };

  // 修改showCode
  handleSwitchChange = (value: boolean) => {
    if (!hasEdit) {
      hasEdit = true;
    }
    if (value) {
      this.handleShowCodeTypeModal(true);
    } else {
      this.setState(prevState => ({
        templateData: {
          ...prevState.templateData,
          showCode: false,
          codeType: '',
        },
      }));
    }
  };

  handleCodeTypeChange = (value: string) => {
    if (!hasEdit) {
      hasEdit = true;
    }
    this.handleShowCodeTypeModal(false);
    this.setState(prevState => ({
      templateData: {
        ...prevState.templateData,
        showCode: true,
        codeType: value,
      },
    }));
  };

  // 添加 Section
  addNewSection = () => {
    if (!hasEdit) {
      hasEdit = true;
    }
    let Sections = [...this.state.templateData.Sections];
    Sections.push({
      ...newSection,
      Name:
        'Section' +
        (Sections.length ? Sections[Sections.length - 1].Order + 1 : 1),
      Order: Sections.length ? Sections[Sections.length - 1].Order + 1 : 1,
    });
    this.setState(prevState => ({
      templateData: {
        ...prevState.templateData,
        Sections,
      },
    }));
  };

  // 删除 Section
  deleteSection = () => {
    Keyboard.dismiss();
    if (!hasEdit) {
      hasEdit = true;
    }
    const {currentSectionOrder} = this.state;
    let Sections = [...this.state.templateData.Sections],
      sectionIndex = 0;
    if (Sections.length < 2) {
      return;
    }
    Sections.forEach((item, i) => {
      if (item.Order === currentSectionOrder) {
        sectionIndex = i;
        Sections.splice(i, 1);
      }
    });
    Modal.alert('delete Section ' + (sectionIndex + 1), '', [
      {
        text: 'Cancel',
        onPress: () => console.log('cancel'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          this.setState(prevState => ({
            currentSectionOrder: Sections[0].Order,
            templateData: {
              ...prevState.templateData,
              Sections,
            },
          }));
        },
      },
    ]);
  };

  // 修改 Section Name
  changeSectionName = (text: string, SectionOrder: number) => {
    if (!hasEdit) {
      hasEdit = true;
    }
    if (text.length > 50) {
      this.showErrorMsg('Section name should not exceed 50 characters at most');
      return;
    }
    this.setState(prevState => ({
      templateData: {
        ...prevState.templateData,
        Sections: prevState.templateData.Sections.map((item: any) =>
          item.Order === SectionOrder
            ? {
                ...item,
                Name: text,
              }
            : item,
        ),
      },
    }));
  };

  // Section Tab 改变
  onTabChange = (SectionOrder: number) => {
    this.setState({
      currentSectionOrder: SectionOrder,
    });
  };

  // 添加 Field
  addNewField = (fieldData: FieldType, currentSectionOrder: number) => {
    if (!hasEdit) {
      hasEdit = true;
    }
    console.log('add new field ===', fieldData, currentSectionOrder);
    this.setState(prevState => ({
      templateData: {
        ...prevState.templateData,
        Sections: prevState.templateData.Sections.map((item: any) =>
          item.Order === currentSectionOrder
            ? {
                ...item,
                Fields: [
                  ...item.Fields,
                  {
                    ...fieldData,
                    Order: item.Fields.length
                      ? item.Fields[item.Fields.length - 1].Order + 1
                      : 1,
                  },
                ],
              }
            : item,
        ),
      },
    }));
  };

  // 修改 Field
  updateField = (fieldData: FieldType, currentSectionOrder: number) => {
    if (!hasEdit) {
      hasEdit = true;
    }
    this.setState(prevState => ({
      templateData: {
        ...prevState.templateData,
        Sections: prevState.templateData.Sections.map((item: any) =>
          item.Order === currentSectionOrder
            ? {
                ...item,
                Fields: item.Fields.map((fieldItem: any) =>
                  fieldItem.Order === fieldData.Order
                    ? {
                        ...fieldData,
                      }
                    : fieldItem,
                ),
              }
            : item,
        ),
      },
    }));
  };

  // 复制 Field 并在列表最后生成副本
  duplicateField = (FieldItem: any) => {
    Keyboard.dismiss();
    if (!hasEdit) {
      hasEdit = true;
    }
    Modal.alert(
      'Duplicate field ' + FieldItem.Name,
      'Copies are created at the end of the list.',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('cancel'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            const {currentSectionOrder} = this.state;
            this.setState(prevState => ({
              templateData: {
                ...prevState.templateData,
                Sections: prevState.templateData.Sections.map((item: any) => {
                  if (item.Order === currentSectionOrder) {
                    let Fields = [...item.Fields];
                    Fields.push({
                      ...FieldItem,
                      Name: '',
                      Order: Fields.length
                        ? Fields[Fields.length - 1].Order + 1
                        : 1,
                    });
                    return {
                      ...item,
                      Fields,
                    };
                  } else {
                    return item;
                  }
                }),
              },
            }));
          },
        },
      ],
    );
  };

  // 修改 Field Name
  changeFieldName = (text: string, FieldOrder: number) => {
    if (!hasEdit) {
      hasEdit = true;
    }
    this.setState(prevState => ({
      templateData: {
        ...prevState.templateData,
        Sections: prevState.templateData.Sections.map((item: any) =>
          item.Order === prevState.currentSectionOrder
            ? {
                ...item,
                Fields: item.Fields.map((fieldItem: any) =>
                  fieldItem.Order === FieldOrder
                    ? {
                        ...fieldItem,
                        Name: text,
                      }
                    : fieldItem,
                ),
              }
            : item,
        ),
      },
    }));
  };

  // 删除 Field
  deleteField = (FieldOrder: number, fieldName: string) => {
    Keyboard.dismiss();
    if (!hasEdit) {
      hasEdit = true;
    }
    Modal.alert('Delete Element ' + fieldName, '', [
      {
        text: 'Cancel',
        onPress: () => console.log('cancel'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          this.setState(prevState => ({
            templateData: {
              ...prevState.templateData,
              Sections: prevState.templateData.Sections.map((item: any) => {
                if (item.Order === prevState.currentSectionOrder) {
                  let Fields = [...item.Fields];
                  Fields.forEach((item, i) => {
                    if (item.Order === FieldOrder) {
                      Fields.splice(i, 1);
                    }
                  });
                  return {
                    ...item,
                    Fields,
                  };
                } else {
                  return item;
                }
              }),
            },
          }));
        },
      },
    ]);
  };

  // 打开操作弹窗
  openControllerModal = () => {
    Keyboard.dismiss();
    this.setState({
      templateControllerVisible: true,
    });
  };

  // 关闭操作弹窗
  closeControllerModal = () => {
    this.setState({
      templateControllerVisible: false,
    });
  };

  handleShowCodeTypeModal = (visible: boolean) => {
    this.setState({
      codeTypeModalVisible: visible,
    });
  };

  // 暂存修改
  saveEditingTemplate = () => {
    const {templateData} = this.state;
    this.props.dispatch(saveEditingTemplate(templateData));
  };

  // 提交前判断
  handleCreateConfirm = (confirmType: string, withoutConfirm?: boolean) => {
    Keyboard.dismiss();
    this.closeControllerModal();
    const {navigation} = this.props;
    const {templateData} = this.state;
    const {Sections} = templateData;
    if (templateData.Name === '') {
      this.showErrorMsg('Template name is required !');
      return;
    }
    if (templateData.Name.length > 50) {
      this.showErrorMsg('The Template Name length is 1-50 characters !');
      return;
    }

    let tempFieldCount = 0;
    Sections.forEach((section: SectionType | any) => {
      section.Fields.forEach((field: FieldType) => {
        if (field.Type !== fieldTypes.Table) {
          tempFieldCount += 1;
        } else {
          field.TableFieldList.forEach((item: TableFieldType) => {
            tempFieldCount += 1;
          });
        }
      });
    });
    if (tempFieldCount < 1) {
      Modal.alert(
        'Create template failed !',
        'Template must have at least 1 element but recommend to have 3 and above',
        [
          {
            text: 'OK',
            onPress: () => {},
          },
        ],
      );
      return;
    }

    let tableField = 0;
    if (
      Sections.some((section: SectionType | any) =>
        section.Fields.some((field: FieldType) =>
          field.Type !== fieldTypes.Table
            ? field.Name === ''
            : field.TableFieldList.some((item: TableFieldType) => {
                if (item.Name === '') {
                  tableField = 1;
                  return 1;
                }
              }),
        ),
      )
    ) {
      if (tableField) {
        this.showErrorMsg("Table's field name is required !");
        return;
      }
      this.showErrorMsg('Field name is required !');
      return;
    }
    // 验证完毕
    const modalTitle = confirmType + ' template ?';
    const onPressOK = () => {
      this.saveEditingTemplate();
      setTimeout(() => {
        if (confirmType === 'Save') {
          this.handleSave();
        } else if (confirmType === 'Submit') {
          this.handleSubmit();
        } else if (confirmType === 'Preview') {
          this.handlePreview();
        }
      }, 500);
    };
    if (withoutConfirm) {
      onPressOK();
    } else {
      Modal.alert(
        modalTitle,
        tempFieldCount < 3 ? 'Template might be incomplete' : '',
        [
          {
            text: 'Cancel',
            onPress: () => {
              console.log('cancel');
            },
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: onPressOK,
          },
        ],
      );
    }
  };

  // 预览
  handlePreview = () => {
    const {navigation} = this.props;
    const {templateData} = this.state;
    this.props.dispatch(previewTemplate({...templateData}));
    this.props.navigation.navigate('TemplatePreview');
  };

  // 保存
  handleSave = () => {
    const {navigation, userTemplateDraftsMap, currentUserInfo} = this.props;
    const {templateData} = this.state;
    let callback = () => {
      this.props.dispatch(clearEditingTemplate());
      navigation.navigate('Template', {tab: 0});
      Toast.success(toastTips.SuccessSave, 1);
    };
    if (userTemplateDraftsMap.includes(templateData.pKey)) {
      console.log('update');
      this.props.dispatch(
        updateUserTemplateDraft(currentUserInfo._id, {...templateData}),
      );
    } else {
      console.log('create');
      this.props.dispatch(
        createUserTemplateDraft(currentUserInfo._id, {...templateData}),
      );
    }
    callback();
  };

  // 提交
  handleSubmit = () => {
    const {navigation, authToken, templates} = this.props;
    const {templateData} = this.state;
    // 目前编辑公司Template入口只有Organization Collect Data页面中
    this.props.dispatch(
      uploadCompanyTemplate(
        authToken,
        templateData,
        templateData.UploadStatus ? false : true,
        () => {
          this.props.dispatch(clearEditingTemplate());
          navigation.navigate('Template', {tab: 0});
        },
      ),
    );
  };

  // 分享
  handleShare = () => {
    Keyboard.dismiss();
    this.closeControllerModal();
    const {navigation} = this.props;
    navigation.navigate('CreateGroup', {
      title: 'Share',
      type: 'shareTemplate',
    });
  };

  handleShareByLink = () => {
    this.closeControllerModal();
    const {authToken} = this.props;
    const {templateData} = this.state;
    const baseUrl = serverURL.replace('/api/', '');

    const handleSuccess = () => {
      Clipboard.setString(baseUrl + '/reportEdit/' + templateData.pKey);
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
        templateId: templateData.pKey,
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
  };

  handleShareByQRCode = () => {
    this.closeControllerModal();
    const {authToken} = this.props;
    const {templateData} = this.state;
    const baseUrl = serverURL.replace('/api/', '');

    const handleSuccess = () => {
      this.props.navigation.navigate('ShareTemplateByQRCode', {
        templateId: templateData.pKey,
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
        templateId: templateData.pKey,
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
  };

  // 删除
  handleDeleteTemplateConfirm = () => {
    Keyboard.dismiss();
    this.closeControllerModal();
    const {authToken, currentUserInfo, navigation} = this.props;
    const {templateData} = this.state;
    Modal.alert('Delete template ?', '', [
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
          setTimeout(() => {
            this.closeControllerModal();
            this.props.dispatch(
              deleteCompanyTemplate(authToken, templateData.pKey),
            );
            this.props.navigation.navigate('Template', {tab: 0});
          }, 500);
        },
      },
    ]);
  };

  // render Field Item
  _renderFieldItem = (listItem: any) => {
    const {navigation} = this.props;
    const {currentSectionOrder} = this.state;
    const {index, item} = listItem;
    let FieldOrder = item.Order;
    const pageType = this.props.navigation.getParam('type');
    let isFocus = item.isFocus;
    const normalField = (
      <TemplateField
        fieldType={item.Type}
        value={item.Name}
        isLinked={item.isLinked || false}
        autoFocus={isFocus && item.Name === '' ? true : false}
        placeholder="Fill in content title"
        handleDelete={() => this.deleteField(FieldOrder, item.Name)}
        handleChangeTitle={(text: string) => {
          this.changeFieldName(text, FieldOrder);
        }}
        handleEdit={() => {
          this.saveEditingTemplate();
          navigation.navigate('RegulationScreen', {
            templateAction: 'EditField',
            currentSectionOrder: currentSectionOrder,
            fieldData: item,
          });
        }}
      />
    );
    const selectionField = (
      <TemplateField
        fieldType={item.Type}
        value={item.Name}
        isLinked={item.isLinked || false}
        autoFocus={isFocus && item.Name === '' ? true : false}
        placeholder="Fill in content title"
        handleDelete={() => this.deleteField(FieldOrder, item.Name)}
        handleChangeTitle={(text: string) => {
          this.changeFieldName(text, FieldOrder);
        }}
        handleEdit={() => {
          this.saveEditingTemplate();
          navigation.navigate('RegulationScreen', {
            templateAction: 'EditField',
            currentSectionOrder: currentSectionOrder,
            fieldData: item,
          });
        }}
        handleDuplicate={() => this.duplicateField(item)}
      />
    );
    switch (item.Type) {
      case 'ADD_Field': {
        return (
          <TouchableOpacity
            style={styles.addFieldContainer}
            onPress={() => {
              this.saveEditingTemplate();
              navigation.navigate('RegulationScreen', {
                templateAction: 'AddNewField',
                currentSectionOrder: currentSectionOrder,
              });
            }}>
            <Image source={DIcon.addElement} />
            <Text style={styles.addElementText}>Add Element</Text>
          </TouchableOpacity>
        );
      }
      case 'Section_Title': {
        let SectionOrder = item.SectionOrder;
        return (
          <View style={styles.sectionTitleView}>
            <TextInput
              value={item.Name}
              placeholder="Please fill in section name"
              placeholderTextColor="#ccc"
              style={styles.fieldSectionTitleInput}
              onChangeText={text => {
                this.changeSectionName(text, SectionOrder);
              }}
            />
          </View>
        );
      }
      case fieldTypes.Text: {
        return normalField;
      }
      case fieldTypes.Number: {
        return normalField;
      }
      case fieldTypes.Money: {
        return normalField;
      }
      case fieldTypes.Email: {
        return normalField;
      }
      case fieldTypes.Radio: {
        return selectionField;
      }
      case fieldTypes.CheckBox: {
        return selectionField;
      }
      case fieldTypes.Datetime: {
        return normalField;
      }
      case fieldTypes.Date: {
        return normalField;
      }
      case fieldTypes.TimeStamp: {
        return normalField;
      }
      case fieldTypes.Picture: {
        return normalField;
      }
      case fieldTypes.Video: {
        return normalField;
      }
      case fieldTypes.Location: {
        return normalField;
      }
      case fieldTypes.Signature: {
        return normalField;
      }
      case fieldTypes.Table: {
        return normalField;
      }
      default:
        return item.Type ? normalField : null;
    }
  };

  showErrorMsg = (errorMsg: string) => {
    if (errorMsg) {
      this.setState({errorMsg});
      setTimeout(() => {
        this.hideErrorMsg();
      }, 15000);
    }
  };
  hideErrorMsg = () => {
    this.setState({errorMsg: ''});
  };

  render() {
    const {navigation, editingTemplate} = this.props;
    const {templateData, currentSectionOrder, errorMsg} = this.state;
    let {Sections} = templateData;
    const renderTemplateContent = () => {
      let FormList: Array<any> = [];
      const renderTabBar = Sections.map((item: any, index: number) => {
        if (item.Order === currentSectionOrder) {
          FormList = [
            ...item.Fields.map((field: any, index: number) => {
              if (index === item.Fields.length - 1) {
                return {
                  ...field,
                  isFocus: true,
                };
              } else {
                return {
                  ...field,
                  isFocus: false,
                };
              }
            }),
            {Type: 'ADD_Field', Order: -1},
          ];
          if (!editingTemplate.hiddenSection) {
            FormList.unshift({
              Type: 'Section_Title',
              Order: -2,
              index: index,
              SectionOrder: currentSectionOrder,
              Name: item.Name,
            });
          }
        }
        return (
          <TouchableOpacity
            key={index}
            onPress={() => {
              this.onTabChange(item.Order);
            }}>
            <View style={styles.tabBarItem}>
              <Text
                style={
                  item.Order === currentSectionOrder
                    ? {...styles.tabBarText, color: '#2E2E2E'}
                    : styles.tabBarText
                }
                numberOfLines={1}>
                {item.Name}
              </Text>
              <View
                style={
                  item.Order === currentSectionOrder
                    ? {
                        ...styles.activeTabLine,
                        backgroundColor: DColors.mainColor,
                      }
                    : styles.activeTabLine
                }
              />
            </View>
          </TouchableOpacity>
        );
      });
      return (
        <View style={styles.tabsContainer}>
          {!editingTemplate.hiddenSection ? (
            <View style={styles.tabBar}>
              <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                style={{borderRightWidth: 2, borderRightColor: '#C3CBCA'}}>
                {renderTabBar}
              </ScrollView>
              <TouchableOpacity
                onPress={this.deleteSection}
                style={styles.deleteSectionWrap}>
                <Image source={DIcon.deleteSection} />
              </TouchableOpacity>
            </View>
          ) : null}
          <FlatList
            data={FormList}
            removeClippedSubviews={false}
            renderItem={item => this._renderFieldItem(item)}
            keyExtractor={(item: any, index) => item.Order + '' + index}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      );
    };

    const renderPageFooter = (
      <TouchableOpacity
        style={styles.btnSubmit}
        onPress={() => {
          this.handleCreateConfirm('Submit');
        }}>
        <Text style={{fontSize: 16, color: '#fff'}}>Submit</Text>
      </TouchableOpacity>
    );

    const renderAddSectionBtn = (
      <View style={styles.createSectionContainer}>
        <TouchableOpacity onPress={this.addNewSection}>
          <Image source={DIcon.addSection} />
        </TouchableOpacity>
      </View>
    );

    // let sectionOrder = Sections.Order;
    const pageType = this.props.navigation.getParam('type');
    StatusBar.setBarStyle('light-content', true);

    return (
      <View style={styles.container}>
        <TitleBarNew
          title={navigation.getParam('type') + ' Template'}
          navigation={navigation}
          rightImage={DIcon.more}
          pressLeft={this.onBackButtonPressAndroid}
          pressRight={this.openControllerModal}
        />
        <View style={{flex: 1}}>
          {errorMsg ? (
            <View style={styles.noticeBarWrap}>
              <NoticeBar
                mode="closable"
                icon={<Icon name="exclamation-circle" color="#f5222d" />}
                onPress={this.hideErrorMsg}
                marqueeProps={{
                  loop: true,
                  leading: 2000,
                  trailing: 2000,
                  fps: 40,
                  style: {},
                }}>
                {errorMsg}
              </NoticeBar>
            </View>
          ) : null}
          <View style={styles.titleBar}>
            <TextInput
              // autoFocus={pageType === "Create" ? true : false}
              value={templateData.Name}
              placeholder="Template Name"
              placeholderTextColor="#757575"
              numberOfLines={1}
              style={styles.templateTitle}
              onChangeText={this.setEditTemplateName}
            />
          </View>
          <View style={{...styles.switchView, marginHorizontal: 17}}>
            <Text style={styles.switchText}>
              Sign
              {templateData.showCode && (
                <Text style={{fontSize: 14, color: DColors.mainColor}}>
                  {'   ' + templateData.codeType + ' No'}
                </Text>
              )}
            </Text>
            <Switch
              disabled={templateData.linkable}
              value={templateData.showCode}
              trackColor={{false: '#ccc', true: DColors.mainColor}}
              ios_backgroundColor="#ccc"
              thumbColor="#fff"
              onValueChange={this.handleSwitchChange}
            />
          </View>
          <View style={styles.content}>{renderTemplateContent()}</View>
          {!editingTemplate.hiddenSection ? renderAddSectionBtn : null}
          {renderPageFooter}
          {this.renderCodeTypeModal()}
          {this.renderControllerModal()}
        </View>
      </View>
    );
  }

  renderControllerModal = () => {
    const {navigation} = this.props;
    const {templateData} = this.state;
    const pageType = navigation.getParam('type');
    let controllers: any = [
      {
        text: 'Save Template',
        onPress: () => {
          this.handleCreateConfirm('Save', true);
        },
      },
      {
        text: 'Share Template',
        onPress: () => {
          this.handleShare();
        },
      },
      // {
      //   text: "Share template through link",
      //   onPress: () => {
      //     this.handleShareByLink();
      //   }
      // },
      // {
      //   text: "Share template through QR Code",
      //   onPress: () => {
      //     this.handleShareByQRCode();
      //   }
      // },
      {text: 'Delete Template', onPress: this.handleDeleteTemplateConfirm},
      {
        text: 'Preview Template',
        onPress: () => {
          this.handleCreateConfirm('Preview', true);
        },
      },
    ];
    const judge = {
      // 新的模板
      isNewTemplate: pageType === 'Create' || pageType === 'Copy',
      // 未提交的模板
      isUnSubmitTemplate: !templateData.UploadStatus,
      // 已提交的模板
      isSubmittedTemplate: templateData.UploadStatus,
      // 系统默认模板
      isMasterTemplate: templateData.isDefault,
    };
    // 新模板无删除按钮
    if (judge.isNewTemplate) {
      controllers.forEach((item: any, i: number) => {
        if (item.text === 'Delete Template') {
          controllers.splice(i, 1);
        }
      });
    }
    // 未提交或者编辑过还未提交修改的模板无分享按钮
    if (judge.isUnSubmitTemplate || hasEdit || judge.isMasterTemplate) {
      controllers.forEach((item: any, i: number) => {
        if (item.text === 'Share Template') {
          controllers.splice(i, 1);
        }
      });
    }
    // 已提交或者未编辑过的模板无保存本地按钮
    if (judge.isSubmittedTemplate || !hasEdit) {
      controllers.forEach((item: any, i: number) => {
        if (item.text === 'Save Template') {
          controllers.splice(i, 1);
        }
      });
    }
    return (
      <DActionSheet
        visible={this.state.templateControllerVisible}
        onClose={this.closeControllerModal}
        actions={controllers}
      />
    );
  };

  renderCodeTypeModal = () => {
    const {codeTypeModalVisible} = this.state;
    const codeTypeActions = codeTypeList.map((item: string) => ({
      text: item + ' No',
      onPress: () => {
        this.handleCodeTypeChange(item);
      },
    }));
    return (
      <DActionSheet
        title="Select type"
        visible={codeTypeModalVisible}
        onClose={() => {
          this.handleShowCodeTypeModal(false);
        }}
        actions={codeTypeActions}
      />
    );
  };
}

const mapStateToProps = (state: any) => {
  const userId = state.loginInfo.currentUserInfo._id;
  const userTemplateDraftsMap = getIn(
    state,
    ['draft', 'userIdIndexedDrafts', userId, 'userTemplateDraftsMap'],
    [],
  );
  return {
    userId,
    userTemplateDraftsMap,
    authToken: state.loginInfo.currentUserInfo.authToken,
    currentUserInfo: state.loginInfo.currentUserInfo,
    editingTemplate: state.template.editingTemplate,
    templates: state.template.templates,
  };
};

export default connect(mapStateToProps)(CreateTemplateScreen);
