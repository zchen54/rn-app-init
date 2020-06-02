// 谷歌地图服务
// https://console.cloud.google.com/apis/credentials?folder=&organizationId=&project=gleaming-vision-274810

const GOOGLE_API_KEY = 'AIzaSyAHiNLuE34rArSOlQmGKob57JX9FspJ3dg';

// 通过经纬度解析地址
export const reverseGeoCoding = (latitude: number, longitude: number) => {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_API_KEY}`;
  console.log(latitude, longitude, url);
  return fetch(url, {
    method: 'GET',
  })
    .then(response => {
      return response.json();
    })
    .then(res => {
      console.log('google res', res);
      return res;
    })
    .catch(error => {});
};

// 通过经纬度搜索附近
export const nearbySearchByLatLng = (latitude: number, longitude: number) => {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=1500&key=${GOOGLE_API_KEY}`;
  console.log(latitude, longitude, url);
  return fetch(url, {
    method: 'GET',
  })
    .then(response => {
      return response.json();
    })
    .then(res => {
      console.log('google res', res);
      return res;
    })
    .catch(error => {});
};

// 搜索自动填充
export const placeAutoComplete = (
  input: string,
  latitude?: number,
  longitude?: number,
  sessionToken?: number,
) => {
  const url =
    latitude && longitude
      ? `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&location=${latitude},${longitude}&radius=3000&strictbounds&key=${GOOGLE_API_KEY}&sessiontoken=${sessionToken}`
      : `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${GOOGLE_API_KEY}&sessiontoken=${sessionToken}`;

  console.log(latitude, longitude, url);
  return fetch(url, {
    method: 'GET',
  })
    .then(response => {
      return response.json();
    })
    .then(res => {
      console.log('google placeAutoComplete res', res);
      return res;
    })
    .catch(error => {});
};

// 获取地址详情
export const getPlaceDetail = (place_id: string, sessionToken?: number) => {
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=place_id,name,geometry,formatted_address&key=${GOOGLE_API_KEY}&sessiontoken=${sessionToken}`;

  console.log('placeDetail', url);
  return fetch(url, {
    method: 'GET',
  })
    .then(response => {
      return response.json();
    })
    .then(res => {
      console.log('google placeDetail res', res);
      return res;
    })
    .catch(error => {});
};
