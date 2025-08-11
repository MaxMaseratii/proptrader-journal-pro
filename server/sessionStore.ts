import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import redis from './redis';
import { pool } from './db';

const PgSession = connectPgSimple(session);

// Redis session store for scalability (fallback to PostgreSQL)
class ScalableSessionStore {
  private useRedis: boolean;
  private pgStore: any;

  constructor() {
    this.useRedis = process.env.NODE_ENV === 'production';
    
    // PostgreSQL session store as fallback
    this.pgStore = new PgSession({
      pool,
      tableName: 'sessions',
      createTableIfMissing: true,
    });
  }

  async get(sid: string): Promise<any> {
    if (this.useRedis) {
      try {
        const session = await redis.get(`sess:${sid}`);
        return session ? JSON.parse(session) : null;
      } catch (error) {
        console.error('Redis session get error, falling back to PostgreSQL:', error);
        return new Promise((resolve, reject) => {
          this.pgStore.get(sid, (err: any, session: any) => {
            if (err) reject(err);
            else resolve(session);
          });
        });
      }
    }
    
    return new Promise((resolve, reject) => {
      this.pgStore.get(sid, (err: any, session: any) => {
        if (err) reject(err);
        else resolve(session);
      });
    });
  }

  async set(sid: string, session: any): Promise<void> {
    if (this.useRedis) {
      try {
        const ttl = session.cookie?.maxAge ? Math.floor(session.cookie.maxAge / 1000) : 86400;
        await redis.setex(`sess:${sid}`, ttl, JSON.stringify(session));
        return;
      } catch (error) {
        console.error('Redis session set error, falling back to PostgreSQL:', error);
      }
    }
    
    return new Promise((resolve, reject) => {
      this.pgStore.set(sid, session, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async destroy(sid: string): Promise<void> {
    if (this.useRedis) {
      try {
        await redis.del(`sess:${sid}`);
        return;
      } catch (error) {
        console.error('Redis session destroy error, falling back to PostgreSQL:', error);
      }
    }
    
    return new Promise((resolve, reject) => {
      this.pgStore.destroy(sid, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async touch(sid: string, session: any): Promise<void> {
    if (this.useRedis) {
      try {
        const ttl = session.cookie?.maxAge ? Math.floor(session.cookie.maxAge / 1000) : 86400;
        await redis.expire(`sess:${sid}`, ttl);
        return;
      } catch (error) {
        console.error('Redis session touch error, falling back to PostgreSQL:', error);
      }
    }
    
    return new Promise((resolve, reject) => {
      this.pgStore.touch(sid, session, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export const scalableSessionStore = new ScalableSessionStore();