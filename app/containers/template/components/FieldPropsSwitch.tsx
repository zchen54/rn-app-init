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

interface Props {
  disabled?: boolean;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const FieldPropsSwitch = (props: Props) => {
  const {label, value, onChange, disabled} = props;
  return (
    <View style={styles.switchView}>
      <Text style={styles.switchText}>{label}</Text>
      <Switch
        value={value}
        disabled={disabled || undefined}
        trackColor={{false: '#ccc', true: DColors.mainColor}}
        ios_backgroundColor="#ccc"
        thumbColor="#fff"
        onValueChange={onChange}
      />
    </View>
  );
};
