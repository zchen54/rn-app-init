import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, Text, StyleSheet, Image, TouchableOpacity} from 'react-native';
import {
  setSize, // 设置宽高
  deviceHeight, // 设备高度
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
  statusBarHeight,
  getIn,
  backgroundColorEnum,
} from '../../../common/utils';
import {DColors, DFontSize, FONT_FAMILY} from '../../../common/styles';
import {
  TemplateType,
  ModelType,
  ReportType,
} from '../../../common/constants/ModeTypes';
import {Toast, Modal, Icon} from '@ant-design/react-native';
import moment from 'moment';

const Page = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor,
  titleColor: DColors.title,
  templateMargin: 8,
};

const DIcon = {
  headerImageIcon: require('../../images/Me/Portrait.png'),
  d2gIcon: require('../../images/Me/about.png'),
  submit_blue: require('../../images/template/submit_blue.png'),
  write_blue: require('../../images/template/write_blue.png'),
  deleteIcon: require('../../images/template/Delete_red.png'),
  defaultIcon: require('../../images/template/default.png'),
  more: require('../../images/Index-Login/more-operation.png'),
};

interface Props {
  index: number;
  templateData: ModelType & TemplateType;
  onPress: () => void;
  handleMoreAction?: () => void;
  isSystem?: boolean;
  showCategory: boolean;
  category?: string;
  bgColor?: string;
}

const paddingX = 12;
const DATE_FORMAT = 'DD/MM/YYYY HH:mm';

export const TemplateItem = (props: Props) => {
  const {
    index,
    templateData,
    onPress,
    handleMoreAction,
    isSystem,
    showCategory,
    category,
    bgColor,
  } = props;
  let creatorIcon = DIcon.d2gIcon;
  let creatorName = templateData.isDefault
    ? 'Sample'
    : templateData.CreatorName;
  let templateStatus: any;
  if (isSystem) {
    // 系统模板
    creatorName = 'Sample';
  } else {
    // 公司模板
    creatorIcon = templateData.isDefault
      ? DIcon.d2gIcon
      : templateData.CreatorPic
      ? {
          uri: templateData.CreatorPic,
        }
      : DIcon.headerImageIcon;

    if (!templateData.isDefault) {
      if (templateData.UploadStatus) {
        // templateStatus = Icon.submit_blue;
      } else {
        templateStatus = DIcon.write_blue;
      }
    }
  }
  let itemWrapperStyle: any =
    index % 2 ? styles.templateItemWrapperR : styles.templateItemWrapperL;
  if (index === 0 || index === 1) {
    itemWrapperStyle = {
      ...itemWrapperStyle,
      paddingTop: paddingX,
    };
  }

  return templateData.Name ? (
    <View style={itemWrapperStyle}>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.templateItem,
          {
            backgroundColor: bgColor,
          },
        ]}>
        <View style={styles.creatorInfo}>
          <Image
            style={{width: 20, height: 20, borderRadius: 10}}
            source={creatorIcon}
          />
          <Text numberOfLines={1} style={styles.creatorText}>
            {creatorName}
          </Text>
        </View>
        <View style={{flex: 1, marginTop: 8}}>
          <Text numberOfLines={2} style={styles.templateTitle}>
            {templateData.Name}
          </Text>
        </View>
        <Text numberOfLines={1} style={styles.infoText}>
          {templateData.updatedAt
            ? moment(templateData.updatedAt).format(DATE_FORMAT)
            : ''}
          {/* {showCategory && category ? category : ''} */}
        </Text>
        <View style={styles.statusIcon}>
          {!isSystem && handleMoreAction ? (
            <TouchableOpacity
              key="deleteCompanyTemplate"
              onPress={handleMoreAction}>
              <Image
                style={{width: 20, height: 20, tintColor: '#fff'}}
                source={DIcon.more}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        {/* {_renderQuickAction()} */}
      </TouchableOpacity>
    </View>
  ) : (
    <View style={itemWrapperStyle}>
      <View style={styles.templateItem} />
    </View>
  );
};

const styles = StyleSheet.create({
  templateItemWrapperL: {
    width: deviceWidth / 2,
    backgroundColor: '#fff',
    paddingLeft: paddingX,
    paddingRight: paddingX / 2,
    paddingBottom: paddingX,
  },
  templateItemWrapperR: {
    width: deviceWidth / 2,
    backgroundColor: '#fff',
    paddingLeft: paddingX / 2,
    paddingRight: paddingX,
    paddingBottom: paddingX,
  },
  templateItem: {
    width: (deviceWidth - paddingX * 3) / 2,
    borderRadius: 7,
    overflow: 'hidden',
    height: 100,
    padding: 10,
  },
  templateTitle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    lineHeight: 18,
    color: '#fff',
  },
  creatorInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  creatorText: {
    fontFamily: Page.font_family,
    fontSize: 14,
    marginLeft: 10,
    width: 100,
    color: '#fff',
  },
  infoText: {
    fontFamily: Page.font_family,
    fontSize: 12,
    color: '#fff',
    textAlign: 'right',
  },
  statusIcon: {
    position: 'absolute',
    top: 5,
    right: 7,
  },
  quickContainer: {
    width: (deviceWidth - paddingX * 3) / 2,
    height: 40,
    position: 'absolute',
    left: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  actionImageWrapper: {
    width: (deviceWidth - Page.templateMargin * 3) / 4 - 2,
    height: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionImage: {
    width: 21,
    height: 21,
  },
  defaultText: {
    fontSize: 14,
    color: '#2e2e2e',
  },
});
