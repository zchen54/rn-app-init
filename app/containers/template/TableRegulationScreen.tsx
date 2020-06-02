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
import {DColors} from '../../common/styles';
import {
  tableFieldTypes,
  fieldProperty,
  customFormat,
} from '../../common/constants';
import {TableFieldType} from '../../common/constants/ModeTypes';
import {getIn} from '../../common/utils';
import {styles} from './style';
import {isStaffInCompany} from './judgement';
import {
  FieldPropsSwitch,
  FieldPropsInput,
  FieldPropsSelect,
  CurrencyUnitPicker,
} from './components';
import {currencyUnit} from './components/currencyUnit';

const newTableField: TableFieldType = {
  _id: '',
  Name: '',
  Type: '',
  Order: 1,
  Remark: '',
  property: {
    required: false,
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
    currencyUnit: '',
  },
};

const DIcon = {
  addElement: require('../images/template/Add.png'),
  removeElement: require('../images/template/Reduce.png'),
  EnterIcon: require('../images/Me/enterwhite.png'),
  selectType: require('../images/template/Right.png'),
};

const tableFieldPropsMap = {
  Text: {hasDesc: true, hasMaxLen: true},
  Number: {hasDesc: true, hasMaxLen: true, hasDecimal: true},
  Money: {
    hasDesc: true,
    hasMaxLen: true,
    hasDecimal: true,
    hasUnitSelect: true,
  },
  Email: {hasDesc: true, hasSendEmail: true},
  Radio: {hasDesc: true, hasAddOptions: true},
  CheckBox: {hasDesc: true},
  Datetime: {hasDesc: true, hasAutoComplete: true},
  TimeStamp: {hasDesc: true, hasAutoComplete: true},
  Date: {hasDesc: true, hasAutoComplete: true},
};

export const formatTableElementTitle = (type: string) => {
  let titleText = '';
  tableTypeSelectList.some((item: any) => {
    if (item.type === type) {
      titleText = item.title;
      return true;
    }
  });
  return titleText;
};

const tableTypeSelectList = [
  {
    type: 'Text',
    title: 'Single Line',
    tips: ['', 'Auto get the ID', 'User input'],
    // tips: ['Auto get the name', 'Auto get the ID', 'User input'],
  },
  {type: 'Number', title: 'Number', tips: []},
  {type: 'Money', title: 'Money', tips: []},
  {type: 'Email', title: 'Email', tips: []},
  {type: 'Radio', title: 'Radio', tips: []},
  {type: 'CheckBox', title: 'CheckBox', tips: []},
  {
    type: 'TimeStamp',
    title: 'Time',
    tips: [customFormat.TIME, 'MM DD , YYYY', 'MM DD , YYYY  HH:mm:ss'],
  },
  {type: 'Staff', title: 'Employee', tips: []},
  {type: 'Department', title: 'Department', tips: []},
];

interface State {
  tableFieldData: TableFieldType;
  textOptionOpen: boolean;
  timeOptionOpen: boolean;
  currencySelectVisible: boolean;
}
interface Props {
  currentUserInfo: any;
  navigation: any;
}

export class TableRegulationScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      tableFieldData: {
        ...newTableField,
      },
      textOptionOpen: false,
      timeOptionOpen: false,
      currencySelectVisible: false,
    };
  }

  componentWillMount() {
    this.handleInitialState(this.props);
  }

  componentWillReceiveProps(nextProps: any) {
    this.handleInitialState(nextProps);
  }

  // 初始化 State
  handleInitialState = (props: any) => {
    const {navigation} = props;
    const fieldAction = navigation.getParam('fieldAction');
    const tableFieldData = navigation.getParam('tableFieldData');

    if (fieldAction === 'AddNewTableField' && tableFieldData) {
      this.setState({
        tableFieldData: {
          ...newTableField,
        },
      });
    }
    if (fieldAction === 'EditTableField' && tableFieldData) {
      this.setState({tableFieldData});
    }
  };

  // 是否必填
  // handleSwitchChange = (value: boolean) => {
  //   this.setState(prevState => ({
  //     tableFieldData: {
  //       ...prevState.tableFieldData,
  //       property: {
  //         ...prevState.tableFieldData.property,
  //         required: value
  //       }
  //     }
  //   }));
  // };

  // 是否自动填充时间
  handleSwitchAutoCompleteCreationTimeChange = (value: boolean) => {
    this.setState(prevState => ({
      ...prevState,
      tableFieldData: {
        ...prevState.tableFieldData,
        property: {
          ...prevState.tableFieldData.property,
          autoCompleteCreationTime: value,
        },
      },
    }));
  };

  // 是否自动发送邮件
  handleSwitchAutoSendEmailChange = (value: boolean) => {
    this.setState(prevState => ({
      ...prevState,
      tableFieldData: {
        ...prevState.tableFieldData,
        property: {
          ...prevState.tableFieldData.property,
          sendEmail: value,
        },
      },
    }));
  };

  handleSwitchAutoCompleteFromStaffNameChange = () => {
    this.setState(prevState => ({
      ...prevState,
      tableFieldData: {
        ...prevState.tableFieldData,
        property: {
          ...prevState.tableFieldData.property,
          autoCompleteFromStaffName: !prevState.tableFieldData.property
            .autoCompleteFromStaffName,
          autoCompleteCreationTime: false,
          autoCompleteFromStaffId: false,
        },
      },
    }));
  };

  handleSwitchAutoCompleteFromStaffIdChange = () => {
    this.setState(prevState => ({
      ...prevState,
      tableFieldData: {
        ...prevState.tableFieldData,
        property: {
          ...prevState.tableFieldData.property,
          autoCompleteFromStaffName: false,
          autoCompleteCreationTime: false,
          autoCompleteFromStaffId: !prevState.tableFieldData.property
            .autoCompleteFromStaffId,
        },
      },
    }));
  };

  handleSwitchAutoCompleteFromSelf = () => {
    this.setState(prevState => ({
      ...prevState,
      tableFieldData: {
        ...prevState.tableFieldData,
        autoCompleteFromStaffName: false,
        autoCompleteFromStaffId: false,
        autoCompleteCreationTime: false,
      },
    }));
  };

  // 货币单位选择
  handleSelectUnitChange = (value: string) => {
    this.setState(prevState => ({
      ...prevState,
      tableFieldData: {
        ...prevState.tableFieldData,
        property: {
          ...prevState.tableFieldData.property,
          currencyUnit: value,
        },
      },
    }));
  };

  handleSwitchCustomOptionChange = (value: boolean) => {
    this.setState(prevState => ({
      ...prevState,
      tableFieldData: {
        ...prevState.tableFieldData,
        property: {
          ...prevState.tableFieldData.property,
          customOption: value,
        },
      },
    }));
  };

  handleRemarkChange = (value: string) => {
    this.setState(prevState => ({
      ...prevState,
      tableFieldData: {
        ...prevState.tableFieldData,
        Remark: value,
      },
    }));
  };

  handleMaxLengthChange = (value: string) => {
    this.setState(prevState => ({
      ...prevState,
      tableFieldData: {
        ...prevState.tableFieldData,
        property: {
          ...prevState.tableFieldData.property,
          maxLength: value ? parseInt(value) : 0,
        },
      },
    }));
  };

  handleDecimalChange = (value: string) => {
    let decimalPlaces = parseInt(value) || 0;
    this.setState(prevState => ({
      ...prevState,
      tableFieldData: {
        ...prevState.tableFieldData,
        property: {
          ...prevState.tableFieldData.property,
          decimalPlaces,
        },
      },
    }));
  };

  // 选择 Table Field Type
  selectTableFieldType = (tableFieldType: string) => {
    this.setState(prevState => ({
      ...prevState,
      tableFieldData: {
        ...prevState.tableFieldData,
        Type: tableFieldType,
        property: {
          ...prevState.tableFieldData.property,
          options:
            tableFieldType === tableFieldTypes.Radio ||
            tableFieldType === tableFieldTypes.CheckBox
              ? ['']
              : [],
          autoCompleteFromStaffName: false,
          autoCompleteFromStaffId: false,
          autoCompleteCreationTime: false,
          customOption: false,
          maxLength:
            tableFieldType === tableFieldTypes.Money
              ? 8
              : tableFieldType === tableFieldTypes.Number ||
                tableFieldType === tableFieldTypes.Text
              ? 20
              : 0,
          decimalPlaces: tableFieldType === tableFieldTypes.Money ? 2 : 0,
        },
      },
      Remark: '',
      textOptionOpen: false,
      timeOptionOpen: false,
    }));

    if (tableFieldType === tableFieldTypes.Money) {
      const unitObj = currencyUnit[0];
      const unitValue = `${unitObj.symbol},${unitObj.code},${unitObj.name}`;
      this.handleSelectUnitChange(unitValue);
    }
  };

  clearFieldType = (fromType: string) => {
    const currentType = this.state.tableFieldData.Type;
    let Type = '';
    if (
      fromType === tableFieldTypes.Text &&
      currentType === tableFieldTypes.Text
    ) {
      Type = currentType;
    } else if (
      fromType === tableFieldTypes.TimeStamp &&
      [
        tableFieldTypes.TimeStamp,
        tableFieldTypes.Date,
        tableFieldTypes.Datetime,
      ].indexOf(currentType) !== -1
    ) {
      Type = currentType;
    }
    this.setState(prevState => ({
      ...prevState,
      tableFieldData: {
        ...prevState.tableFieldData,
        Type,
      },
    }));
  };

  // 添加 Select Option
  onAddSelectOption = () => {
    this.setState(prevState => ({
      ...prevState,
      tableFieldData: {
        ...prevState.tableFieldData,
        property: {
          ...prevState.tableFieldData.property,
          options: [...prevState.tableFieldData.property.options, ''],
        },
      },
    }));
  };

  // 删除 Select Option
  onRemoveSelectOption = (optIndex: number) => {
    let options = [...this.state.tableFieldData.property.options];
    if (options.length > 1) {
      options.splice(optIndex, 1);
      this.setState(prevState => ({
        ...prevState,
        tableFieldData: {
          ...prevState.tableFieldData,
          property: {
            ...prevState.tableFieldData.property,
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
      tableFieldData: {
        ...prevState.tableFieldData,
        property: {
          ...prevState.tableFieldData.property,
          options: prevState.tableFieldData.property.options.map(
            (optItem: string, optInd: number) =>
              optInd === optIndex ? value : optItem,
          ),
        },
      },
    }));
  };

  handleConfirm = () => {
    const {navigation} = this.props;
    const {tableFieldData} = this.state;
    if (tableFieldData.Type === '') {
      Toast.fail('Please select a type of field !', 1, undefined, false);
      return;
    }
    if (
      [tableFieldTypes.Radio, tableFieldTypes.CheckBox].indexOf(
        tableFieldData.Type,
      ) !== -1 &&
      tableFieldData.property.options.indexOf('') !== -1
    ) {
      Toast.fail('Options is required !', 1, undefined, false);
      return;
    }
    navigation.navigate('RegulationScreen', {
      fieldAction: navigation.getParam('fieldAction'),
      currentSectionOrder: navigation.getParam('currentSectionOrder'),
      tableFieldData: tableFieldData,
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
    const {tableFieldData, currencySelectVisible} = this.state;
    const _renderTypeOptionItem = (optionItem: any) => {
      const {index, item} = optionItem;
      let typeItemDom: any = <View />;
      if (
        [
          tableFieldTypes.Number,
          tableFieldTypes.Money,
          tableFieldTypes.Email,
          tableFieldTypes.Datetime,
          tableFieldTypes.Date,
          tableFieldTypes.Staff,
          tableFieldTypes.Department,
        ].indexOf(item.type) !== -1 ||
        (item.type === tableFieldTypes.Text &&
          !isStaffInCompany(currentUserInfo))
      ) {
        typeItemDom = (
          <TouchableOpacity
            style={styles.normalTypeItem}
            onPress={() => {
              this.selectTableFieldType(item.type);
            }}>
            <View style={styles.typeCheckbox}>
              {tableFieldData.Type === item.type && (
                <Image source={DIcon.selectType} />
              )}
            </View>
            <View style={styles.typeTextView}>
              <Text style={styles.typeText}>{item.title}</Text>
            </View>
          </TouchableOpacity>
        );
      } else if (
        [tableFieldTypes.Radio, tableFieldTypes.CheckBox].indexOf(item.type) !==
        -1
      ) {
        let optionsDom: any = <View />;
        optionsDom = tableFieldData.property.options.map(
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
                this.selectTableFieldType(item.type);
              }}>
              <View style={styles.typeCheckbox}>
                {tableFieldData.Type === item.type && (
                  <Image source={DIcon.selectType} />
                )}
              </View>
              <View style={styles.typeTextView}>
                <Text style={styles.typeText}>{item.type}</Text>
                <Text style={styles.typeTips}>{' ' + item.tips}</Text>
              </View>
            </TouchableOpacity>
            {tableFieldData.Type === item.type && (
              <View style={styles.checkboxList}>{optionsDom}</View>
            )}
          </View>
        );
      } else if (
        item.type === tableFieldTypes.Text &&
        isStaffInCompany(currentUserInfo)
      ) {
        let optionsDom: any = <View />;
        optionsDom = item.tips.map((optItem: string, optIndex: number) =>
          optItem ? (
            <TouchableOpacity
              onPress={() => {
                this.selectTableFieldType(item.type);
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
              {tableFieldData.Type === item.type ? (
                optIndex === 0 &&
                tableFieldData.property.autoCompleteFromStaffName ? (
                  <View style={{...styles.unSelect, borderColor: '#1E9DFC'}}>
                    <View style={styles.selected} />
                  </View>
                ) : optIndex === 1 &&
                  tableFieldData.property.autoCompleteFromStaffId ? (
                  <View style={{...styles.unSelect, borderColor: '#1E9DFC'}}>
                    <View style={styles.selected} />
                  </View>
                ) : optIndex === 2 &&
                  !tableFieldData.property.autoCompleteFromStaffName &&
                  !tableFieldData.property.autoCompleteFromStaffId ? (
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
                  textOptionOpen: true,
                });
                this.clearFieldType(item.type);
              }}>
              <View style={styles.typeCheckbox}>
                {tableFieldData.Type === item.type && (
                  <Image source={DIcon.selectType} />
                )}
              </View>
              <View
                style={{
                  ...styles.typeTextView,
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.typeText}>{item.title}</Text>
                {tableFieldData.Type === item.type && (
                  <Text
                    style={{
                      ...styles.typeText,
                      color: DColors.mainColor,
                      marginRight: 17,
                    }}>
                    {tableFieldData.property.autoCompleteFromStaffName
                      ? 'Name'
                      : tableFieldData.property.autoCompleteFromStaffId
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
      } else if (item.type === tableFieldTypes.TimeStamp) {
        let optionsDom: any = <View />;
        optionsDom = item.tips.map((optItem: string, optIndex: number) => (
          <TouchableOpacity
            onPress={() => {
              if (optIndex === 0) {
                this.selectTableFieldType(tableFieldTypes.TimeStamp);
              } else if (optIndex === 1) {
                this.selectTableFieldType(tableFieldTypes.Date);
              } else {
                this.selectTableFieldType(tableFieldTypes.Datetime);
              }
            }}
            key={optIndex + ''}
            style={{...styles.checkboxOption, alignItems: 'center'}}>
            {optIndex ===
            [
              tableFieldTypes.TimeStamp,
              tableFieldTypes.Date,
              tableFieldTypes.Datetime,
            ].indexOf(tableFieldData.Type) ? (
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
                  timeOptionOpen: true,
                });
                this.clearFieldType(item.type);
              }}>
              <View style={styles.typeCheckbox}>
                {[
                  tableFieldTypes.Datetime,
                  tableFieldTypes.TimeStamp,
                  tableFieldTypes.Date,
                ].indexOf(tableFieldData.Type) !== -1 && (
                  <Image source={DIcon.selectType} />
                )}
              </View>
              <View
                style={{
                  ...styles.typeTextView,
                  justifyContent: 'space-between',
                }}>
                <Text style={styles.typeText}>{item.type}</Text>
                {[
                  tableFieldTypes.Datetime,
                  tableFieldTypes.TimeStamp,
                  tableFieldTypes.Date,
                ].indexOf(tableFieldData.Type) !== -1 && (
                  <Text
                    style={{
                      ...styles.typeText,
                      color: DColors.mainColor,
                      marginRight: 17,
                    }}>
                    {tableFieldData.Type === tableFieldTypes.Datetime
                      ? 'Date&Time'
                      : tableFieldData.Type === tableFieldTypes.TimeStamp
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
      }

      return typeItemDom;
    };

    StatusBar.setBarStyle('light-content', true);

    const _renderSwitchList = () => {
      let FieldPropsListDom: Array<any> = [];

      if (
        getIn(tableFieldPropsMap, [tableFieldData.Type, 'hasAddOptions'], null)
      ) {
        FieldPropsListDom.push(
          <FieldPropsSwitch
            label="Allow user to add option"
            value={tableFieldData.property.customOption || false}
            onChange={this.handleSwitchCustomOptionChange}
          />,
        );
      }
      if (
        getIn(
          tableFieldPropsMap,
          [tableFieldData.Type, 'hasAutoComplete'],
          null,
        )
      ) {
        FieldPropsListDom.push(
          <FieldPropsSwitch
            label="Autocomplete creation time"
            value={tableFieldData.property.autoCompleteCreationTime || false}
            onChange={this.handleSwitchAutoCompleteCreationTimeChange}
          />,
        );
      }
      if (
        getIn(tableFieldPropsMap, [tableFieldData.Type, 'hasSendEmail'], null)
      ) {
        FieldPropsListDom.push(
          <FieldPropsSwitch
            label="Activate Email"
            value={tableFieldData.property.sendEmail || false}
            onChange={this.handleSwitchAutoSendEmailChange}
          />,
        );
      }
      if (
        getIn(tableFieldPropsMap, [tableFieldData.Type, 'hasUnitSelect'], null)
      ) {
        FieldPropsListDom.push(
          <FieldPropsSelect
            label="Unit"
            value={tableFieldData.property.currencyUnit || ''}
            onPress={this.onOpenCurrencySelect}
          />,
        );
      }
      if (getIn(tableFieldPropsMap, [tableFieldData.Type, 'hasDesc'], null)) {
        FieldPropsListDom.push(
          <FieldPropsInput
            label="Instructions"
            value={tableFieldData.Remark}
            onChange={this.handleRemarkChange}
          />,
        );
      }
      if (getIn(tableFieldPropsMap, [tableFieldData.Type, 'hasMaxLen'], null)) {
        FieldPropsListDom.push(
          <FieldPropsInput
            keyboardType="number-pad"
            label="Max length"
            value={tableFieldData.property.maxLength.toString()}
            onChange={this.handleMaxLengthChange}
            onBlur={() => {
              if (
                tableFieldData.Type === tableFieldTypes.Number ||
                tableFieldData.Type === tableFieldTypes.Money
              ) {
                let maxLength = tableFieldData.property.maxLength || 0;
                const decimalLength =
                  tableFieldData.property.decimalPlaces || 0;
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
      if (
        getIn(tableFieldPropsMap, [tableFieldData.Type, 'hasDecimal'], null)
      ) {
        FieldPropsListDom.push(
          <FieldPropsInput
            keyboardType="number-pad"
            label="Decimal"
            value={
              tableFieldData.property.decimalPlaces
                ? tableFieldData.property.decimalPlaces.toString()
                : '0'
            }
            onChange={this.handleDecimalChange}
            onBlur={() => {
              if (
                tableFieldData.Type === tableFieldTypes.Number ||
                tableFieldData.Type === tableFieldTypes.Money
              ) {
                const maxLength = tableFieldData.property.maxLength || 0;
                let decimalLength = tableFieldData.property.decimalPlaces || 0;
                let errorMsg = '';
                if (maxLength && decimalLength > maxLength - 1) {
                  decimalLength = maxLength - 1;
                  errorMsg = 'The decimal must be less than the max length ! ';
                }
                // if (tableFieldData.Type === tableFieldTypes.Money && decimalLength > 2) {
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
    const componentList = tableTypeSelectList;

    return (
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}>
        <View style={styles.container}>
          <TitleBarNew
            title="Table Regulation"
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
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(TableRegulationScreen);
