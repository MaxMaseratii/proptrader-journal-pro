// Web Workers for heavy computational tasks in scalable architecture
import { Worker } from 'worker_threads';
import path from 'path';

export class ComputationWorkerPool {
  private workers: Worker[] = [];
  private workerQueue: Worker[] = [];
  private maxWorkers: number;

  constructor(maxWorkers: number = 4) {
    this.maxWorkers = maxWorkers;
    this.initializeWorkers();
  }

  private initializeWorkers() {
    for (let i = 0; i < this.maxWorkers; i++) {
      this.createWorker();
    }
  }

  private createWorker() {
    const workerScript = `
      const { parentPort } = require('worker_threads');
      
      // Heavy computation functions that can be moved to worker threads
      function calculateTradingAnalytics(trades) {
        const analytics = {
          totalTrades: trades.length,
          totalPnl: 0,
          winningTrades: 0,
          losingTrades: 0,
          bestTrade: 0,
          worstTrade: 0,
          consecutiveWins: 0,
          consecutiveLosses: 0,
          maxDrawdown: 0,
          profitFactor: 0,
          sharpeRatio: 0,
          dailyReturns: [],
        };

        if (trades.length === 0) return analytics;

        let currentBalance = 0;
        let peakBalance = 0;
        let currentWinStreak = 0;
        let currentLossStreak = 0;
        let maxWinStreak = 0;
        let maxLossStreak = 0;
        let totalWins = 0;
        let totalLosses = 0;
        let returns = [];

        trades.forEach((trade, index) => {
          const pnl = parseFloat(trade.pnl) || 0;
          analytics.totalPnl += pnl;
          currentBalance += pnl;
          
          if (pnl > 0) {
            analytics.winningTrades++;
            totalWins += pnl;
            currentWinStreak++;
            currentLossStreak = 0;
            maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
          } else if (pnl < 0) {
            analytics.losingTrades++;
            totalLosses += Math.abs(pnl);
            currentLossStreak++;
            currentWinStreak = 0;
            maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
          }

          if (currentBalance > peakBalance) {
            peakBalance = currentBalance;
          } else {
            const drawdown = (peakBalance - currentBalance) / peakBalance * 100;
            analytics.maxDrawdown = Math.max(analytics.maxDrawdown, drawdown);
          }

          if (pnl !== 0) {
            returns.push(pnl);
          }

          if (pnl > analytics.bestTrade) analytics.bestTrade = pnl;
          if (pnl < analytics.worstTrade) analytics.worstTrade = pnl;
        });

        analytics.consecutiveWins = maxWinStreak;
        analytics.consecutiveLosses = maxLossStreak;
        analytics.profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins;

        // Sharpe ratio calculation
        if (returns.length > 1) {
          const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
          const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - meanReturn, 2), 0) / (returns.length - 1);
          const stdDev = Math.sqrt(variance);
          analytics.sharpeRatio = stdDev > 0 ? meanReturn / stdDev : 0;
        }

        return analytics;
      }

      function processCSVData(csvText, columnMapping) {
        const lines = csvText.split('\\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const trades = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const trade = {};

          // Map columns based on provided mapping
          Object.keys(columnMapping).forEach(field => {
            const columnIndex = headers.indexOf(columnMapping[field]);
            if (columnIndex !== -1) {
              trade[field] = values[columnIndex];
            }
          });

          // Convert numeric fields
          if (trade.pnl) trade.pnl = parseFloat(trade.pnl) || 0;
          if (trade.quantity) trade.quantity = parseInt(trade.quantity) || 1;
          if (trade.entryPrice) trade.entryPrice = parseFloat(trade.entryPrice) || 0;
          if (trade.exitPrice) trade.exitPrice = parseFloat(trade.exitPrice) || 0;

          trades.push(trade);
        }

        return trades;
      }

      parentPort.on('message', ({ type, data, id }) => {
        try {
          let result;
          
          switch (type) {
            case 'CALCULATE_ANALYTICS':
              result = calculateTradingAnalytics(data.trades);
              break;
              
            case 'PROCESS_CSV':
              result = processCSVData(data.csvText, data.columnMapping);
              break;
              
            default:
              throw new Error(\`Unknown task type: \${type}\`);
          }
          
          parentPort.postMessage({ id, result, error: null });
        } catch (error) {
          parentPort.postMessage({ id, result: null, error: error.message });
        }
      });
    `;

    const worker = new Worker(workerScript, { eval: true });
    this.workers.push(worker);
    this.workerQueue.push(worker);
    return worker;
  }

  async executeTask(type: string, data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const worker = this.workerQueue.shift();
      
      if (!worker) {
        // All workers busy, queue the task
        setTimeout(() => this.executeTask(type, data).then(resolve).catch(reject), 100);
        return;
      }

      const taskId = Math.random().toString(36).substr(2, 9);
      const timeout = setTimeout(() => {
        reject(new Error('Worker task timeout'));
        this.workerQueue.push(worker);
      }, 30000); // 30 second timeout

      worker.once('message', ({ id, result, error }) => {
        if (id === taskId) {
          clearTimeout(timeout);
          this.workerQueue.push(worker);
          
          if (error) {
            reject(new Error(error));
          } else {
            resolve(result);
          }
        }
      });

      worker.postMessage({ type, data, id: taskId });
    });
  }

  async calculateAnalytics(trades: any[]) {
    return this.executeTask('CALCULATE_ANALYTICS', { trades });
  }

  async processCSV(csvText: string, columnMapping: any) {
    return this.executeTask('PROCESS_CSV', { csvText, columnMapping });
  }

  terminate() {
    this.workers.forEach(worker => worker.terminate());
    this.workers = [];
    this.workerQueue = [];
  }
}

// Singleton instance for the application
export const workerPool = new ComputationWorkerPool(
  process.env.NODE_ENV === 'production' ? 8 : 2
);

// Cleanup on process exit
process.on('exit', () => workerPool.terminate());
process.on('SIGINT', () => workerPool.terminate());
process.on('SIGTERM', () => workerPool.terminate());