import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";
import { ResponsiveNeoGraph } from "../components/NeoGraph";

const NEO4J_URI = "bolt://localhost:7687";
const NEO4J_USER = "neo4j";

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
