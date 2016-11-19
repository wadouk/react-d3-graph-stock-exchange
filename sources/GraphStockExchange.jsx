import {
  default as React,
  Component,
} from 'react';

import xhr from 'axios';
import {LineChart} from 'react-d3-basic'

function summarizeNumber(t, precision = 1) {
  // TODO doesn't handle all numbers
  return t.toString().replace(/(\d)\.(\d+)(e-(\d+))?/g, (match, p1, p2, p3, p4) => {
    function computePrecision(p2_) {
      if (p1 == "0") {
        return p2_.replace(/(0+)/g, "$1").length + precision + 1
      }
      return p2_.length - precision;
    }
    const t2 = Math.round(parseInt(p2, 10) / Math.pow(10, computePrecision(p2)));
    return parseFloat("" + p1 + "." + t2 + "e-" + p4);
  });
}

export default class GraphStockExchange extends Component {
  static defaultProps = {
    chartSeries: [{
      field: 'CAC40',
      name: 'CAC40',
      color: 'blue',
      yOrient: "left",
    }, {
      field: 'NASDAQ',
      name: 'NASDAQ',
      color: 'red',
      yOrient: "right",
    }]
  };

  constructor(props) {
    super(props);
    this.state = {
      data: []
    }
  }

  refreshData() {
    xhr.get("/api")
      .then((response) => {
        this.setState({
          data: response.data.slice(-20).map(d => {
            return {
              CAC40: summarizeNumber(d.stocks.CAC40),
              NASDAQ: summarizeNumber(d.stocks.NASDAQ),
              index: d.index
            }
          })
        });
      });
  }

  componentDidMount() {
    this.startInterval();
  }

  startInterval() {
    this.interval = setInterval(this.refreshData.bind(this), 1000);
  }

  stopInterval() {
    clearInterval(this.interval)
  }

  renderTable() {
    return (
      <table onMouseEnter={this.stopInterval.bind(this)} onMouseLeave={this.startInterval.bind(this)}>
        <tbody>
        {this.props.chartSeries.map(serie => {
          return (
            <tr key={serie.field}>
              <td style={{color: serie.color}}>{serie.name}</td>
              {this.state.data.map(value => {
                return (<td key={value.index}>{value[serie.field]}</td>)
              })}
            </tr>
          )
        })}
        </tbody>
      </table>
    );
  }

  render() {
    return (<div>
      <LineChart margins={{left: 100, right: 100, top: 50, bottom: 50}} width={1000} height={500}
                 chartSeries={this.props.chartSeries}
                 data={this.state.data} x={(d) => d.index}/>
      {this.renderTable()}
    </div>)
  }

}