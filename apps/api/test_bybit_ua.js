fetch('https://api.bybit.com/v5/market/time', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
  }
}).then(res => res.json()).then(console.log).catch(console.error);
