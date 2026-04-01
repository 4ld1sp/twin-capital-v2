import { testConnection } from './src/services/apiKeyService.js';

testConnection('bybit', { key: 'invalid', secret: 'invalid' })
  .then(res => console.log('Result:', JSON.stringify(res)))
  .catch(err => {
    console.error('Error:', err);
    if (err.cause) console.error('Cause:', err.cause);
    process.exit(1);
  });
