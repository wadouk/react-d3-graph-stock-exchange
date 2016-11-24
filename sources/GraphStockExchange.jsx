import {
  default as React,
  Component,
} from 'react';

import xhr from 'axios';
import {LineChart} from 'react-d3-basic'

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
      data: [],
      override: [],
    }
  }

  refreshData() {
    xhr.get("/api")
      .then((response) => {
        this.setState({
          data: response.data.slice(-20).map(d => {
            return {
              CAC40: (d.stocks.CAC40),
              NASDAQ: (d.stocks.NASDAQ),
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

  onChange(currency, value) {
    return (event) => {
      const override = this.state.override;
      override[value.index] = (override[value.index] || {});
      override[value.index][currency] = event.target.value;
      this.setState({
        override: override,
      });
    }
  }


  getData() {
    const getValue = ((currency, value) => {
      return (this.state.override[value.index] || {})[currency] || value[currency];
    }).bind(this);

    return this.state.data.map((d) => {
      return this.props.chartSeries.map(tuple => {
        return {[`${tuple.field}`]: getValue(tuple.field, d)};
      }).reduce((reduced, value) => {
        return Object.assign({index: d.index}, reduced, value)
      }, {});
    })
  }

  renderTable() {
    var datas = this.getData();

    return (
      <table onMouseEnter={this.stopInterval.bind(this)} onMouseLeave={this.startInterval.bind(this)}>
        <thead>
        <tr>
          <th>Currencies</th>
          {datas.map(d => {
            return (<th key={d.index}>{d.index}</th>)
          })}
        </tr>
        </thead>
        <tbody>
        {this.props.chartSeries.map(tuple => {
          return (
            <tr key={tuple.field}>
              <td style={{color: tuple.color}}>{tuple.name}</td>
              {datas.map(value => {
                return (<td key={value.index}>
                  <input
                    onChange={this.onChange(tuple.field, value)}
                    value={value[tuple.field]}
                    style={{width: "40px"}}/>
                </td>)
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
      <LineChart margins={{left: 100, right: 100, top: 50, bottom: 50}}
                 width={1000}
                 height={500}
                 chartSeries={this.props.chartSeries}
                 data={this.getData()} x={(d) => d.index}/>
      {this.renderTable()}
    </div>)
  }

}