import React, { Component } from "react";
import "./App.css";
import { ResponsiveNeoGraph } from "../components/NeoGraph";

const NEO4J_USER = process.env.REACT_APP_NEO4J_USER!;
const NEO4J_URI = process.env.REACT_APP_NEO4J_URL!;
const NEO4J_PASSWORD = process.env.REACT_APP_NEO4J_PASS!;

export class App extends Component {
  render() {
    return (
      <div className="App">
        <ResponsiveNeoGraph
          containerId={"id0"}
          neo4jUri={NEO4J_URI}
          neo4jUser={NEO4J_USER}
          neo4jPassword={NEO4J_PASSWORD}
        />
      </div>
    );
  }
}
