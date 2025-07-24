// Debug July 22nd P&L calculation specifically
const fs = require('fs');

const csvData = fs.readFileSync('attached_assets/Orders (11)_1753376477852.csv', 'utf8');
const lines = csvData.trim().split('\n');
const header = lines[0].split(',');
const rows = lines.slice(1).map(line => {
  const values = line.split(',');
  const row = {};
  header.forEach((key, index) => {
    row[key] = values[index] || '';
  });
  return row;
}).filter(row => row.Status && row.Status.trim() === 'Filled');

console.log('🔍 JULY 22ND DEBUG ANALYSIS');
console.log('==========================');

// Filter July 22nd trades
const july22Trades = rows.filter(row => row.Date === '7/22/25');
console.log('📅 July 22nd filled orders:', july22Trades.length);

july22Trades.forEach((trade, i) => {
  console.log(`${i+1}. ${trade['B/S']} ${trade.Contract} @${trade.avgPrice} x${trade.filledQty} [${trade['Fill Time']}]`);
});

// Calculate expected P&L
if (july22Trades.length === 2) {
  const sellTrade = july22Trades.find(t => t['B/S'].toLowerCase().includes('sell'));
  const buyTrade = july22Trades.find(t => t['B/S'].toLowerCase().includes('buy'));
  
  if (sellTrade && buyTrade) {
    const sellPrice = parseFloat(sellTrade.avgPrice);
    const buyPrice = parseFloat(buyTrade.avgPrice);
    const points = sellPrice - buyPrice;
    const multiplier = 20; // NQ multiplier
    const expectedPnL = points * multiplier;
    
    console.log('\n💰 EXPECTED P&L CALCULATION:');
    console.log(`Sell: ${sellPrice}`);
    console.log(`Buy: ${buyPrice}`);
    console.log(`Points: ${points}`);
    console.log(`Multiplier: ${multiplier}`);
    console.log(`Expected P&L: $${expectedPnL}`);
    console.log(`\n🚨 Dashboard shows: $2437.5`);
    console.log(`🚨 Difference: $${2437.5 - expectedPnL} (should be $0)`);
  }
}
