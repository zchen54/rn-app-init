import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import {
  tableFieldTypes,
  customFormat,
  regTypeConstants,
  toastTips,
} from '../../../common/constants';
import {toDecimal, regTools, getIn} from '../../../common/utils';
import {decimalJudgeFormatFun} from './common';
import {Modal, Toast} from '@ant-design/react-native';
import moment from 'moment';
import DateTimePicker from 'react-native-modal-datetime-picker';
import {FONT_FAMILY, DColors, DFontSize} from '../../../common/styles';
import {
  FieldTablePropertyType,
  FieldPropertyType,
} from '../../../common/constants/ModeTypes';
// import reactotron from "../../../../ReactotronConfig";

const Page = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor,
  titleColor: DColors.title,
};
interface State {
  currentTableFieldOrder: number;
  currentIndex: number;
  isDateTimePickerVisible: boolean;
  initialSelectDateTime: string;
  modeOfDateTimePicker: 'date' | 'time' | 'datetime' | undefined;
}
interface Props {
  navigation: any;
  FieldName: string;
  TableFieldDataList: Array<any>;
  saveEditingReport: Function;
  onReportTableFieldChange: (
    TableFieldDataList: any,
    FieldTableProperty: FieldTablePropertyType,
  ) => void;
  currentUserInfo: any;
  FieldTableProperty: FieldTablePropertyType;
  staffMap: any;
  departmentMap: any;
}

export class TableField extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      currentTableFieldOrder: 0,
      currentIndex: 0,
      isDateTimePickerVisible: false,
      initialSelectDateTime: '',
      modeOfDateTimePicker: 'date',
    };
  }

  // 函数：修改tablefield的值
  TableFieldChange = (text: string, FieldOrder: number, index: number) => {
    // let { TableFieldDataList } = this.state;
    let {TableFieldDataList, FieldTableProperty} = this.props;
    TableFieldDataList.forEach(item => {
      if (item.Order === FieldOrder) {
        item.FieldValueList[index] = text;
      }
    });
    this.props.onReportTableFieldChange(TableFieldDataList, FieldTableProperty);
  };

  // 修改table多选框的值
  onCheckBox = (valueArr: Array<string>) => {
    const {currentTableFieldOrder, currentIndex} = this.state;
    let theValue = valueArr.join(',');
    this.TableFieldChange(theValue, currentTableFieldOrder, currentIndex);
  };

  // 修改table多选框的值
  onRadioBox = (value: string) => {
    const {currentTableFieldOrder, currentIndex} = this.state;
    this.TableFieldChange(value, currentTableFieldOrder, currentIndex);
  };

  onStaffOrDepartmentChange = (value: string) => {
    const {currentTableFieldOrder, currentIndex} = this.state;
    this.TableFieldChange(value, currentTableFieldOrder, currentIndex);
  };

  // 定位table timefield位置
  _showDateTimePicker = (
    mode: 'date' | 'time' | 'datetime' | undefined,
    value: string,
    FieldOrder: number,
    currentIndex: number,
  ) => {
    this.setState({
      isDateTimePickerVisible: true,
      modeOfDateTimePicker: mode,
      initialSelectDateTime: value,
      currentTableFieldOrder: FieldOrder,
      currentIndex: currentIndex,
    });
  };
  _hideDateTimePicker = () =>
    this.setState({
      modeOfDateTimePicker: 'date',
      isDateTimePickerVisible: false,
    });

  // 修改table timefield的值
  _handleDatePicked = (date: any) => {
    console.log('A date has been picked: ', date);
    const {
      currentTableFieldOrder,
      currentIndex,
      modeOfDateTimePicker,
    } = this.state;
    let value = moment(date).format();
    this._hideDateTimePicker();
    this.TableFieldChange(value, currentTableFieldOrder, currentIndex);
  };

  // 增加row
  addTableData = () => {
    let {TableFieldDataList, currentUserInfo, FieldTableProperty} = this.props;

    let staffName = currentUserInfo.staffName || '',
      staffId = currentUserInfo.staffNumber || '';

    TableFieldDataList.forEach(item => {
      if (item.property.autoCompleteFromStaffName) {
        item.FieldValueList.push(staffName);
      } else if (item.property.autoCompleteFromStaffId) {
        item.FieldValueList.push(staffId);
      } else if (item.property.autoCompleteCreationTime) {
        item.FieldValueList.push(item.FieldValueList[0]);
      } else {
        item.FieldValueList.push('');
      }
    });

    FieldTableProperty = FieldTableProperty
      ? {
          ...FieldTableProperty,
          row: FieldTableProperty.row + 1,
        }
      : FieldTableProperty;

    this.props.onReportTableFieldChange(TableFieldDataList, FieldTableProperty);
  };

  // 删除row
  deleteTableData = (theIndex: number) => {
    let {TableFieldDataList, FieldTableProperty} = this.props;
    let row = FieldTableProperty ? FieldTableProperty.row : 1;
    if (TableFieldDataList[0].FieldValueList.length > 1) {
      row = row - 1;
      TableFieldDataList.forEach(item => {
        item.FieldValueList.splice(theIndex, 1);
      });
    }
    FieldTableProperty = FieldTableProperty
      ? {
          ...FieldTableProperty,
          row: row,
        }
      : FieldTableProperty;
    this.props.onReportTableFieldChange(TableFieldDataList, FieldTableProperty);
  };

  // 渲染table
  renderTable = () => {
    const {TableFieldDataList, staffMap, departmentMap} = this.props;

    // 渲染table field
    return TableFieldDataList[0].FieldValueList.map(
      (item: string, valueIndex: number) => {
        return (
          <View key={'wrapper' + valueIndex}>
            <View style={styles.rowContent}>
              <View style={styles.rowTitle}>
                <Text style={styles.rowText}>Row {valueIndex + 1}</Text>
                <Text
                  onPress={() => this.deleteTableData(valueIndex)}
                  style={styles.deleteText}>
                  Delete
                </Text>
              </View>
              {TableFieldDataList.map(item => {
                switch (item.Type) {
                  case tableFieldTypes.Text: {
                    return (
                      <View key={item.Order} style={styles.itemStyle}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.FieldName}
                          <Text>
                            {item.property.required ? (
                              <Text style={{color: '#ed2f31'}}> *</Text>
                            ) : null}
                          </Text>
                        </Text>
                        <TextInput
                          value={item.FieldValueList[valueIndex]}
                          style={styles.inputStyle}
                          placeholderTextColor="#CCCCCC"
                          placeholder={item.Remark || 'Please enter content'}
                          maxLength={item.property.maxLength || undefined}
                          onChangeText={(text: string) => {
                            this.TableFieldChange(text, item.Order, valueIndex);
                          }}
                        />
                      </View>
                    );
                  }
                  case tableFieldTypes.Email: {
                    return (
                      <View key={item.Order} style={styles.itemStyle}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.FieldName}
                          <Text>
                            {item.property.required ? (
                              <Text style={{color: '#ed2f31'}}> *</Text>
                            ) : null}
                          </Text>
                        </Text>
                        <TextInput
                          value={item.FieldValueList[valueIndex]}
                          style={styles.inputStyle}
                          keyboardType="email-address"
                          placeholderTextColor="#CCCCCC"
                          placeholder={item.Remark || 'Please enter content'}
                          maxLength={item.property.maxLength || undefined}
                          onChangeText={(text: string) => {
                            this.TableFieldChange(text, item.Order, valueIndex);
                          }}
                          // onBlur={() => {
                          //   if (
                          //     item.FieldValueList[valueIndex] &&
                          //     !regTools(
                          //       item.FieldValueList[valueIndex],
                          //       regTypeConstants.EMAIL
                          //     )
                          //   ) {
                          //     Toast.fail(
                          //       toastTips.MailError,
                          //       2,
                          //       undefined,
                          //       false
                          //     );
                          //     return;
                          //   }
                          // }}
                        />
                      </View>
                    );
                  }
                  case tableFieldTypes.Number: {
                    const decimalPlaces = item.property.decimalPlaces || 0,
                      maxLength = item.property.maxLength || 20;
                    let keyboardType: any = 'default';
                    if (item.Type === 'Money' || item.Type === 'Number') {
                      keyboardType = 'number-pad';
                      if (decimalPlaces) {
                        keyboardType = 'decimal-pad';
                      }
                    }
                    return (
                      <View key={item.Order} style={styles.itemStyle}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.FieldName}
                          <Text>
                            {item.property.required ? (
                              <Text style={{color: '#ed2f31'}}> *</Text>
                            ) : null}
                          </Text>
                        </Text>
                        <TextInput
                          value={item.FieldValueList[valueIndex]}
                          style={styles.inputStyle}
                          placeholderTextColor="#CCCCCC"
                          placeholder={item.Remark || 'Only number'}
                          maxLength={!decimalPlaces ? maxLength : undefined}
                          // placeholder={
                          //   decimalPlaces === 1
                          //     ? decimalPlaces + " decimal place"
                          //     : decimalPlaces === 2
                          //     ? decimalPlaces + " decimal places"
                          //     : "Only number"
                          // }
                          keyboardType={keyboardType}
                          onChangeText={(text: string) => {
                            let newText =
                              decimalPlaces && maxLength
                                ? decimalJudgeFormatFun(
                                    text,
                                    maxLength,
                                    decimalPlaces,
                                  )
                                : text;
                            this.TableFieldChange(
                              newText,
                              item.Order,
                              valueIndex,
                            );
                          }}
                          onBlur={() => {
                            let newText =
                              toDecimal(
                                item.FieldValueList[valueIndex],
                                decimalPlaces || 0,
                              ) || '';
                            this.TableFieldChange(
                              newText,
                              item.Order,
                              valueIndex,
                            );
                          }}
                        />
                      </View>
                    );
                  }
                  case tableFieldTypes.Money: {
                    const decimalPlaces = item.property.decimalPlaces || 0,
                      maxLength = item.property.maxLength || 20;
                    let keyboardType: any = 'default';
                    if (item.Type === 'Money' || item.Type === 'Number') {
                      keyboardType = 'number-pad';
                      if (decimalPlaces) {
                        keyboardType = 'decimal-pad';
                      }
                    }
                    let unitText =
                      item.property && item.property.currencyUnit
                        ? ' (' +
                          item.property.currencyUnit.substr(
                            0,
                            item.property.currencyUnit.indexOf(','),
                          ) +
                          ')'
                        : ' ($)';
                    return (
                      <View key={item.Order} style={styles.itemStyle}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.FieldName + unitText}
                          <Text>
                            {item.property.required ? (
                              <Text style={{color: '#ed2f31'}}> *</Text>
                            ) : null}
                          </Text>
                        </Text>
                        <TextInput
                          value={item.FieldValueList[valueIndex]}
                          style={styles.inputStyle}
                          placeholderTextColor="#CCCCCC"
                          placeholder={item.Remark || 'Only number'}
                          maxLength={!decimalPlaces ? maxLength : 20}
                          keyboardType={keyboardType}
                          onChangeText={(text: string) => {
                            let newText =
                              decimalPlaces && maxLength
                                ? decimalJudgeFormatFun(
                                    text,
                                    maxLength,
                                    decimalPlaces,
                                    true,
                                  )
                                : text;
                            this.TableFieldChange(
                              newText,
                              item.Order,
                              valueIndex,
                            );
                          }}
                          onBlur={() => {
                            let newText =
                              toDecimal(
                                item.FieldValueList[valueIndex],
                                decimalPlaces || 0,
                              ) || '';
                            this.TableFieldChange(
                              newText,
                              item.Order,
                              valueIndex,
                            );
                          }}
                        />
                      </View>
                    );
                  }
                  case tableFieldTypes.Datetime: {
                    let placeholderText = item.Remark || 'Please select time';
                    return (
                      <View key={item.Order} style={styles.itemStyle}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.FieldName}
                          <Text>
                            {item.property.required ? (
                              <Text style={{color: '#ed2f31'}}> *</Text>
                            ) : null}
                          </Text>
                        </Text>
                        <Text
                          style={
                            item.FieldValueList[valueIndex]
                              ? styles.inputStyle
                              : styles.defaultText
                          }
                          onPress={() => {
                            if (!item.property.autoCompleteCreationTime) {
                              this._showDateTimePicker(
                                'datetime',
                                item.FieldValueList[valueIndex],
                                item.Order,
                                valueIndex,
                              );
                            }
                          }}>
                          {item.FieldValueList[valueIndex]
                            ? moment(item.FieldValueList[valueIndex]).format(
                                customFormat.DATETIME,
                              )
                            : placeholderText}
                        </Text>
                      </View>
                    );
                  }
                  case tableFieldTypes.Date: {
                    let placeholderText = item.Remark || 'Please select time';
                    return (
                      <View key={item.Order} style={styles.itemStyle}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.FieldName}
                          <Text>
                            {item.property.required ? (
                              <Text style={{color: '#ed2f31'}}> *</Text>
                            ) : null}
                          </Text>
                        </Text>
                        <Text
                          style={
                            item.FieldValueList[valueIndex]
                              ? styles.inputStyle
                              : styles.defaultText
                          }
                          onPress={() => {
                            if (!item.property.autoCompleteCreationTime) {
                              this._showDateTimePicker(
                                'date',
                                item.FieldValueList[valueIndex],
                                item.Order,
                                valueIndex,
                              );
                            }
                          }}>
                          {item.FieldValueList[valueIndex]
                            ? moment(item.FieldValueList[valueIndex]).format(
                                customFormat.DATE,
                              )
                            : placeholderText}
                        </Text>
                      </View>
                    );
                  }
                  case tableFieldTypes.TimeStamp: {
                    let placeholderText = item.Remark || 'Please select time';
                    return (
                      <View key={item.Order} style={styles.itemStyle}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.FieldName}
                          <Text>
                            {item.property.required ? (
                              <Text style={{color: '#ed2f31'}}> *</Text>
                            ) : null}
                          </Text>
                        </Text>
                        <Text
                          style={
                            item.FieldValueList[valueIndex]
                              ? styles.inputStyle
                              : styles.defaultText
                          }
                          onPress={() => {
                            if (!item.property.autoCompleteCreationTime) {
                              this._showDateTimePicker(
                                'time',
                                item.FieldValueList[valueIndex],
                                item.Order,
                                valueIndex,
                              );
                            }
                          }}>
                          {item.FieldValueList[valueIndex]
                            ? moment(item.FieldValueList[valueIndex]).format(
                                customFormat.TIME,
                              )
                            : placeholderText}
                        </Text>
                      </View>
                    );
                  }
                  case tableFieldTypes.Radio: {
                    let placeholderText = item.Remark || 'Please select';
                    const colValue = item.FieldValueList[valueIndex];
                    return (
                      <View key={item.Order} style={styles.itemStyle}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.FieldName}
                          <Text>
                            {item.property.required ? (
                              <Text style={{color: '#ed2f31'}}> *</Text>
                            ) : null}
                          </Text>
                        </Text>
                        <TouchableOpacity
                          style={styles.formCheckBoxTextView}
                          onPress={() => {
                            this.setState({
                              currentTableFieldOrder: item.Order,
                              currentIndex: valueIndex,
                            });
                            this.props.navigation.navigate('RadioField', {
                              field: {
                                ...item,
                                FieldValue: item.FieldValueList[valueIndex],
                              },
                              onRadioBox: this.onRadioBox,
                              options: item.property.customOption
                                ? [...item.property.options, '']
                                : [...item.property.options],
                            });
                          }}>
                          {colValue ? (
                            <Text
                              style={{
                                ...styles.inputStyle,
                                textAlign: 'left',
                              }}>
                              {colValue}
                            </Text>
                          ) : (
                            <Text
                              numberOfLines={1}
                              style={styles.RadioDefaultText}>
                              {placeholderText}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  }
                  case tableFieldTypes.CheckBox: {
                    let placeholderText = item.Remark || 'Please select';
                    const colValue = item.FieldValueList[valueIndex];
                    return (
                      <View key={item.Order} style={styles.itemStyle}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.FieldName}
                          <Text>
                            {item.property.required ? (
                              <Text style={{color: '#ed2f31'}}> *</Text>
                            ) : null}
                          </Text>
                        </Text>
                        <TouchableOpacity
                          style={styles.formCheckBoxTextView}
                          onPress={() => {
                            this.setState({
                              currentTableFieldOrder: item.Order,
                              currentIndex: valueIndex,
                            });
                            this.props.navigation.navigate('CheckField', {
                              field: {
                                ...item,
                                FieldValue: item.FieldValueList[valueIndex],
                              },
                              onCheckBox: this.onCheckBox,
                              options: item.property.options,
                            });
                          }}>
                          {colValue ? (
                            colValue
                              .split(',')
                              .map((item: string, index: number) => (
                                <Text
                                  key={index}
                                  style={{
                                    ...styles.inputStyle,
                                    textAlign: 'left',
                                  }}>
                                  {item.trim() + ' ;  '}
                                </Text>
                              ))
                          ) : (
                            <Text
                              numberOfLines={1}
                              style={styles.RadioDefaultText}>
                              {placeholderText}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    );
                  }
                  case tableFieldTypes.Staff: {
                    let placeholderText = item.Remark || 'Please select';
                    const colValue =
                      getIn(staffMap, [
                        item.FieldValueList[valueIndex],
                        'staffName',
                      ]) || item.FieldValueList[valueIndex];
                    return (
                      <View key={item.Order} style={styles.itemStyle}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.FieldName}
                          <Text>
                            {item.property.required ? (
                              <Text style={{color: '#ed2f31'}}> *</Text>
                            ) : null}
                          </Text>
                        </Text>
                        <Text
                          style={
                            colValue ? styles.inputStyle : styles.defaultText
                          }
                          onPress={() => {
                            this.setState({
                              currentTableFieldOrder: item.Order,
                              currentIndex: valueIndex,
                            });
                            this.props.saveEditingReport();
                            this.props.navigation.navigate('StaffSelect', {
                              field: {FieldName: item.FieldName},
                              onSelect: this.onStaffOrDepartmentChange,
                            });
                          }}>
                          {colValue ? colValue : placeholderText}
                        </Text>
                      </View>
                    );
                  }
                  case tableFieldTypes.Department: {
                    let placeholderText = item.Remark || 'Please select';
                    const colValue =
                      getIn(departmentMap, [
                        item.FieldValueList[valueIndex],
                        'name',
                      ]) || item.FieldValueList[valueIndex];
                    return (
                      <View key={item.Order} style={styles.itemStyle}>
                        <Text style={styles.itemTitle} numberOfLines={2}>
                          {item.FieldName}
                          <Text>
                            {item.property.required ? (
                              <Text style={{color: '#ed2f31'}}> *</Text>
                            ) : null}
                          </Text>
                        </Text>
                        <Text
                          style={
                            colValue ? styles.inputStyle : styles.defaultText
                          }
                          onPress={() => {
                            this.setState({
                              currentTableFieldOrder: item.Order,
                              currentIndex: valueIndex,
                            });
                            this.props.saveEditingReport();
                            this.props.navigation.navigate('DepartmentSelect', {
                              field: {FieldName: item.FieldName},
                              onSelect: this.onStaffOrDepartmentChange,
                            });
                          }}>
                          {colValue ? colValue : placeholderText}
                        </Text>
                      </View>
                    );
                  }
                }
              })}
            </View>
          </View>
        );
      },
    );
  };

  render() {
    const {
      modeOfDateTimePicker,
      isDateTimePickerVisible,
      initialSelectDateTime,
    } = this.state;
    return (
      <View>
        <View
          style={{
            marginTop: 16,
            marginBottom: 32,
          }}>
          {this.renderTable()}
          <View key={'add'}>
            <TouchableOpacity onPress={this.addTableData}>
              <View style={styles.button}>
                <Text style={styles.deleteText}>+ Add Row</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <DateTimePicker
          mode={modeOfDateTimePicker}
          headerTextIOS={'Pick a ' + modeOfDateTimePicker}
          isVisible={isDateTimePickerVisible}
          date={
            initialSelectDateTime
              ? moment(initialSelectDateTime).toDate()
              : moment().toDate()
          }
          onConfirm={(date: any) => {
            this._handleDatePicked(date);
          }}
          onCancel={this._hideDateTimePicker}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  rowTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 47,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  rowText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: Page.titleColor,
  },
  deleteText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: Page.mainColor,
  },
  rowContent: {
    backgroundColor: '#FFFFFF',
    paddingLeft: 17,
    paddingRight: 10,
    borderRadius: 3,
    marginBottom: 8,
  },
  itemStyle: {
    flexDirection: 'row',
    flex: 1,
    minHeight: 47,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    paddingVertical: 4,
  },
  itemTitle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#757575',
    maxWidth: '50%',
  },
  inputStyle: {
    padding: 0,
    maxWidth: '50%',
    textAlign: 'right',
    fontSize: 16,
  },
  defaultText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#CCCCCC',
    width: '50%',
    textAlign: 'right',
  },
  RadioDefaultText: {
    fontFamily: Page.font_family,
    flex: 1,
    color: '#CCCCCC',
    textAlign: 'right',
  },
  button: {
    flexDirection: 'row',
    flex: 1,
    width: '100%',
    height: 40,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderRadius: 3,
  },
  formCheckBoxTextView: {
    width: '50%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  formCheckBoxText: {
    marginVertical: 3,
    fontSize: DFontSize.c1,
    color: DColors.title,
    textAlign: 'left',
  },
});
