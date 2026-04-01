import https from 'https';

https.get('https://api.bybit.com/v5/market/time', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('HTTPS GET Result:', data));
}).on('error', console.error);
