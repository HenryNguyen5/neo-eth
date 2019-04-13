import { v1 as neo4j } from "neo4j-driver";
import { ethers } from "ethers";
import mapValues from "lodash/mapValues";

type TransactionResponse = ethers.providers.TransactionResponse;
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

interface ExtendedBlock extends ethers.providers.Block {
  fetchedTransactions: TransactionResponse[];
}

async function getExtendedBlock(blockNum: number): Promise<ExtendedBlock> {
  console.log("Getting block ", blockNum);
  const block = await provider.getBlock(blockNum, true);

  // fix include transactions typing
  console.log("block ", blockNum, " fetched");

  return { ...block, fetchedTransactions: block.transactions as any };
}

async function getBlocksAndExec(
  startBlockNum: number,
  endBlockNum: number,
  executor: (block: ExtendedBlock) => Promise<void>
) {
  //   const blocks: ExtendedBlock[] = [];
  for (let i = startBlockNum; i <= endBlockNum; i++) {
    await executor(await getExtendedBlock(i));
    console.log(`Block ${i} inserted`);

    // blocks.push(await getExtendedBlock(i));
  }
  //   return blocks;
}

interface StorableTransaction {
  blockNumber?: number;
  blockHash?: string;
  timestamp?: number;
  confirmations: number;
  from: string;
  raw?: string;
  hash?: string;
  to?: string;
  nonce: number;
  gasLimit: string;
  gasPrice: string;
  data: string;
  value: string;
  chainId: number;
  r?: string;
  s?: string;
  v?: number;
}

function getStorableTransaction(
  transaction: TransactionResponse
): StorableTransaction {
  const storableTransaction = (mapValues(
    transaction,
    (value, key: keyof TransactionResponse) => {
      switch (key) {
        case "wait":
          return undefined;
        case "gasLimit":
          return (value as any).toString(10);
        case "gasPrice":
          return (value as any).toString(10);
        case "value":
          return (value as any).toString(10);
        default:
          return value;
      }
    }
  ) as unknown) as StorableTransaction;
  return storableTransaction;
}

enum Env {
  NEO4J_USER = "NEO4J_USER",
  NEO4J_PASS = "NEO4J_PASS"
}

function getEnvVars<T extends string[]>(...variableNames: T) {
  const vars = variableNames.map(v => process.env[v]) as T;
  return vars;
}

function getDbDriver() {
  return neo4j.driver(
    `bolt://localhost`,
    neo4j.auth.basic(...getEnvVars(Env.NEO4J_USER, Env.NEO4J_PASS))
  );
}

async function insertEthTransactionsFrom(block: ExtendedBlock) {
  const session = getSession();

  await session.writeTransaction(async tx => {
    await Promise.all(
      block.fetchedTransactions.map(ethTx => insertEthTransaction(ethTx, tx))
    );
  });
}

async function insertEthTransaction(
  transaction: ExtendedBlock["fetchedTransactions"][number],
  tx: neo4j.Transaction
) {
  const storableTransaction = getStorableTransaction(transaction);

  const { from, to, value } = storableTransaction;

  await insertAddress(to || ethers.constants.AddressZero, tx);
  await insertAddress(from, tx);

  tx.run(
    `
        MATCH (from:Address { address: $from }), (to: Address { address: $to })
        CREATE (from)-[tx:Transaction $tx]->(to)`,
    {
      from,
      to: to || ethers.constants.AddressZero,
      tx: {
        value,
        valueEther: `${Number(ethers.utils.formatEther(value)).toFixed(2)} ETH`
      }
    }
  );
}

async function insertAddress(address: string, transaction: neo4j.Transaction) {
  await transaction.run(`MERGE (a:Address {address: $address})`, { address });
}

let session: neo4j.Session | null = null;

function getSession(): neo4j.Session {
  if (!session) {
    throw Error("No session found");
  }
  return session;
}

async function deleteTransactions() {
  const session = getSession();
  return await session.run(`
    MATCH (address: Address)
    DETACH DELETE address`);
}

async function pagerank() {
  const session = getSession();
  const q = `CALL algo.pageRank.stream('Address', 'Transaction', {iterations:20, dampingFactor:0.85})
YIELD nodeId, score
WITH algo.asNode(nodeId) AS a, score
ORDER BY score DESC
MERGE (b: Address{address: a.address})
ON MATCH SET b.score = score`;
  console.log("running pagerank...");
  await session.run(q);
  console.log("done");
}

async function seedDb() {
  const session = getSession();
  await session.run(`CREATE INDEX ON :Address(address)`);
  await deleteTransactions();
  await getBlocksAndExec(7_490_652, 7_497_852, insertEthTransactionsFrom);
}

async function computeCommunities() {
  const session = getSession();
  const q = `CALL algo.scc('Address','Transaction', {write:true,partitionProperty:'community'})
YIELD loadMillis, computeMillis, writeMillis, setCount, maxSetSize, minSetSize
RETURN maxSetSize, minSetSize;`;
  await session.run(q);
}
async function main() {
  const driver = getDbDriver();
  session = driver.session();
  await pagerank();

  //   console.log(delRes.records);
  //   res.forEach(r => r && console.log(r.records));
  session.close();
  process.exit(0);
}

main();
