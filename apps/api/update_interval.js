import postgres from 'postgres';

const sql = postgres('postgres://twincapital:tc_dev_secret_2026@localhost:5432/twincapital');

async function update() {
  const res = await sql`
    UPDATE deployed_bots 
    SET signal_interval = '10m', updated_at = NOW() 
    WHERE id = '97600622-8915-4cc5-bf4c-2f826e36c812'
  `;
  console.log('Update result:', res.length === 0 ? 'Success' : 'Check failed');
  await sql.end();
}

update().catch(err => {
  console.error(err);
  process.exit(1);
});
