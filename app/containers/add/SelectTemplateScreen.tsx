import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import {Button, Toast} from '@ant-design/react-native';
import {
  TitleBarWithTabs,
  TitleBarNew,
  SearchInput,
  formatSearchResultText,
} from '../../common/components';
import {
  fetchUserReports,
  fetchCompanyReports,
  previewTemplateBySelect,
  initReport,
  duplicateTemplate,
  fetchTemplateInfo,
} from '../../store/actions';
import {FONT_FAMILY} from '../../common/styles';
import {TemplateType, ModelType} from '../../common/constants/ModeTypes';
import moment from 'moment';
import {deviceWidth, searchType, fuzzySearchTools} from '../../common/utils';
import {isStaffInCompany, isAdmin} from '../template/judgement';

interface State {
  checkTemplatepKey: any;
  searchValue: string;
  hadFetch: boolean;
}
interface Props {
  navigation: any;
  organizationTemplates: Array<ModelType & TemplateType>;
  currentUserInfo: any;
  dispatch: Function;
}
const Page = {
  font_family: FONT_FAMILY,
};

let Icon = {
  rightIcon: require('../images/template/right_choose.png'),
};

export class SelectTemplateScreen extends Component<Props, State> {
  viewDidAppear: any;
  constructor(props: Props) {
    super(props);
    this.state = {
      checkTemplatepKey: '',
      searchValue: '',
      hadFetch: false,
    };
  }

  componentWillMount() {
    this.handleInitialState(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.handleInitialState(nextProps);
  }

  handleInitialState = (props: Props) => {
    const {navigation, currentUserInfo} = props;
    this.setState({
      checkTemplatepKey: navigation.getParam('selectPkey')
        ? navigation.getParam('selectPkey')
        : '',
    });
  };

  handleSearchChange = (value: string) => {
    this.setState({
      searchValue: value,
    });
  };

  handleConfirm = () => {
    const {navigation, organizationTemplates, currentUserInfo} = this.props;
    const {checkTemplatepKey} = this.state;
    const {authToken} = currentUserInfo;
    if (checkTemplatepKey === '') {
      Toast.fail('please select template', 1, undefined, false);
      return;
    }
    const action = navigation.getParam('action');
    if (action === 'editTemplate') {
      this.props.dispatch(
        fetchTemplateInfo(authToken, checkTemplatepKey, () => {
          this.props.navigation.navigate('CreateTemplate', {
            type: 'Edit',
          });
        }),
      );
    }
    if (action === 'copyTemplate') {
      this.props.dispatch(
        fetchTemplateInfo(
          authToken,
          checkTemplatepKey,
          (templateData: TemplateType & ModelType) => {
            this.props.dispatch(duplicateTemplate(templateData.pKey));
            navigation.navigate('CreateTemplate', {type: 'Copy'});
          },
          'CopyTemplate',
        ),
      );
    }
    if (action === 'collectData') {
      let checkTemplate;
      checkTemplate = organizationTemplates.filter(
        (item: ModelType & TemplateType) => item.pKey === checkTemplatepKey,
      )[0];
      this.props.dispatch(
        initReport(authToken, checkTemplate, () => {
          this.props.navigation.navigate('CollectData', {
            type: 'Create',
          });
        }),
      );
    }
  };

  render() {
    const {navigation, organizationTemplates, currentUserInfo} = this.props;
    const {searchValue, checkTemplatepKey} = this.state;
    const action = navigation.getParam('action');

    let showTemplates;
    let dataSource = organizationTemplates;
    // Master Template 不允许编辑
    if (action === 'editTemplate') {
      dataSource = dataSource.filter(
        (template: ModelType & TemplateType) => !template.isDefault,
      );
    }
    if (searchValue === '') {
      showTemplates = dataSource;
    } else {
      showTemplates = dataSource.filter(item =>
        fuzzySearchTools(searchValue, item.Name),
      );
    }

    const _renderItem = (data: any) => {
      // console.log("renderItem");
      const {index, item} = data;

      return (
        <View>
          <TouchableOpacity
            onPress={() => {
              checkTemplatepKey === item.pKey
                ? this.setState({checkTemplatepKey: ''})
                : this.setState({
                    checkTemplatepKey: item.pKey,
                  });
            }}>
            <View style={styles.itemWrapper}>
              <View style={styles.itemLeft}>
                <Text numberOfLines={2} style={styles.templateTitle}>
                  {formatSearchResultText(item.Name, searchValue)}
                </Text>
                <View style={styles.itemInfo}>
                  <Text
                    style={{...styles.infoText, width: deviceWidth - 290}}
                    numberOfLines={1}>
                    {item.CreatorName}
                  </Text>
                  <Text style={styles.infoText}>
                    {moment(item.createdAt).format('MMM D, YYYY HH:mm')}
                  </Text>
                </View>
              </View>
              <View style={styles.itemRight}>
                {checkTemplatepKey === item.pKey ? (
                  <Image
                    style={{...styles.cricle, borderWidth: 0}}
                    source={Icon.rightIcon}
                  />
                ) : (
                  <View style={styles.cricle} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      );
    };

    return (
      <View style={styles.normal}>
        <TitleBarNew title={'Select Template'} navigation={navigation} />
        <View style={styles.searchBarWrapper}>
          <SearchInput value={searchValue} onChange={this.handleSearchChange} />
        </View>
        <View style={{alignItems: 'center', flex: 1}}>
          <FlatList
            showsVerticalScrollIndicator={false}
            data={showTemplates}
            renderItem={sectionItem => _renderItem(sectionItem)}
            keyExtractor={(item: any, index: number) => item.pKey + '' + index}
            extraData={this.state}
          />
          <Button
            disabled={!checkTemplatepKey ? true : undefined}
            onPress={this.handleConfirm}
            style={styles.buttonStyle}
            type={checkTemplatepKey ? 'primary' : undefined}>
            {action === 'editTemplate'
              ? 'Edit Template'
              : action === 'copyTemplate'
              ? 'Copy Template'
              : action === 'collectData'
              ? 'Collect Data'
              : 'Confirm'}
          </Button>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  searchBarWrapper: {
    marginVertical: 16,
    marginHorizontal: 17,
    width: deviceWidth - 34,
  },
  itemWrapper: {
    height: 100,
    width: deviceWidth - 34,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingLeft: 21,
    paddingBottom: 18,
    paddingRight: 17,
    marginBottom: 16,
    borderRadius: 7,
  },
  itemLeft: {
    width: '85%',
    height: 65,
  },
  itemRight: {
    justifyContent: 'center',
  },
  templateTitle: {
    width: '100%',
    height: 41,
    fontFamily: Page.font_family,
    fontSize: 18,
    color: '#2E2E2E',
  },
  itemInfo: {
    marginTop: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoText: {
    fontFamily: Page.font_family,
    fontSize: 14,
    color: '#757575',
  },
  cricle: {
    width: 20,
    height: 20,
    marginLeft: 25,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#999999',
  },
  buttonStyle: {
    marginVertical: 6,
    width: deviceWidth - 34,
    height: 40,
  },
});
const mapStateToProps = (state: any) => {
  return {
    organizationTemplates: state.template.companyTemplates,
    currentUserInfo: state.loginInfo.currentUserInfo,
  };
};

export default connect(mapStateToProps)(SelectTemplateScreen);
