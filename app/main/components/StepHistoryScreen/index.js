import React, {useState, useEffect} from 'react';
import {
  View,
  SafeAreaView,
  StatusBar,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  processColor,
} from 'react-native';
import Fitness from '@ovalmoney/react-native-fitness';
// import { BarChart } from 'react-native-charts-wrapper';
import {isIPhoneX} from '../../../core/utils/isIPhoneX';

import {Dimensions} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {ScrollView} from 'react-native-gesture-handler';
// import { LineChart, Grid } from 'react-native-svg-charts'
import moment from 'moment';
import 'moment/locale/vi'; // without this line it didn't work
import Header from '../../../base/components/Header';
import BarChart from './BarChart';
import message from '../../../core/msg/stepCount';
import {injectIntl, intlShape} from 'react-intl';
import * as fontSize from '../../../core/fontSize';
const screenWidth = Dimensions.get('window').width;
const StepCount = ({props, intl, navigation}) => {
  const {formatMessage} = intl;

  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43],
        color: (opacity = 1) => `#fe4358`, // optional
        strokeWidth: 2, // optional
      },
    ],
  };
  const [selectDate, setSelectDate] = useState(true);
  const [selectWeek, setSelectWeek] = useState(false);
  const [selectMonth, setSelectMonth] = useState(false);
  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: '#fff',
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) => `#fe4358`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };
  const [time, setTime] = useState([]);
  const [countStep, setCountStep] = useState(null);
  const [countRest, setCountRest] = useState(0);
  const [countCarlo, setCountCarlo] = useState(0);
  const [distant, setDistant] = useState(0);
  const [year, setYear] = useState('');
  const totalCount = 10000;
  const permissions = [
    {
      kind: Fitness.PermissionKinds.Steps,
      access: Fitness.PermissionAccesses.Read,
    },
    {
      kind: Fitness.PermissionKinds.Calories,
      access: Fitness.PermissionAccesses.Read,
    },
    {
      kind: Fitness.PermissionKinds.Distances,
      access: Fitness.PermissionAccesses.Read,
    },
  ];
  const [dataChart, setDataChart] = useState([]);
  const xAxis = {
    granularityEnabled: true,
    granularity: 1,
    xAxisvalueFormatter: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
    ],
    position: 'TOP',
    labelCount: 7,
    avoidFirstLastClipping: true,
  };
  useEffect(() => {
    var end = new Date();
    end.setDate(end.getDate() + 1);
    var start = new Date();
    // let listDate = getListDate(start, end)

    getPermission(
      moment(start.getTime())
        .format('YYYY-MM-DD')
        .toString(),
      moment(end.getTime())
        .format('YYYY-MM-DD')
        .toString(),
    );
  }, []);
  const onSetSelect = type => () => {
    if (type == 1) {
      let start = new Date();

      let end = new Date();
      end.setDate(start.getDate() + 1);
      getPermission(
        moment(start.getTime())
          .format('YYYY-MM-DD')
          .toString(),
        moment(end.getTime())
          .format('YYYY-MM-DD')
          .toString(),
      );
      setSelectDate(true);
      setSelectMonth(false);
      setSelectWeek(false);
      return;
    }
    if (type == 2) {
      let end = new Date();
      var start = new Date().setDate(new Date().getDate() - 6);
      getPermission(
        moment(start)
          .format('YYYY-MM-DD')
          .toString(),
        moment(end)
          .format('YYYY-MM-DD')
          .toString(),
      );
      setSelectDate(false);
      setSelectMonth(false);
      setSelectWeek(true);
      return;
    }
    if (type == 3) {
      let month = new Date().getMonth();
      let year = new Date().getFullYear();
      let end = new Date();
      var start = new Date(year, month, 1);
      getPermission(
        moment(start)
          .format('YYYY-MM-DD')
          .toString(),
        moment(end)
          .format('YYYY-MM-DD')
          .toString(),
      );
      setSelectDate(false);
      setSelectMonth(true);
      setSelectWeek(false);
      return;
    }
  };
  const getDaysInMonth = (month, year) => {
    var date = new Date(year, month, 1);
    var days = [];
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };
  const getPermission = (start, end) => {
    Fitness.isAuthorized(permissions)
      .then(res => {
        if (res == true) {
          let listDate = getListDate(start, end);
          renderDataMap(listDate);
          onGetSteps(start, end);
          onGetCalories(start, end);
          onGetDistances(start, end);
        } else {
          Fitness.requestPermissions(permissions)
            .then(res => {})
            .catch(err => {});
        }
      })
      .catch(err => {
        Fitness.requestPermissions(permissions)
          .then(res => {})
          .catch(err => {});
      });
    // Fitness.requestPermissions(permissions).then(res => {
    //     Fitness.getSteps({ startDate: '2020/12/01', endDate: '2020/12/03' }).then(res => {
    //
    //         // setCountStep(res)
    //         alert(JSON.stringify(res))
    //     })
    //

    // }).catch(err => {
    //     alert(JSON.stringify(err))

    //

    // })
  };
  const renderDataMap = listDate => {
    let valueDate = [];
    listDate.map(obj => {
      valueDate.push({
        x: obj,
      });
    });
  };
  const onGetSteps = (start, end) => {
    try {
      var valueDate = [];
      var valueTime = [];
      var total = 0;
      Fitness.getSteps({startDate: start, endDate: end})
        .then(res => {
          setYear(moment(end).format('YYYY'));
          if (res.length) {
            res.map(obj => {
              valueTime.push(moment(obj.endDate).format('MM/DD'));
              valueDate.push({
                marker: obj.quantity,
                y: obj.quantity,
                year: moment(end).format('YYYY'),
              });
              total += obj.quantity;
            });
            setTime(valueTime);

            setCountStep(numberWithCommas(total));

            setCountRest(totalCount - total);

            let dataChart = [
              {
                // label: "demo",
                values: valueDate,

                // config: {
                //     color: processColor('#fe4358'),
                //     drawCircles: true,
                //     lineWidth: 3,
                //     drawValues: false,
                //     axisDependency: 'LEFT',
                //     circleColor: processColor('#fe4358'),
                //     circleRadius: 5,
                //     drawCircleHole: false,
                //     mode: 'HORIZONTAL_BEZIER',
                // },
              },
            ];

            setDataChart(dataChart);
          } else {
            let dataNull = [
              {
                startDate: start,
                endDate: end,
                quantity: 0,
              },
            ];

            dataNull.map(obj => {
              valueTime.push(moment(obj.endDate).format('MM/DD'));
              valueDate.push({
                marker: obj.quantity,
                y: obj.quantity,
                year: moment(end).format('YYYY'),
              });
              total += obj.quantity;
            });
            setTime(valueTime);

            setCountStep(numberWithCommas(total));

            setCountRest(totalCount - total);

            let dataChart = [
              {
                // label: "demo",
                values: valueDate,

                // config: {
                //     color: processColor('#fe4358'),
                //     drawCircles: true,
                //     lineWidth: 3,
                //     drawValues: false,
                //     axisDependency: 'LEFT',
                //     circleColor: processColor('#fe4358'),
                //     circleRadius: 5,
                //     drawCircleHole: false,
                //     mode: 'HORIZONTAL_BEZIER',
                // },
              },
            ];

            setDataChart(dataChart);
          }
        })
        .catch(err => {});
    } catch (e) {}
  };
  const onGetDistances = (start, end) => {
    Fitness.getDistances({startDate: start, endDate: end})
      .then(res => {
        //
        var total = 0;
        res.map(obj => {
          total += obj.quantity;
        });
        total = total / 1000;
        setDistant(total.toFixed(1));
      })
      .catch(err => {});
  };
  const addDays = (date, days = 1) => {
    var list = [];
    const result = new Date(date);
    result.setDate(result.getDate() + days);

    list.push(result);

    return [...list];
  };

  const getListDate = (startDate, endDate, range = []) => {
    var start = new Date(startDate);
    var end = new Date(endDate);

    if (start > end) {
      return range;
    }
    const next = addDays(start, 1);
    return getListDate(next, end, [...range, start]);
  };
  const numberWithCommas = x => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };
  const onGetCalories = (start, end) => {
    Fitness.getCalories({startDate: start, endDate: end})
      .then(res => {
        //
        var total = 0;
        res.map(obj => {
          total += obj.quantity;
        });
        setCountCarlo(total);
      })
      .catch(err => {});
  };
  const onBack = () => {
    try {
      navigation.pop();
    } catch (e) {}
  };
  const onShowMenu = () => {
    navigation.openDrawer();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />

      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        {/* <View>
                    <Text>Thống kê bước chân</Text>
                </View> */}
        <Header
          onBack={onBack}
          colorIcon={'#FE4358'}
          title={formatMessage(message.stepCountHistory)}
          styleHeader={styles.header}
          styleTitle={{
            color: '#000',
            fontSize: fontSize.bigger,
          }}
          styleHeader={{justifyContent: 'space-around'}}
          showMenu={true}
          onShowMenu={onShowMenu}
        />
        <View style={styles.viewLineChart}>
          {(dataChart.length && <BarChart data={dataChart} time={time} />) ||
            null}
          {/* <BarChart style={styles.chart}
                        data={dataChart}
                        style={styles.chart}
                        // data={this.state.data}
                        xAxis={{
                            drawGridLines: true,
                            avoidFirstLastClipping: true,
                            position: 'top',
                            textSize: 10,
                            valueFormatter: 'date',
                            drawAxisLines: false,
                            axisLineColor: processColor('#FFFFFF00'),
                        }}
                        yAxis={{
                            left: {
                                drawGridLines: false,
                                axisLineWidth: 0,
                                axisMinimum: 0,
                            },
                            right: {
                                enabled: false,
                            },
                        }}
                        highlights={[{ x: 3 }, { x: 6 }]}
                        animation={{
                            durationY: 1000,
                        }}
                        chartDescription={{
                            text: '',
                        }}
                        yAxis={{

                            left: {
                                // valueFormatter: 'largeValue',
                                // axisMinimum: 10,
                                // drawAxisLine: false,
                                // gridDashedLine: {
                                //   lineLength: 5,
                                //   spaceLength: 5,
                                // },
                            },
                            right: {
                                inverted: true,
                                enabled: false,
                            },
                        }}
                        // touchEnabled={true}
                        dragEnabled={true}
                        scaleEnabled={true}
                        syncX={true}
                        scaleXEnabled={true}
                        legend={{
                            form: 'SQUARE',
                            horizontalAlignment: 'CENTER',
                            orientation: 'HORIZONTAL',
                            wordWrapEnabled: true,
                            xEntrySpace: 10,
                            formSize: 20,
                            textSize: 13,
                            custom: {
                                colors: '#FE4358'
                            }

                        }}

                        // marker={{
                        //     enabled: true,
                        //     markerColor: processColor('#372B7B'),
                        //     textColor: processColor('#FFF'),
                        //     markerFontSize: 14,
                        // }}
                        scaleYEnabled={true}
                        // visibleRange={this.state.visibleRange}
                        dragDecelerationEnabled={false}
                    // ref="chart"
                    // onChange={this.handleChange.bind(this)}
                    /> */}
        </View>

        <View style={styles.dataHealth}>
          <View style={styles.viewImgData}>
            <Image
              style={styles.img}
              source={require('./images/ic_step.png')}
            />
            <Text style={styles.txData}>{`${formatMessage(
              message.stepsToTarget,
            )} ${countRest > 0 ? countRest : 0}`}</Text>
            <Text style={styles.txUnit}>{`${formatMessage(
              message.stepsNormal,
            )}`}</Text>
          </View>
          <View style={styles.viewImgData}>
            <Image
              style={styles.img}
              source={require('./images/ic_distance.png')}
            />
            <Text style={styles.txData}>{distant}</Text>
            <Text style={styles.txUnit}>{`km`}</Text>
          </View>
          <View style={styles.viewImgData}>
            <Image
              style={styles.img}
              source={require('./images/ic_calories.png')}
            />
            <Text style={styles.txData}>{countCarlo}</Text>
            <Text style={styles.txUnit}>{`kcal`}</Text>
          </View>
          <View style={styles.viewImgData}>
            <Image
              style={styles.img}
              source={require('./images/ic_time.png')}
            />
            <Text style={styles.txData}>{`50`}</Text>
            <Text style={styles.txUnit}>{`${formatMessage(
              message.minute,
            )}`}</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.viewBtn}>
        <TouchableOpacity
          onPress={onSetSelect(1)}
          style={[styles.btnDate, selectDate ? styles.bgRed : {}]}>
          <Text style={[styles.txDate, selectDate ? {} : styles.txGray]}>
            {formatMessage(message.day)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSetSelect(2)}
          style={[styles.btnDate, selectWeek ? styles.bgRed : {}]}>
          <Text style={[styles.txDate, selectWeek ? {} : styles.txGray]}>
            {formatMessage(message.week)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSetSelect(3)}
          style={[styles.btnDate, selectMonth ? styles.bgRed : {}]}>
          <Text style={[styles.txDate, selectMonth ? {} : styles.txGray]}>
            {formatMessage(message.month)}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 30,
  },
  bgRed: {
    backgroundColor: '#fe4358',
  },
  header: {
    backgroundColor: '#ffffff',
    marginTop: isIPhoneX ? 0 : 20,
  },
  txGray: {
    color: '#a1a1a1',
  },
  btnDate: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 50,
  },
  img: {},
  chart: {
    flex: 1,
  },
  viewLineChart: {
    marginTop: 30,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  viewHeight: {
    height: 10,
  },
  viewImgData: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  txData: {
    color: '#fe4358',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  txUnit: {
    fontSize: 14,
    textAlign: 'center',
    color: '#fe4358',
    marginTop: 5,
  },
  dataHealth: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 30,
    marginTop: 20,
    borderTopColor: '#00000010',
    borderBottomColor: '#00000010',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 20,
  },

  viewCircular: {
    paddingVertical: 30,
    marginTop: 20,
    alignItems: 'center',
    marginHorizontal: 20,
    justifyContent: 'center',
  },
  viewBorderCircular: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 200,
  },
  circular: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewFill: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  txCountStep: {
    color: '#fe4358',
    fontSize: 37,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  txCountTarget: {
    color: '#949494',
    fontSize: 14,
  },
  chart: {
    flex: 1,
    height: 300,
  },
  txDate: {
    color: '#fff',
    fontSize: 14,
  },
  txtYear: {
    fontSize: fontSize.normal,
    fontWeight: 'bold',
    paddingBottom: 5,
    alignSelf: 'center',
  },
});
StepCount.propTypes = {
  intl: intlShape.isRequired,
};

export default injectIntl(StepCount);
