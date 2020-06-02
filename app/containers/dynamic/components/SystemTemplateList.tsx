import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SectionList,
} from 'react-native';
import {
  setSize, // 设置宽高
  deviceHeight, // 设备高度
  deviceWidth, // 设备宽度
  setSizeWithPx, // 设置字体 px 转 dp
  statusBarHeight,
  getIn,
  backgroundColorEnum,
} from '../../../common/utils';
import {DColors, DFontSize, FONT_FAMILY} from '../../../common/styles';
import {
  TemplateType,
  ModelType,
  ReportType,
} from '../../../common/constants/ModeTypes';
import {TemplateItem} from './TemplateItem';
import moment from 'moment';

const Page = {
  font_family: FONT_FAMILY,
  mainColor: DColors.mainColor,
  titleColor: DColors.title,
  templateMargin: 8,
};

const Icon = {
  headerImageIcon: require('../../images/Me/Portrait.png'),
  blankpage3: require('../../images/template/blankpage3.png'),
};

interface State {
  sections: Array<any>;
  openingSectionTitle: Array<string>;
}
interface Props {
  refreshing: boolean;
  systemTemplates: Array<ModelType & TemplateType>;
  handleFetchList: Function;
  handlePreviewSystemTemplate: Function;
}

export class SystemTemplateList extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      sections: [],
      openingSectionTitle: [],
    };
  }

  componentWillMount() {
    this.handleInitialState(this.props);
  }

  componentWillReceiveProps(nextProps: Props) {
    this.handleInitialState(nextProps);
  }

  handleInitialState = (props: Props) => {
    const {systemTemplates} = props;

    if (systemTemplates.length) {
      let sectionMap: any = {};
      let sections: Array<any> = [];
      // 系统模板根据 isTop 和 label 分类
      const topSysTemplateLabel = 'Top System Template',
        emptyDefaultLabel = 'Others';
      const insertSectionMap = (key: string, dataItem: any) => {
        if (!sectionMap[key]) {
          sectionMap[key] = {
            title: key,
            data: [],
          };
        }
        sectionMap[key].data.push(dataItem);
      };
      systemTemplates.forEach((item: any) => {
        if (item.isTop) {
          insertSectionMap(topSysTemplateLabel, item);
        }
        if (item.label) {
          insertSectionMap(item.label, item);
        } else {
          insertSectionMap(emptyDefaultLabel, item);
        }
      });

      // 将没label的模板放至末尾
      let topSectionItem: any = {};
      let lastSectionItem: any = {};
      Object.keys(sectionMap).forEach((key: string) => {
        let tempData = {
          title: sectionMap[key].title,
          data: [
            {
              templates: sectionMap[key].data,
            },
          ],
        };
        if (tempData.title === topSysTemplateLabel) {
          topSectionItem = tempData;
        } else if (tempData.title === emptyDefaultLabel) {
          lastSectionItem = tempData;
        } else {
          sections.push(tempData);
        }
      });
      if (topSectionItem && topSectionItem.title) {
        sections.unshift(topSectionItem);
      }
      if (lastSectionItem && lastSectionItem.title) {
        sections.push(lastSectionItem);
      }
      this.setState({sections, openingSectionTitle: Object.keys(sectionMap)});
    }
  };

  handlePressSectionTitle = (title: string) => {
    if (title) {
      let openingSectionTitle = [...this.state.openingSectionTitle];
      let index = openingSectionTitle.indexOf(title);
      index === -1
        ? openingSectionTitle.push(title)
        : openingSectionTitle.splice(index, 1);
      this.setState({openingSectionTitle});
    }
  };

  render() {
    const {
      refreshing,
      handleFetchList,
      systemTemplates,
      handlePreviewSystemTemplate,
    } = this.props;
    const {openingSectionTitle, sections} = this.state;
    const lastSectionTitle = sections[sections.length - 1].title;

    let sectionTitleListForColor = [
      ...new Set(sections.map((item: any) => item.title)),
    ];
    sectionTitleListForColor = sectionTitleListForColor.sort();

    const _renderSectionHeader = ({section}: any) => {
      return (
        <TouchableOpacity
          onPress={() => {
            this.handlePressSectionTitle(section.title);
          }}
          style={styles.sectionHeader}>
          <Text style={{lineHeight: 50, fontSize: 16, color: '#2E2E2E'}}>
            {section.title}
          </Text>
          <Text style={{fontSize: 12, color: '#757575'}}>
            {openingSectionTitle.indexOf(section.title) >= 0 ? 'Hide' : 'Show'}
          </Text>
        </TouchableOpacity>
      );
    };

    const _renderSectionFooter = ({section}: any) => {
      return section.title !== lastSectionTitle ? (
        <View style={styles.sectionFooter} />
      ) : (
        <View />
      );
    };

    const _renderItem = ({index, item, section}: any) => {
      const {templates} = item;
      let dIndex = sectionTitleListForColor.indexOf(section.title);
      let itemColor =
        dIndex > -1
          ? backgroundColorEnum[dIndex % 14]
          : backgroundColorEnum[index % 14];

      return openingSectionTitle.indexOf(section.title) >= 0 ? (
        <View style={styles.sysTemplateRow}>
          {templates.map((templateItem: any, index: number) => (
            <TemplateItem
              key={templateItem.pKey ? templateItem.pKey + index : index}
              templateData={templateItem}
              index={index}
              onPress={() => {
                handlePreviewSystemTemplate(templateItem);
              }}
              showCategory={true}
              category={section.title}
              bgColor={itemColor}
            />
          ))}
        </View>
      ) : (
        <View />
      );
    };

    let emptyTip = (
      <View style={styles.emptyWrapper}>
        <Image source={Icon.blankpage3} />
        <Text style={styles.emptyText}>There's no dynamics here.</Text>
      </View>
    );

    return (
      <SectionList
        sections={sections}
        renderSectionHeader={_renderSectionHeader}
        renderSectionFooter={_renderSectionFooter}
        renderItem={sectionItem => _renderItem(sectionItem)}
        keyExtractor={(item, index) => '' + index}
        refreshing={refreshing}
        onRefresh={() => {
          handleFetchList();
        }}
        ListEmptyComponent={emptyTip}
        contentContainerStyle={{
          paddingBottom: setSizeWithPx(80),
        }}
        style={styles.sectionList}
      />
    );
  }
}

const styles = StyleSheet.create({
  sectionList: {},
  sectionHeader: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },
  sectionFooter: {
    marginTop: 8,
    marginHorizontal: 17,
    height: 1,
    backgroundColor: '#E3E4E5',
  },
  sysTemplateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: Page.templateMargin,
  },
  emptyWrapper: {
    width: '100%',
    flex: 1,
    marginTop: (deviceHeight - statusBarHeight - 48 - 223) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: Page.font_family,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#96D0FC',
  },
});
