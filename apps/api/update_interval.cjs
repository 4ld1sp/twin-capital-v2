const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://twincapital:tc_dev_secret_2026@localhost:5432/twincapital' });

async function update() {
  await client.connect();
  const res = await client.query("UPDATE deployed_bots SET signal_interval = '10m', updated_at = NOW() WHERE id = '97600622-8915-4cc5-bf4c-2f826e36c812'");
  console.log('Update result:', res.rowCount, 'row(s) updated.');
  await client.end();
}

update().catch(console.error);
