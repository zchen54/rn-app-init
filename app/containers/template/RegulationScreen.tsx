import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import UUID from 'uuid/v1';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Image,
  Keyboard,
  Switch,
  StatusBar,
} from 'react-native';
import {Icon, Modal, Tabs, Portal, Toast} from '@ant-design/react-native';
import {TitleBarNew} from '../../common/components';
import {
  fieldTypes,
  tableFieldTypes,
  fieldProperty,
  customFormat,
} from '../../common/constants';
import {DColors, DFontSize, FONT_FAMILY} from '../../common/styles';
import {saveEditingField, clearEditingField} from '../../store/actions';
import {getIn} from '../../common/utils';
import {FieldType, TableFieldType} from '../../common/constants/ModeTypes';
import {styles} from './style';
import {isStaffInCompany} from './judgement';
import {
  FieldPropsSwitch,
  FieldPropsInput,
  FieldPropsSelect,
  CurrencyUnitPicker,
} from './components';
import {formatTableElementTitle} from './TableRegulationScreen';
import {currencyUnit} from './components/currencyUnit';

const newField: FieldType = {
  _id: '',
  Name: '',
  Type: '',
  Order: 1,
  Remark: '',
  TableFieldList: [],
  property: {
    required: false,
    privacy: false,
    options: [],
    defaultValue: '',
    maximum: 0,
    minimum: 0,
    maxLength: 0,
    minLength: 0,
    placeHolder: '',
    autoCompleteFromStaffName: false,
    autoCompleteFromStaffId: false,
    autoCompleteCreationTime: false,
    customOption: false,
    decimalPlaces: 0,
    internalData: false,
    pictureNumber: 1,
    videoNumber: 1,
    currencyUnit: '',
  },
};

const DIcon = {
  addElement: require('../images/template/Add.png'),
  removeElement: require('../images/template/Reduce.png'),
  EnterIcon: require('../images/Me/enterwhite.png'),
  selectType: require('../images/template/Right.png'),
};

const fieldPropsMap = {
  Text: {hasMandatory: true, hasDesc: true, hasMaxLen: true, hasPrivacy: true},
  Number: {
    hasMandatory: true,
    hasDesc: true,
    hasMaxLen: true,
    hasDecimal: true,
    hasPrivacy: true,
  },
  Money: {
    hasMandatory: true,
    hasDesc: true,
    hasMaxLen: true,
    hasDecimal: true,
    hasUnitSelect: true,
    hasPrivacy: true,
  },
  TextArea: {hasMandatory: true, hasDesc: true, hasPrivacy: true},
  Email: {hasMandatory: true, hasDesc: true, hasSendEmail: true},
  Radio: {hasMandatory: true, hasDesc: true, hasAddOptions: true},
  RadioButton: {hasMandatory: true, hasDesc: true, hasAddOptions: true},
  ScanBarCode: {hasMandatory: true, hasDesc: true},
  ScanQRCode: {hasMandatory: true, hasDesc: true},
  CheckBox: {hasMandatory: true, hasDesc: true},
  Datetime: {hasMandatory: true, hasDesc: true, hasAutoComplete: true},
  TimeStamp: {hasMandatory: true, hasDesc: true, hasAutoComplete: true},
  Date: {hasMandatory: true, hasDesc: true, hasAutoComplete: true},
  Picture: {hasMandatory: true, hasNumberSetting: true},
  Video: {hasMandatory: true, hasNumberSetting: true},
  Location: {hasMandatory: true},
  Table: {hasMandatory: true},
  Signature: {hasMandatory: true},
  Name: {hasMandatory: true},
  Staff: {hasMandatory: true},
  Department: {hasMandatory: true},
};

export const formatElementTitle = (type: string) => {
  let titleText = '';
  typeSelectList.some((item: any) => {
    if (item.type === type) {
      titleText = item.title;
      return true;
    }
  });
  return titleText;
};

export const typeSelectList = [
  {
    type: 'Text',
    title: 'Single Line',
    tips: ['', 'Auto get the ID', 'User input'],
    // tips: ['Auto get the name', 'Auto get the ID', 'User input'],
  },
  {type: 'TextArea', title: 'Multi Line', tips: []},
  {type: 'Number', title: 'Number', tips: []},
  {type: 'Money', title: 'Money', tips: []},
  {type: 'Email', title: 'Email', tips: []},
  {type: 'Radio', title: 'Dropdown', tips: []},
  {type: 'RadioButton', title: 'Radio', tips: []},
  {type: 'CheckBox', title: 'CheckBox', tips: []},
  {type: 'ScanBarCode', title: 'Bar Code', tips: []},
  {type: 'ScanQRCode', title: 'Qr Code', tips: []},
  {
    type: 'TimeStamp',
    title: 'TimeStamp',
    tips: [customFormat.TIME, 'MM DD , YYYY', 'MM DD , YYYY  HH:mm:ss'],
  },
  {type: 'Picture', title: 'Picture', tips: []},
  {
    type: 'Video',
    title: 'Video',
    tips: ['Duration limit 15s', 'Duration limit 30s', 'Duration limit 60s'],
    values: [15, 30, 60],
  },
  {type: 'Signature', title: 'Signature', tips: []},
  {type: 'Location', title: 'Location', tips: []},
  {type: 'Table', title: 'Table', tips: []},
  {type: 'Name', title: 'Name', tips: []},
  {type: 'Staff', title: 'Employee', tips: []},
  {type: 'Department', title: 'Department', tips: []},
];

interface State {
  fieldData: FieldType;
  textOptionOpen: boolean;
  timeOptionOpen: boolean;
  videoOptionOpen: boolean;
  currencySelectVisible: boolean;
}
interface Props {
  currentUserInfo: any;
  navigation: any;
  editingField: FieldType;
  saveEditingField: (FieldData: FieldType) => void;
  clearEditingField: () => void;
}

export class RegulationScreen extends Component<Props, State> {
  viewDidAppear: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      fieldData: {
        ...newField,
      },
      textOptionOpen: false,
      timeOptionOpen: false,
      videoOptionOpen: false,
      currencySelectVisible: false,
    };
  }

  componentDidMount() {
    this.viewDidAppear = this.props.navigation.addListener(
      'willFocus',
      (navigationProps: any) => {
        // console.log("页面将要显示", navigationProps);

        // 来自Template编辑页的action
        const templateAction = getIn(navigationProps, [
          'action',
          'params',
          'templateAction',
        ]);
        // 来自field编辑页的action
        const fieldAction = getIn(navigationProps, [
          'action',
          'params',
          'fieldAction',
        ]);
        const fieldData = getIn(navigationProps, [
          'action',
          'params',
          'fieldData',
        ]);
        const tableFieldData = getIn(navigationProps, [
          'action',
          'params',
          'tableFieldData',
        ]);
        console.log(templateAction, fieldAction, fieldData, tableFieldData);

        if (templateAction === 'AddNewField' && fieldData) {
          this.setState({
            fieldData: {
              ...newField,
            },
          });
        }
        if (templateAction === 'EditField' && fieldData) {
          this.setState({fieldData});
        }
        if (fieldAction === 'AddNewTableField' && tableFieldData) {
          this.addNewTableField(tableFieldData);
        } else if (fieldAction === 'EditTableField' && tableFieldData) {
          this.updateTableField(tableFieldData);
        }
      },
    );
  }

  componentWillUnmount() {
    this.viewDidAppear.remove();
  }

  componentWillMount() {
    this.props.clearEditingField();
    this.handleInitialState(this.props);
  }

  componentWillReceiveProps(nextProps: any) {
    this.handleInitialState(nextProps);
  }

  // 初始化 State
  handleInitialState = (props: any) => {
    const {navigation, editingField} = props;
    if (editingField && Array.isArray(editingField.TableFieldList)) {
      this.setState({
        fieldData: {
          ...editingField,
          TableFieldList: [...editingField.TableFieldList],
        },
      });
    }
  };

  // 是否必填
  handleSwitchMandatoryChange = (value: boolean) => {
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          required: value,
        },
      },
    }));
  };

  // privacy
  handleSwitchPrivacyChange = (value: boolean) => {
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          privacy: value,
        },
      },
    }));
  };

  // internalData
  handleSwitchEncryptChange = (value: boolean) => {
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          internalData: value,
        },
      },
    }));
  };

  // 是否自动填充时间
  handleSwitchAutoCompleteCreationTimeChange = (value: boolean) => {
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          autoCompleteCreationTime: value,
        },
      },
    }));
  };

  // 是否自动发送邮件
  handleSwitchAutoSendEmailChange = (value: boolean) => {
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          sendEmail: value,
        },
      },
    }));
  };

  // 货币单位选择
  handleSelectUnitChange = (value: string) => {
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          currencyUnit: value,
        },
      },
    }));
  };

  handleRemarkChange = (value: string) => {
    // let newValue = '';
    //     newValue = value.replace(' ','\u{00a0}')
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        Remark: value,
      },
    }));
  };

  handleMaxLengthChange = (value: string) => {
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          maxLength: value ? parseInt(value) : 0,
        },
      },
    }));
  };

  handleDecimalChange = (value: string) => {
    let decimalPlaces = parseInt(value) || 0;
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          decimalPlaces,
        },
      },
    }));
  };

  handlePictureNumberChange = (value: string) => {
    let pictureNumber = parseInt(value) || 0;
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          pictureNumber,
        },
      },
    }));
  };

  handleVideoNumberChange = (value: string) => {
    let videoNumber = parseInt(value) || 0;
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          videoNumber,
        },
      },
    }));
  };

  handleSwitchAutoCompleteFromStaffNameChange = () => {
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          autoCompleteFromStaffName: !prevState.fieldData.property
            .autoCompleteFromStaffName,
          autoCompleteFromStaffId: false,
          autoCompleteCreationTime: false,
        },
      },
    }));
  };

  handleSwitchAutoCompleteFromStaffIdChange = () => {
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          autoCompleteFromStaffName: false,
          autoCompleteCreationTime: false,
          autoCompleteFromStaffId: !prevState.fieldData.property
            .autoCompleteFromStaffId,
        },
      },
    }));
  };

  handleSwitchAutoCompleteFromSelf = () => {
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          autoCompleteFromStaffName: false,
          autoCompleteFromStaffId: false,
          autoCompleteCreationTime: false,
        },
      },
    }));
  };

  handleSwitchCustomOptionChange = (value: boolean) => {
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          customOption: value,
        },
      },
    }));
  };

  handleSwitchDurationLimitChange = (duration: number) => {
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          videoTime: duration,
        },
      },
    }));
  };

  // 选择 Field Type
  selectFieldType = (fieldType: string) => {
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        Type: fieldType,
        property: {
          ...prevState.fieldData.property,
          options:
            fieldType === fieldTypes.Radio ||
            fieldType === fieldTypes.RadioButton ||
            fieldType === fieldTypes.CheckBox
              ? ['']
              : [],
          autoCompleteFromStaffName: false,
          autoCompleteFromStaffId: false,
          autoCompleteCreationTime: false,
          customOption: false,
          videoTime: 0,
          maxLength:
            fieldType === fieldTypes.Money
              ? 8
              : fieldType === fieldTypes.Number || fieldType === fieldTypes.Text
              ? 20
              : 0,
          decimalPlaces: fieldType === fieldTypes.Money ? 2 : 0,
        },
      },
      Remark: '',
      textOptionOpen: false,
      timeOptionOpen: false,
      videoOptionOpen: false,
    }));

    if (fieldType === fieldTypes.Money) {
      const unitObj = currencyUnit[0];
      const unitValue = `${unitObj.symbol},${unitObj.code},${unitObj.name}`;
      this.handleSelectUnitChange(unitValue);
    }
  };

  clearFieldType = (fromType: string) => {
    const currentType: any = this.state.fieldData.Type;
    let Type = '';
    if (fromType === fieldTypes.Text && currentType === fieldTypes.Text) {
      Type = currentType;
    } else if (
      fromType === fieldTypes.TimeStamp &&
      [fieldTypes.TimeStamp, fieldTypes.Date, fieldTypes.Datetime].indexOf(
        currentType,
      ) !== -1
    ) {
      Type = currentType;
    } else if (
      fromType === fieldTypes.Video &&
      currentType === fieldTypes.Video
    ) {
      Type = currentType;
    }
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        Type,
      },
    }));
  };

  // 添加 Select Option
  onAddSelectOption = () => {
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          options: [...prevState.fieldData.property.options, ''],
        },
      },
    }));
  };

  // 删除 Select Option
  onRemoveSelectOption = (optIndex: number) => {
    let options = [...this.state.fieldData.property.options];
    if (options.length > 1) {
      options.splice(optIndex, 1);
      this.setState(prevState => ({
        ...prevState,
        fieldData: {
          ...prevState.fieldData,
          property: {
            ...prevState.fieldData.property,
            options,
          },
        },
      }));
    }
  };

  // 修改 Select Option
  onChangeSelectOptionVal = (value: string, optIndex: number) => {
    this.setState(prevState => ({
      ...prevState,
      fieldData: {
        ...prevState.fieldData,
        property: {
          ...prevState.fieldData.property,
          options: prevState.fieldData.property.options.map(
            (optItem: string, optInd: number) =>
              optInd === optIndex ? value : optItem,
          ),
        },
      },
    }));
  };

  // 为 table 添加 Field
  addNewTableField = (tableFieldData: TableFieldType) => {
    const TableFieldList = [...this.state.fieldData.TableFieldList];
    this.setState(prevState => ({
      fieldData: {
        ...prevState.fieldData,
        TableFieldList: [
          ...TableFieldList,
          {
            ...tableFieldData,
            Order: TableFieldList.length
              ? TableFieldList[TableFieldList.length - 1].Order + 1
              : 1,
          },
        ],
      },
    }));
  };

  // 为 table 修改 Field
  updateTableField = (tableFieldData: TableFieldType) => {
    const TableFieldList = [...this.state.fieldData.TableFieldList];
    this.setState(prevState => ({
      fieldData: {
        ...prevState.fieldData,
        TableFieldList: TableFieldList.map((tbFItem: any) =>
          tbFItem.Order === tableFieldData.Order
            ? {
                ...tableFieldData,
              }
            : tbFItem,
        ),
      },
    }));
  };

  // 复制 Table Field 并在 Table 列表最后生成副本
  duplicateTableField = (TableFieldItem: TableFieldType) => {
    let TableFieldList = [...this.state.fieldData.TableFieldList];
    TableFieldList.push({
      ...TableFieldItem,
      Name: '',
      Order: TableFieldList.length
        ? TableFieldList[TableFieldList.length - 1].Order + 1
        : 1,
    });
    Modal.alert(
      'Duplicate field ' + TableFieldItem.Name,
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
            this.setState(prevState => ({
              fieldData: {
                ...prevState.fieldData,
                TableFieldList,
              },
            }));
          },
        },
      ],
    );
  };

  // 为 table 修改 Field Name
  changeTableFieldName = (text: string, tableFieldOrder: number) => {
    const TableFieldList = [...this.state.fieldData.TableFieldList];
    this.setState(prevState => ({
      fieldData: {
        ...prevState.fieldData,
        TableFieldList: TableFieldList.map((tbFItem: any) =>
          tbFItem.Order === tableFieldOrder
            ? {...tbFItem, Name: text}
            : tbFItem,
        ),
      },
    }));
  };

  // 为 table 删除 Field
  deleteTableField = (tableFieldOrder: number, tableFieldName: string) => {
    let TableFieldList = [...this.state.fieldData.TableFieldList];
    TableFieldList.forEach((tbFItem, i) => {
      if (tbFItem.Order === tableFieldOrder) {
        TableFieldList.splice(i, 1);
      }
    });
    Modal.alert('Delete Element ' + tableFieldName, '', [
      {
        text: 'Cancel',
        onPress: () => console.log('cancel'),
        style: 'cancel',
      },
      {
        text: 'OK',
        onPress: () => {
          this.setState(prevState => ({
            fieldData: {
              ...prevState.fieldData,
              TableFieldList,
            },
          }));
        },
      },
    ]);
  };

  // 暂存修改
  saveEditingField = () => {
    const {fieldData} = this.state;
    this.props.saveEditingField(fieldData);
  };

  handleConfirm = () => {
    const {navigation} = this.props;
    const {fieldData} = this.state;
    const currentType: any = fieldData.Type;
    if (currentType === '') {
      Toast.fail('Please select a type of field !', 1, undefined, false);
      return;
    }
    if (
      currentType === fieldTypes.Table &&
      fieldData.TableFieldList.length === 0
    ) {
      Toast.fail('Please add a Element !', 1, undefined, false);
      return;
    }
    if (
      currentType === fieldTypes.Table &&
      fieldData.TableFieldList.some(field => field.Name === '')
    ) {
      Toast.fail(' Field name is required !', 1, undefined, false);
      return;
    }
    if (
      [fieldTypes.Radio, fieldTypes.RadioButton, fieldTypes.CheckBox].indexOf(
        currentType,
      ) !== -1 &&
      fieldData.property.options.indexOf('') !== -1
    ) {
      Toast.fail('Options is required !', 1, undefined, false);
      return;
    }
    this.props.clearEditingField();
    navigation.navigate('CreateTemplate', {
      templateAction: navigation.getParam('templateAction'),
      currentSectionOrder: navigation.getParam('currentSectionOrder'),
      fieldData: fieldData,
    });
  };

  onOpenCurrencySelect = () => {
    this.setState({currencySelectVisible: true});
  };
  onCloseCurrencySelect = () => {
    this.setState({currencySelectVisible: false});
  };

  render() {
    const {navigation, currentUserInfo} = this.props;
    const {fieldData, currencySelectVisible} = this.state;
    const currentType: any = fieldData.Type;

    const _renderTypeOptionItem = (optionItem: any) => {
      const {index, item} = optionItem;
      let typeItemDom: any = <View />;
      if (
        [
          fieldTypes.Number,
          fieldTypes.Money,
          fieldTypes.Email,
          fieldTypes.TextArea,
          fieldTypes.Name,
          fieldTypes.Staff,
          fieldTypes.Department,
          fieldTypes.ScanBarCode,
          fieldTypes.ScanQRCode,
          fieldTypes.Picture,
          fieldTypes.Location,
          fieldTypes.Signature,
        ].indexOf(item.type) !== -1 ||
        (item.type === fieldTypes.Text && !isStaffInCompany(currentUserInfo))
      ) {
        typeItemDom = (
          <TouchableOpacity
            style={styles.normalTypeItem}
            onPress={() => {
              this.selectFieldType(item.type);
            }}>
            <View style={styles.typeCheckbox}>
              {currentType === item.type && <Image source={DIcon.selectType} />}
            </View>
            <View style={styles.typeTextView}>
              <Text style={styles.typeText}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        );
      } else if (
        [fieldTypes.Radio, fieldTypes.RadioButton, fieldTypes.CheckBox].indexOf(
          item.type,
        ) !== -1
      ) {
        let optionsDom: any = <View />;
        optionsDom = fieldData.property.options.map(
          (optItem: string, optIndex: number) => (
            <View key={optIndex + ''} style={styles.checkboxOption}>
              <TouchableOpacity
                style={styles.removeOptionBtn}
                onPress={() => {
                  this.onRemoveSelectOption(optIndex);
                }}>
                <Image source={DIcon.removeElement} />
              </TouchableOpacity>
              <TextInput
                value={optItem}
                autoFocus={optItem === '' ? true : false}
                placeholder="Please fill in the option title"
                placeholderTextColor="#ccc"
                style={styles.checkboxOptionInput}
                onChangeText={text => {
                  this.onChangeSelectOptionVal(text, optIndex);
                }}
              />
            </View>
          ),
        );
        optionsDom.push(
          <TouchableOpacity
            key={'addOption'}
            style={styles.addOptionBtn}
            onPress={this.onAddSelectOption}>
            <Image source={DIcon.addElement} />
            <Text style={styles.addOptionText}>Add option</Text>
          </TouchableOpacity>,
        );

        typeItemDom = (
          <View style={styles.checkboxTypeItem}>
            <TouchableOpacity
              style={styles.normalTypeItem}
              onPress={() => {
                this.selectFieldType(item.type);
              }}>
              <View style={styles.typeCheckbox}>
                {currentType === item.type && (
                  <Image source={DIcon.selectType} />
                )}
              </View>
              <View style={styles.typeTextView}>
                <Text style={styles.typeText}>{item.title}</Text>
              </View>
            </TouchableOpacity>
            {currentType === item.type && (
              <View style={styles.checkboxList}>{optionsDom}</View>
            )}
          </View>
        );
      } else if (item.type === fieldTypes.Table) {
        let optionsDom: any = <View />;
        optionsDom = fieldData.TableFieldList.map(
          (tbFItem: TableFieldType, tbFIndex: number) => {
            return (
              <View key={tbFIndex + ''} style={styles.tableField}>
                <View style={styles.tableFieldLeft}>
                  <TouchableOpacity
                    style={styles.removeOptionBtn}
                    onPress={() => {
                      this.deleteTableField(tbFItem.Order, tbFItem.Name);
                    }}>
                    <Image source={DIcon.removeElement} />
                  </TouchableOpacity>
                  <TextInput
                    value={tbFItem.Name}
                    autoFocus={tbFItem.Name === '' ? true : false}
                    placeholder="Content title"
                    placeholderTextColor="#ccc"
                    style={styles.tableFieldNameInput}
                    onChangeText={text => {
                      this.changeTableFieldName(text, tbFItem.Order);
                    }}
                  />
                </View>
                <TouchableOpacity
                  onPress={() => {
                    this.saveEditingField();
                    navigation.navigate('TableRegulationScreen', {
                      fieldAction: 'EditTableField',
                      currentSectionOrder: navigation.getParam(
                        'currentSectionOrder',
                      ),
                      tableFieldData: tbFItem,
                    });
                  }}
                  style={styles.tableFieldRight}>
                  <Text style={styles.fieldTypeText}>
                    {formatTableElementTitle(tbFItem.Type) || tbFItem.Type}
                  </Text>
                  <Image style={styles.enterStyle} source={DIcon.EnterIcon} />
                </TouchableOpacity>
              </View>
            );
          },
        );
        optionsDom.push(
          <TouchableOpacity
            key={'addOption'}
            style={styles.addOptionBtn}
            onPress={() => {
              this.saveEditingField();
              navigation.navigate('TableRegulationScreen', {
                fieldAction: 'AddNewTableField',
                currentSectionOrder: navigation.getParam('currentSectionOrder'),
              });
            }}>
            <Image source={DIcon.addElement} />
            <Text style={styles.addOptionText}>Add Element</Text>
          </TouchableOpacity>,
        );

        typeItemDom = (
          <View style={styles.checkboxTypeItem}>
            <TouchableOpacity
              style={styles.normalTypeItem}
              onPress={() => {
                this.selectFieldType(item.type);
              }}>
              <View style={styles.typeCheckbox}>
                {currentType === item.type && (
                  <Image source={DIcon.selectType} />
                )}
              </View>
              <View style={styles.typeTextView}>
                <Text style={styles.typeText}>{item.title}</Text>
              </View>
            </TouchableOpacity>
            {currentType === item.type && (
              <View style={styles.checkboxList}>{optionsDom}</View>
            )}
          </View>
        );
      } else if (
        item.type === fieldTypes.Text &&
        isStaffInCompany(currentUserInfo)
      ) {
        let optionsDom: any = <View />;
        optionsDom = item.tips.map((optItem: string, optIndex: number) =>
          optItem ? (
            <TouchableOpacity
              onPress={() => {
                this.selectFieldType(item.type);
                if (optIndex === 0) {
                  this.handleSwitchAutoCompleteFromStaffNameChange();
                } else if (optIndex === 1) {
                  this.handleSwitchAutoCompleteFromStaffIdChange();
                } else {
                  this.handleSwitchAutoCompleteFromSelf();
                }
              }}
              key={optIndex + ''}
              style={{...styles.checkboxOption, alignItems: 'center'}}>
              {currentType === item.type ? (
                optIndex === 0 &&
                fieldData.property.autoCompleteFromStaffName ? (
                  <View style={{...styles.unSelect, borderColor: '#1E9DFC'}}>
                    <View style={styles.selected} />
                  </View>
                ) : optIndex === 1 &&
                  fieldData.property.autoCompleteFromStaffId ? (
                  <View style={{...styles.unSelect, borderColor: '#1E9DFC'}}>
                    <View style={styles.selected} />
                  </View>
                ) : optIndex === 2 &&
                  !fieldData.property.autoCompleteFromStaffName &&
                  !fieldData.property.autoCompleteFromStaffId ? (
                  <View style={{...styles.unSelect, borderColor: '#1E9DFC'}}>
                    <View style={styles.selected} />
                  </View>
                ) : (
                  <View style={styles.unSelect} />
                )
              ) : (
                <View style={styles.unSelect} />
              )}
              <Text style={{fontSize: 16, color: '#757575'}}>{optItem}</Text>
            </TouchableOpacity>
          ) : null,
        );

        typeItemDom = (
          <View style={styles.checkboxTypeItem}>
            <TouchableOpacity
              style={styles.normalTypeItem}
              onPress={() => {
                this.setState({
                  timeOptionOpen: false,
                  textOptionOpen: true,
                  videoOptionOpen: false,
                });
                this.clearFieldType(item.type);
              }}>
              <View style={styles.typeCheckbox}>
                {currentType === item.type && (
                  <Image source={DIcon.selectType} />
                )}
              </View>
              <View
                style={{
                  ...styles.typeTextView,
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.typeText}>{item.title}</Text>
                {currentType === item.type && (
                  <Text
                    style={{
                      ...styles.typeText,
                      color: DColors.mainColor,
                      marginRight: 17,
                    }}>
                    {fieldData.property.autoCompleteFromStaffName
                      ? 'Name'
                      : fieldData.property.autoCompleteFromStaffId
                      ? 'ID'
                      : 'User input'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            {this.state.textOptionOpen ? (
              <View style={styles.checkboxList}>{optionsDom}</View>
            ) : null}
          </View>
        );
      } else if (item.type === fieldTypes.TimeStamp) {
        let optionsDom: any = <View />;
        optionsDom = item.tips.map((optItem: string, optIndex: number) => (
          <TouchableOpacity
            onPress={() => {
              if (optIndex === 0) {
                this.selectFieldType(fieldTypes.TimeStamp);
              } else if (optIndex === 1) {
                this.selectFieldType(fieldTypes.Date);
              } else {
                this.selectFieldType(fieldTypes.Datetime);
              }
            }}
            key={optIndex + ''}
            style={{...styles.checkboxOption, alignItems: 'center'}}>
            {optIndex ===
            [
              fieldTypes.TimeStamp,
              fieldTypes.Date,
              fieldTypes.Datetime,
            ].indexOf(currentType) ? (
              <View style={{...styles.unSelect, borderColor: '#1E9DFC'}}>
                <View style={styles.selected} />
              </View>
            ) : (
              <View style={styles.unSelect} />
            )}
            <Text style={{fontSize: 16, color: '#757575'}}>{optItem}</Text>
          </TouchableOpacity>
        ));

        typeItemDom = (
          <View style={styles.checkboxTypeItem}>
            <TouchableOpacity
              style={styles.normalTypeItem}
              onPress={() => {
                this.setState({
                  textOptionOpen: false,
                  timeOptionOpen: true,
                  videoOptionOpen: false,
                });
                this.clearFieldType(item.type);
              }}>
              <View style={styles.typeCheckbox}>
                {[
                  fieldTypes.Datetime,
                  fieldTypes.TimeStamp,
                  fieldTypes.Date,
                ].indexOf(currentType) !== -1 && (
                  <Image source={DIcon.selectType} />
                )}
              </View>
              <View
                style={{
                  ...styles.typeTextView,
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.typeText}>{item.title}</Text>
                {[
                  fieldTypes.Datetime,
                  fieldTypes.TimeStamp,
                  fieldTypes.Date,
                ].indexOf(currentType) !== -1 && (
                  <Text
                    style={{
                      ...styles.typeText,
                      color: DColors.mainColor,
                      marginRight: 17,
                    }}>
                    {currentType === fieldTypes.Datetime
                      ? 'Date&Time'
                      : currentType === fieldTypes.TimeStamp
                      ? 'Time'
                      : 'Date'}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            {this.state.timeOptionOpen ? (
              <View style={styles.checkboxList}>{optionsDom}</View>
            ) : null}
          </View>
        );
      } else if (item.type === fieldTypes.Video) {
        let optionsDom: any = <View />;
        optionsDom = item.tips.map((optItem: string, optIndex: number) => (
          <TouchableOpacity
            onPress={() => {
              this.selectFieldType(item.type);
              this.handleSwitchDurationLimitChange(item.values[optIndex]);
            }}
            key={optIndex + ''}
            style={{...styles.checkboxOption, alignItems: 'center'}}>
            {fieldData.property.videoTime === item.values[optIndex] ? (
              <View style={{...styles.unSelect, borderColor: '#1E9DFC'}}>
                <View style={styles.selected} />
              </View>
            ) : (
              <View style={styles.unSelect} />
            )}
            <Text style={{fontSize: 16, color: '#757575'}}>{optItem}</Text>
          </TouchableOpacity>
        ));

        typeItemDom = (
          <View style={styles.checkboxTypeItem}>
            <TouchableOpacity
              style={styles.normalTypeItem}
              onPress={() => {
                this.setState({
                  textOptionOpen: false,
                  timeOptionOpen: false,
                  videoOptionOpen: true,
                });
                this.clearFieldType(item.type);
              }}>
              <View style={styles.typeCheckbox}>
                {currentType === item.type && (
                  <Image source={DIcon.selectType} />
                )}
              </View>
              <View
                style={{
                  ...styles.typeTextView,
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.typeText}>{item.title}</Text>
                {currentType === item.type && (
                  <Text
                    style={{
                      ...styles.typeText,
                      color: DColors.mainColor,
                      marginRight: 17,
                    }}>
                    {fieldData.property.videoTime
                      ? fieldData.property.videoTime + 's'
                      : ''}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
            {this.state.videoOptionOpen ? (
              <View style={styles.checkboxList}>{optionsDom}</View>
            ) : null}
          </View>
        );
      }

      return typeItemDom;
    };

    StatusBar.setBarStyle('light-content', true);

    const _renderSwitchList = () => {
      let FieldPropsListDom: Array<any> = [];

      if (getIn(fieldPropsMap, [fieldData.Type, 'hasMandatory'], null)) {
        FieldPropsListDom.push(
          <FieldPropsSwitch
            label="Mandatory"
            value={fieldData.property.required || false}
            onChange={this.handleSwitchMandatoryChange}
          />,
        );
      }
      if (getIn(fieldPropsMap, [fieldData.Type, 'hasAddOptions'], null)) {
        FieldPropsListDom.push(
          <FieldPropsSwitch
            label="Allow user to add option"
            value={fieldData.property.customOption || false}
            onChange={this.handleSwitchCustomOptionChange}
          />,
        );
      }
      if (getIn(fieldPropsMap, [fieldData.Type, 'hasAutoComplete'], null)) {
        FieldPropsListDom.push(
          <FieldPropsSwitch
            label="Autocomplete creation time"
            value={fieldData.property.autoCompleteCreationTime || false}
            onChange={this.handleSwitchAutoCompleteCreationTimeChange}
          />,
        );
      }

      if (getIn(fieldPropsMap, [fieldData.Type, 'hasSendEmail'], null)) {
        FieldPropsListDom.push(
          <FieldPropsSwitch
            label="Activate Email"
            value={fieldData.property.sendEmail || false}
            onChange={this.handleSwitchAutoSendEmailChange}
          />,
        );
      }
      if (getIn(fieldPropsMap, [fieldData.Type, 'hasUnitSelect'], null)) {
        FieldPropsListDom.push(
          <FieldPropsSelect
            label="Unit"
            value={fieldData.property.currencyUnit || ''}
            onPress={this.onOpenCurrencySelect}
          />,
        );
      }
      if (getIn(fieldPropsMap, [fieldData.Type, 'hasDesc'], null)) {
        FieldPropsListDom.push(
          <FieldPropsInput
            label="Instructions"
            value={fieldData.Remark}
            onChange={this.handleRemarkChange}
          />,
        );
      }
      if (getIn(fieldPropsMap, [fieldData.Type, 'hasMaxLen'], null)) {
        FieldPropsListDom.push(
          <FieldPropsInput
            keyboardType="number-pad"
            label="Max length"
            value={fieldData.property.maxLength.toString()}
            onChange={this.handleMaxLengthChange}
            onBlur={() => {
              if (
                fieldData.Type === fieldTypes.Number ||
                fieldData.Type === fieldTypes.Money
              ) {
                let maxLength = fieldData.property.maxLength || 0;
                const decimalLength = fieldData.property.decimalPlaces || 0;
                if (decimalLength && maxLength && maxLength <= decimalLength) {
                  maxLength = decimalLength + 1;
                  Modal.alert(
                    'Invalid value of Max length',
                    'The max length must be greater than the decimal.',
                    [
                      {
                        text: 'OK',
                        onPress: () => {},
                      },
                    ],
                  );
                }
                this.handleMaxLengthChange(maxLength.toString());
              }
            }}
          />,
        );
      }
      if (getIn(fieldPropsMap, [fieldData.Type, 'hasDecimal'], null)) {
        FieldPropsListDom.push(
          <FieldPropsInput
            keyboardType="number-pad"
            label="Decimal"
            value={
              fieldData.property.decimalPlaces
                ? fieldData.property.decimalPlaces.toString()
                : '0'
            }
            onChange={this.handleDecimalChange}
            onBlur={() => {
              if (
                fieldData.Type === fieldTypes.Number ||
                fieldData.Type === fieldTypes.Money
              ) {
                const maxLength = fieldData.property.maxLength || 0;
                let decimalLength = fieldData.property.decimalPlaces || 0;
                let errorMsg = '';
                if (maxLength && decimalLength > maxLength - 1) {
                  decimalLength = maxLength - 1;
                  errorMsg = 'The decimal must be less than the max length ! ';
                }
                // if (fieldData.Type === fieldTypes.Money && decimalLength > 2) {
                //   decimalLength = 2
                //   errorMsg += "The decimal of money must not be greater than 2 !"
                // }
                if (errorMsg) {
                  Modal.alert('Invalid value of Decimal', errorMsg, [
                    {
                      text: 'OK',
                      onPress: () => {},
                    },
                  ]);
                }
                this.handleDecimalChange(decimalLength.toString());
              }
            }}
          />,
        );
      }

      if (getIn(fieldPropsMap, [fieldData.Type, 'hasNumberSetting'], null)) {
        let mediaNumber = '0';
        if (
          fieldData.Type === fieldTypes.Picture &&
          fieldData.property.pictureNumber
        ) {
          mediaNumber = fieldData.property.pictureNumber.toString();
        }
        if (
          fieldData.Type === fieldTypes.Video &&
          fieldData.property.videoNumber
        ) {
          mediaNumber = fieldData.property.videoNumber.toString();
        }

        FieldPropsListDom.push(
          <FieldPropsInput
            keyboardType="number-pad"
            label="Number Setting"
            value={mediaNumber}
            onChange={
              fieldData.Type === fieldTypes.Picture
                ? this.handlePictureNumberChange
                : fieldData.Type === fieldTypes.Video
                ? this.handleVideoNumberChange
                : () => {}
            }
            onBlur={() => {
              if (fieldData.Type === fieldTypes.Picture) {
                let pictureNumber = fieldData.property.pictureNumber || 1;
                let errorMsg = '';
                if (pictureNumber < 1 || pictureNumber > 10) {
                  pictureNumber =
                    pictureNumber < 1 ? 1 : pictureNumber > 10 ? 10 : 1;
                  errorMsg = 'The number must be between 1 and 10 ! ';
                }
                if (errorMsg) {
                  Modal.alert('Invalid value of Number', errorMsg, [
                    {
                      text: 'OK',
                      onPress: () => {},
                    },
                  ]);
                }
                this.handlePictureNumberChange(pictureNumber.toString());
              }
              if (fieldData.Type === fieldTypes.Video) {
                let videoNumber = fieldData.property.videoNumber || 1;
                let errorMsg = '';
                if (videoNumber < 1 || videoNumber > 3) {
                  videoNumber = videoNumber < 1 ? 1 : videoNumber > 3 ? 3 : 1;
                  errorMsg = 'The number must be between 1 and 3 ! ';
                }
                if (errorMsg) {
                  Modal.alert('Invalid value of Number', errorMsg, [
                    {
                      text: 'OK',
                      onPress: () => {},
                    },
                  ]);
                }
                this.handleVideoNumberChange(videoNumber.toString());
              }
            }}
          />,
        );
      }

      // privacy
      if (getIn(fieldPropsMap, [fieldData.Type, 'hasPrivacy'], null)) {
        FieldPropsListDom.push(
          <FieldPropsSwitch
            disabled={fieldData.isLinked}
            label="Privacy"
            value={fieldData.property.privacy || false}
            onChange={this.handleSwitchPrivacyChange}
          />,
        );
      }

      // Encrypt
      if (getIn(fieldPropsMap, [fieldData.Type], null)) {
        FieldPropsListDom.push(
          <FieldPropsSwitch
            label="Encrypt"
            value={fieldData.property.internalData || false}
            onChange={this.handleSwitchEncryptChange}
          />,
        );
      }

      return (
        <View style={styles.fieldPropsList}>
          {FieldPropsListDom.map((item: any, index: number) => (
            <View key={index} style={index ? styles.fieldPropsItemLine : {}}>
              {item}
            </View>
          ))}
        </View>
      );
    };

    // 过滤组件列表
    const componentList = typeSelectList;

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}>
        <View style={styles.container}>
          <TitleBarNew
            title="Regulation"
            navigation={navigation}
            right="Save"
            pressRight={this.handleConfirm}
          />
          {_renderSwitchList()}
          <View style={styles.typeSelectView}>
            <View style={styles.typeSelectTitleView}>
              <Text style={styles.typeSelectTitle}>Content type</Text>
            </View>
            <FlatList
              removeClippedSubviews={false}
              data={componentList}
              renderItem={item => _renderTypeOptionItem(item)}
              keyExtractor={(item: any, index: number) => index + ''}
              style={styles.typeSelectList}
              extraData={this.state}
              keyboardShouldPersistTaps="handled"
            />
          </View>
          <CurrencyUnitPicker
            title="Select Unit"
            visible={currencySelectVisible}
            onClose={this.onCloseCurrencySelect}
            onSelect={this.handleSelectUnitChange}
            authToken={currentUserInfo.authToken}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const mapStateToProps = (state: any) => {
  return {
    currentUserInfo: state.loginInfo.currentUserInfo,
    editingField: state.template.editingField,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    saveEditingField: (FieldData: FieldType) =>
      dispatch(saveEditingField(FieldData)),
    clearEditingField: () => dispatch(clearEditingField()),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegulationScreen);
