/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View} from 'react-native';
import ChartView from 'react-native-highcharts';

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\nCmd+D or shake for dev menu',
    android: 'Double tap R on your keyboard to reload,\nShake or press menu button for dev men' +
            'u'
});

export default class App extends Component {
    constructor (props) {
        super(props)
        this.state = {
            x: 0
        }
    }

    render() {
        var Highcharts = 'Highcharts';
        var data1 = {} // if you want to use chartData in your config, defined the data proto at here
        var conf = {
            chart: {
                type: 'spline',
                animation: Highcharts.svg, // don't animate in old IE
                marginRight: 10,
                events: {
                    load: function () {
                        // set up the updating of the chart each second
                        var series = this.series[0];
                        setInterval(function () {
                            var x = (new Date()).getTime(), // current time
                                y = Math.random();
                            series.addPoint([
                                x, y
                            ], true, true);
                        }, 1000);
                    }
                }
            },
            title: {
                text: 'Live random data'
            },
            xAxis: {
                type: 'datetime',
                tickPixelInterval: 150
            },
            yAxis: {
                title: {
                    text: 'Value'
                },
                plotLines: [
                    {
                        value: 0,
                        width: 1,
                        color: '#808080'
                    }
                ]
            },
            tooltip: {
                formatter: function () {
                    window.postMessage(this.x)
                    return '<b>' + this.series.name + '</b><br/>' + Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' + Highcharts.numberFormat(this.y, 2);
                }
            },
            legend: {
                enabled: false
            },
            exporting: {
                enabled: false
            },
            series: [
                {
                    name: 'Random data',
                    data: // [{x: 0, y: data1.a}, {x: 1, y: data1.b}] // you can usr your data like this
                    (function () {
                        // generate an array of random data
                        var data = [],
                            time = (new Date()).getTime(),
                            i;

                        for (i = -19; i <= 0; i += 1) {
                            data.push({
                                x: time + i * 1000,
                                y: Math.random()
                            });
                        }
                        return data;
                    }())
                }
            ]
        };

        const options = {
            global: {
                useUTC: false
            },
            lang: {
                decimalPoint: ',',
                thousandsSep: '.'
            }
        };

        const data2 = {
            c: 1,
            d: 2
        }
        return (
            <View>
                <ChartView
                    chartData={{ // data1 and data2 are the variable name in the chart webview
                        data1: {
                            a: 1,
                            b: 2
                        },
                        data2: data2
                    }}
                    style={{height: 300}}
                    config={conf}
                    options={options}
                    baseUri={'Charts/libs'}
                    libsUri={['highstock.js']}
                    constructMethod={ChartView.ConstructMethod.STOCK_CHART}
                    onEvent={(data, e) => this.setState({
                        x: data
                    })}
                />
                <Text>x:{this.state.x}</Text>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF'
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5
    }
});
