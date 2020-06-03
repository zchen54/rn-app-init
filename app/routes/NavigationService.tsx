import React from 'react';

export const navigationRef: any = React.createRef();

const navigate = (name: string, params: any) => {
  navigationRef.current && navigationRef.current.navigate(name, params);
};

const getNavigation = () => {
  return navigationRef.current && navigationRef.current;
};

export default {
  navigate,
  getNavigation,
};
