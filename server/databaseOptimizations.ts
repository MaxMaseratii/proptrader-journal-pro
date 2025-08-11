import { pool } from './db';

// Database optimization functions for million-user scale
export class DatabaseOptimizer {
  
  // Create indexes for performance
  static async createOptimizedIndexes() {
    const indexes = [
      // Accounts table indexes
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_user_id ON accounts(user_id)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_type ON accounts(type)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_accounts_status ON accounts(status)`,
      
      // Trades table indexes
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trades_account_id ON trades(account_id)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trades_date ON trades(date)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trades_symbol ON trades(symbol)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trades_pnl ON trades(pnl)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trades_date_account ON trades(date, account_id)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trades_pnl_account ON trades(pnl, account_id)`,
      
      // Journal entries indexes
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_account_id ON journal_entries(account_id)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_date ON journal_entries(date)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_daily_plan ON journal_entries(daily_plan_id)`,
      
      // Daily stats indexes
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_stats_account_date ON daily_stats(account_id, date)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_stats_pnl ON daily_stats(total_pnl)`,
      
      // Daily plans indexes
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_plans_account_date ON daily_plans(account_id, date)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_plans_strategy ON daily_plans(strategy_id)`,
      
      // Sessions table optimization
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_expire ON sessions(expire)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sessions_sid ON sessions(sid)`,
      
      // Users table optimization
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)`,
      `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at)`,
    ];

    console.log('Creating optimized database indexes...');
    
    for (const index of indexes) {
      try {
        await pool.query(index);
        console.log(`✓ Created index: ${index.split(' ')[6]}`);
      } catch (error) {
        // Index might already exist, which is fine
        if (!error.message.includes('already exists')) {
          console.error(`Error creating index: ${error.message}`);
        }
      }
    }
  }

  // Optimize table configurations for high concurrency
  static async optimizeTableSettings() {
    const optimizations = [
      // Increase fillfactor for tables with frequent updates
      `ALTER TABLE trades SET (fillfactor = 90)`,
      `ALTER TABLE accounts SET (fillfactor = 85)`,
      `ALTER TABLE daily_stats SET (fillfactor = 90)`,
      
      // Enable parallel queries
      `SET max_parallel_workers_per_gather = 4`,
      `SET max_parallel_workers = 8`,
      
      // These settings would be applied at database level, not via query
      // Commenting out for application-level optimization
    ];

    console.log('Applying database optimizations...');
    
    for (const optimization of optimizations) {
      try {
        await pool.query(optimization);
        console.log(`✓ Applied: ${optimization.substring(0, 50)}...`);
      } catch (error) {
        console.error(`Error applying optimization: ${error.message}`);
      }
    }
  }

  // Partitioning for large trade tables (for massive scale)
  static async createPartitions() {
    try {
      // Create partitioned trades table for massive datasets
      await pool.query(`
        CREATE TABLE IF NOT EXISTS trades_partitioned (
          LIKE trades INCLUDING ALL
        ) PARTITION BY RANGE (date);
      `);

      // Create monthly partitions for the current and next 12 months
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      
      for (let i = 0; i < 24; i++) {
        const month = ((currentMonth + i - 1) % 12) + 1;
        const year = currentYear + Math.floor((currentMonth + i - 1) / 12);
        const nextMonth = (month % 12) + 1;
        const nextYear = year + Math.floor(month / 12);
        
        const partitionName = `trades_${year}_${month.toString().padStart(2, '0')}`;
        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const endDate = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;
        
        await pool.query(`
          CREATE TABLE IF NOT EXISTS ${partitionName} 
          PARTITION OF trades_partitioned 
          FOR VALUES FROM ('${startDate}') TO ('${endDate}');
        `);
      }
      
      console.log('✓ Created partitioned tables for massive scale');
    } catch (error) {
      console.error('Error creating partitions:', error.message);
    }
  }

  // Database maintenance tasks
  static async performMaintenance() {
    const maintenanceTasks = [
      // Update table statistics
      `ANALYZE trades`,
      `ANALYZE accounts`,
      `ANALYZE journal_entries`,
      `ANALYZE daily_stats`,
      `ANALYZE sessions`,
      
      // Vacuum frequently updated tables
      `VACUUM (ANALYZE) trades`,
      `VACUUM (ANALYZE) sessions`,
      
      // Reindex if needed (should be done during low-traffic periods)
      // `REINDEX INDEX CONCURRENTLY idx_trades_date_account`,
    ];

    console.log('Performing database maintenance...');
    
    for (const task of maintenanceTasks) {
      try {
        await pool.query(task);
        console.log(`✓ Completed: ${task}`);
      } catch (error) {
        console.error(`Error in maintenance task: ${error.message}`);
      }
    }
  }

  // Query optimization helpers
  static getOptimizedQueries() {
    return {
      // Optimized trade queries with proper indexing
      getTradesByAccountAndDateRange: `
        SELECT * FROM trades 
        WHERE account_id = $1 AND date BETWEEN $2 AND $3 
        ORDER BY date DESC, fill_time DESC
        LIMIT $4 OFFSET $5
      `,
      
      // Optimized analytics query
      getAccountAnalytics: `
        SELECT 
          COUNT(*) as total_trades,
          SUM(pnl) as total_pnl,
          AVG(pnl) as avg_pnl,
          COUNT(CASE WHEN pnl > 0 THEN 1 END) as winning_trades,
          COUNT(CASE WHEN pnl < 0 THEN 1 END) as losing_trades,
          MAX(pnl) as best_trade,
          MIN(pnl) as worst_trade
        FROM trades 
        WHERE account_id = $1 AND date >= $2
      `,
      
      // Optimized daily stats query
      getDailyStats: `
        SELECT date, total_pnl, trade_count, win_rate 
        FROM daily_stats 
        WHERE account_id = $1 
        ORDER BY date DESC 
        LIMIT $2
      `,
    };
  }
}

// Initialize database optimizations
export async function initializeDatabaseOptimizations() {
  if (process.env.NODE_ENV === 'production') {
    try {
      await DatabaseOptimizer.createOptimizedIndexes();
      await DatabaseOptimizer.optimizeTableSettings();
      await DatabaseOptimizer.performMaintenance();
      
      console.log('✅ Database optimizations completed');
    } catch (error) {
      console.error('❌ Error during database optimization:', error);
    }
  }
}