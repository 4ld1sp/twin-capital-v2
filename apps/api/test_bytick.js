import https from 'https';

https.get('https://api.bytick.com/v5/market/time', (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('BYTICK GET Result:', data));
}).on('error', console.error);
