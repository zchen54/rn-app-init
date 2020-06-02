import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  SectionList,
  Keyboard,
  Platform,
  TextInput,
} from 'react-native';
import {PlatFormAndroid} from '../../../env';
import {
  TitleBarNew,
  SearchInput,
  formatSearchResultText,
} from '../../../common/components';
import {deviceWidth, searchType, getIn} from '../../../common/utils';
import {FONT_FAMILY} from '../../../common/styles';
import {
  searchUserByEmail,
  fetchCompanyInfo,
  fetchCompanyStaff,
} from '../../../store/actions';

interface State {
  searchValue: string;
  refreshing: boolean;
  openingSectionTitle: Array<string>;
}
interface Props {
  authToken: string;
  companyInfo: any;
  currentUserInfo: any;
  navigation: any;
  fetchCompanyInfo: (
    authToken: string,
    companyPkey: string,
    callback?: Function,
  ) => void;
  fetchCompanyStaff: (authToken: string, callback?: Function) => void;
  searchUserByEmail: (
    authToken: string,
    email: string,
    callback?: Function,
  ) => void;
}

const Icon = {
  SearchIcon: require('../../images/Me/search.png'),
  CloseIcon: require('../../images/Me/close.png'),
  HistoryIcon: require('../../images/Me/history.png'),
  EnterIcon: require('../../images/Me/enter.png'),
  DropIcon: require('../../images/Me/drop.png'),
  headerImageIcon: require('../../images/Me/Portrait.png'),
};

export class OrganizationStructure extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchValue: '',
      refreshing: false,
      openingSectionTitle: [],
    };
  }

  componentWillMount() {
    this.handleFetchList();
  }

  handleFetchList = () => {
    const {currentUserInfo} = this.props;
    this.setState({refreshing: true});
    this.props.fetchCompanyStaff(currentUserInfo.authToken, () => {
      this.setState({refreshing: false});
    });
  };

  handleSearchChange = (value: string) => {
    const {staffs} = this.props.companyInfo;
    const {searchValue} = this.state;
    let openingSectionTitle: Array<string> = [];
    staffs.forEach((item: any) => {
      if (
        value !== '' &&
        item.department &&
        item.staffName &&
        item.staffName.toUpperCase().indexOf(searchValue.toUpperCase()) > -1 &&
        openingSectionTitle.indexOf(item.department.name) === -1
      ) {
        openingSectionTitle.push(item.department.name);
      }
    });
    this.setState({
      openingSectionTitle,
      searchValue: value,
    });
  };

  handleCheckDepartment = (title: string, staffs: Array<any>) => {
    if (title && staffs.length) {
      let openingSectionTitle = [...this.state.openingSectionTitle];
      let index = openingSectionTitle.indexOf(title);
      index === -1
        ? openingSectionTitle.push(title)
        : openingSectionTitle.splice(index, 1);
      this.setState({openingSectionTitle});
    }
  };

  handleClickStaff = (staff: any) => {
    const {authToken, navigation} = this.props;
    this.props.searchUserByEmail(authToken, staff.user.email, () => {
      navigation.navigate('FriendInfo', {
        type: searchType.FriendEmail,
      });
    });
  };

  render() {
    const {searchValue, openingSectionTitle, refreshing} = this.state;
    const {companyInfo, navigation} = this.props;
    const {departments, staffs} = companyInfo;
    const staffsCount = Array.isArray(staffs)
      ? staffs.filter(staff => staff.state).length
      : 0;

    StatusBar.setBarStyle('light-content', true);
    if (Platform.OS === PlatFormAndroid) {
      StatusBar.setTranslucent(true);
      StatusBar.setBackgroundColor('rgba(0,0,0,0)', true);
    }

    let showStaffs =
      searchValue === ''
        ? staffs
        : Array.isArray(staffs)
        ? staffs.filter(
            (item: any) =>
              item.staffName &&
              item.staffName.toUpperCase().indexOf(searchValue.toUpperCase()) >
                -1,
          )
        : [];

    const _renderSearch = () => {
      return (
        <View style={styles.searchBarWrapper}>
          <SearchInput value={searchValue} onChange={this.handleSearchChange} />
        </View>
      );
    };

    const _renderStructure = () => {
      let sections: any = [];
      if (Array.isArray(departments)) {
        sections = departments.map((department: any) => {
          let data: any = [];
          showStaffs.forEach((staff: any) => {
            if (
              staff.state &&
              staff.department &&
              staff.department._id === department._id
            ) {
              data.push(staff);
            }
          });
          return {
            ...department,
            data,
          };
        });
      }
      let freeStaffs = showStaffs.filter(
        (staff: any) => staff.state && !staff.department,
      );
      if (freeStaffs.length) {
        sections.push({
          name: 'All Departments',
          data: freeStaffs,
        });
      }

      const renderItem = ({item, index, section}: any) => {
        return openingSectionTitle.indexOf(section.name) >= 0 ||
          section.name === '' ? (
          <TouchableOpacity
            onPress={() => {
              this.handleClickStaff(item);
            }}
            style={styles.staffItem}>
            {item && getIn(item, ['user', 'userPic'], '') ? (
              <Image
                style={styles.Avatar}
                source={{
                  uri: getIn(item, ['user', 'userPic'], ''),
                }}
              />
            ) : (
              <Image style={styles.Avatar} source={Icon.headerImageIcon} />
            )}
            <View
              style={
                index === 0
                  ? styles.staffNameWrap
                  : {
                      ...styles.staffNameWrap,
                      borderTopWidth: 1,
                      borderTopColor: '#F2F2F2',
                    }
              }>
              <Text style={styles.staffName}>
                {formatSearchResultText(item.staffName, searchValue)}
              </Text>
              {item.isAdmin ? (
                <Text style={styles.adminLabel}>Administrator</Text>
              ) : (
                <Text> </Text>
              )}
            </View>
          </TouchableOpacity>
        ) : (
          <View />
        );
      };

      const renderSectionHeader = ({section}: any) => {
        return section.name !== '' ? (
          <View style={styles.sectionTitle}>
            <TouchableOpacity
              onPress={() => {
                this.handleCheckDepartment(section.name, section.data);
              }}
              style={styles.sectionTitleWrap}>
              <Text style={styles.sectionTitleText}>
                {section.name + ' (' + section.data.length + ')'}
              </Text>
              {openingSectionTitle.indexOf(section.name) >= 0 ? (
                <Image style={{...styles.arrowIcon}} source={Icon.DropIcon} />
              ) : (
                <Image style={{...styles.arrowIcon}} source={Icon.EnterIcon} />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{height: 8}} />
        );
      };

      return (
        <View style={{flex: 1}}>
          <Text style={styles.title}>
            {companyInfo.name + ' (' + staffsCount + ')'}
          </Text>
          <SectionList
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            sections={sections}
            refreshing={refreshing}
            onRefresh={this.handleFetchList}
            keyExtractor={(item, index) => '' + index}
            style={styles.sectionList}
          />
        </View>
      );
    };

    return (
      <View style={styles.normal}>
        <TitleBarNew
          title={'Organizational structure'}
          navigation={navigation}
        />
        {_renderSearch()}
        {_renderStructure()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  searchBarWrapper: {
    marginVertical: 16,
    marginHorizontal: 17,
    width: deviceWidth - 34,
  },
  title: {
    fontSize: 16,
    paddingHorizontal: 17,
    color: '#2E2E2E',
  },
  sectionList: {
    marginTop: 10,
  },
  sectionTitle: {
    height: 52,
    backgroundColor: '#fff',
    paddingLeft: 17,
  },
  sectionTitleWrap: {
    height: 52,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleText: {
    fontSize: 16,
    color: '#757575',
  },
  arrowIcon: {
    position: 'relative',
    width: 12,
    height: 12,
    marginRight: 17,
  },
  staffItem: {
    height: 53,
    paddingLeft: 17,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  Avatar: {
    width: 40,
    height: 40,
    // backgroundColor: "#F38900",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  staffNameWrap: {
    height: 53,
    width: deviceWidth - 74,
    marginLeft: 17,

    flexDirection: 'row',
    alignItems: 'center',
  },
  staffName: {
    fontSize: 16,
    color: '#2E2E2E',
  },
  adminLabel: {
    backgroundColor: '#F38900',
    marginLeft: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
    fontSize: 12,
    color: '#FFF',
  },
});

const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
    currentUserInfo: state.loginInfo.currentUserInfo,
    companyInfo: state.company.companyInfo,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    searchUserByEmail: (
      authToken: string,
      email: string,
      callback?: Function,
    ) => {
      dispatch(searchUserByEmail(authToken, email, callback));
    },
    fetchCompanyInfo: (
      authToken: string,
      companyPkey: string,
      callback?: Function,
    ) => {
      dispatch(fetchCompanyInfo(authToken, companyPkey, callback));
    },
    fetchCompanyStaff: (authToken: string, callback?: Function) => {
      dispatch(fetchCompanyStaff(authToken, callback));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(OrganizationStructure);
