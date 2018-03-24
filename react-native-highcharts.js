import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, WebView } from 'react-native'

class ChartView extends Component {
  static ConstructMethod = {
    STOCK_CHART: 'stockChart',
    CHART: 'chart'
  }

  static propTypes = {
    chartData: PropTypes.object,
    config: PropTypes.object.isRequired,
    options: PropTypes.object,
    baseUri: PropTypes.string.isRequired,
    libsUri: PropTypes.array.isRequired,
    constructMethod: PropTypes.string.isRequired,
    onEvent: PropTypes.func,
    executeAfterChartCreated: PropTypes.string
  }

  static defaultProps = {
    chartData: {},
    style: {},
    config: {},
    options: {},
    baseUri: '',
    libsUri: [],
    constructMethod: 'stockChart'
  }

  constructor (props) {
    super(props)
    this.concatHTML = this._getHtml(props)
  }

  _getHtml (props) {
    let scriptUriArr = props
      .libsUri
      .map(item => {
        return `<script src="${item}"></script>`
      })
    let scripts = scriptUriArr.join('')

    this.chartDataStr = this._getChartDataStr(props.chartData)
    this.optionsStr = this._getOptionsStr(props.options)
    this.configStr = this._getConfigStr(props.config)

    this.headHtml = `<html>
                    <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=0" />
                    <style media="screen" type="text/css">
                    #container {
                        width:100%;
                        height:100%;
                        top:0;
                        left:0;
                        right:0;
                        bottom:0;
                        position:absolute;
                        user-select: none;
                        -webkit-user-select: none;
                    }
                    </style>
                    <head>
                        ${scripts}
                        <script>
                            ${this.chartDataStr}
                            window.onload = function() {
                                Highcharts.setOptions(${this.optionsStr});
                                var chart = Highcharts.${props.constructMethod}('container', `
    this.footerHtml = `      );
                            ${this.props.executeAfterChartCreated && this.props.executeAfterChartCreated}
                        }
                        </script>
                    </head>
                    <body>
                        <div id="container">
                        </div>
                    </body>
                </html>`
    return `${this.headHtml}${this.configStr}${this.footerHtml}`
  }

  _getChartDataStr (chartData) {
    let chartDataStr = ''
    if (chartData) {
      for (let key in chartData) {
        if (chartData.hasOwnProperty(key)) {
          const data = chartData[key]
          const dataStr = JSON.stringify(data, function (key, value) { // create string of json but if it detects function it uses toString()
            return (typeof value === 'function')
              ? value.toString()
              : value
          })
          let newChartData = JSON.parse(dataStr)
          chartDataStr += `var ${key} = ${flattenObject(newChartData)}\n`
        }
      }
    }
    return chartDataStr
  }

  _getOptionsStr (options) {
    return JSON.stringify(options)
  }

  _getConfigStr (config) {
    const configStr = JSON.stringify(config, function (key, value) { // create string of json but if it detects function it uses toString()
      return (typeof value === 'function')
        ? value.toString()
        : value
    })
    const newConfig = JSON.parse(configStr)
    return flattenObject(newConfig)
  }

  shouldComponentUpdate (nextProps) {
    const chartDataStr = this._getChartDataStr(nextProps.chartData)
    const configStr = this._getConfigStr(nextProps.config)
    const optionsStr = this._getOptionsStr(nextProps.options)
    const nextStyleStr = JSON.stringify(nextProps.style)
    const lastStyleStr = JSON.stringify(this.props.style)

    let needUpdate = false

    if (chartDataStr !== this.chartDataStr) {
      this.chartDataStr = chartDataStr
      needUpdate = true
    }

    if (configStr !== this.configStr) {
      this.configStr = configStr
      needUpdate = true
    }

    if (optionsStr !== this.optionsStr) {
      this.optionsStr = optionsStr
      needUpdate = true
    }

    if (needUpdate) {
      this.concatHTML = this._getHtml(nextProps)
      return needUpdate
    }

    return !(nextStyleStr === lastStyleStr && nextProps.baseUri === this.props.baseUri && nextProps.libsUri === this.props.libsUri && nextProps.constructMethod === this.props.constructMethod)
  }

  // used to resize on orientation of display
  reRenderWebView (e) {
    this.setState({height: e.nativeEvent.layout.height, width: e.nativeEvent.layout.width})
  }

  render () {
    return (
      <View style={this.props.style}>
        <WebView
          onLayout={this.reRenderWebView}
          style={styles.full}
          source={{
            html: this.concatHTML,
            baseUrl: this.props.baseUri
          }}
          javaScriptEnabled
          domStorageEnabled
          scalesPageToFit
          scrollEnabled={false}
          onMessage={(e) => {
            this.props.onEvent && this
              .props
              .onEvent(e.nativeEvent.data, e)
          }}
          automaticallyAdjustContentInsets
          {...this.props} />
      </View>
    )
  }
}

let flattenObject = function (obj, str = '{') {
  Object
    .keys(obj)
    .forEach(function (key) {
      str += `${key}: ${flattenText(obj[key])}, `
    })
  if (str === '{') {
    return '{}'
  } else {
    return `${str.slice(0, str.length - 2)}}`
  }
}

let isArray = (o) => {
  return Object.prototype.toString.call(o) === '[object Array]'
}

let flattenText = function (item, key) {
  if (key === 'y') { console.log(item, typeof item) }
  let str = ''
  if (item && typeof item === 'object' && !isArray(item)) {
    str += flattenObject(item)
  } else if (item && typeof item === 'object' && isArray(item)) {
    str += '['
    item.forEach(function (k2) {
      str += `${flattenText(k2)}, `
    })
    if (item.length > 0) { str = str.slice(0, str.length - 2) }
    str += ']'
  } else if (typeof item === 'string' && item.slice(0, 8) === 'function') {
    str += `${item}`
  } else if (typeof item === 'string') {
    str += `\"${item.replace(/"/g, '\\"')}\"`
  } else {
    str += `${item}`
  }
  return str
}

let styles = StyleSheet.create({
  full: {
    flex: 1,
    backgroundColor: 'transparent'
  }
})

module.exports = ChartView
