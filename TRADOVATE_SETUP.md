# TradingView API Setup Guide

## Simple 2-Step Setup

### Step 1: Get Your TradingView API Key
1. Go to https://www.tradingview.com/
2. Log into your TradingView account (requires paid plan with API access)
3. Go to Settings > API Keys
4. Generate a new API key
5. Copy the API key (keep it safe!)

### Step 2: Add Your API Key
In the Replit environment, go to the "Secrets" tab and add:
- `TRADINGVIEW_API_KEY` = your API key from TradingView

### Step 3: Test Connection
1. Go to the "Live Trading" page in the app
2. Click "Test Connection"
3. If it works, you'll see live market quotes!

## What You'll Get

✅ **Real-Time Quotes**: Live market data for stocks, forex, crypto, futures
✅ **Market Analysis**: Price data, volume, bid/ask spreads
✅ **Symbol Search**: Access to thousands of trading instruments
✅ **Historical Data**: Chart data for technical analysis
✅ **Broker Integration**: Connect your broker accounts through TradingView
✅ **Auto Refresh**: Data updates every 10 seconds automatically

## Popular Symbols Included

- **Stocks**: AAPL, TSLA, MSFT, SPY, QQQ
- **Futures**: ES (S&P 500), NQ (Nasdaq), CL (Oil)
- **Forex**: EURUSD, GBPUSD, USDJPY
- **Crypto**: BTCUSDT, ETHUSDT

## Requirements

- TradingView paid subscription with API access
- Valid API key from TradingView portal

## Troubleshooting

**Connection Failed?**
- Make sure you have a paid TradingView subscription with API access
- Double-check your API key is correct
- Verify the API key hasn't expired

**No Market Data?**
- Check if you have real-time data permissions for the exchanges
- Make sure your TradingView subscription includes the markets you want
- Try with popular symbols first (AAPL, SPY, etc.)

That's it! Much more powerful than basic broker APIs - you get access to TradingView's entire ecosystem.