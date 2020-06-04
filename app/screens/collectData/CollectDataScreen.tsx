import React, {useState, useEffect} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  BackHandler,
  ScrollView,
} from 'react-native';
import {Toast, Icon, Modal, Button} from '@ant-design/react-native';
import {openActionSheet} from '../../store/actions';
import {deviceWidth} from '../../common/utils';
import {
  SingleImagePicker,
  MultipleImagePicker,
  VideoPicker,
  MultipleVideoPicker,
  SignaturePad,
} from '../../common/components';

const FormItem = (props: any) => {
  const {label, children} = props;
  return (
    <View style={styles.formItem}>
      <Text style={styles.formLabel}>{label}</Text>
      <View style={styles.formItemBody}>{children}</View>
    </View>
  );
};

interface Props {
  dispatch: any;
}

interface FormData {
  singleImgSource: string;
  multipleImgSource: string;
  singleVideoSource: string;
  multipleVideoSource: string;
  signatureSource: string;
}
const initFormData: FormData = {
  singleImgSource: '',
  multipleImgSource: '',
  singleVideoSource: '',
  multipleVideoSource: '',
  signatureSource: '',
};

const CollectDataScreen = (props: Props) => {
  const {dispatch} = props;

  const [formData, setFormData] = useState(initFormData);

  const actionsMock = [
    {
      text: 'Share',
      onPress: () => {
        console.log('press share');
      },
    },
    {
      text: 'Delete',
      color: 'red',
      onPress: () => {
        console.log('press delete');
      },
    },
  ];

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView>
        <Button
          onPress={() => {
            dispatch(openActionSheet(actionsMock));
          }}>
          Open ActionSheet
        </Button>
        <FormItem label="Single Image Picker">
          <SingleImagePicker
            source={formData.singleImgSource}
            pickerStyle={{
              backgroundColor: '#f2f2f2',
            }}
            handleSelect={(value: string) => {
              setFormData({
                ...formData,
                singleImgSource: value,
              });
            }}
            authToken={undefined}
          />
        </FormItem>
        <FormItem label="Multiple Image Picker">
          <MultipleImagePicker
            source={formData.multipleImgSource}
            pickerStyle={{
              backgroundColor: '#f2f2f2',
            }}
            handleSelect={(value: string) => {
              setFormData({
                ...formData,
                multipleImgSource: value,
              });
            }}
            authToken={undefined}
            multiple={true}
            maxFiles={3}
          />
        </FormItem>
        <FormItem label="Single Video Picker">
          <VideoPicker
            source={formData.singleVideoSource}
            durationLimit={15}
            handleSelect={(value: string) => {
              setFormData({
                ...formData,
                singleVideoSource: value,
              });
            }}
            authToken={undefined}
          />
        </FormItem>
        <FormItem label="Multiple Video Picker">
          <MultipleVideoPicker
            source={formData.multipleVideoSource}
            durationLimit={15}
            handleSelect={(value: string) => {
              setFormData({
                ...formData,
                multipleVideoSource: value,
              });
            }}
            authToken={undefined}
            maxFiles={2}
          />
        </FormItem>
        <FormItem label="Signature">
          <SignaturePad
            source={formData.signatureSource}
            pickerStyle={
              {
                // backgroundColor: '#f2f2f2',
              }
            }
            handleConfirm={(value: string) => {
              setFormData({
                ...formData,
                signatureSource: value,
              });
            }}
            authToken={undefined}
          />
        </FormItem>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formItem: {
    width: deviceWidth,
    marginVertical: 2,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  formLabel: {
    fontSize: 14,
    color: '#2e2e2e',
  },
  formItemBody: {
    marginTop: 10,
  },
  formItemBodyText: {
    fontSize: 14,
    color: '#757575',
  },
});

const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
  };
};

export default connect(mapStateToProps)(CollectDataScreen);
