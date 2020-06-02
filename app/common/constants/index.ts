'use strict';

export * from './alertInfoConstants';
export * from './fontSizeConstants';
export * from './iconTypeConstants';
export * from './loginTypes';
export * from './regTypeConstants';
export * from './country';

export const codeTypeList = ['Document', 'Reference', 'Report'];

export enum fieldTypes {
  Text = 'Text',
  TextArea = 'TextArea',
  Number = 'Number',
  Money = 'Money',
  Email = 'Email',
  Radio = 'Radio',
  RadioButton = 'RadioButton', // 单选平铺
  CheckBox = 'CheckBox',
  Datetime = 'Datetime',
  TimeStamp = 'TimeStamp',
  Date = 'Date',
  Picture = 'Picture',
  Video = 'Video',
  Location = 'Location',
  Table = 'Table',
  Signature = 'Signature',
  LinkedReport = 'LinkedReport',
  LinkedField = 'LinkedField',
  Name = 'Name',
  Staff = 'Staff',
  Department = 'Department',
  ScanBarCode = 'ScanBarCode',
  ScanQRCode = 'ScanQRCode',
  File = 'File',
}

export enum tableFieldTypes {
  Text = 'Text',
  Number = 'Number',
  Money = 'Money',
  Email = 'Email',
  Radio = 'Radio',
  CheckBox = 'CheckBox',
  Datetime = 'Datetime',
  TimeStamp = 'TimeStamp',
  Date = 'Date',
  Staff = 'Staff',
  Department = 'Department',
}

export const fieldProperty: any = {
  AutoCompleteFromStaffName: 'AutoCompleteFromStaffName',
  AutoCompleteFromStaffId: 'AutoCompleteFromStaffId',
  CustomOption: 'CustomOption',
};

export const customFormat = {
  DATETIME: 'MMM Do , YYYY  HH:mm:ss',
  DATE: 'MMM Do , YYYY',
  TIME: 'HH:mm:ss',
};

export const UPLOAD_STATUS_TRUE = 1;
export const UPLOAD_STATUS_FALSE = 0;
