import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  BackHandler,
} from 'react-native';
import {DColors, DFontSize, FONT_FAMILY} from '../../../common/styles';
import {
  setSize, // 设置宽高
  deviceHeight, // 设备高度
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
} from '../../../common/utils';
import {styles} from '../style';
import {typeSelectList} from '../RegulationScreen';
import {formatElementTitle} from '../RegulationScreen';
import {fieldTypes} from '../../../common/constants';

const Page = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor,
  titleColor: DColors.title,
  modal_Title_Size: DFontSize.c1,
};

const DIcon = {
  EnterIcon: require('../../images/Me/enterwhite.png'),
  removeElement: require('../../images/template/Reduce.png'),
};

interface State {}
interface Props {
  fieldType: string;
  value: string;
  isLinked?: boolean;
  autoFocus: boolean;
  placeholder: string;
  style?: any;
  handleChangeTitle: (text: string) => void;
  handleDelete: () => void;
  handleEdit: () => void;
  handleDuplicate?: () => void;
}

export class TemplateField extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      fieldType,
      value,
      isLinked,
      autoFocus,
      placeholder,
      style,
      handleChangeTitle,
      handleDelete,
      handleEdit,
      handleDuplicate,
    } = this.props;

    return (
      <View style={style ? [style, styles.FieldWrap] : styles.FieldWrap}>
        <View style={styles.fieldItem}>
          <View style={styles.fieldItemLeft}>
            <TouchableOpacity
              onPress={handleDelete}
              disabled={isLinked}
              style={isLinked ? {opacity: 0.4} : {}}>
              <Image source={DIcon.removeElement} style={{marginRight: 12}} />
            </TouchableOpacity>
            <TextInput
              autoFocus={autoFocus}
              value={value}
              placeholder={placeholder}
              placeholderTextColor="#ccc"
              style={styles.fieldTitleInput}
              onChangeText={handleChangeTitle}
            />
          </View>
          <TouchableOpacity onPress={handleEdit} style={styles.fieldItemRight}>
            <Text style={styles.fieldTypeText}>
              {formatElementTitle(fieldType)
                ? formatElementTitle(fieldType)
                : fieldType === fieldTypes.RadioButton
                ? 'Radio'
                : fieldType}
            </Text>
            <Image style={styles.enterStyle} source={DIcon.EnterIcon} />
          </TouchableOpacity>
        </View>
        {handleDuplicate && (
          <TouchableOpacity
            onPress={handleDuplicate}
            style={styles.copyFieldBtn}>
            <Text style={styles.copyFieldBtnText}>Copy</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
}
