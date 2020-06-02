import React from "react";
import { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SectionList,
  Image,
  TouchableOpacity,
  StatusBar,
  TextStyle,
  Keyboard
} from "react-native";
import {
  setSize, // 设置宽高
  deviceHeight, // 设备高度
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
  statusBarHeight,
  getIn,
  backgroundColorEnum
} from "../../common/utils";
import { NetworkStateBar, TitleBarNew } from "../../common/components";
import {
  fetchSystemTemplates,
  previewTemplate,
  addSystemTemplateToCompany
} from "../../store/actions";
import { DColors, DFontSize, FONT_FAMILY } from "../../common/styles";
import moment from "moment";
import { toastTips } from "../../common/constants";
import { Toast, Modal } from "@ant-design/react-native";
import { formatServiceReportToLocal } from "./../../store/sagas/report";
import { Action } from "@ant-design/react-native/lib/modal/PropsType";
import {
  TemplateType,
  ModelType,
  ReportType
} from "../../common/constants/ModeTypes";
import { SystemTemplateList, TemplateItem } from "./components";

interface State {
  hadFetch: boolean;
  refreshing: boolean;
}
interface Props {
  navigation: any;
  authToken: string;
  templates: Array<ModelType & TemplateType>;
  companyTemplates: Array<ModelType & TemplateType>;
  systemTemplates: Array<ModelType & TemplateType>;
  dispatch: Function;
}
const Page = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor,
  titleColor: DColors.title,
  templateMargin: 8
};
const Icon = {
  headerImageIcon: require("../images/Me/Portrait.png"),
  blankpage3: require("../images/template/blankpage3.png")
};

export class SystemTemplate extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hadFetch: false,
      refreshing: false
    };
  }

  componentWillMount() {}

  componentWillReceiveProps(nextProps: Props) {
    this.handleFetchList(nextProps);
  }

  handleFetchList = (props: Props, refresh = false) => {
    const { authToken, systemTemplates } = props;
    const { hadFetch } = this.state;
    if ((!hadFetch && !systemTemplates.length) || refresh) {
      this.setState({ hadFetch: true, refreshing: true });
      this.props.dispatch(
        fetchSystemTemplates(authToken, () => {
          this.setState({ refreshing: false });
        })
      );
    } else {
      this.setState({ refreshing: false });
    }
  };

  handlePreviewSystemTemplate = (templateItem: any) => {
    this.props.dispatch(
      previewTemplate({
        ...templateItem
      })
    );
    this.props.navigation.navigate("TemplatePreview", {
      isSystemTemplate: true
    });
  };

  render() {
    const { systemTemplates, navigation } = this.props;
    const { refreshing } = this.state;

    return (
      <View style={styles.normal}>
        <TitleBarNew title={"System Template"} navigation={navigation} />
        <NetworkStateBar></NetworkStateBar>
        <SystemTemplateList
          refreshing={refreshing}
          systemTemplates={systemTemplates}
          handleFetchList={() => {
            this.handleFetchList(this.props, true);
          }}
          handlePreviewSystemTemplate={(templateItem: any) => {
            this.handlePreviewSystemTemplate(templateItem);
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: "#f2f2f2"
  }
});

const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
    templates: state.template.templates,
    companyTemplates: state.template.companyTemplates,
    systemTemplates: state.template.systemTemplates
  };
};

export default connect(mapStateToProps)(SystemTemplate);
