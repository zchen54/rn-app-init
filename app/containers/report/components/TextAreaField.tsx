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

export class TextAreaField extends Component<Props, State> {
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

    return (
      <View
        style={
          isWarn
            ? {...styles.TextAreaWrap, ...warnStyle}
            : {...styles.TextAreaWrap}
        }>
        <TextInput
          keyboardType={keyboardType}
          multiline={true}
          textAlignVertical="top"
          placeholder={placeholder ? placeholder : ''}
          value={
            FieldValue || (FieldType === 'Number' && FieldValue !== '')
              ? FieldValue
              : undefined
          }
          style={styles.formInput}
          onChangeText={handleChangeText}
          onBlur={handleBlur ? handleBlur : () => {}}
        />
      </View>
    );
  }
}
