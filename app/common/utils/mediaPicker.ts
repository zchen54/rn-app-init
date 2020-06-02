import ImagePicker from "react-native-image-crop-picker";

/**
 *  https://github.com/ivpusic/react-native-image-crop-picker
 * @param selectType "gallery" or "camera"
 * @param reqObj
 */
export function mediaPicker(
  options: { selectType: string; reqObj: any },
  callback?: Function
) {
  let { selectType, reqObj } = options;
  if (selectType === "gallery") {
    ImagePicker.openPicker(reqObj).then(res => {
      console.log(res);
      if (callback) {
        callback(res);
      }
    });
  } else if (selectType === "camera") {
    ImagePicker.openCamera(reqObj).then(res => {
      console.log(res);
      if (callback) {
        callback(res);
      }
    });
  }
}
