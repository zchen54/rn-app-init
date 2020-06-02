/**
 * onChange时的转换
 * @param numStr 输入的值
 * @param maxLength 最大长度
 * @param decimalLength 小数位数
 */
export const decimalJudgeFormatFun = (
  numStr: string,
  maxLength: number,
  decimalLength: number,
  isMoney: boolean = false,
) => {
  let newStr = numStr;
  const indexOfPoint = numStr.indexOf('.'),
    intLength = maxLength - decimalLength, // 整数的最大长度
    strWithoutPoint = numStr.replace('.', '');
  if (indexOfPoint !== -1) {
    // 输入的是小数
    if (indexOfPoint > intLength) {
      // 当整数长度大于整数的最大长度时，根据整数的最大长度添加小数点
      newStr =
        strWithoutPoint.substr(0, intLength) +
        '.' +
        strWithoutPoint.substr(intLength);
    }

    if (isMoney) {
      // Money长度限制
      const indexOfPoint2 = newStr.indexOf('.'),
        decimalLength2 = newStr.length - (indexOfPoint2 + 1);
      if (decimalLength2 > decimalLength) {
        newStr = newStr.substr(0, indexOfPoint2 + 1 + decimalLength);
      }
    }
  } else {
    // 输入的是整数
    if (numStr.length > intLength) {
      // 当整数长度大于整数的最大长度时，根据整数的最大长度添加小数点
      newStr = numStr.substr(0, intLength) + '.' + numStr.substr(intLength);
    }
  }
  return newStr;
};
