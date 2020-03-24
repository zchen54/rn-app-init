"use strict";

export * from "./alertInfoConstants";
export * from "./fontSizeConstants";
export * from "./iconTypeConstants";
export * from "./loginTypes";
export * from "./regTypeConstants";

export const codeTypeList = ["Document", "Reference", "Report"];

export const fieldTypes: any = {
  Text: "Text",
  Number: "Number",
  Money: "Money",
  Email: "Email",
  Radio: "Radio",
  CheckBox: "CheckBox",
  Datetime: "Datetime",
  TimeStamp: "TimeStamp",
  Date: "Date",
  Picture: "Picture",
  Video: "Video",
  Location: "Location",
  Table: "Table",
  Signature: "Signature",
  LinkedReport: "LinkedReport",
  LinkedField: "LinkedField"
};

export const tableFieldTypes: any = {
  Text: "Text",
  Number: "Number",
  Money: "Money",
  Email: "Email",
  Radio: "Radio",
  CheckBox: "CheckBox",
  Datetime: "Datetime",
  TimeStamp: "TimeStamp",
  Date: "Date"
  // Picture: "Picture",
  // Video: "Video",
  // Location: "Location",
  // Table: "Table",
};

export const fieldProperty: any = {
  AutoCompleteFromStaffName: "AutoCompleteFromStaffName",
  AutoCompleteFromStaffId: "AutoCompleteFromStaffId",
  CustomOption: "CustomOption"
};

export const customFormat = {
  DATETIME: "MMM Do , YYYY  HH:mm:ss",
  DATE: "MMM Do , YYYY",
  TIME: "HH:mm:ss"
};

export const UPLOAD_STATUS_TRUE = 1;
export const UPLOAD_STATUS_FALSE = 0;
