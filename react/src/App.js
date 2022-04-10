import logo from './logo.svg';
import './App.css';
import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

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
        <h1>NORTH BOUND</h1>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Direction</TableCell>
                <TableCell align="right">Minutes Away</TableCell>
                <TableCell align="right">Miles Away</TableCell>
                <TableCell align="right">Scheduled Arrival</TableCell>
                <TableCell align="right">Minutes Late</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.buses.map((row) => (
                row.direction == "NB" &&
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.direction}
                  </TableCell>
                  <TableCell align="right">{row.minutes_away}</TableCell>
                  <TableCell align="right">{row.miles_to_stop}</TableCell>
                  <TableCell align="right">{row.scheduled_stop_arrival}</TableCell>
                  <TableCell align="right">{row.seconds_late}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <h1>SOUTH BOUND</h1>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Direction</TableCell>
                <TableCell align="right">Minutes Away</TableCell>
                <TableCell align="right">Miles Away</TableCell>
                <TableCell align="right">Scheduled Arrival</TableCell>
                <TableCell align="right">Minutes Late</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.buses.map((row) => (
                row.direction == "SB" &&
                <TableRow
                  key={row.name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {row.direction}
                  </TableCell>
                  <TableCell align="right">{row.minutes_away}</TableCell>
                  <TableCell align="right">{row.miles_to_stop}</TableCell>
                  <TableCell align="right">{row.scheduled_stop_arrival}</TableCell>
                  <TableCell align="right">{row.seconds_late}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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