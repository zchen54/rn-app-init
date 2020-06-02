import React, {Component} from 'react';
import {View, Text, TextInput, ViewStyle} from 'react-native';

import {styles} from '../../template/style';

interface State {}
interface Props {
  FieldValue: string;
  FieldType: string;
  placeholder?: string;
  maxLength?: number;
  handleChangeText: (text: string) => void;
  handleBlur?: () => void;
  isWarn?: boolean;
  decimalPlaces?: number;
}

export class FullNameField extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      FieldType,
      FieldValue,
      handleChangeText,
      placeholder,
      handleBlur,
      isWarn,
      maxLength,
      decimalPlaces,
    } = this.props;

    const warnStyle: ViewStyle = {
      borderColor: '#ed2f31',
      borderWidth: 1,
    };

    let keyboardType: any = 'default';
    let valueArr = FieldValue.split(',');

    return (
      <View
        style={
          isWarn
            ? {...styles.fullNameGroup, ...warnStyle}
            : {...styles.fullNameGroup}
        }>
        <View style={styles.fullNameItem}>
          <TextInput
            keyboardType={keyboardType}
            placeholder={'First'}
            value={valueArr[0] || undefined}
            style={styles.formInput}
            onChangeText={(text: string) => {
              handleChangeText([text, valueArr[1]].join(','));
            }}
          />
        </View>
        <View style={styles.fullNameItem}>
          <TextInput
            keyboardType={keyboardType}
            placeholder={'Last'}
            value={valueArr[1] || undefined}
            style={styles.formInput}
            onChangeText={(text: string) => {
              handleChangeText([valueArr[0], text].join(','));
            }}
          />
        </View>
      </View>
    );
  }
}
