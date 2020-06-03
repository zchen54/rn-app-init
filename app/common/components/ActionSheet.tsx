import React, {Component} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {Modal} from '@ant-design/react-native';
import {
  getIn,
  API_v2,
  requestApiV2,
  deviceWidth,
  randomTemplateColor,
  isFullScreen,
  isIphoneX,
  isIphoneXsMax,
} from '../utils';
import {DColors} from '../styles';

interface ActionType {
  text: string;
  color?: string;
  onPress: () => void;
}

interface State {}
interface Props {
  title?: string;
  visible: boolean;
  onClose: () => void;
  actions: Array<ActionType>;
}

export class ActionSheet extends Component<Props, State> {
  render() {
    const {title, visible, onClose, actions} = this.props;
    return (
      <Modal
        popup
        visible={visible}
        animationType="slide-up"
        maskClosable={true}
        onClose={onClose}
        style={{backgroundColor: 'rgba(0,0,0,0)'}}>
        <View style={styles.modalSelectWrap}>
          {title ? (
            <View style={styles.modalTitleRow}>
              <Text style={{fontSize: 14, color: '#757575'}}>{title}</Text>
            </View>
          ) : null}
          {actions.map((action: ActionType) => (
            <TouchableOpacity
              key={action.text}
              onPress={() => {
                onClose();
                action.onPress();
              }}
              style={styles.modalSelectRow}>
              <Text
                style={{
                  fontSize: 18,
                  color: action.color ? action.color : DColors.mainColor,
                }}>
                {action.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity onPress={onClose} style={styles.modalCancelRow}>
          <Text style={{fontSize: 18, color: DColors.mainColor}}>Cancel</Text>
        </TouchableOpacity>
        {isIphoneX() || isIphoneXsMax() ? <View style={{height: 30}} /> : null}
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  modalSelectWrap: {
    width: deviceWidth - 12,
    marginHorizontal: 6,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  modalTitleRow: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  modalCancelRow: {
    width: deviceWidth - 12,
    height: 50,
    marginHorizontal: 6,
    marginBottom: 6,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalSelectRow: {
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f9f9f9',
  },
});
