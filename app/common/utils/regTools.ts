import {regTypeConstants} from '../constants/regTypeConstants';
export function regTools(regValue: string, regType: string) {
  switch (regType) {
    case regTypeConstants.MOBILE_PHONE: {
      let myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
      return myreg.test(regValue);
    }
    case regTypeConstants.EMAIL: {
      let reg = new RegExp(
        // "^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"
        /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      );
      return reg.test(regValue);
    }
    case regTypeConstants.PHONE: {
      let reg = /^[0-9]{5,30}$/;
      return reg.test(regValue);
    }
    default:
      return false;
  }
}
