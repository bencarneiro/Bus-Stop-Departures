import logo from "./logo.svg";
import "./App.css";
import React, { useState } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const axios = require("axios");

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { seconds: 0, buses: [] };
  }

  updateTimes() {
    axios
      .get("http://localhost:8000/bus_departures", { timeout: 5000 })
      .then((resp) => {
        console.log(resp);
        this.setState((state) => ({
          buses: resp.data.buses,
        }));
      });
  }

  tick() {
    if (this.state.seconds % 15 == 14) {
      this.updateTimes();
    }
    this.setState((state) => ({
      seconds: state.seconds + 1,
    }));
  }

  componentDidMount() {
    this.interval = setInterval(() => this.tick(), 1000);

    axios
      .get("http://localhost:8000/bus_departures", { timeout: 5000 })
      .then((resp) => {
        console.log(resp);
        this.setState((state) => ({
          buses: resp.data.buses,
        }));
      });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <div>
        <h1>NORTH BOUND</h1>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Current Stop</TableCell>
                <TableCell align="right">Miles Away</TableCell>
                <TableCell align="right">Scheduled Arrival</TableCell>
                <TableCell align="right">Minutes Late</TableCell>
                <TableCell align="right">Minutes Away</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.buses?.map(
                (row) =>
                  row.direction == "NB" && (
                    <TableRow
                      key={row.name}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      {row.status == 2 && (
                        <TableCell component="th" scope="row">
                          En Route To {row.current_stop_name}
                        </TableCell>
                      )}
                      {row.status == 1 && (
                        <TableCell component="th" scope="row">
                          Stopped At {row.current_stop_name}
                        </TableCell>
                      )}
                      {row.miles_to_stop !== "Unknown" && (
                        <TableCell align="right">
                          {Math.round(row.miles_to_stop * 10) / 10}
                        </TableCell>
                      )}
                      {row.miles_to_stop == "Unknown" && (
                        <TableCell align="right">{row.miles_to_stop}</TableCell>
                      )}
                      {row.minutes_to_scheduled > 0 && (
                        <TableCell align="right">
                          {row.scheduled_stop_arrival} (
                          {row.minutes_to_scheduled} Min)
                        </TableCell>
                      )}
                      {row.minutes_to_scheduled < 0 && (
                        <TableCell align="right">
                          {row.scheduled_stop_arrival} (
                          {row.minutes_to_scheduled * -1} Min Ago)
                        </TableCell>
                      )}
                      {row.minutes_to_scheduled == 0 && (
                        <TableCell align="right">
                          {row.scheduled_stop_arrival} (NOW)
                        </TableCell>
                      )}
                      <TableCell align="right">
                        {Math.round(row.seconds_late / 60)}
                      </TableCell>
                      <TableCell align="right">{row.minutes_away}</TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <h1>SOUTH BOUND</h1>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Current Stop</TableCell>
                <TableCell align="right">Miles Away</TableCell>
                <TableCell align="right">Scheduled Arrival</TableCell>
                <TableCell align="right">Minutes Late</TableCell>
                <TableCell align="right">Minutes Away</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.buses?.map(
                (row) =>
                  row.direction == "SB" && (
                    <TableRow
                      key={row.name}
                      sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                    >
                      {row.status == 2 && (
                        <TableCell component="th" scope="row">
                          En Route To {row.current_stop_name}
                        </TableCell>
                      )}
                      {row.status == 1 && (
                        <TableCell component="th" scope="row">
                          Stopped At {row.current_stop_name}
                        </TableCell>
                      )}
                      {row.miles_to_stop !== "Unknown" && (
                        <TableCell align="right">
                          {Math.round(row.miles_to_stop * 10) / 10}
                        </TableCell>
                      )}
                      {row.miles_to_stop == "Unknown" && (
                        <TableCell align="right">{row.miles_to_stop}</TableCell>
                      )}
                      {row.minutes_to_scheduled > 0 && (
                        <TableCell align="right">
                          {row.scheduled_stop_arrival} (
                          {row.minutes_to_scheduled} Min)
                        </TableCell>
                      )}
                      {row.minutes_to_scheduled < 0 && (
                        <TableCell align="right">
                          {row.scheduled_stop_arrival} (
                          {row.minutes_to_scheduled * -1} Min Ago)
                        </TableCell>
                      )}
                      {row.minutes_to_scheduled == 0 && (
                        <TableCell align="right">
                          {row.scheduled_stop_arrival} (NOW)
                        </TableCell>
                      )}
                      <TableCell align="right">
                        {Math.round(row.seconds_late / 60)}
                      </TableCell>
                      <TableCell align="right">{row.minutes_away}</TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    );
  }
}

export default App;
