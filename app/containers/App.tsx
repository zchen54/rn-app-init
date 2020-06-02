import React, {Component} from 'react';
import {BackHandler, Animated, Easing, Image} from 'react-native';
import {Button, Toast, Icon} from '@ant-design/react-native';
import {
  setSizeWithPx, // 设置字体 px 转 dp
  deviceWidth,
} from '../common/utils';
import {
  createAppContainer,
  createSwitchNavigator,
  createStackNavigator,
  createBottomTabNavigator,
} from 'react-navigation';

// common
import AccurateSearch from '../common/components/AccurateSearch';
import FuzzySearchAll from '../containers/search/FuzzySearch';
// auth
import LoginScreen from './auth/LoginScreen';
import SignUpScreen from './auth/SignUpScreen';
import AuthLoadingScreen from './auth/AuthLoadingScreen';
import ForgetPasswordScreen from './auth/ForgetPasswordScreen';
import Agreement from './auth/Agreement';
import TestComponent from '../common/components/TestComponent';

// add
import {AddScreen} from './add/AddScreen';
import SelectTemplateScreen from './add/SelectTemplateScreen';
import SelectReportScreen from './add/SelectReportScreen';

// template
import TemplateList from './template/TemplateList';
import TemplatePreviewScreen from './template/TemplatePreviewScreen';
import CreateTemplateScreen from './template/CreateTemplateScreen';
import RegulationScreen from './template/RegulationScreen';
import TableRegulationScreen from './template/TableRegulationScreen';
import ShareTemplateByQRCode from './template/ShareTemplateByQRCode';
import {PlaceAutoComplete} from '../common/components';

// report
import DataInTemplateList from './report/DataInTemplateList';
import ReportList from './report/ReportList';
import ReportPreviewScreen from './report/ReportPreviewScreen';
import CollectDataScreen from './report/CollectDataScreen';
import RadioField from './report/components/RadioField';
import CheckField from './report/components/CheckField';
import DepartmentSelect from './report/components/DepartmentSelect';
import StaffSelect from './report/components/StaffSelect';
import Maps from './report/components/Maps';
import MapScreen from './report/components/MapScreen';
import LinkedReportSelectScreen from './report/components/LinkedReportSelectScreen';
import ApprovalProcessScreen from './report/ApprovalProcess';
import MyTaskList from './task/MyTaskList';
import PersonalGuideScreen from './me/PersonalGuideScreen';

// dynamic
import DynamicList from './dynamic/DynamicList';
import SystemTemplate from './dynamic/SystemTemplate';

// me
import MeScreen from './me/MeScreen';

// profile
import ProfileScreen from './me/profileInfo/ProfileScreen';
import NickName from './me/profileInfo/NickName';
import Gender from './me/profileInfo/Gender';
import PhoneEditScreen from './me/profileInfo/PhoneEditScreen';
import QRCode from './me/profileInfo/QRCode';
import SelectCountry from './me/profileInfo/SelectCountry';

// group
import MyGroupScreen from './me/group/MyGroupScreen';
import CreateGroup from './me/group/CreateGroup';
import EditGroupScreen from './me/group/EditGroupScreen';
import GroupName from './me/group/GroupName';

// message
import MessageScreen from './me/message/MessageScree';

// settings
import SettingsScreen from './me/Settings/SettingsScreen';
import PasswordChange from './me/Settings/PasswordChange';
import Invite from './me/Settings/Invite';
import About from './me/Settings/About';
import Feedback from './me/Settings/Feedback';
import Help from './me/Settings/Help';
import HelpDetail from './me/Settings/HelpDetail';

// friends
import FriendsScreen from './me/friends/FriendsScreen';
import FriendInfo from './me/friends/FriendInfo';

// scan
import ScanQRCode from './scanQRCode/ScanQRCode';
import WebLogin from './scanQRCode/WebLogin';

// organization
import Organization from './me/organization/Organization';
import OrganizationStructure from './me/organization/OrganizationStructure';
import NameChange from './me/organization/NameChange';
import AddOrganization from './me/organization/AddOrganization';
import InviteOrganization from './me/organization/InviteOrganization';
import SearchOrganization from './me/organization/SearchOrganization';

// create organization
import CreateOrganization from './me/createOrg/CreateOrganization';
import Industry from './me/createOrg/Industry';
import Scale from './me/createOrg/Scale';
import SelectReseller from './me/createOrg/SelectReseller';
import RegionState from './me/createOrg/RegionState';
import RegionProvince from './me/createOrg/RegionProvince';
import RegionCity from './me/createOrg/RegionCity';

// import MoviePlayer from "../common/components/MoviePlayer";

import TabBar from './TabBar';

const AddIcon = require('./images/Index-Login/work.png');
const TemplateIcon = require('./images/Index-Login/Template.png');
const TemplateFocusIcon = require('./images/Index-Login/Template_c.png');
const ReportIcon = require('./images/Index-Login/Report.png');
const ReportFocusIcon = require('./images/Index-Login/Report_c.png');
const DynamicIcon = require('./images/Index-Login/Dynamic.png');
const DynamicFocusIcon = require('./images/Index-Login/Dynamic_c.png');
const MeIcon = require('./images/Index-Login/Me.png');
const MeFocusIcon = require('./images/Index-Login/Me_c.png');

const TabContainer = createBottomTabNavigator(
  {
    Template: {
      screen: TemplateList,
      navigationOptions: {
        header: null,
        tabBarIcon: ({focused, tintColor}: any) => (
          <Image
            source={focused ? TemplateFocusIcon : TemplateIcon}
            style={{
              width: 20,
              height: 20,
              tintColor: tintColor,
              resizeMode: 'contain',
            }}
          />
        ),
      },
    },
    Data: {
      screen: DataInTemplateList,
      navigationOptions: {
        header: null,
        tabBarIcon: ({focused, tintColor}: any) => (
          <Image
            source={focused ? ReportFocusIcon : ReportIcon}
            style={{
              width: 20,
              height: 20,
              tintColor: tintColor,
              resizeMode: 'contain',
            }}
          />
        ),
      },
    },
    Work: {
      screen: AddScreen,
      navigationOptions: {
        header: null,
        tabBarIcon: ({focused, tintColor}: any) => (
          // <Icon name="plus-circle" size="md" color="#1e9dfc" />
          <Image
            source={AddIcon}
            style={{
              position: 'absolute',
              top: -25,
              width: 56,
              height: 56,
              tintColor: tintColor,
              resizeMode: 'contain',
            }}
          />
        ),
        tabBarComponent: (props: any) => {
          return <TabBar {...props} style={{borderTopColor: '#605F60'}} />;
        },
        tabBarVisible: false,
      },
    },
    Dynamic: {
      screen: DynamicList,
      navigationOptions: {
        header: null,
        tabBarIcon: ({focused, tintColor}: any) => (
          <Image
            source={focused ? DynamicFocusIcon : DynamicIcon}
            style={{
              width: 20,
              height: 20,
              tintColor: tintColor,
              resizeMode: 'contain',
            }}
          />
        ),
      },
    },
    Me: {
      screen: MeScreen,
      navigationOptions: {
        header: null,
        tabBarIcon: ({focused, tintColor}: any) => (
          <Image
            source={focused ? MeFocusIcon : MeIcon}
            style={{
              width: 20,
              height: 20,
              tintColor: tintColor,
              resizeMode: 'contain',
            }}
          />
        ),
      },
    },
  },
  {
    lazy: true,
    tabBarPosition: 'bottom',
    tabBarComponent: (props: any) => {
      return <TabBar {...props} style={{borderTopColor: '#605F60'}} />;
    },
    tabBarOptions: {
      activeTintColor: '#1e9dfc',
      inactiveTintColor: '#757575',
      showIcon: true,
      style: {
        backgroundColor: '#fff',
        borderWidth: 0,
      },
      indicatorStyle: {
        opacity: 0,
      },
      tabStyle: {
        padding: 0,
      },
    },
  },
);

// TabContainer.navigationOptions = ({ navigation }: any) => {
//   const { routeName } = navigation.state.routes[navigation.state.index];
//   return {
//     headerTitle: routeName
//   };
// };

const PersonalUserStack = createStackNavigator(
  {
    PersonalGuide: {screen: PersonalGuideScreen},
    CreateOrganization: {screen: CreateOrganization},
    Industry: {screen: Industry},
    Scale: {screen: Scale},
    SelectReseller: {screen: SelectReseller},
    SelectCountry: {screen: SelectCountry},
    RegionState: {screen: RegionState},
    RegionProvince: {screen: RegionProvince},
    RegionCity: {screen: RegionCity},
    AddOrganization: {screen: AddOrganization},
    InviteOrganization: {screen: InviteOrganization},
    SearchOrganization: {screen: SearchOrganization},
    AuthScanQRCode: {screen: ScanQRCode},
  },
  {
    mode: 'card',
    headerMode: 'none',
    // headerMode: "float"
    // headerMode: "screen",
    // navigationOptions: {
    //   headerStyle: {
    //     backgroundColor: "#3e9ce9"
    //   },
    //   headerTitleStyle: {
    //     color: "#fff",
    //     fontSize: 20
    //   },
    //   headerTintColor: "#fff",
    //   gesturesEnabled: false
    // },
    transitionConfig: () => ({
      transitionSpec: {
        duration: 300,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
      },
      screenInterpolator: (sceneProps: any) => {
        const {layout, position, scene} = sceneProps;
        const {index} = scene;

        // const height = layout.initHeight;
        // const translateY = position.interpolate({
        //   inputRange: [index - 1, index, index + 1],
        //   outputRange: [height, 0, 0]
        // });

        const width = layout.initWidth;
        const translateX = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [width, 0, 0],
        });
        const opacity = position.interpolate({
          inputRange: [index - 1, index - 0.99, index],
          outputRange: [0, 1, 1],
        });

        return {opacity, transform: [{translateX}]};
      },
    }),
  },
);

const AppStack = createStackNavigator(
  {
    Home: {
      screen: TabContainer,
      navigationOptions: {
        // header: null
      },
    },
    AccurateSearch: {screen: AccurateSearch},
    FuzzySearchAll: {screen: FuzzySearchAll},
    TemplatePreview: {screen: TemplatePreviewScreen},
    ReportList: {screen: ReportList},
    ReportPreview: {screen: ReportPreviewScreen},
    ApprovalProcess: {screen: ApprovalProcessScreen},
    MyTaskList: {screen: MyTaskList},
    CreateTemplate: {
      screen: CreateTemplateScreen,
      navigationOptions: {
        gesturesEnabled: false, // 禁止iOS侧滑返回
      },
    },
    RegulationScreen: {screen: RegulationScreen},
    TableRegulationScreen: {screen: TableRegulationScreen},
    SelectTemplate: {screen: SelectTemplateScreen},
    ShareTemplateByQRCode: {screen: ShareTemplateByQRCode},
    PlaceAutoComplete: {screen: PlaceAutoComplete},
    CollectData: {screen: CollectDataScreen},
    RadioField: {screen: RadioField},
    CheckField: {screen: CheckField},
    DepartmentSelect: {screen: DepartmentSelect},
    StaffSelect: {screen: StaffSelect},
    Maps: {screen: Maps},
    MapScreen: {screen: MapScreen},
    LinkedReportSelect: {screen: LinkedReportSelectScreen},
    SelectReport: {screen: SelectReportScreen},
    SystemTemplate: {screen: SystemTemplate},
    Profile: {screen: ProfileScreen},
    MyGroup: {screen: MyGroupScreen},
    CreateGroup: {screen: CreateGroup},
    EditGroup: {screen: EditGroupScreen},
    GroupName: {screen: GroupName},
    NickName: {screen: NickName},
    Gender: {screen: Gender},
    PhoneEdit: {screen: PhoneEditScreen},
    QRCode: {screen: QRCode},
    Message: {screen: MessageScreen},
    Settings: {screen: SettingsScreen},
    PasswordChange: {screen: PasswordChange},
    Invite: {screen: Invite},
    About: {screen: About},
    Feedback: {screen: Feedback},
    Help: {screen: Help},
    HelpDetail: {screen: HelpDetail},
    Friends: {screen: FriendsScreen},
    FriendInfo: {screen: FriendInfo},
    Organization: {screen: Organization},
    OrganizationStructure: {screen: OrganizationStructure},
    NameChange: {screen: NameChange},
    ScanQRCode: {screen: ScanQRCode},
    WebLogin: {screen: WebLogin},
  },
  {
    mode: 'card',
    headerMode: 'none',
    // headerMode: "float"
    // headerMode: "screen",
    // navigationOptions: {
    //   headerStyle: {
    //     backgroundColor: "#3e9ce9"
    //   },
    //   headerTitleStyle: {
    //     color: "#fff",
    //     fontSize: 20
    //   },
    //   headerTintColor: "#fff",
    //   gesturesEnabled: false
    // },
    transitionConfig: () => ({
      transitionSpec: {
        duration: 300,
        easing: Easing.out(Easing.poly(4)),
        timing: Animated.timing,
      },
      screenInterpolator: (sceneProps: any) => {
        const {layout, position, scene} = sceneProps;
        const {index} = scene;

        // const height = layout.initHeight;
        // const translateY = position.interpolate({
        //   inputRange: [index - 1, index, index + 1],
        //   outputRange: [height, 0, 0]
        // });

        const width = layout.initWidth;
        const translateX = position.interpolate({
          inputRange: [index - 1, index, index + 1],
          outputRange: [width, 0, 0],
        });
        const opacity = position.interpolate({
          inputRange: [index - 1, index - 0.99, index],
          outputRange: [0, 1, 1],
        });

        return {opacity, transform: [{translateX}]};
      },
    }),
  },
);

const AuthStack = createStackNavigator({
  Login: {
    screen: LoginScreen,
    navigationOptions: {
      header: null,
    },
  },
  SignUp: {
    screen: SignUpScreen,
    navigationOptions: {
      header: null,
    },
  },
  ForgetPassword: {
    screen: ForgetPasswordScreen,
    navigationOptions: {
      header: null,
    },
  },
  Agreement: {
    screen: Agreement,
    navigationOptions: {
      header: null,
    },
  },
});
// Now AppContainer is the main component for React to render

export default createAppContainer(
  createSwitchNavigator(
    {
      // TestComponent: TestComponent,
      AuthLoading: AuthLoadingScreen,
      App: AppStack,
      PersonalUser: PersonalUserStack,
      Auth: AuthStack,
    },
    {
      initialRouteName: 'AuthLoading',
    },
  ),
);
