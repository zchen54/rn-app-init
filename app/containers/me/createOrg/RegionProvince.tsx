import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {TitleBarNew} from '../../../common/components';
import {FONT_FAMILY} from '../../../common/styles';
import {
  deviceWidth,
  requestApiV2,
  API_v2,
  sortObjectArray,
} from '../../../common/utils';
interface State {
  provinces: Array<any>;
  stateData: any;
}
interface Props {
  authToken: string;
  navigation: any;
}
const Page = {
  font_family: FONT_FAMILY,
};

const Icon: any = {
  social: require('../../images/industry/Personnel.png'),
  EnterIcon: require('../../images/Me/enterwhite.png'),
};

export class RegionProvince extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      provinces: [],
      stateData: {},
    };
  }

  componentWillMount() {
    const {authToken, navigation} = this.props;
    const country = navigation.getParam('regionStateData');
    const data = {id: country._id};
    requestApiV2(API_v2.getCity, data, authToken)
      .then(res => {
        if (Array.isArray(res.data.cities)) {
          let mainlandCities: any = [],
            specialCities: any = [];
          res.data.cities.forEach((item: any) => {
            if (item._id.indexOf('C_') !== -1) {
              specialCities.push(item);
            } else {
              mainlandCities.push(item);
            }
          });
          console.log(specialCities, sortObjectArray(specialCities, 'name'));
          this.setState({
            stateData: country,
            provinces: [
              ...sortObjectArray(specialCities, 'name'),
              ...sortObjectArray(mainlandCities, 'name'),
            ],
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  }

  handleSelectProvince = (valueObj: any) => {
    const {navigation} = this.props;
    const {stateData} = this.state;
    let hasCities =
      Array.isArray(valueObj.litleCities) && valueObj.litleCities.length > 0;
    if (hasCities) {
      navigation.navigate('RegionCity', {
        regionStateData: stateData,
        regionProvData: valueObj,
        regionCityData: {},
      });
    } else {
      navigation.navigate('CreateOrganization', {
        regionStateData: stateData,
        regionProvData: valueObj,
        regionCityData: {},
      });
    }
  };

  renderListItem = ({item}: any) => {
    return (
      <TouchableOpacity
        key={item._id}
        onPress={() => {
          this.handleSelectProvince(item);
        }}
        style={{marginTop: 1}}>
        <View style={styles.itemWrapper}>
          <Text style={styles.textStyle}>{item.name}</Text>
          {Array.isArray(item.litleCities) && item.litleCities.length > 0 && (
            <Image
              style={{...styles.enterStyle, tintColor: '#B3B3B3'}}
              source={Icon.EnterIcon}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    const {navigation} = this.props;
    const {provinces} = this.state;
    // console.log("render===", provinces);

    return (
      <View style={styles.normal}>
        <TitleBarNew title={'Region'} navigation={navigation} />
        <FlatList
          data={provinces}
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
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RegionProvince);
