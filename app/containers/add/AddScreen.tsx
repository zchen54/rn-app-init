import React, {Component} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import {DColors, DFontSize, FONT_FAMILY} from '../../common/styles';
import {
  setSize, // 设置宽高
  deviceHeight, // 设备高度
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
  isFullScreen,
  isIphoneX,
  isIphoneXsMax,
} from '../../common/utils';
import moment from 'moment';
import {store} from '../../store';
import {Icon, Button} from '@ant-design/react-native';
import {
  clearEditingTemplate,
  clearEditingField,
  clearEditingReport,
} from '../../store/actions';

const NewTempIcon = require('../images/Index-Login/Work_New.png');
const EditTempIcon = require('../images/Index-Login/Work_Tedit.png');
const CopyTempIcon = require('../images/Index-Login/Work_Tcopy.png');
const CollectDataIcon = require('../images/Index-Login/Work_Collect.png');
const EditDataIcon = require('../images/Index-Login/Work_Dedit.png');
const CopyDataIcon = require('../images/Index-Login/Work_Dcopy.png');
const CloseIcon = require('../images/Index-Login/Close.png');
const tipsBg = require('../images/Index-Login/work_bg.png');
const AddPage = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor,
  font_size: DFontSize.c1,
  closeColor: DColors.content,
};

interface State {}
interface Props {
  navigation: any;
  onClose: Function;
}

export class AddScreen extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  componentWillMount() {
    store.dispatch(clearEditingTemplate());
    store.dispatch(clearEditingField());
    store.dispatch(clearEditingReport());
  }

  componentWillReceiveProps() {
    store.dispatch(clearEditingTemplate());
    store.dispatch(clearEditingField());
    store.dispatch(clearEditingReport());
  }

  render() {
    let {navigation} = this.props;
    const currentHour = parseInt(moment().format('H')) || null;
    const greeting = currentHour
      ? currentHour >= 0 && currentHour < 12
        ? 'Good Morning!'
        : currentHour >= 12 && currentHour < 18
        ? 'Good Afternoon!'
        : currentHour >= 18 && currentHour <= 23
        ? 'Good evening!'
        : ''
      : '';
    return (
      <View style={styles.container}>
        <View
          style={
            isIphoneX() || isIphoneXsMax()
              ? {...styles.controller, height: deviceHeight - 60}
              : styles.controller
          }>
          <View style={styles.middleContainer}>
            <View>
              <Text
                style={{textAlign: 'center', fontSize: 26, color: '#1E9DFC'}}>
                {greeting}
              </Text>
            </View>
            <View style={styles.tipsWrap}>
              <View style={styles.tips}>
                <Image style={{width: 333, height: 67}} source={tipsBg} />
                <View style={styles.tipsTextWrap}>
                  <View>
                    <Text style={styles.tipsText}>
                      What do you want to do today?
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.tipsText}>
                      Select a Shortcut below to start.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.boxRow}>
              <Text style={styles.rowName}>Template</Text>
              <TouchableOpacity
                style={styles.Item}
                onPress={() => {
                  this.props.onClose();
                  navigation.navigate('CreateTemplate', {
                    type: 'Create',
                  });
                }}>
                <View>
                  <Image style={styles.image} source={NewTempIcon} />
                </View>
                <Text style={styles.title}>New</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.Item}
                onPress={() => {
                  this.props.onClose();
                  navigation.navigate('SelectTemplate', {
                    title: 'Select A Template',
                    action: 'editTemplate',
                  });
                }}>
                <View>
                  <Image style={styles.image} source={EditTempIcon} />
                </View>
                <Text style={styles.title}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.Item}
                onPress={() => {
                  this.props.onClose();
                  navigation.navigate('SelectTemplate', {
                    title: 'Copy A Template',
                    action: 'copyTemplate',
                  });
                }}>
                <View>
                  <Image style={styles.image} source={CopyTempIcon} />
                </View>
                <Text style={styles.title}>Copy</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.boxRow}>
              <Text style={styles.rowName}>Data</Text>
              <TouchableOpacity
                style={styles.Item}
                onPress={() => {
                  this.props.onClose();
                  navigation.navigate('SelectTemplate', {
                    title: 'Select A Template',
                    action: 'collectData',
                  });
                }}>
                <View>
                  <Image style={styles.image} source={CollectDataIcon} />
                </View>
                <Text style={styles.title}>Collect</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.Item}
                onPress={() => {
                  this.props.onClose();
                  navigation.navigate('SelectReport', {
                    action: 'editData',
                  });
                }}>
                <View>
                  <Image style={styles.image} source={EditDataIcon} />
                </View>
                <Text style={styles.title}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.Item}
                onPress={() => {
                  this.props.onClose();
                  navigation.navigate('SelectReport', {
                    action: 'copyData',
                  });
                }}>
                <View>
                  <Image style={styles.image} source={CopyDataIcon} />
                </View>
                <Text style={styles.title}>Copy</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.closeWrapper}>
            <TouchableOpacity
              onPress={() => {
                this.props.onClose();
              }}
              activeOpacity={1}
              style={
                isIphoneX() || isIphoneXsMax()
                  ? {...styles.close, marginBottom: 60}
                  : styles.close
              }>
              <Image style={styles.closeImage} source={CloseIcon} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: deviceHeight,
  },
  tipsWrap: {
    height: 76,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tips: {
    width: 333,
    height: 67,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipsTextWrap: {
    position: 'absolute',
    top: 8,
    left: 20,
    width: 330,
    height: 50,
  },
  tipsText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  controller: {
    width: deviceWidth,
    height: deviceHeight - 20,
    position: 'absolute',
    left: 0,
    bottom: 0,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    // borderWidth: 1,
    // borderColor: "red"
  },
  middleContainer: {
    flex: 1,
    paddingBottom: 10,
    flexDirection: 'column',
    justifyContent: 'space-around',
    // borderWidth: 1,
    // borderColor: "green"
  },
  boxRow: {
    marginVertical: 15,
    marginHorizontal: 26,
    paddingHorizontal: 10,
    paddingVertical: 33,
    borderWidth: 2,
    borderColor: '#72C3FF',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rowName: {
    height: 30,
    paddingHorizontal: 16,
    position: 'absolute',
    left: 20,
    top: -18,
    backgroundColor: '#fff',
    fontSize: 18,
    color: '#1E9DFC',
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    textAlignVertical: 'center',
    ...Platform.select({
      ios: {
        lineHeight: 30,
      },
      android: {},
    }),
  },
  Item: {
    width: 80,
    alignItems: 'center',
  },
  title: {
    fontSize: DFontSize.a3,
    color: DColors.title,
    marginTop: 10,
  },
  closeWrapper: {
    alignItems: 'center',
    // borderWidth: 1,
    // borderColor: "blue"
  },
  close: {
    marginBottom: 35,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 54,
    height: 54,
  },
  closeImage: {
    width: 14,
    height: 14,
  },
});
