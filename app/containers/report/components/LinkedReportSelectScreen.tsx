import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import {deviceWidth, requestApiV2, API_v2, getIn} from '../../../common/utils';
import {FONT_FAMILY, DColors} from '../../../common/styles';
import {TitleBarNew} from '../../../common/components';
import {Toast, Modal, Portal} from '@ant-design/react-native';
import {fieldTypes, toastTips, customFormat} from '../../../common/constants';
import moment from 'moment';

let Icon = {
  rightIcon: require('../../images/template/right_choose.png'),
};
const Page = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor,
  titleColor: DColors.title,
};

export const formatValueTextForLinkReport = (
  value: string,
  type: string,
  defaultStr: string,
  staffMap: {
    [key: string]: string;
  },
  departmentMap: {
    [key: string]: string;
  },
) => {
  let formatText = value;
  if (value && type) {
    if (type === fieldTypes.Datetime) {
      formatText = moment(value).format(customFormat.DATETIME);
    } else if (type === fieldTypes.Date) {
      formatText = moment(value).format(customFormat.DATE);
    } else if (type === fieldTypes.TimeStamp) {
      formatText = moment(value).format(customFormat.TIME);
    } else if (type === fieldTypes.Staff) {
      formatText = getIn(staffMap, [value, 'staffName']);
    } else if (type === fieldTypes.Department) {
      if (value === 'All Departments') {
        formatText = value;
      } else {
        formatText = getIn(departmentMap, [value, 'name']);
      }
    }
  }
  console.log(type, value, formatText);
  return formatText || defaultStr;
};

interface Props {
  navigation: any;
  authToken: string;
  staffMap: {
    [key: string]: string;
  };
  departmentMap: {
    [key: string]: string;
  };
}

function LinkedReportSelect(props: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState('');

  const {navigation, authToken} = props;

  const handleFetchList = async () => {
    const templateId = navigation.getParam('templateId');
    setRefreshing(true);
    const response = await requestApiV2(
      API_v2.getReportFields,
      {templateId},
      authToken,
    );

    setRefreshing(false);
    if (response.result === 'Success' && Array.isArray(response.data)) {
      setDataSource(response.data);
    } else {
      Modal.alert('Fetch templates failed !', response.error, [
        {text: 'OK', onPress: () => {}},
      ]);
    }
  };

  // 打开时获取数据
  useEffect(() => {
    handleFetchList();
    const value = navigation.getParam('value');
    if (value) {
      setSelectedReportId(value);
    }
  }, []);

  const fieldName = navigation.getParam('fieldName');
  const linkReportKey = navigation.getParam('linkReportKey');
  const onChange = navigation.getParam('onChange');

  const handleSelectReport = (reportMap: any) => {
    setSelectedReportId(reportMap._id);
    onChange(linkReportKey, reportMap);
    navigation.goBack();
  };

  const _renderItem = (data: any) => {
    const {staffMap, departmentMap} = props;
    const fieldId = navigation.getParam('fieldId');
    const {index, item} = data;
    return (
      <TouchableOpacity
        onPress={() => {
          handleSelectReport(item);
        }}
        style={
          index
            ? [styles.itemWrapper, styles.itemBorderTop]
            : styles.itemWrapper
        }>
        {selectedReportId === item._id ? (
          <Image style={styles.checkedImage} source={Icon.rightIcon} />
        ) : (
          <View style={styles.unCheckCircle} />
        )}
        <Text numberOfLines={1} style={styles.itemText}>
          {formatValueTextForLinkReport(
            getIn(item, [fieldId, 'value'], ''),
            getIn(item, [fieldId, 'type'], ''),
            '--',
            staffMap,
            departmentMap,
          )}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.normal}>
      <TitleBarNew
        navigation={navigation}
        title={fieldName}
        middleStyle={{maxWidth: deviceWidth - 160}}
      />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={dataSource}
        refreshing={refreshing}
        onRefresh={handleFetchList}
        renderItem={(item: any) => _renderItem(item)}
        keyExtractor={(item: any, index: number) => item._id + index}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  itemWrapper: {
    width: deviceWidth,
    height: 50,
    paddingLeft: 17,
    flexDirection: 'row',
    // justifyContent: "center",
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  itemBorderTop: {
    borderTopColor: '#eee',
    borderTopWidth: 1,
  },
  itemText: {
    fontFamily: Page.font_family,
    color: Page.titleColor,
    fontSize: 16,
  },
  unCheckCircle: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#999999',
    borderWidth: 1,
    borderRadius: 10,
    marginRight: 10,
  },
  checkedImage: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
});

const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
    staffMap: state.company.staffMap,
    departmentMap: state.company.departmentMap,
  };
};

export default connect(mapStateToProps)(LinkedReportSelect);
