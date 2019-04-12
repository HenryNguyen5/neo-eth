import React, { Component } from "react";
import useResizeAware from "react-resize-aware";
const NeoVis = require("neovis.js");
console.log(NeoVis);
interface ResponsiveProps {
  containerId: string;
  neo4jUri: string;
  neo4jUser: string;
  neo4jPassword: string;
  backgroundColor?: string;
}

export function ResponsiveNeoGraph(props: ResponsiveProps) {
  const [resizeListener, sizes] = useResizeAware();

  const { height, width } = sizes;
  const neoGraphProps = {
    ...props,
    width: Math.max(height, width),
    height: Math.max(height, width)
  };

  return (
    <div style={{ position: "relative" }}>
      {resizeListener}
      <NeoGraph {...neoGraphProps} />
    </div>
  );
}

ResponsiveNeoGraph.defaultProps = {
  backgroundColor: "#d3d3d3"
};

interface Props {
  width: number;
  height: number;
  containerId: string;
  neo4jUri: string;
  neo4jUser: string;
  neo4jPassword: string;
  backgroundColor?: string;
}

export class NeoGraph extends Component<Props> {
  visRef: React.RefObject<HTMLDivElement>;

  public static defaultProps: Partial<Props> = {
    width: 600,
    height: 600,
    backgroundColor: "#d3d3d3"
  };
  vis: any;
  constructor(props: Props) {
    super(props);
    this.visRef = React.createRef();
  }

  public componentDidMount() {
    const { neo4jUri, neo4jUser, neo4jPassword } = this.props;

    const config = {
      container_id: this.visRef.current!.id,
      server_url: neo4jUri,
      server_user: neo4jUser,
      server_password: neo4jPassword,
      labels: {
        Address: {
          community: "address",
          size: "score"
        }
      },
      relationships: {
        Transaction: {}
      },
      initial_cypher: `
      CALL algo.pageRank.stream('Address', 'Transaction', {iterations:20, dampingFactor:0.85})
      YIELD nodeId, score
      RETURN algo.asNode(nodeId) AS Address,score
      ORDER BY score DESC
      LIMIT 5;`,
      arrows: true
    };

    this.vis = new NeoVis.default(config);
    this.vis.render();
  }

  render() {
    const { width, height, containerId, backgroundColor } = this.props;
    return (
      <div
        id={containerId}
        ref={this.visRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          backgroundColor: `${backgroundColor}`
        }}
      />
    );
  }
}
