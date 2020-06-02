import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Toast, Modal, Portal} from '@ant-design/react-native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {TitleBarNew} from '../../../common/components';
import {updateStaffMap} from '../../../store/actions';
import {FONT_FAMILY} from '../../../common/styles';
import {deviceWidth, requestApiV2, API_v2} from '../../../common/utils';
import {
  ReportType,
  TemplateType,
  ModelType,
  newReport,
} from '../../../common/constants/ModeTypes';

interface State {
  dataList: Array<any>;
}
interface Props {
  authToken: string;
  companyId: string;
  editingReport: ModelType & ReportType;
  navigation: any;
  dispatch: Function;
}
const Page = {
  font_family: FONT_FAMILY,
};

const Icon: any = {
  social: require('../../images/industry/Personnel.png'),
  EnterIcon: require('../../images/Me/enterwhite.png'),
};

export class StaffSelect extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      dataList: [],
    };
  }

  componentWillMount() {
    const {authToken, companyId, editingReport} = this.props;
    const company_id = companyId || editingReport.companyId;
    if (company_id) {
      const toastKey = Toast.loading('Loading...', 0);
      requestApiV2(API_v2.getStaff, {companyId: company_id}, authToken)
        .then(res => {
          Portal.remove(toastKey);
          if (Array.isArray(res.data)) {
            let staffMap: any = {};
            this.setState({
              dataList: res.data.map((item: any) => {
                staffMap[item._id] = item;
                return {
                  _id: item._id,
                  label: item.staffName,
                };
              }),
            });
            this.props.dispatch(updateStaffMap(staffMap));
          } else {
            Modal.alert('Get reseller failed !', res.error, [
              {text: 'OK', onPress: () => {}},
            ]);
          }
        })
        .catch(error => {
          Portal.remove(toastKey);
          console.error(error);
        });
    }
  }

  handleSelectState = (value: any) => {
    const {navigation} = this.props;
    let onSelect = navigation.getParam('onSelect');
    onSelect(value);
    navigation.goBack();
  };

  renderListItem = ({item}: any) => {
    return (
      <TouchableOpacity
        key={item._id}
        onPress={() => {
          this.handleSelectState(item._id);
        }}
        style={{marginTop: 1}}>
        <View style={styles.itemWrapper}>
          <Text style={styles.textStyle}>{item.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const {navigation} = this.props;
    const {dataList} = this.state;
    let field = navigation.getParam('field');

    return (
      <View style={styles.normal}>
        <TitleBarNew title={field.FieldName} navigation={navigation} />
        <FlatList
          data={dataList}
          renderItem={this.renderListItem}
          keyExtractor={(item, index) => item._id + index}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  itemWrapper: {
    width: deviceWidth,
    height: 48,
    paddingLeft: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  textStyle: {
    fontFamily: Page.font_family,
    fontSize: 16,
    color: '#2E2E2E',
  },
  enterStyle: {
    position: 'relative',
    width: 7,
    height: 12,
    marginRight: 17,
  },
});

const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
    companyId: state.loginInfo.currentUserInfo.company,
    editingReport: state.report.editingReport,
  };
};

export default connect(mapStateToProps)(StaffSelect);
