import React from 'react'
import xhr from 'axios';

export default class GraphStockExchange extends React.Component {
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
          data: response.data.slice(-20)
        });
      });
  }

  componentDidMount() {
    setInterval(this.refreshData.bind(this), 1000);
  }

  render() {
    return (<div>data : {this.state.data.map(d => JSON.stringify(d, null, 2)).join(",")}</div>)
  }
}