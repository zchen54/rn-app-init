import { messageTypeConstants } from "../types";

// services
export const fetchMessage = (authToken: string, callback?: Function) => ({
  type: messageTypeConstants.FETCH_MESSAGE,
  authToken,
  callback
});

export const fetchMessageFulfilled = (message: Array<any>) => ({
  type: messageTypeConstants.FETCH_MESSAGE_FULFILLED,
  message
});

export const fetchNewMessageCount = (authToken: string) => ({
  type: messageTypeConstants.FETCH_NEW_MESSAGE_COUNT,
  authToken
});
export const updateNewMessageCount = (count: string) => ({
  type: messageTypeConstants.UPDATE_NEW_MESSAGE_COUNT,
  count
});

export const updateMessageIsRead = (authToken: string) => ({
  type: messageTypeConstants.UPDATE_MESSAGE_ISREAD,
  authToken
});

export const handleFriendRequest = (
  authToken: string,
  options: {
    messageId: string;
    accept: boolean;
  },
  callback: Function
) => ({
  type: messageTypeConstants.HANDLE_FRIEND_REQUEST,
  authToken,
  options,
  callback
});

export const handleGroupRequest = (
  authToken: string,
  options: {
    messageId: string;
    accept: boolean;
  },
  callback: Function
) => ({
  type: messageTypeConstants.HANDLE_GROUP_REQUEST,
  authToken,
  options,
  callback
});

export const handleCompanyJoinRequest = (
  authToken: string,
  options: {
    messagePkey: string;
    // departmentPkey: string;
    // role: number;
    audit: boolean;
  },
  callback: Function
) => ({
  type: messageTypeConstants.HANDLE_COMPANY_JOIN_REQUEST,
  authToken,
  options,
  callback
});

export const handleCompanyExitRequest = (
  authToken: string,
  options: {
    messagePkey: string;
    audit: boolean;
  },
  callback: Function
) => ({
  type: messageTypeConstants.HANDLE_COMPANY_EXIT_REQUEST,
  authToken,
  options,
  callback
});
