const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://twincapital:tc_dev_secret_2026@localhost:5432/twincapital' });

async function run() {
  await client.connect();
  const res = await client.query("SELECT id, strategy_name, symbol, signal_interval, status FROM deployed_bots WHERE status = 'running'");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

run().catch(console.error);
