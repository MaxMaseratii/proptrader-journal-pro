// Test the symbol formatting for TradingView
const { getTradingViewSymbol, cleanSymbolForTradingView } = require('./client/src/lib/symbol-utils.ts');

console.log('Testing TradingView symbol formatting:');
console.log('MNQ -> ', getTradingViewSymbol('MNQ'));
console.log('NQ -> ', getTradingViewSymbol('NQ'));
console.log('ES -> ', getTradingViewSymbol('ES'));
console.log('MES -> ', getTradingViewSymbol('MES'));
console.log('CL -> ', getTradingViewSymbol('CL'));
console.log('GC -> ', getTradingViewSymbol('GC'));

console.log('\nExpected formats:');
console.log('MNQ should be: CME:MNQ1!');
console.log('NQ should be: CME:NQ1!');
console.log('ES should be: CME:ES1!');
console.log('CL should be: NYMEX:CL1!');
console.log('GC should be: COMEX:GC1!');