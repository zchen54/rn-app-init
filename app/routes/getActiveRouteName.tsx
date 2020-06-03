/**
 * Gets the current screen from navigation state
 * @param state
 */
const getActiveRouteName = (state: any): any => {
  const route: any = state.routes[state.index];

  if (route.state) {
    // Dive into nested navigators
    return getActiveRouteName(route.state);
  }

  return route.name;
};

export default getActiveRouteName;
