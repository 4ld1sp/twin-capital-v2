import React, { useEffect, useRef, memo } from 'react';
import { useTrading } from '../../context/TradingContext';

const LiveBacktestChart = ({ height = '100%', hideTopToolbar = false }) => {
  const container = useRef();
  const widgetRef = useRef(null);
  const { getTradingViewSymbol, activeTimeframe, setActiveSymbol, setActiveTimeframe } = useTrading();

  const tvSymbol = getTradingViewSymbol();

  useEffect(() => {
    // Clear previous widget
    if (container.current) {
      const existingDiv = container.current.querySelector('#tradingview_advanced_chart');
      if (existingDiv) existingDiv.innerHTML = '';
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== "undefined" && container.current) {
        widgetRef.current = new window.TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: activeTimeframe,
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: "tradingview_advanced_chart",
          hide_side_toolbar: false,
          hide_top_toolbar: hideTopToolbar,
          withdateranges: true,
          details: true,
          hotlist: true,
          calendar: false,
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
          toolbar_bg: "#131722",
          studies: [
            "STD;EMA",
            "STD;RSI"
          ],
          overrides: {
            "mainSeriesProperties.candleStyle.upColor": "#26a69a",
            "mainSeriesProperties.candleStyle.downColor": "#ef5350",
            "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
            "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
            "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
          },
        });

        // Listen for symbol/interval changes from TradingView
        if (widgetRef.current && widgetRef.current.onChartReady) {
          widgetRef.current.onChartReady(() => {
            const chart = widgetRef.current.activeChart();
            if (chart) {
              chart.onSymbolChanged().subscribe(null, () => {
                const info = chart.symbolExt();
                if (info && info.symbol) {
                  // Extract just the symbol (remove exchange prefix)
                  const sym = info.symbol.includes(':') 
                    ? info.symbol.split(':')[1] 
                    : info.symbol;
                  setActiveSymbol(sym);
                }
              });
              chart.onIntervalChanged().subscribe(null, (interval) => {
                setActiveTimeframe(String(interval));
              });
            }
          });
        }
      }
    };

    // Only add script if not already loaded
    if (!document.querySelector('script[src="https://s3.tradingview.com/tv.js"]')) {
      container.current?.appendChild(script);
    } else if (typeof window.TradingView !== "undefined") {
      script.onload();
    }

    return () => {
      widgetRef.current = null;
    };
  }, [tvSymbol, activeTimeframe]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height, width: "100%" }}>
      <div id="tradingview_advanced_chart" style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

export default memo(LiveBacktestChart);
