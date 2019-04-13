# Running server

1. Navigate to /server
2. Run `yarn`
3. Setup a Parity node with JSON-RPC api enabled
4. Have neo4j database running
5. Seed the database with `yarn start` after the parity node has synchronized
6. If needed, run the page rank + community algorithms to derive metadata from the wallets

# Running client

1. Navigate to /client
2. Run `yarn`
3. Populate environment variables needed by App.tsx in `.env.local`
4. Run `yarn start`
