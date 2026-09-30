import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for serverless environments
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create connection pool optimized for high-scale deployment (1M+ users)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: process.env.NODE_ENV === 'production' ? 100 : 20, // Scale connection pool for production
  min: 5, // Minimum connections to maintain
  idleTimeoutMillis: 60000, // Increased idle timeout
  connectionTimeoutMillis: 30000,
});

// Add connection error handling
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export const db = drizzle({ client: pool, schema });
