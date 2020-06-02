import React, { Component } from "react";
import { connect } from "react-redux";
import { View, StyleSheet, Text, Image } from "react-native";
import { TitleBarNew } from "../../common/components";
import { deviceWidth, randomTemplateColor } from "../../common/utils";
import QRCode from "react-native-qrcode-svg";
import { FONT_FAMILY } from "../../common/styles";
import { serverURL } from "../../env";
import moment from "moment";
import {
  FieldType,
  SectionType,
  TemplateType,
  ModelType,
  TableFieldType,
  commonObj,
  newTemplate,
  newSection
} from "../../common/constants/ModeTypes";

interface State {}
interface Props {
  navigation: any;
  editingTemplate: ModelType & TemplateType;
}
const Page = {
  font_family: FONT_FAMILY
};

export class ShareTemplateByQRCode extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const { navigation, editingTemplate } = this.props;
    const baseUrl = serverURL.replace("/api/", "");
    const templateId = navigation.getParam("templateId");
    const templateName = navigation.getParam("templateName");
    const templateColor = navigation.getParam("templateColor");
    const companyName = navigation.getParam("companyName");

    const QRUrl = `${baseUrl}/reportEdit/qr_user/${templateId}`;

    return (
      <View style={styles.normal}>
        <TitleBarNew title="Share Template" navigation={navigation} />
        <View style={styles.codeWrapper}>
          <View style={styles.topContainer}>
            <View
              style={{
                ...styles.Avatar,
                backgroundColor: templateColor
                  ? templateColor
                  : randomTemplateColor()
              }}
            ></View>
            <View style={styles.userInfo}>
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={styles.usernameStyle}
              >
                {templateName}
              </Text>
              <Text style={styles.infoTextStyle} numberOfLines={1}>
                {companyName}
                {/* {moment(editingTemplate.createdAt).format("MMM D, YYYY HH:mm")} */}
              </Text>
            </View>
          </View>
          <View style={styles.QRCodeStyle}>
            <QRCode size={220} value={QRUrl} color="#1EABFC" logoSize={40} />
          </View>
          <Text style={styles.remarkText}>
            Scan QR Code to fill in the data.
          </Text>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    alignItems: "center"
  },
  codeWrapper: {
    width: deviceWidth - 32,
    height: 400,
    marginTop: 50,
    backgroundColor: "#FFFFFF",
    flexDirection: "column",
    alignItems: "center"
  },
  topContainer: {
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 22
  },
  Avatar: {
    width: 54,
    height: 54,
    borderRadius: 6
  },
  userInfo: {
    width: deviceWidth - 145
  },
  usernameStyle: {
    fontFamily: Page.font_family,
    marginTop: 5,
    fontSize: 18,
    lineHeight: 20,
    color: "#2E2E2E"
  },
  infoTextStyle: {
    fontSize: 12,
    marginTop: 5,
    color: "#2E2E2E"
  },
  QRCodeStyle: {
    width: 220,
    height: 220,
    marginTop: 28
  },
  remarkText: {
    color: "#757575",
    fontSize: 14,
    marginTop: 20
  }
});

const mapStateToProps = (state: any) => {
  return {
    editingTemplate: state.template.editingTemplate
  };
};

export default connect(mapStateToProps)(ShareTemplateByQRCode);
