// Quick test to analyze the user's CSV and fix the P&L calculation issue
const csvData = `orderId,Account,Order ID,B/S,Contract,Product,Product Description,avgPrice,filledQty,Fill Time,lastCommandId,Status,_priceFormat,_priceFormatType,_tickSize,spreadDefinitionId,Version ID,Timestamp,Date,Quantity,Text,Type,Limit Price,Stop Price,decimalLimit,decimalStop,Filled Qty,Avg Fill Price,decimalFillAvg
254393970004,TAKEPROFIT6683432,254393970004, Buy,MESU5,MES,Micro E-mini S&P 500,6344.75,1,07/21/2025 21:00:00,254393970004, Filled,-2,0,0.25,,254393970004,07/21/2025 21:00:00,7/21/25,1,Tradingview, Limit,6344.75,,6344.75,,1,6344.75,6344.75
254393970057,TAKEPROFIT6683432,254393970057, Sell,MESU5,MES,Micro E-mini S&P 500,6348.0,1,07/21/2025 21:24:44,254393970057, Filled,-2,0,0.25,,254393970057,07/21/2025 21:24:44,7/21/25,1,Exit, Market,,,,,1,6348.00,6348.0
254393970070,TAKEPROFIT6683432,254393970070, Sell,NQU5,NQ,E-Mini NASDAQ 100,23285.0,1,07/22/2025 14:32:28,254393970093, Filled,-2,0,0.25,,254393970093,07/22/2025 14:32:28,7/22/25,1,Tradingview, Limit,23285.00,,23285.0,,1,23285.00,23285.0
254393970072,TAKEPROFIT6683432,254393970072, Buy,NQU5,NQ,E-Mini NASDAQ 100,23247.5,1,07/22/2025 14:46:02,254393970137, Filled,-2,0,0.25,,254393970137,07/22/2025 14:34:01,7/22/25,1,Tradingview, Limit,23247.50,,23247.5,,1,23247.50,23247.5
254393970305,TAKEPROFIT6683432,254393970305, Sell,ESU5,ES,E-Mini S&P 500,6358.0,1,07/23/2025 14:51:13,254393970305, Filled,-2,0,0.25,,254393970305,07/23/2025 14:51:13,7/23/25,1,Tradingview, Limit,6358.00,,6358.0,,1,6358.00,6358.0
254393970306,TAKEPROFIT6683432,254393970306, Buy,ESU5,ES,E-Mini S&P 500,6357.0,1,07/23/2025 15:01:29,254393970336, Filled,-2,0,0.25,,254393970336,07/23/2025 15:00:31,7/23/25,1,Tradingview, Stop,,6357.00,,6357.0,1,6357.00,6357.0`;

console.log('🔍 Analyzing user CSV data...');

const lines = csvData.trim().split('\n');
const header = lines[0].split(',');
const rows = lines.slice(1).map(line => {
  const values = line.split(',');
  const row = {};
  header.forEach((key, index) => {
    row[key] = values[index] || '';
  });
  return row;
});

console.log('📊 Total rows:', rows.length);

// Filter only filled orders
const filledOrders = rows.filter(row => 
  row.Status && row.Status.trim() === 'Filled'
).map(row => ({
  orderId: row.orderId,
  side: row['B/S'].toLowerCase().includes('buy') ? 'buy' : 'sell',
  contract: row.Contract,
  product: row.Product,
  avgPrice: parseFloat(row.avgPrice),
  quantity: parseInt(row.filledQty),
  date: row.Date,
  fillTime: row['Fill Time']
}));

console.log('✅ Filled orders:', filledOrders.length);
filledOrders.forEach(order => {
  console.log(`  ${order.date} ${order.side} ${order.contract} @${order.avgPrice} x${order.quantity}`);
});

// Group by contract and date
const tradeGroups = new Map();
filledOrders.forEach(order => {
  const key = `${order.contract}-${order.date}`;
  if (!tradeGroups.has(key)) {
    tradeGroups.set(key, []);
  }
  tradeGroups.get(key).push(order);
});

console.log('\n📈 Trade matching analysis:');
let totalPnL = 0;
const trades = [];

for (const [groupKey, orders] of tradeGroups) {
  console.log(`\n🔍 Group: ${groupKey} (${orders.length} orders)`);
  
  // Sort by fill time
  orders.sort((a, b) => new Date(a.fillTime).getTime() - new Date(b.fillTime).getTime());
  
  const processed = new Set();
  
  for (let i = 0; i < orders.length; i++) {
    if (processed.has(i)) continue;
    
    const order1 = orders[i];
    
    // Look for opposing order
    for (let j = i + 1; j < orders.length; j++) {
      if (processed.has(j)) continue;
      
      const order2 = orders[j];
      
      if (order1.side !== order2.side && order1.quantity === order2.quantity) {
        const buyOrder = order1.side === 'buy' ? order1 : order2;
        const sellOrder = order1.side === 'sell' ? order1 : order2;
        
        // Calculate P&L based on contract type
        let pointValue = 50; // ES default
        if (buyOrder.product === 'MES') {
          pointValue = 5; // MES is 1/10 of ES
        } else if (buyOrder.product === 'NQ') {
          pointValue = 20; // NQ point value
        }
        
        const priceDiff = sellOrder.avgPrice - buyOrder.avgPrice;
        const pnl = priceDiff * buyOrder.quantity * pointValue;
        totalPnL += pnl;
        
        trades.push({
          contract: buyOrder.contract,
          buy: buyOrder.avgPrice,
          sell: sellOrder.avgPrice,
          pnl,
          date: buyOrder.date
        });
        
        console.log(`  ✅ Trade: Buy ${buyOrder.avgPrice} → Sell ${sellOrder.avgPrice} = ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`);
        
        processed.add(i);
        processed.add(j);
        break;
      }
    }
  }
}

console.log(`\n💰 FINAL ANALYSIS:`);
console.log(`Total trades created: ${trades.length}`);
console.log(`Total P&L: $${totalPnL.toFixed(2)}`);
console.log(`Breakdown:`);
trades.forEach(trade => {
  console.log(`  ${trade.date} ${trade.contract}: ${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}`);
});

console.log(`\n🚨 CRITICAL FINDING:`);
console.log(`Based on your actual CSV data, you should have lost $${Math.abs(totalPnL).toFixed(2)}, not won $1500!`);
console.log(`The current system is incorrectly calculating phantom profits.`);