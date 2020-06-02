import React, {Component} from 'react';
import {View, Text, TouchableOpacity, Image, ViewStyle} from 'react-native';
import {setSizeWithPx} from '../../../common/utils';
import {DColors} from '../../../common/styles';
import {styles} from '../../template/style';

interface State {}
interface Props {
  isCheckbox?: boolean;
  isWarn?: boolean;
  FieldValue: string;
  placeholder?: string;
  handlePress: () => void;
}

export class CheckBoxField extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      FieldValue,
      handlePress,
      placeholder,
      isWarn,
      isCheckbox,
    } = this.props;
    const warnStyle: ViewStyle = {
      borderColor: '#ed2f31',
      borderWidth: 1,
    };
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={
          isWarn ? {...styles.formCheckBox, ...warnStyle} : styles.formCheckBox
        }
        onPress={handlePress}>
        <View style={styles.formCheckBoxTextView}>
          {FieldValue ? (
            FieldValue.split(',').map((item: string, index: number) => (
              <Text key={index} style={styles.formCheckBoxText}>
                {isCheckbox ? item.trim() + ' ;  ' : item.trim()}
              </Text>
            ))
          ) : (
            <Text style={{fontSize: 14, color: '#aaa'}}>
              {placeholder ? placeholder : ''}
            </Text>
          )}
        </View>
        <Image
          style={{
            width: setSizeWithPx(36),
            height: setSizeWithPx(20),
            tintColor: DColors.content,
          }}
          source={require('../../images/template/down.png')}
        />
      </TouchableOpacity>
    );
  }
}
