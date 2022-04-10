import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';

const axios = require('axios');


class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { seconds: 0, buses: [] };
  }

  tick() {
    this.setState(state => ({
      seconds: state.seconds + 1
    }));
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1000);

    axios.get('http://127.0.0.1:8000/bus_departures', {'timeout': 5000}).then(resp => {
      console.log(resp.data)
      this.setState(state => ({
        buses: resp.data.buses
      }));
    });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <div>
        Seconds: {this.state.seconds}
      </div>
    );
  }
}

export default App






// class App extends React.Component {

//   getData() {
//     axios.get('http://127.0.0.1:8000/bus_departures').then(resp => {
//       setBuses(resp.data?.buses)
//       console.log(buses)
//     });
//   }

//   componentDidMount() { this.getData() }

//   render() {
//     const [buses,setBuses] = useState([]);
//     return <h1>Hello, {this.props.buses[0].minutes_away}</h1>;
//   }
// }

// export default App









// function App() {

//   const [buses,setBuses] = useState([])

//   const getData = () => {
//     axios.get('http://127.0.0.1:8000/bus_departures').then(resp => {
//       setBuses(resp.data?.buses)
//       console.log(buses)
//     });
//   }

//   componentDidMount() { getData(); }

//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
