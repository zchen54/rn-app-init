import React, {Component} from 'react';
import {View, Text, TextInput, ViewStyle} from 'react-native';
import {FieldPropertyType} from '../../../common/constants/ModeTypes';
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
  property?: FieldPropertyType;
}

export class InputField extends Component<Props, State> {
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
      property,
    } = this.props;
    const warnStyle: ViewStyle = {
      borderColor: '#ed2f31',
      borderWidth: 1,
    };
    let keyboardType: any = 'default';
    if (FieldType === 'Money' || FieldType === 'Number') {
      keyboardType = 'number-pad';
      if (decimalPlaces) {
        keyboardType = 'decimal-pad';
      }
    } else if (FieldType === 'Email') {
      keyboardType = 'email-address';
    }
    return FieldType === 'Money' ? (
      <View
        style={
          isWarn ? {...styles.formItemWrap, ...warnStyle} : styles.formItemWrap
        }>
        <Text>
          {property && property.currencyUnit
            ? property.currencyUnit.substr(
                0,
                property.currencyUnit.indexOf(','),
              ) + ' '
            : '$ '}
        </Text>
        <TextInput
          keyboardType={keyboardType}
          placeholder={placeholder ? placeholder : ''}
          value={FieldValue || FieldValue !== '' ? FieldValue : undefined}
          maxLength={!decimalPlaces ? maxLength : undefined}
          style={styles.formInput}
          onChangeText={handleChangeText}
          onBlur={handleBlur ? handleBlur : () => {}}
        />
      </View>
    ) : (
      <View
        style={
          isWarn ? {...styles.formItemWrap, ...warnStyle} : styles.formItemWrap
        }>
        <TextInput
          keyboardType={keyboardType}
          placeholder={placeholder ? placeholder : ''}
          value={
            FieldValue || (FieldType === 'Number' && FieldValue !== '')
              ? FieldValue
              : undefined
          }
          maxLength={!decimalPlaces ? maxLength : undefined}
          style={styles.formInput}
          onChangeText={handleChangeText}
          onBlur={handleBlur ? handleBlur : () => {}}
        />
      </View>
    );
  }
}
