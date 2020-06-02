## Run

```
yarn
yarn run android
// or
yarn run ios
```

---

## Android -> Generating the release APK

> 测试环境

```
  cd android
  ./gradlew clean
  cd ..
  npx jetify
  cd android
  ./gradlew assembleBeta
  // .apk will output at ./android/app/build/outputs/apk/beta

  // App Center code push
  appcenter codepush release-react -a Allsworth-ZhuChen/Data2Go-android --description '更新日志'
```

> 生产环境

```
  // ./android/app/build.gradle
  versionCode [like 1, 2, 3, 4 and Automatic incremental]
  versionName [like 1.0 | 2.0 for Major update, 1.1 | 1.2 for Minor update, 1.0.1 | 1.0.2 for Debug]

  cd android
  ./gradlew clean
  cd ..
  npx jetify
  cd android
  ./gradlew assembleRelease
  // .apk will output at ./android/app/build/outputs/apk/release

  // App Center code push
  appcenter codepush release-react -a Allsworth-ZhuChen/Data2Go-android -d Production --description '更新日志'

  // Use Android App Bundle for Google Play
  ./gradlew bundleRelease
  // .aab will output at ./android/app/build/outputs/bundle/release
```

---

## iOS -> Archive and Distribute

> 测试版

```
// ./app/env.ts
  export const releaseMode = false;

// Xcode -> target -> General -> Identity
//    Display Name: Data2Go-Beta
//    Bundle Identifier: com.Seacos.Data2Go.test
//    CodePushDeploymentKey: gYBzTn3BcoDNnk_-ngS950L6UUfjc_YheO5xe

  yarn run bundle-ios

// Xcode -> Product -> Clean Build Folder
// Xcode -> Product -> Archive
// Xcode -> Distribute App -> Ad Hoc -> continue next until success -> Export ipa
```

> 发布版

```
// ./app/env.ts
  export const releaseMode = true;

// Xcode -> target -> General -> Identity
//    Display Name: Data2Go
//    Bundle Identifier: com.Seacos.Data2Go
//    Version: [like 1.0 | 2.0 for Major update, 1.1 | 1.2 for Minor update, 1.0.1 | 1.0.2 for Debug]
//    Build: [like 1, 2, 3, 4 and Automatic incremental]
//    CodePushDeploymentKey: 3bd_C15V7ia_g3yZIZKWcEpX1XsGsbBkxGjug

  yarn run bundle-ios

// Xcode -> Product -> Clean Build Folder
// Xcode -> Product -> Archive
// Xcode -> Validate App -> continue next until success
// Xcode -> Distribute App -> iOS App Store -> continue next until success -> Upload
```

---

## Docs

- > [TypeScript](https://www.tslang.cn/docs/home.html)

- > [React Native](https://facebook.github.io/react-native/docs/getting-started)

- > [React Navigation](https://reactnavigation.org/docs/en/api-reference.html)

- > [Ant Design Mobile RN](https://rn.mobile.ant.design/docs/react/introduce-cn)

- > [Redux Sage](https://redux-saga-in-chinese.js.org/)

- > [react-native-modal-datetime-picker](https://github.com/mmazzarolo/react-native-modal-datetime-picker)

- > [react-native-image-picker](https://github.com/react-native-community/react-native-image-picker)

- > [react-native-storage](https://github.com/sunnylqm/react-native-storage)

- > [react-native-video](https://github.com/react-native-community/react-native-video)

- > [react-native-orientation](https://github.com/yamill/react-native-orientation)

- > [react-native-image-viewer](https://github.com/ascoders/react-native-image-viewer)

- > [react-native-signature-capture](https://github.com/RepairShopr/react-native-signature-capture)

---

## Demo

- Generate uuid

```
import uuidv1 from "uuid/v1";
let newUUID = uuidv1();
```
