import React, { useState, useEffect, Fragment } from "react";
import { statusBarHeight, deviceWidth, deviceHeight } from "../../common/utils";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  TextInput,
  FlatList,
} from "react-native";
import { connect } from "react-redux";
import { fetchFriendList, fetchGroupList } from "../../store/actions";
import { styles } from "./styles";
import { setAllHistory, getAllHistory } from "../../common/utils";
// import Reactotron from "reactotron-react-native";
import SearchResult from "./components/SearchResult";
interface Props {
  navigation: any;
  fetchFriendList: (authToken: string, callback?: Function) => void;
  fetchGroupList: (
    authToken: string,
    isCreator: boolean,
    callback?: Function
  ) => void;
  authToken: string;
}

const Icon = {
  SearchIcon: require("../../containers/images/Me/search.png"),
  CloseIcon: require("../../containers/images/Me/close.png"),
  HistoryIcon: require("../../containers/images/Me/history.png"),
};

const FuzzySearch = (props: Props) => {
  StatusBar.setBarStyle("dark-content", true);
  const willMount = 1;
  const [searchValue, setSearchValue] = useState("");
  const [history, setHistory] = useState([] as string[]);
  // 获取历史数据
  const InitHistory = () => {
    getAllHistory()
      .then(res => {
        // Reactotron.log("InitHistory---res", res);
        if (res) {
          setHistory(res);
        }
      })
      .catch(e => {
        // Reactotron.log("InitHistory---e", e);
      });
  };
  // 存入历史数据
  const handleEnter = () => {
    if (searchValue === "") {
      return;
    }
    let temHistory = [
      searchValue,
      ...history.filter(item => item !== searchValue),
    ].splice(0, 10);
    setHistory(temHistory);
    setAllHistory(temHistory);
  };
  // 删除历史记录（一条）
  const handleDeleteHistory = (text: string) => {
    let tempHistory = history.filter(item => item !== text).splice(0, 10);
    setHistory(tempHistory);
    setAllHistory(tempHistory);
  };
  // 清除历史记录（十条）
  const handleClearHistory = () => {
    setHistory([]);
    setAllHistory([]);
  };
  // 渲染历史数据
  const _renderHistoryItem = (data: any) => {
    const { index, item } = data;
    return (
      <TouchableOpacity onPress={() => setSearchValue(item)}>
        <View style={styles.itemWrapper}>
          <Image style={styles.imageStyle} source={Icon.HistoryIcon} />
          <View style={index === 0 ? null : styles.line}>
            <Text style={styles.searchValueStyle}>{item}</Text>
          </View>
          <TouchableOpacity
            style={styles.closeImageStyle}
            onPress={() => handleDeleteHistory(item)}
          >
            <Image source={Icon.CloseIcon} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };
  // clear按钮组件
  const _renderClearButton = () => {
    return history.length > 0 ? (
      <TouchableOpacity style={{ marginTop: 8 }} onPress={handleClearHistory}>
        <View style={styles.clearButton}>
          <Text style={styles.clearTextStyle}>Clear search records</Text>
        </View>
      </TouchableOpacity>
    ) : null;
  };
  useEffect(() => {
    InitHistory();
    props.fetchFriendList(props.authToken);
    props.fetchGroupList(props.authToken, false);
  }, [willMount]);
  return (
    <View style={styles.normal}>
      <View style={styles.searchWrapper}>
        <View style={styles.container}>
          <View style={styles.inputWrapper}>
            <Image style={styles.serachIconStyle} source={Icon.SearchIcon} />
            <TextInput
              placeholder="Search"
              value={searchValue}
              autoFocus={true}
              style={styles.inputStyle}
              onChangeText={(text: string) => setSearchValue(text)}
              onBlur={handleEnter}
              returnKeyType={"search"}
            />
          </View>
          <Text
            style={styles.cancelStyle}
            onPress={() => props.navigation.goBack()}
          >
            Cancel
          </Text>
        </View>
      </View>
      {searchValue ? (
        <SearchResult searchValue={searchValue} navigation={props.navigation} />
      ) : (
        <View style={{ maxHeight: deviceHeight - statusBarHeight - 53 }}>
          <FlatList
            data={history}
            renderItem={data => _renderHistoryItem(data)}
            keyExtractor={(item, index) => item + index}
            extraData={history}
          />
          {_renderClearButton()}
        </View>
      )}
    </View>
  );
};

const mapStateToProps = (state: any) => {
  return {
    authToken: state.loginInfo.currentUserInfo.authToken,
  };
};

const mapDispatchToProps = (dispatch: any) => {
  return {
    fetchFriendList: (authToken: string, callback?: Function) => {
      dispatch(fetchFriendList(authToken, callback));
    },
    fetchGroupList: (
      authToken: string,
      isCreator: boolean,
      callback?: Function
    ) => dispatch(fetchGroupList(authToken, isCreator, callback)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(FuzzySearch);
