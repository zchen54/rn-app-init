/**
 * Function toDecimal 保留小数 不足补零
 * @param {number} number 待转换的数字
 * @param {number} decimalPlaces 保留几位小数
 * @return {number} 保留n位小数 不足补0
 */
export const toDecimal = (value: string, decimalPlaces: number = 0) => {
  let str = '';
  if (decimalPlaces) {
    let number: any = value;
    if (isNaN(number)) {
      return false;
    } else {
      const base = Math.pow(10, decimalPlaces);
      let float = Math.round(number * base) / base;
      str = float.toString();
      let rs = str.indexOf('.');
      if (decimalPlaces !== 0) {
        if (rs < 0) {
          rs = str.length;
          str += '.';
        }
        while (str.length <= rs + decimalPlaces) {
          str += '0';
        }
      }
    }
  }
  return decimalPlaces ? str : value;
};

/**
 * Safely access deeply nested values
 * @param collection Data source
 * @param keyPath Key path array
 * @param notSetValue Default value for not found
 */
export const getIn = (
  collection: any,
  keyPath: Array<any>,
  notSetValue?: any,
): any =>
  keyPath.reduce(
    (rlt, keyIndex) => (rlt && rlt[keyIndex] ? rlt[keyIndex] : null),
    collection,
  ) || notSetValue;

/**
 * Safely access deeply nested values
 * @param collection Data source
 * @param keyPath Array of key path or key judgement function
 * @param notSetValue Default value for not found
 */
export const getInPro = (
  collection: any,
  keyPath: Array<any>,
  notSetValue?: any,
): any =>
  keyPath.reduce((rlt, keyIndex) => {
    if (typeof keyIndex === 'function' && Array.isArray(rlt)) {
      let tempRlt;
      rlt.forEach((item, index) => {
        if (keyIndex(item)) {
          tempRlt = rlt && rlt[index] ? rlt[index] : null;
        }
      });
      return tempRlt;
    } else {
      return rlt && rlt[keyIndex] ? rlt[keyIndex] : null;
    }
  }, collection) || notSetValue;

/**
 * 对象数组排序
 * @param array The Object Array you need to sort
 * @param sortKey The key of the object in array you want to sort by
 */
export const sortObjectArray = (array: any, sortKey: string) =>
  array.sort(function(a: any, b: any) {
    var valueA = a[sortKey].toUpperCase();
    var valueB = b[sortKey].toUpperCase();
    if (valueA < valueB) {
      return -1;
    }
    if (valueA > valueB) {
      return 1;
    }
    return 0;
  });

// 模糊搜索
export const fuzzySearchTools = (needle: string, haystack: string) => {
  const needleUpper = needle.toUpperCase(),
    haystackUpper = haystack.toUpperCase(),
    hLen = haystack.length,
    nLen = needle.length;
  if (nLen > hLen) {
    return false;
  }
  if (nLen === hLen) {
    return needleUpper === haystackUpper;
  }
  outer: for (let i = 0, j = 0; i < nLen; i++) {
    let nch = needleUpper.charCodeAt(i);
    while (j < hLen) {
      if (haystackUpper.charCodeAt(j++) === nch) {
        continue outer;
      }
    }
    return false;
  }
  return true;
};

export const backgroundColorEnum = [
  '#5CCAA1',
  '#957DBD',
  '#FFA400',
  '#00C0CA',
  '#98C555',
  '#F34D44',
  '#FF959B',
  '#E67373',
  '#E6AC73',
  '#79B6F2',
  '#AC73E5',
  '#E573AC',
  '#04d984',
  '#7979F2',
];

export const randomTemplateColor = () => {
  return backgroundColorEnum[Math.floor(Math.random() * 14)];
};
