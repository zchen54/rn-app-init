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
import {Modal, Tabs, Portal, Toast} from '@ant-design/react-native';
import {
  fieldTypes,
  tableFieldTypes,
  fieldProperty,
  customFormat,
} from '../../../common/constants';
import {DColors, DFontSize, FONT_FAMILY} from '../../../common/styles';
import {getIn} from '../../../common/utils';
import {FieldType, TableFieldType} from '../../../common/constants/ModeTypes';
import {isStaffInCompany} from '.././judgement';
import {styles} from './style';
import {Icon} from '@ant-design/react-native';

interface Props {
  label: string;
  value: string;
  onPress: () => void;
}

export const FieldPropsSelect = (props: Props) => {
  const {label, value, onPress} = props;
  let valueText = value;
  const valueArr = value.split(',');
  if (Array.isArray(valueArr) && valueArr.length === 3) {
    const symbol = valueArr[0],
      code = valueArr[1],
      name = valueArr[2];
    valueText =
      value.length > 24 ? `${code}(${symbol})` : `${code}(${symbol}) - ${name}`;
  }
  return (
    <View style={styles.switchView}>
      <Text style={styles.switchText}>{label}</Text>
      <TouchableOpacity
        onPress={onPress}
        style={{flexDirection: 'row', alignItems: 'center'}}>
        <Text style={styles.switchText}>{valueText}</Text>
        <Icon name="right" color="#757575" style={{marginLeft: 10}} />
      </TouchableOpacity>
    </View>
  );
};
