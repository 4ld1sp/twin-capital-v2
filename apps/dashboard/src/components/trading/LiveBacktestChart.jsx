import React, { useEffect, useRef, memo } from 'react';

const LiveBacktestChart = () => {
  const container = useRef();

  useEffect(() => {
    // Prevent multiple scripts from being added in strict mode
    if (container.current && container.current.querySelector('script')) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== "undefined") {
        new window.TradingView.widget({
          autosize: true,
          symbol: "BINANCE:BTCUSDT",
          interval: "D",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: "tradingview_backtest_hub",
          hide_side_toolbar: false,
          toolbar_bg: "#0B0E14",
        });
      }
    };
    if (container.current) {
      container.current.appendChild(script);
    }
  }, []);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "100%", width: "100%" }}>
      <div id="tradingview_backtest_hub" style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

export default memo(LiveBacktestChart);
