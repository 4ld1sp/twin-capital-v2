import { getWalletBalance } from './src/services/bybitService.js';

getWalletBalance('fake', 'fake')
  .then(res => console.log('Wallet:', res))
  .catch(err => console.error('Wallet Error:', err));
