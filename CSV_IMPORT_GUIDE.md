# 📊 PropTraderJournal - Complete CSV Import Guide

## Overview
PropTraderJournal supports importing trading data from multiple platforms and brokers through various CSV upload methods. This guide covers all supported formats, requirements, and best practices.

## 🔧 Import Methods Available

### 1. **Universal CSV Importer** (Recommended)
- **Location**: Trades page → "Import CSV" tab
- **Features**: Auto-detects platform format, column mapping interface
- **Best For**: All major trading platforms and custom formats

### 2. **Automatic CSV Import**
- **Location**: Trades page → Quick import button
- **Features**: Hidden complexity, automatic processing
- **Best For**: Standard broker formats

### 3. **Robust Trade Entry**
- **Location**: Advanced import interface
- **Features**: Data validation, error checking, preview
- **Best For**: Large files requiring validation

## 📋 Supported Trading Platforms

### **Major Platforms Supported:**
- **Tradovate** - Futures trading platform
- **MetaTrader 4/5** - Forex and CFD platform
- **Rithmic** - Professional futures platform
- **CQG** - Professional trading platform
- **NinjaTrader** - Advanced charting and trading
- **Interactive Brokers** - Multi-asset broker
- **FTMO** - Prop trading firm
- **TopstepTrader** - Prop trading firm
- **ThinkorSwim** - TD Ameritrade platform
- **Binance** - Cryptocurrency exchange

## 📁 CSV File Requirements

### **File Format Requirements:**
- **File Type**: `.csv` files only
- **Encoding**: UTF-8 (recommended)
- **Size Limit**: Up to 50MB per file
- **Separator**: Comma-separated values

### **Required Data Columns:**
The system can process two main types of CSV files:

#### **Type 1: Order-based CSV (Most Common)**
```csv
Date,Time,Symbol,Side,Quantity,Price,Status,OrderId
2025-01-15,09:30:00,ES,Buy,1,4500.25,Filled,12345
2025-01-15,09:45:00,ES,Sell,1,4510.50,Filled,12346
```

**Required Columns:**
- `Date` - Trade date (YYYY-MM-DD or MM/DD/YYYY)
- `Symbol` - Trading instrument (ES, NQ, etc.)
- `Side` - Buy/Sell or Long/Short
- `Quantity` - Number of contracts/shares
- `Price` - Execution price
- `Status` - Filled/Open/Canceled

**Optional Columns:**
- `Time` - Execution time
- `OrderId` - Unique order identifier
- `OrderType` - Market/Limit/Stop
- `Commission` - Trading fees
- `P&L` - Profit/Loss amount

#### **Type 2: Completed Trades CSV**
```csv
EnteredAt,ExitedAt,Symbol,Side,Quantity,EntryPrice,ExitPrice,PnL
2025-01-15 09:30:00,2025-01-15 10:15:00,ES,Long,1,4500.25,4510.50,250.00
```

**Required Columns:**
- `EnteredAt` - Entry date/time
- `ExitedAt` - Exit date/time
- `Symbol` - Trading instrument
- `Side` - Long/Short or Buy/Sell
- `EntryPrice` - Entry execution price
- `ExitPrice` - Exit execution price
- `PnL` - Profit/Loss amount

## 🎯 Stop Loss & Take Profit Detection

### **Advanced SL/TP Analysis:**
The system automatically detects and tracks:

1. **Initial Levels**: First stop loss and take profit levels set
2. **Final Levels**: Last modified levels before trade closure
3. **Movement Tracking**: Whether stops were moved favorably or against the trader
4. **Discipline Analysis**: How well trader managed risk and let profits run

### **Detection Algorithm:**
- Analyzes order sequences within trading windows
- Groups related orders by symbol and time proximity
- Distinguishes between initial placement and modifications
- Calculates discipline scores based on movement patterns

## 💾 Account Integration

### **Account Selection:**
- **Required**: Must select target account before import
- **Validation**: CSV account ID consistency checking
- **Security**: Each account only accepts its own CSV files

### **Account ID Validation:**
- First CSV import stores the account ID
- Subsequent imports must match the same account ID
- Prevents accidental cross-contamination of trading data
- Error messages guide users to correct account selection

## 📊 Import Process

### **Step-by-Step Process:**

1. **Select Account**
   - Choose target PropFirm account
   - Account must be active and accessible

2. **Upload CSV File**
   - Drag & drop or browse for file
   - File validation occurs automatically
   - Preview of data structure shown

3. **Column Mapping** (Universal Importer)
   - Auto-detection of platform format
   - Manual mapping interface for custom formats
   - Real-time preview of mapped data

4. **Data Validation**
   - Check for required fields
   - Validate date formats and numeric values
   - Flag potential issues before import

5. **Processing & Analysis**
   - Group orders into complete trades
   - Analyze stop loss/take profit movements
   - Calculate discipline and behavioral metrics

6. **Import Completion**
   - Summary of records processed
   - Count of successful imports
   - List of any errors or warnings

## ⚠️ Common Issues & Solutions

### **File Format Issues:**
- **Problem**: "Invalid CSV format"
- **Solution**: Ensure comma-separated values, check for extra quotes or special characters

### **Date Format Problems:**
- **Problem**: "Cannot parse date"
- **Solution**: Use YYYY-MM-DD format or MM/DD/YYYY with consistent formatting

### **Missing Required Fields:**
- **Problem**: "Missing required column"
- **Solution**: Ensure all required columns are present and properly named

### **Account Mismatch:**
- **Problem**: "Account ID mismatch"
- **Solution**: Use the same account that was used for the first CSV import

### **Duplicate Trades:**
- **Problem**: "Duplicate trade detected"
- **Solution**: Check if trades were already imported, use date filters if needed

## 🔍 Data Quality Checks

### **Automatic Validations:**
- **Date Consistency**: Entry dates before exit dates
- **Price Validation**: Reasonable price ranges for instruments
- **P&L Calculation**: Verify P&L matches price differences
- **Quantity Checks**: Positive quantities, reasonable trade sizes
- **Symbol Validation**: Recognizable trading instruments

### **Discipline Scoring:**
- **Risk Management**: Analysis of position sizing consistency
- **Stop Loss Discipline**: Tracking of stop loss modifications
- **Profit Taking**: Analysis of take profit level management
- **Emotional Control**: Detection of revenge trading patterns
- **Consistency**: Evaluation of trading plan adherence

## 📈 Post-Import Features

### **Immediate Updates:**
- Dashboard widgets refresh with new data
- Discipline scores recalculated
- Performance metrics updated
- Risk management statistics refreshed

### **Enhanced Analysis:**
- **Trade Documentation**: Image URLs and TradingView links supported
- **Behavioral Insights**: Psychological pattern detection
- **Performance Tracking**: Real-time P&L and drawdown monitoring
- **Compliance Monitoring**: PropFirm rule adherence checking

## 🛠️ Advanced Features

### **Bulk Import Capabilities:**
- Import multiple days/weeks of trading data
- Process large CSV files (thousands of trades)
- Batch processing with progress indicators
- Error recovery and partial import support

### **Platform-Specific Optimizations:**
- **Tradovate**: Optimized for futures contract notation
- **MetaTrader**: Forex pair and CFD handling
- **Interactive Brokers**: Multi-asset class support
- **Prop Firms**: Challenge and funded account tracking

### **Custom Column Mapping:**
- Map any CSV column to required fields
- Save mapping templates for reuse
- Support for custom field names
- Flexible date/time format handling

## 🔐 Security & Privacy

### **Data Protection:**
- CSV files processed server-side only
- No permanent storage of raw CSV content
- Account-specific data isolation
- Secure authentication required

### **Access Control:**
- User-specific account access
- PropFirm account segregation
- Session-based authentication
- Audit trail of all imports

## 📞 Support & Troubleshooting

### **Getting Help:**
- Check this guide for common solutions
- Review error messages for specific guidance
- Use the preview feature to validate data before import
- Contact support with specific error details

### **Best Practices:**
1. **Start Small**: Test with a few trades first
2. **Clean Data**: Remove unnecessary columns and formatting
3. **Consistent Formatting**: Use consistent date and number formats
4. **Regular Backups**: Keep original CSV files as backups
5. **Account Verification**: Double-check account selection before import

---

## 📋 Quick Reference

### **Supported File Types:** `.csv`
### **Max File Size:** 50MB
### **Required Fields:** Date, Symbol, Side, Quantity, Price
### **Import Location:** Trades page → Import CSV tab
### **Processing Time:** 1-5 minutes depending on file size
### **Account Integration:** Full PropFirm account compatibility

---

*Last Updated: July 18, 2025*
*PropTraderJournal v2.0 - Elite Trading Journal*