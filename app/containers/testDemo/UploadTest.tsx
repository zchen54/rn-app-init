// import React from "react";
// import { Component } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   StatusBar,
//   Image,
//   ScrollView
// } from "react-native";
// import { DImagePicker } from "../../common/components";
// import { DColors, DFontSize, FONT_FAMILY } from "../../common/styles";
// import {
//   uploadImage,
//   API_v2,
//   statusBarHeight,
//   setSize, // 设置宽高
//   deviceHeight, // 设备高度
//   deviceWidth, // 设备宽度
//   setSizeWithPx // 设置字体 px 转 dp
// } from "../../common/utils";
// import { Icon, InputItem, Button, Toast, Tabs } from "@ant-design/react-native";

// interface State {
//   imageSource: string;
//   imagesList: Array<string>;
// }
// interface Props {
//   navigation: any;
// }

// export default class UploadTest extends Component<Props, State> {
//   constructor(props: Props) {
//     super(props);
//     this.state = {
//       imageSource: "",
//       imagesList: []
//     };
//   }

//   _handleSelectImage = (uri: any, response: any) => {
//     console.log("_handleSelectImage", uri, response);
//     this.setState({
//       imageSource: uri
//     });
//   };

//   _handleUpload = () => {
//     const { imageSource } = this.state;

//     let filePathList = imageSource.split(",");

//     uploadImage(API_v2.uploadFile, filePathList)
//       .then((res: any) => {
//         console.log("upload success", res);
//         if (res.result === "Success") {
//           this.setState({ imagesList: res.data });
//         }
//       })
//       .catch(err => {
//         console.error("uploadImage", err.message);
//       });
//   };

//   render() {
//     const { imageSource, imagesList } = this.state;
//     const sourceArr = imageSource !== "" ? imageSource.split(",") : [];
//     console.log("render ---", sourceArr);

//     return (
//       <ScrollView style={styles.container}>
//         <Text style={{ fontSize: 20, marginBottom: 20 }}>
//           Upload Images Demo
//         </Text>
//         <DImagePicker
//           pickerStyle={{ borderWidth: 1, borderColor: "blue" }}
//           source={imageSource}
//           handleSelect={this._handleSelectImage}
//         />
//         <View
//           style={{ marginTop: 20, paddingHorizontal: 20, paddingVertical: 20 }}
//         >
//           {sourceArr.length ? (
//             sourceArr.map(item => <Text key={item}>{item}</Text>)
//           ) : (
//             <Text>Select: 0</Text>
//           )}
//         </View>
//         <Button onPress={this._handleUpload}>Upload</Button>
//         <View
//           style={{
//             flexDirection: "row",
//             flexWrap: "wrap"
//           }}
//         >
//           {imagesList.map((url: any) => (
//             <Image
//               key={url}
//               source={{ uri: url }}
//               style={{
//                 marginHorizontal: 10,
//                 marginVertical: 10,
//                 width: setSizeWithPx(240),
//                 height: setSizeWithPx(240)
//               }}
//             />
//           ))}
//         </View>
//         <View
//           style={{ marginTop: 20, paddingHorizontal: 20, paddingVertical: 20 }}
//         >
//           {imagesList.length ? (
//             imagesList.map(item => <Text key={item}>{item}</Text>)
//           ) : (
//             <Text>Uploaded: 0</Text>
//           )}
//         </View>
//       </ScrollView>
//     );
//   }
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingVertical: 20
//   }
// });
