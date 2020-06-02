import React, { Component } from "react";
import { connect } from "react-redux";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { TitleBarNew, ActionSheet } from "../../../common/components";
import {
  deviceWidth,
  uploadImage,
  API_v2,
  regTools,
  isNetworkConnected
} from "../../../common/utils";
import { FONT_FAMILY } from "../../../common/styles";
import ImagePicker from "react-native-image-picker";
import { sendfeedBack } from "../../../store/actions";
import { Toast } from "@ant-design/react-native";
import { regTypeConstants, toastTips } from "../../../common/constants";
import { ErrorMessage_Network_Offline } from "../../../env";
interface State {
  FeedbackInfo: string;
  ContactInfo: string;
  Picture: Array<string>;
  Image: Array<string>;
  visible: boolean;
}
interface Props {
  navigation: any;
  currentUserInfo: any;
  sendfeedBack: (
    authToken: string,
    options: {
      description: string;
      images: Array<string>;
      email: string;
    },
    callback: Function
  ) => void;
}

const AddIcon = require("../../images/Me/addphoto.png");
const DeleteIcon = require("../../images/Me/feedback_close.png");

export class Feedback extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      FeedbackInfo: "",
      ContactInfo: "",
      Picture: [],
      Image: [],
      visible: false
    };
  }

  changeFeedbackInfo = (text: string) => {
    if (text.length > 200) {
      return;
    } else {
      this.setState({
        FeedbackInfo: text
      });
    }
  };

  changeContactInfo = (text: string) => {
    this.setState({
      ContactInfo: text
    });
  };

  handleConfirm = () => {
    // todo
    let { authToken } = this.props.currentUserInfo;
    let { navigation } = this.props;
    let { FeedbackInfo, Image, ContactInfo } = this.state;
    if (FeedbackInfo === "") {
      Toast.fail("Please input feedback", 2, undefined, false);
      return;
    }
    if (ContactInfo && !regTools(ContactInfo, regTypeConstants.EMAIL)) {
      Toast.fail(toastTips.MailError, 2, undefined, false);
      return;
    }
    let options = {
      description: FeedbackInfo,
      images: Image,
      email: ContactInfo
    };
    this.props.sendfeedBack(authToken, options, () => navigation.goBack());
  };

  handleCamera = () => {
    let { Picture, Image } = this.state;
    const { currentUserInfo } = this.props;
    isNetworkConnected()
      .then(isConnected => {
        if (isConnected) {
          const options: any = {
            title: "Choose Image",
            cancelButtonTitle: "Cancel",
            takePhotoButtonTitle: "Take Photo",
            chooseFromLibraryButtonTitle: "Choose from Gallery",
            cameraType: "back",
            mediaType: "photo",
            // maxWidth: 300,
            // maxHeight: 300,
            quality: 0.8,
            angle: 0,
            allowsEditing: false,
            noData: true,
            storageOptions: {
              skipBackup: true,
              path: "data2goImages"
            }
          };
          ImagePicker.launchCamera(options, (response: any) => {
            console.log("Response = ", response);

            if (response.didCancel) {
              console.log("User cancelled image picker");
            } else if (response.error) {
              console.log("ImagePicker Error: ", response.error);
            } else if (response.customButton) {
              console.log("User tapped custom button: ", response.customButton);
            } else {
              if (response.fileSize / 1024 / 1024 > 5) {
                Toast.fail(
                  "Images cannot be larger than 100M",
                  2,
                  undefined,
                  false
                );
              } else {
                uploadImage(
                  API_v2.uploadFile,
                  [response.uri],
                  currentUserInfo.authToken
                ).then((res: any) => {
                  console.log("Response =---- ", res);
                  if (res.result === "Success") {
                    Picture.push(response.uri);
                    Image.push(res.data[0]);
                    this.setState({
                      Picture,
                      Image
                    });
                  }
                });
              }
            }
          });
          this.setState({
            visible: false
          });
        } else {
          Toast.offline(ErrorMessage_Network_Offline, 2);
          return { RCode: -1, RMsg: ErrorMessage_Network_Offline };
        }
      })
      .catch(() => {
        Toast.offline(ErrorMessage_Network_Offline, 2);
        return { RCode: -1, RMsg: ErrorMessage_Network_Offline };
      });
  };

  handleLibrary = () => {
    let { Picture, Image } = this.state;
    const { currentUserInfo } = this.props;
    isNetworkConnected()
      .then(isConnected => {
        if (isConnected) {
          const options: any = {
            title: "Choose Image",
            cancelButtonTitle: "Cancel",
            takePhotoButtonTitle: "Take Photo",
            chooseFromLibraryButtonTitle: "Choose from Gallery",
            cameraType: "back",
            mediaType: "photo",
            // maxWidth: 300,
            // maxHeight: 300,
            quality: 0.8,
            angle: 0,
            allowsEditing: false,
            noData: true,
            storageOptions: {
              skipBackup: true,
              path: "data2goImages"
            }
          };
          ImagePicker.launchImageLibrary(options, (response: any) => {
            console.log("Response = ", response);

            if (response.didCancel) {
              console.log("User cancelled image picker");
            } else if (response.error) {
              console.log("ImagePicker Error: ", response.error);
            } else if (response.customButton) {
              console.log("User tapped custom button: ", response.customButton);
            } else {
              if (response.fileSize / 1024 / 1024 > 5) {
                Toast.fail(
                  "Images cannot be larger than 100M",
                  2,
                  undefined,
                  false
                );
              } else {
                uploadImage(
                  API_v2.uploadFile,
                  [response.uri],
                  currentUserInfo.authToken
                ).then((res: any) => {
                  // console.log("Response =---- ", res);
                  if (res.result === "Success") {
                    Picture.push(response.uri);
                    Image.push(res.data[0]);
                    this.setState({
                      Picture,
                      Image
                    });
                  }
                });
              }
            }
          });
          this.setState({
            visible: false
          });
        } else {
          Toast.offline(ErrorMessage_Network_Offline, 2);
          return { RCode: -1, RMsg: ErrorMessage_Network_Offline };
        }
      })
      .catch(() => {
        Toast.offline(ErrorMessage_Network_Offline, 2);
        return { RCode: -1, RMsg: ErrorMessage_Network_Offline };
      });
  };

  deletePicture = (item: string) => {
    const { Picture } = this.state;
    this.setState({
      Picture: Picture.filter(PictureItem => PictureItem !== item)
    });
  };

  renderFeebackdInfo = () => {
    const { FeedbackInfo, Picture } = this.state;

    const ImagePicker = (
      <TouchableOpacity onPress={() => this.setState({ visible: true })}>
        <Image style={styles.image} source={AddIcon} />
      </TouchableOpacity>
    );

    return (
      <View style={styles.feedbackStyle}>
        <View style={{ height: 82 }}>
          <TextInput
            value={FeedbackInfo}
            multiline={true}
            style={styles.feedbackInput}
            numberOfLines={2}
            placeholder="Please fill in more than 10 words of the problem description so that we can provide better help"
            onChangeText={this.changeFeedbackInfo}
          />
        </View>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Text style={styles.remarkStyle}>{FeedbackInfo.length + "/200"}</Text>
        </View>
        <View style={{ flexDirection: "row" }}>
          {Picture.map(item => (
            <View key={item}>
              <Image style={styles.image} source={{ uri: item }} />
              <TouchableOpacity
                style={{
                  position: "absolute",
                  right: 3,
                  top: -5
                }}
                onPress={() => this.deletePicture(item)}
              >
                <Image style={styles.deleteIcon} source={DeleteIcon} />
              </TouchableOpacity>
            </View>
          ))}
          {Picture.length < 4 ? ImagePicker : null}
        </View>
        <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
          <Text style={styles.remarkStyle}>{Picture.length + "/4"}</Text>
        </View>
      </View>
    );
  };

  render() {
    let { navigation } = this.props;
    return (
      <View style={{ flex: 1 }}>
        <TitleBarNew title={"Feedback"} navigation={navigation} />
        <ScrollView style={styles.normal}>
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
            }}
          >
            <View style={{ flex: 1, alignItems: "center" }}>
              <View style={styles.inputWrapper}>
                <Text style={styles.titleStyle}>Feedback information</Text>
                {this.renderFeebackdInfo()}
                <Text style={styles.titleStyle}>Contact information</Text>
                <View style={styles.contactInfoWrapper}>
                  <TextInput
                    value={this.state.ContactInfo}
                    style={styles.contactInfoInput}
                    placeholder="Please leave your email."
                    onChangeText={this.changeContactInfo}
                    // allowFontScaling={false}
                  />
                </View>
              </View>
              <TouchableOpacity
                style={{ marginTop: 65 }}
                onPress={this.handleConfirm}
              >
                <View style={styles.confirmStyle}>
                  <Text style={styles.confirmText}>Submit</Text>
                </View>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
        <ActionSheet
          visible={this.state.visible}
          onClose={() => {
            this.setState({
              visible: false
            });
          }}
          selections={["Take a photo", "Select from the album"]}
          functions={[this.handleCamera, this.handleLibrary]}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  normal: {
    flex: 1,
    backgroundColor: "#F2F2F2"
  },
  inputWrapper: {
    width: deviceWidth - 34
  },
  titleStyle: {
    fontSize: 16,
    color: "#2E2E2E",
    marginTop: 14,
    marginBottom: 13
  },
  feedbackStyle: {
    width: deviceWidth - 34,
    height: 238,
    paddingTop: 14,
    paddingBottom: 13,
    paddingLeft: 17,
    paddingRight: 17,
    borderRadius: 3,
    backgroundColor: "#FFFFFF"
  },
  feedbackInput: {
    padding: 0,
    textAlignVertical: "top",
    fontSize: 14
  },
  remarkStyle: {
    // position: "relative",
    fontSize: 14,
    color: "#CCCCCC",
    marginTop: 13
  },
  imageWrapper: {},
  image: {
    width: 67,
    height: 67,
    marginRight: 8,
    // borderWidth: 1,
    // borderRadius: 3,
    borderColor: "#CCCCCC",
    // borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center"
  },
  deleteIcon: {
    width: 16,
    height: 16
  },
  contactInfoWrapper: {
    width: "100%",
    height: 47,
    borderRadius: 3,
    // paddingTop: 16,
    // paddingBottom: 16,
    justifyContent: "center",
    paddingLeft: 13,
    paddingRight: 13,
    backgroundColor: "#FFFFFF"
  },
  contactInfoInput: {
    padding: 0,
    fontSize: 14
  },
  confirmStyle: {
    width: deviceWidth - 34,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1E9DFC",
    alignItems: "center",
    justifyContent: "center"
  },
  confirmText: {
    fontSize: 16,
    color: "#FFFEFE"
  }
});
const mapStateToProps = (state: any) => {
  return {
    currentUserInfo: state.loginInfo.currentUserInfo
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    sendfeedBack: (
      authToken: string,
      options: {
        description: string;
        images: Array<string>;
        email: string;
      },
      callback: Function
    ) => dispatch(sendfeedBack(authToken, options, callback))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Feedback);
