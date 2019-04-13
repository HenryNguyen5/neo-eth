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
  backgroundColor: "#FFFFFF"
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

const cipher1 = `
MATCH q=(a:Address)-[:Transaction]->(:Address)
RETURN q
ORDER BY a.score DESC
LIMIT 500`;

const cipher3 = `
MATCH (a:Address )-[t:Transaction]->( :Address)
WITH a, count(t) as txCount 
WHERE txCount > 100 AND txCount < 200
RETURN a
LIMIT 5;`;

const cipher4 = `
MATCH q=(:Address {address: "0x707C6F7d35798780CEFCE81B747392198566a186"})-[:Transaction*]-(:Address)
RETURN q
LIMIT 500
`;

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
          caption: "score",
          size: "score",
          //  sizeCypher: `MATCH (a:Address) WHERE a.address="0x707C6F7d35798780CEFCE81B747392198566a186" RETURN 100`,

          community: "community"
        }
      },
      relationships: {
        Transaction: {
          caption: "valueEther",
          thickness: "value"
        }
      },
      arrows: true,
      initial_cypher: cipher4
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
