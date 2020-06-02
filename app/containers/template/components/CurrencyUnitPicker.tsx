import React, {Component, useState, useEffect} from 'react';
import {StyleSheet, View, Text, TouchableOpacity, FlatList} from 'react-native';
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
  deviceHeight,
} from '../../../common/utils';
import {DColors} from '../../../common/styles';
import {currencyUnit} from './currencyUnit';

interface Props {
  title?: string;
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
  authToken: string;
}

export function CurrencyUnitPicker(props: Props) {
  const [unitList, setUnitList] = useState([]);

  const {title, visible, onClose, onSelect, authToken} = props;

  useEffect(() => {
    handleFetchList();
  }, []);

  const handleFetchList = async () => {
    if (Array.isArray(currencyUnit)) {
      const tempArr: any = currencyUnit.map((item: any) => ({
        text: `${item.code}(${item.symbol}) - ${item.name}`,
        value: `${item.symbol},${item.code},${item.name}`,
      }));
      setUnitList(tempArr);
    }
  };

  const _renderItem = (data: any) => {
    const {index, item} = data;
    return (
      <TouchableOpacity
        onPress={() => {
          onSelect(item.value);
          onClose();
        }}
        style={styles.modalSelectRow}>
        <Text style={{fontSize: 16, color: '#666'}}>{item.text}</Text>
      </TouchableOpacity>
    );
  };
  return (
    <Modal
      popup
      visible={visible}
      animationType="slide-up"
      maskClosable={true}
      onClose={onClose}>
      <View style={styles.modalTitleRow}>
        <TouchableOpacity onPress={onClose} style={styles.modalCancelButton}>
          <Text style={{fontSize: 18, color: DColors.mainColor}}>Cancel</Text>
        </TouchableOpacity>
        {title ? (
          <Text style={{fontSize: 16, color: '#666'}}>{title}</Text>
        ) : null}
      </View>
      <FlatList
        showsVerticalScrollIndicator={true}
        data={unitList}
        contentContainerStyle={{}}
        renderItem={(sectionItem: any) => _renderItem(sectionItem)}
        keyExtractor={(item: any, index: number) => item.value}
        extraData={unitList}
        style={styles.modalSelectWrap}
      />
      {isIphoneX() || isIphoneXsMax() ? <View style={{height: 30}} /> : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalSelectWrap: {
    height: deviceHeight * 0.6,
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
  modalCancelButton: {
    position: 'absolute',
    top: 8,
    left: 16,
    fontSize: 14,
  },
  modalSelectRow: {
    minHeight: 40,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#f9f9f9',
  },
});
