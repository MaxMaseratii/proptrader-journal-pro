// Analyze the FULL CSV file to find the discrepancy
import fs from 'fs';

try {
  const csvContent = fs.readFileSync('attached_assets/Orders (10)_1753305588843.csv', 'utf8');
  
  console.log('🔍 Analyzing FULL CSV file...');
  
  const lines = csvContent.trim().split('\n');
  const header = lines[0].split(',');
  
  console.log('📊 Total lines in CSV:', lines.length);
  console.log('📋 Header:', header.slice(0, 10)); // Show first 10 columns
  
  const rows = lines.slice(1).map(line => {
    const values = line.split(',');
    const row = {};
    header.forEach((key, index) => {
      row[key] = values[index] || '';
    });
    return row;
  });

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

  console.log('\n✅ Filled orders found:', filledOrders.length);
  
  // Group by date to see what happened each day
  const dateGroups = new Map();
  filledOrders.forEach(order => {
    if (!dateGroups.has(order.date)) {
      dateGroups.set(order.date, []);
    }
    dateGroups.get(order.date).push(order);
  });

  console.log('\n📅 Orders by date:');
  for (const [date, orders] of dateGroups) {
    console.log(`\n${date}: ${orders.length} orders`);
    orders.forEach(order => {
      console.log(`  ${order.side} ${order.contract} @${order.avgPrice} x${order.quantity} [${order.fillTime}]`);
    });
  }

  // Focus on July 23rd since that's where the user says they lost $1,111
  const july23Orders = filledOrders.filter(order => order.date === '7/23/25');
  console.log(`\n🔍 JULY 23RD ANALYSIS (${july23Orders.length} orders):`);
  
  // Group July 23rd orders by contract
  const july23Groups = new Map();
  july23Orders.forEach(order => {
    const key = order.contract;
    if (!july23Groups.has(key)) {
      july23Groups.set(key, []);
    }
    july23Groups.get(key).push(order);
  });

  let july23TotalPnL = 0;
  console.log('\n📈 July 23rd Trade Analysis:');
  
  for (const [contract, orders] of july23Groups) {
    console.log(`\n🔍 ${contract}: ${orders.length} orders`);
    
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
          
          // Calculate P&L
          let pointValue = 50; // ES default
          if (buyOrder.product === 'MES') {
            pointValue = 5; // MES is 1/10 of ES
          } else if (buyOrder.product === 'NQ') {
            pointValue = 20; // NQ point value
          }
          
          const priceDiff = sellOrder.avgPrice - buyOrder.avgPrice;
          const pnl = priceDiff * buyOrder.quantity * pointValue;
          july23TotalPnL += pnl;
          
          console.log(`  ✅ Trade: Buy ${buyOrder.avgPrice} → Sell ${sellOrder.avgPrice} = ${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`);
          
          processed.add(i);
          processed.add(j);
          break;
        }
      }
    }
    
    // Check for unmatched orders
    for (let i = 0; i < orders.length; i++) {
      if (!processed.has(i)) {
        console.log(`  ⚠️  Unmatched: ${orders[i].side} ${orders[i].contract} @${orders[i].avgPrice}`);
      }
    }
  }
  
  console.log(`\n💰 JULY 23RD TOTAL P&L: $${july23TotalPnL.toFixed(2)}`);
  console.log(`\n🚨 DISCREPANCY ANALYSIS:`);
  console.log(`User reports: -$1,111.25 loss`);
  console.log(`CSV analysis shows: $${july23TotalPnL.toFixed(2)}`);
  console.log(`Difference: $${(Math.abs(-1111.25) - Math.abs(july23TotalPnL)).toFixed(2)}`);
  
} catch (error) {
  console.error('Error reading CSV:', error.message);
}