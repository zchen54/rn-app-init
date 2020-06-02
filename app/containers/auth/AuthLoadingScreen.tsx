import React from 'react';
import {connect} from 'react-redux';
import {
  ActivityIndicator,
  Button,
  StatusBar,
  StyleSheet,
  View,
  Text,
  Image,
  Platform,
  TouchableOpacity,
  NativeModules,
} from 'react-native';
import Orientation from 'react-native-orientation';
import {PlatFormAndroid} from '../../env';
import {
  getUserInfo,
  setIsFrist,
  getIsFrist,
  deviceWidth,
} from '../../common/utils';
import {
  updateCurrentUserInfo,
  fetchAllData,
  backupTemplates,
} from '../../store/actions';
import Swiper from 'react-native-swiper';
import {FONT_FAMILY} from '../../common/styles';
import reactotron from 'reactotron-react-native';
const iOSToolModule = NativeModules.ToolModule;

interface Props {
  navigation: any;
  screenProps: any;
  dispatch: Function;
}
interface State {
  isFirst: boolean;
  versionName: string;
  versionCode: number;
}

const picture = {
  guide1: require('../images/GuidePage/page1.png'),
  guide2: require('../images/GuidePage/page2.png'),
  guide3: require('../images/GuidePage/page3.png'),
};

class AuthLoadingScreen extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    // this._bootstrapAsync();
    Orientation.lockToPortrait();
    // this.checkLoginStatus();
    this.state = {
      isFirst: false,
      versionName: '',
      versionCode: 0,
    };
  }

  componentWillMount() {
    getIsFrist()
      .then(res => {
        console.log('res', res);
        this.setState({
          isFirst: false,
        });
        this.checkLoginStatus();
      })
      .catch(e => {
        console.log(e.message);
        this.setState({
          isFirst: true,
        });
      });
  }

  checkLoginStatus = () => {
    setIsFrist(false);
    getUserInfo()
      .then(res => {
        console.log('check login status: ', res);
        if (res) {
          this.props.dispatch(backupTemplates());
          this.props.dispatch(updateCurrentUserInfo(res));
          if (res && res.roleType === 4) {
            this.props.navigation.navigate('PersonalUser');
          } else {
            this.props.dispatch(
              fetchAllData(res.authToken, false, () =>
                this.props.navigation.navigate(res ? 'App' : 'Auth'),
              ),
            );
          }
        }
      })
      .catch(e => {
        this.props.navigation.navigate('Auth');
        console.log(e.message);
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          backgroundColor={'rgba(0,0,0,0)'}
          barStyle={'light-content'}
          // barStyle="dark-content"
          translucent={true}
        />
        {this.state.isFirst ? (
          <View style={{flex: 1}}>
            <TouchableOpacity
              style={{marginTop: 74, marginLeft: deviceWidth - 20 - 67}}
              onPress={this.checkLoginStatus}>
              <View style={styles.skipButton}>
                <Text style={styles.skipText}>skip</Text>
              </View>
            </TouchableOpacity>

            <Swiper
              // containerStyle={styles.carouselStyle}
              loop={false}
              dotColor="#A89FF5"
              activeDotColor="#4F40D4">
              <View style={styles.pageStyle}>
                <Image
                  style={{
                    width: deviceWidth - 35,
                    height: 300,
                    resizeMode: 'contain',
                    marginBottom: 66,
                  }}
                  source={picture.guide1}
                />
                <Text style={styles.templateStyle}>Template</Text>
                <Text style={{...styles.infoStyle, marginBottom: 126}}>
                  Easily share templates
                </Text>
              </View>
              <View style={styles.pageStyle}>
                <Image
                  style={{
                    width: deviceWidth - 35,
                    height: 300,
                    resizeMode: 'contain',
                    marginBottom: 66,
                  }}
                  source={picture.guide2}
                />
                <Text style={{...styles.templateStyle, color: '#FFB101'}}>
                  Data
                </Text>
                <Text style={{...styles.infoStyle, marginBottom: 126}}>
                  Easily submit data
                </Text>
              </View>
              <View style={styles.pageStyle}>
                <Image
                  style={{
                    width: deviceWidth - 35,
                    height: 300,
                    resizeMode: 'contain',
                    marginBottom: 66,
                  }}
                  source={picture.guide3}
                />
                <Text style={{...styles.templateStyle, color: '#58CCB1'}}>
                  Teams
                </Text>
                <Text style={styles.infoStyle}>Smart work platform</Text>
                <TouchableOpacity
                  style={{marginBottom: 60}}
                  onPress={this.checkLoginStatus}>
                  <View style={styles.goButton}>
                    <Text style={styles.goText}> Let’s go</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Swiper>
          </View>
        ) : (
          <View
            style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <ActivityIndicator size="large" />
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  carouselStyle: {
    flex: 1,
    width: deviceWidth,
  },
  pageStyle: {
    flex: 1,
    width: deviceWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButton: {
    width: 67,
    height: 27,
    backgroundColor: '#F2F2F2',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipText: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    color: '#B3B3B3',
  },
  templateStyle: {
    fontFamily: FONT_FAMILY,
    fontSize: 40,
    color: '#6154D4',
  },
  infoStyle: {
    fontFamily: FONT_FAMILY,
    fontSize: 16,
    color: '#999999',
    marginBottom: 26,
  },
  goButton: {
    width: 240,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#6154D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goText: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    color: '#6154D4',
    fontWeight: 'bold',
  },
});

const mapStateToProps = (state: any) => {
  return {};
};

export default connect(mapStateToProps)(AuthLoadingScreen);
