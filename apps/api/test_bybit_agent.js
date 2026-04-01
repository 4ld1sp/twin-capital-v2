import https from 'https';

const agent = new https.Agent({
  minVersion: 'TLSv1.2',
  ciphers: 'DEFAULT:@SECLEVEL=1'
});

https.get('https://api.bybit.com/v5/market/time', { agent }, (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => console.log('HTTPS GET Result:', data));
}).on('error', console.error);
