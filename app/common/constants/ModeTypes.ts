import {string} from 'prop-types';

export interface ModelType {
  User_pKey_Creator: string;
  User_pKey_Modifier: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserInfoType {
  pKey: string;
  Name: string;
  ImgAddress: string;
  User_pKey: string;
}

export interface UserType {
  pKey: string;
  Name: string;
  Salt: string;
  Role: string;
  FirstName: string;
  LastName: string;
  Address: string;
  VoiceNo: string;
  Email: string;
  Remark: string;
  TemplateArr: TemplateType[];
  ReportArr: ReportType[];
  // GroupArr: GroupType[];
}

export interface GroupType {
  pKey: string;
  Name: string;
  Remark: string;
  userInfo: UserInfoType[];
}

export interface TemplateType {
  pKey: string;
  Name: string;
  showCode: boolean;
  ActiveStatus: number;
  UploadStatus: number;
  Sections: SectionType[];
  CreatorName: string;
  companyId?: string;
  CreatorPic?: string;
  companyName: string;
  customizeKey: string;
  codeType: string;
  color: string;
  Remark: string;
  _id: string;
  shelveStatus: boolean;
  linkable: boolean;
  isDefault?: boolean;
  hiddenFields: string[];
  isSharing?: boolean;
  hiddenSection?: boolean;
  sendEmails?: string; // 发送邮箱的邮件
  department?: string; // 所属部门，创建时写入
  departmentName?: string;
  actionableDepartments?: string[]; // 可操作的部门
  privacyStaffs?: string[]; // 可以查看隐藏字段的员工
  actionableAll?: boolean; // true: 所有人都有权限操作
  approval?: any;
  task?: any;
  taskId?: string;
  isTop?: boolean;
  label?: string;
}

export interface ReportType {
  pKey: string;
  code: string;
  Name: string;
  TemplatepKey: string;
  templateName?: string;
  showCode: boolean;
  customizeKey: string;
  location: string;
  UploadStatus: number;
  Sections: SectionType[];
  CreatorName: string;
  companyId?: string;
  companyName: string;
  CreatorPic: string;
  Remark: string;
  creatorStaffId: string;
  departmentId: string;
  departmentName: string;
  codeType: string;
  color: string;
  storageSize: number;
  templateCreatedAt?: string;
  isDefault?: boolean;
  anonymityType?: string; // web_user || qr_user
  hiddenFields: string[];
  isTemplateSharing?: boolean;
  hiddenSection?: boolean;
  template?: any;
  task?: any;
  approval?: any;
  taskId?: string;
}

export interface SectionType {
  _id: string;
  Name: string;
  Order: number;
  Remark: string;
  sectionKey?: string;
  Fields?: FieldType[];
  FieldData?: FormDataType[];
}

export interface FieldType {
  _id: string;
  Name: string;
  Type: string;
  Order: number;
  Remark: string;
  TableFieldList: TableFieldType[];
  property: FieldPropertyType;
  FieldPosition?: FieldPositionType;
  FieldTableProperty?: FieldTablePropertyType;
  isLinked?: boolean;
}

export interface FieldPositionType {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FieldTablePropertyType {
  column: number;
  row: number;
  height: number;
  heightUnit: string;
}

export interface TableFieldType {
  _id: string;
  Name: string;
  Type: string;
  Order: number;
  Remark: string;
  property: FieldPropertyType;
}

export interface FieldPropertyType {
  required: boolean;
  privacy?: boolean;
  options: string[];
  defaultValue: string;
  maximum: number;
  minimum: number;
  maxLength: number;
  minLength: number;
  placeHolder: string;
  videoTime?: number;
  autoCompleteFromStaffName?: boolean;
  autoCompleteFromStaffId?: boolean;
  autoCompleteCreationTime?: boolean;
  customOption?: boolean;
  decimalPlaces?: number;
  templateId?: string;
  linkedReportId?: string;
  fieldId?: string;
  internalData?: boolean;
  pictureNumber?: number;
  videoNumber?: number;
  currencyUnit?: string;
  sendEmail?: boolean;
  fileName?: string;
}

export interface FormDataType {
  _id: string;
  fieldKey: string;
  Order: number;
  Type: string;
  FieldName: string;
  FieldValue: string;
  Remark: string;
  linkReportValue?: string;
  linkReportFieldObject?: any;
  TableFieldDataList: TableFieldDataType[];
  property: FieldPropertyType;
  FieldPosition?: FieldPositionType;
  FieldTableProperty?: FieldTablePropertyType;
}

export interface TableFieldDataType {
  _id: string;
  tableFieldKey: string;
  Order: number;
  Type: string;
  FieldName: string;
  FieldValueList: string[];
  Remark: string;
  property: FieldPropertyType;
}

export interface FriendsType {
  pKey: string;
  email: string;
  gender: number;
  nickName: string;
  roleType: number;
  updatedAt: string;
  createdAt: string;
  userPic: string;
}

export const commonObj: ModelType = {
  User_pKey_Creator: '',
  User_pKey_Modifier: '',
  createdAt: '',
  updatedAt: '',
};

export const newTemplate: ModelType & TemplateType = {
  ...commonObj,
  pKey: '',
  Name: '',
  Remark: '',
  showCode: false,
  CreatorName: '',
  companyName: '',
  customizeKey: '',
  ActiveStatus: 1,
  UploadStatus: 0,
  codeType: '',
  color: '',
  _id: '',
  shelveStatus: false,
  linkable: false,
  Sections: [],
  hiddenFields: [],
};

export const newSection: SectionType = {
  _id: '',
  Name: 'Section1',
  Order: 1,
  Remark: '',
  Fields: [],
};

export const newReport: ModelType & ReportType = {
  ...commonObj,
  pKey: '',
  code: '',
  Name: '',
  TemplatepKey: '',
  showCode: false,
  customizeKey: '',
  location: '',
  UploadStatus: 0,
  Sections: [],
  CreatorName: '',
  companyName: '',
  CreatorPic: '',
  Remark: '',
  creatorStaffId: '',
  departmentId: '',
  departmentName: '',
  codeType: '',
  color: '',
  storageSize: 0,
  hiddenFields: [],
};

export const newFieldData: FormDataType = {
  _id: '',
  fieldKey: '',
  Order: 1,
  Type: '',
  FieldName: '',
  FieldValue: '',
  Remark: '',
  TableFieldDataList: [],
  property: {
    required: false,
    privacy: false,
    options: [],
    defaultValue: '',
    maximum: 0,
    minimum: 0,
    maxLength: 0,
    minLength: 0,
    placeHolder: '',
    videoTime: 0, // 单位 s
    autoCompleteFromStaffName: false,
    autoCompleteFromStaffId: false,
    autoCompleteCreationTime: false,
    customOption: false,
    decimalPlaces: 0,
    internalData: false,
    pictureNumber: 1,
    videoNumber: 1,
    currencyUnit: '',
  },
};

export const newTableFieldData: TableFieldDataType = {
  _id: '',
  tableFieldKey: '',
  Order: 1,
  Type: '',
  FieldName: '',
  Remark: '',
  FieldValueList: [],
  property: {
    required: false,
    privacy: false,
    options: [],
    defaultValue: '',
    maximum: 0,
    minimum: 0,
    maxLength: 0,
    minLength: 0,
    placeHolder: '',
    autoCompleteFromStaffName: false,
    autoCompleteFromStaffId: false,
    autoCompleteCreationTime: false,
    customOption: false,
    decimalPlaces: 0,
    internalData: false,
    pictureNumber: 1,
    videoNumber: 1,
    currencyUnit: '',
  },
};
