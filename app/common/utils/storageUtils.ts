import Storage from 'react-native-storage';
import AsyncStorage from '@react-native-community/async-storage';

export const storage = new Storage({
  // 最大容量，默认值1000条数据循环存储
  size: 10,
  // 存储引擎：对于RN使用AsyncStorage，对于web使用window.localStorage
  // 如果不指定则数据只会保存在内存中，重启后即丢失
  storageBackend: AsyncStorage,
  // 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），设为null则永不过期
  defaultExpires: null,
  // 读写时在内存中缓存数据。默认启用。
  enableCache: true, // 你可以在构造函数这里就写好sync的方法 // 或是在任何时候，直接对storage.sync进行赋值修改 // 或是写到另一个文件里，这里require引入
});

// 新手引导
export const setIsFrist = (isFrist: any) => {
  storage.save({
    key: 'isFrist',
    data: isFrist,
  });
};
export const getIsFrist = async () => {
  return await storage.load({
    key: 'isFrist',
  });
};
export const setIsFirstBubble = (isFrist: any) => {
  storage.save({
    key: 'isFristBubble',
    data: isFrist,
  });
};
export const getIsFirstBubble = async () => {
  return await storage.load({
    key: 'isFristBubble',
  });
};

// user info
export const setUserInfo = (userInfo: any) => {
  storage.save({
    key: 'userInfo',
    data: userInfo,
  });
};
export const getUserInfo = async () => {
  return await storage.load({
    key: 'userInfo',
  });
};
export const clearUserInfo = () => {
  storage.remove({
    key: 'userInfo',
  });
};

// user login history
export const setLoginHistory = (loginHistory: any) => {
  storage.save({
    key: 'loginHistory',
    data: loginHistory,
  });
};
export const getLoginHistory = async () => {
  return await storage.load({
    key: 'loginHistory',
  });
};
export const clearLoginHistory = () => {
  storage.remove({
    key: 'loginHistory',
  });
};

// search friend history
export const setSearchFriendHistory = (searchFriendHistory: any) => {
  storage.save({
    key: 'searchFriendHistory',
    data: searchFriendHistory,
  });
};
export const getSearchFriendHistory = async () => {
  return await storage.load({
    key: 'searchFriendHistory',
  });
};
export const clearSearchFriendHistory = () => {
  storage.remove({
    key: 'searchFriendHistory',
  });
};

// search email history
export const setSearchEmailHistory = (searchEmailHistory: any) => {
  storage.save({
    key: 'searchEmailHistory',
    data: searchEmailHistory,
  });
};
export const getSearchEmailHistory = async () => {
  return await storage.load({
    key: 'searchEmailHistory',
  });
};
export const clearSearchEmailHistory = () => {
  storage.remove({
    key: 'searchEmailHistory',
  });
};

// search organization history
export const setSearchOrganizationHistory = (
  searchOrganizationHistory: any,
) => {
  storage.save({
    key: 'searchOrganizationHistory',
    data: searchOrganizationHistory,
  });
};
export const getSearchOrganizationHistory = async () => {
  return await storage.load({
    key: 'searchOrganizationHistory',
  });
};
export const clearSearchOrganizationHistory = () => {
  storage.remove({
    key: 'searchOrganizationHistory',
  });
};

// search group history
export const setSearchGroupHistory = (searchGroupHistory: any) => {
  storage.save({
    key: 'searchGroupHistory',
    data: searchGroupHistory,
  });
};
export const getSearchGroupHistory = async () => {
  return await storage.load({
    key: 'searchGroupHistory',
  });
};
export const clearSearchGroupHistory = () => {
  storage.remove({
    key: 'searchGroupHistory',
  });
};

// search Template and Data History
export const setSearchTemplateHistory = (searchTemplateHistory: any) => {
  storage.save({
    key: 'searchTemplateHistory',
    data: searchTemplateHistory,
  });
};
export const getSearchTemplateHistory = async () => {
  return await storage.load({
    key: 'searchTemplateHistory',
  });
};
export const clearSearchTemplateHistory = () => {
  storage.remove({
    key: 'searchTemplateHistory',
  });
};

// Setting
export const setAutoSubmitDraft = (autoSubmitDraft: boolean) => {
  storage.save({
    key: 'autoSubmitDraft',
    data: autoSubmitDraft,
  });
};
export const getAutoSubmitDraft = async () => {
  return await storage.load({
    key: 'autoSubmitDraft',
  });
};

// search History
export const setAllHistory = (History: any) => {
  storage.save({
    key: 'History',
    data: History,
  });
};

export const getAllHistory = async () => {
  return await storage.load({
    key: 'History',
  });
};

export const clearAllHistory = () => {
  storage.remove({
    key: 'History',
  });
};

// Organization for test
// Setting
export const setPressOrgCountForDev = (pressOrgCountForDev: number) => {
  storage.save({
    key: 'pressOrgCountForDev',
    data: pressOrgCountForDev,
  });
};
export const getPressOrgCountForDev = async () => {
  return await storage.load({
    key: 'pressOrgCountForDev',
  });
};
