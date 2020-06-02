import React, {useState, useEffect, Fragment} from 'react';
import {View, Text, Image, TouchableOpacity, SectionList} from 'react-native';
import {connect} from 'react-redux';
import {
  TemplateType,
  ModelType,
  ReportType,
} from '../../../common/constants/ModeTypes';
import {
  selectGroup,
  getGroupMembers,
  searchUserByEmail,
  initReport,
  previewTemplateBySelect,
  previewReport,
  fetchReportInfo,
  fetchTemplateInfo,
} from '../../../store/actions';
// import Reactotron from "reactotron-react-native";
import {styles} from '../styles';
import {
  deviceWidth,
  fuzzySearchTools,
  backgroundColorEnum,
} from '../../../common/utils';
import {formatSearchResultText} from '../../../common/components';

interface Props {
  // from store
  friends: Array<any>;
  groupList: Array<any>;
  templates: Array<ModelType & TemplateType>;
  companyTemplates: Array<ModelType & TemplateType>;
  reports: Array<ModelType & ReportType>;
  companyReports: Array<ModelType & ReportType>;
  authToken: string;
  searchValue: string;
  navigation: any;
  dispatch: Function;
}

const Icon = {
  headerImageIcon: require('../../../containers/images/Me/Portrait.png'),
};

const renderGroupImg = (item: any) => {
  if (item.members.length === 2) {
    return (
      <View style={styles.imageStyleWrapper2}>
        {item.members[0].userPic ? (
          <Image
            source={{uri: item.members[0].userPic}}
            style={styles.imageHalfStyle}
          />
        ) : (
          <Image source={Icon.headerImageIcon} style={styles.imageHalfStyle} />
        )}
        {item.members[1].userPic ? (
          <Image
            source={{uri: item.members[1].userPic}}
            style={styles.imageHalfStyle}
          />
        ) : (
          <Image source={Icon.headerImageIcon} style={styles.imageHalfStyle} />
        )}
      </View>
    );
  } else if (item.members.length === 3) {
    return (
      <View style={styles.imageStyleWrapper2}>
        {item.members[0].userPic ? (
          <Image
            source={{uri: item.members[0].userPic}}
            style={styles.imageHalfStyle}
          />
        ) : (
          <Image source={Icon.headerImageIcon} style={styles.imageHalfStyle} />
        )}
        <View style={styles.imageHalfStyle}>
          {item.members[1].userPic ? (
            <Image
              source={{uri: item.members[1].userPic}}
              style={styles.imageQuiteStyle}
            />
          ) : (
            <Image
              source={Icon.headerImageIcon}
              style={styles.imageQuiteStyle}
            />
          )}
          {item.members[2].userPic ? (
            <Image
              source={{uri: item.members[2].userPic}}
              style={styles.imageQuiteStyle}
            />
          ) : (
            <Image
              source={Icon.headerImageIcon}
              style={styles.imageQuiteStyle}
            />
          )}
        </View>
      </View>
    );
  } else if (item.members.length === 1) {
    return item.members[0].userPic ? (
      <Image
        source={{uri: item.members[0].userPic}}
        style={styles.groupImageStyle}
      />
    ) : (
      <Image source={Icon.headerImageIcon} style={styles.groupImageStyle} />
    );
  } else {
    return (
      <View style={styles.imageStyleWrapper2}>
        <View style={styles.imageHalfStyle}>
          {item.members[0].userPic ? (
            <Image
              source={{uri: item.members[0].userPic}}
              style={styles.imageQuiteStyle}
            />
          ) : (
            <Image
              source={Icon.headerImageIcon}
              style={styles.imageQuiteStyle}
            />
          )}
          {item.members[1].userPic ? (
            <Image
              source={{uri: item.members[1].userPic}}
              style={styles.imageQuiteStyle}
            />
          ) : (
            <Image
              source={Icon.headerImageIcon}
              style={styles.imageQuiteStyle}
            />
          )}
        </View>
        <View style={styles.imageHalfStyle}>
          {item.members[2].userPic ? (
            <Image
              source={{uri: item.members[2].userPic}}
              style={styles.imageQuiteStyle}
            />
          ) : (
            <Image
              source={Icon.headerImageIcon}
              style={styles.imageQuiteStyle}
            />
          )}
          {item.members[3].userPic ? (
            <Image
              source={{uri: item.members[3].userPic}}
              style={styles.imageQuiteStyle}
            />
          ) : (
            <Image
              source={Icon.headerImageIcon}
              style={styles.imageQuiteStyle}
            />
          )}
        </View>
      </View>
    );
  }
};
const dataCreate = (Type: string, dataSource: any[], searchValue: string) => {
  let data;
  if (
    Type === 'Template (PERSONAL)' ||
    Type === 'Template (ORGANIZATION)' ||
    Type === 'Data (PERSONAL)' ||
    Type === 'Data (ORGANIZATION)'
  ) {
    data = dataSource.filter(item => fuzzySearchTools(searchValue, item.Name));
  } else if (Type === 'Friends') {
    data = dataSource.filter(
      item =>
        fuzzySearchTools(searchValue, item.nickName) ||
        fuzzySearchTools(searchValue, item.email),
    );
  } else if (Type === 'Groups') {
    data = dataSource.filter((item: any) =>
      fuzzySearchTools(
        searchValue,
        item.name === ''
          ? item.members.map((user: any) => user.nickName).join(',')
          : item.name,
      ),
    );
  }
  return {
    title: Type,
    data,
  };
};

const SearchResult = (props: Props) => {
  const {
    searchValue,
    templates,
    companyTemplates,
    reports,
    companyReports,
    friends,
    authToken,
    groupList,
  } = props;

  const searchType = [
    {type: 'Template (PERSONAL)', dataSource: templates},
    {type: 'Template (ORGANIZATION)', dataSource: companyTemplates},
    {type: 'Data (PERSONAL)', dataSource: reports},
    {type: 'Data (ORGANIZATION)', dataSource: companyReports},
    {type: 'Friends', dataSource: friends},
    {type: 'Groups', dataSource: groupList},
  ];

  const handlePress = (data: any, title: string) => {
    if (title === 'Template (PERSONAL)') {
      props.dispatch(
        initReport(authToken, data, () => {
          props.navigation.navigate('CollectData', {
            type: 'Create',
          });
        }),
      );
      return;
    }
    if (title === 'Template (ORGANIZATION)') {
      props.dispatch(
        initReport(authToken, data, () => {
          props.navigation.navigate('CollectData', {
            type: 'Create',
          });
        }),
      );
      return;
    }
    if (title === 'Data (PERSONAL)' || title === 'Data (ORGANIZATION)') {
      props.dispatch(
        fetchReportInfo(authToken, data.pKey, () => {
          props.navigation.navigate('ReportPreview', {});
        }),
      );
      return;
    }
    if (title === 'Friends') {
      props.dispatch(
        searchUserByEmail(authToken, data.email, () => {
          props.navigation.navigate('FriendInfo', {
            type: 'FriendEmail',
          });
        }),
      );
    }
    if (title === 'Groups') {
      let {authToken} = props;
      props.dispatch(selectGroup(data));
      props.dispatch(
        getGroupMembers(authToken, data._id, () =>
          props.navigation.navigate('EditGroup'),
        ),
      );
    }
  };

  const _renderSearchItem = (
    data: import('react-native').SectionListRenderItemInfo<any>,
  ) => {
    const {item, index, section} = data;
    const {title} = section;
    if (title === 'Friends') {
      return (
        <TouchableOpacity onPress={() => handlePress(item, title)}>
          <View style={{...styles.itemWrapper, height: 52}}>
            {item.userPic ? (
              <Image source={{uri: item.userPic}} style={styles.avatarStyle} />
            ) : (
              <Image source={Icon.headerImageIcon} style={styles.avatarStyle} />
            )}
            <View style={index === 0 ? null : styles.line}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.nicknameStyle}>
                {formatSearchResultText(item.nickName, searchValue)}
              </Text>
              <Text style={styles.emailStyle}>
                Email: {formatSearchResultText(item.email, searchValue)}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    if (title === 'Groups') {
      return (
        <TouchableOpacity onPress={() => handlePress(item, title)}>
          <View style={{...styles.itemWrapper, height: 52}}>
            {renderGroupImg(item)}
            <View style={index === 0 ? null : styles.line}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.nicknameStyle}>
                {formatSearchResultText(
                  item.name === ''
                    ? item.members.map((user: any) => user.nickName).join(',')
                    : item.name,
                  searchValue,
                )}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity onPress={() => handlePress(item, title)}>
        <View style={{...styles.itemWrapper, height: 52}}>
          <View
            style={[
              styles.avatarStyle,
              {
                backgroundColor: item.color || backgroundColorEnum[index % 14],
              },
            ]}
          />
          <View style={index === 0 ? null : styles.line}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.nicknameStyle}>
              {formatSearchResultText(item.Name, searchValue)}
            </Text>
            <Text style={styles.emailStyle}>{item.CreatorName}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = (Section: any) => {
    let {title} = Section.section;
    return (
      <View
        style={{
          ...styles.itemWrapper,
          height: 40,
          paddingLeft: 17,
          marginTop: 8,
        }}>
        <View
          style={{
            width: deviceWidth - 17,
            height: 40,
            borderBottomColor: '#F2F2F2',
            borderBottomWidth: 1,
            justifyContent: 'center',
          }}>
          <Text style={styles.titleStyle}>{title}</Text>
        </View>
      </View>
    );
  };

  let sections: any[] = [];
  searchType.forEach(item => {
    let section = dataCreate(item.type, item.dataSource, searchValue);
    if (section.data && section.data.length > 0) {
      sections.push(dataCreate(item.type, item.dataSource, searchValue));
    }
  });
  // Reactotron.log("sections----", sections);

  return (
    <Fragment>
      <SectionList
        renderItem={data => _renderSearchItem(data)}
        renderSectionHeader={data => renderSectionHeader(data)}
        sections={sections}
        keyExtractor={(item, index) => item + index}
        ListEmptyComponent={
          <View
            style={{
              ...styles.itemWrapper,
              justifyContent: 'center',
              width: deviceWidth,
            }}>
            <Text style={styles.titleStyle}>No search results</Text>
          </View>
        }
      />
    </Fragment>
  );
};

const mapStateToProps = (state: any) => {
  return {
    friends: state.friendsList.friends,
    groupList: state.group.groupList,
    authToken: state.loginInfo.currentUserInfo.authToken,
    templates: state.template.templates,
    companyTemplates: state.template.companyTemplates,
    reports: state.report.reports,
    companyReports: state.report.companyReports,
  };
};

export default connect(mapStateToProps)(SearchResult);
