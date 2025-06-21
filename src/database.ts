import sqlite3 from 'sqlite3';
import * as path from 'path';
import { Match, MatchUpdate } from './types';

export class Database {
  private db: sqlite3.Database;
  private dbPath: string;

  constructor() {
    // Create database in the same directory as the executable
    this.dbPath = path.join(process.cwd(), 'billiards.db');
    this.db = new sqlite3.Database(this.dbPath);
    this.initialize();
  }

  private initialize(): void {
    this.db.serialize(() => {
      // Create matches table
      this.db.run(`
        CREATE TABLE IF NOT EXISTS matches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          player1_name TEXT NOT NULL DEFAULT 'Player 1',
          player1_logo TEXT DEFAULT NULL,
          player1_fargo INTEGER DEFAULT NULL,
          player1_score INTEGER DEFAULT 0,
          player2_name TEXT NOT NULL DEFAULT 'Player 2', 
          player2_logo TEXT DEFAULT NULL,
          player2_fargo INTEGER DEFAULT NULL,
          player2_score INTEGER DEFAULT 0,
          race_to INTEGER DEFAULT 5,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Check if fargo columns exist, if not add them
      this.db.all("PRAGMA table_info(matches)", (err, rows: any[]) => {
        if (!err && rows) {
          const columns = rows.map(row => row.name);
          if (!columns.includes('player1_fargo')) {
            this.db.run("ALTER TABLE matches ADD COLUMN player1_fargo INTEGER DEFAULT NULL");
          }
          if (!columns.includes('player2_fargo')) {
            this.db.run("ALTER TABLE matches ADD COLUMN player2_fargo INTEGER DEFAULT NULL");
          }
        }
      });

      // Insert default match if it doesn't exist
      this.db.run(`
        INSERT OR IGNORE INTO matches (id, player1_name, player2_name, race_to) 
        VALUES (1, 'Player 1', 'Player 2', 5)
      `);
    });
  }

  public getCurrentMatch(): Promise<Match> {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM matches WHERE id = 1',
        (err: Error | null, row: Match) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  public updateMatch(update: MatchUpdate): Promise<void> {
    return new Promise((resolve, reject) => {
      const { player1_name, player1_logo, player1_fargo, player2_name, player2_logo, player2_fargo, race_to } = update;
      
      this.db.run(`
        UPDATE matches 
        SET player1_name = ?, player1_logo = ?, player1_fargo = ?, player2_name = ?, player2_logo = ?, player2_fargo = ?, race_to = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `, [player1_name, player1_logo, player1_fargo, player2_name, player2_logo, player2_fargo, race_to], (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public updateScore(player: 1 | 2, action: 'increment' | 'decrement'): Promise<void> {
    return new Promise((resolve, reject) => {
      const scoreField = player === 1 ? 'player1_score' : 'player2_score';
      const operation = action === 'increment' ? '+' : '-';
      
      this.db.run(`
        UPDATE matches 
        SET ${scoreField} = MAX(0, ${scoreField} ${operation} 1),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public resetScores(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE matches 
        SET player1_score = 0, player2_score = 0,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  public close(): void {
    if (this.db) {
      this.db.close();
      this.db = null as any; // Prevent double close
    }
  }
} 