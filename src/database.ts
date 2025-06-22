import * as fs from 'fs';
import * as path from 'path';
import { Match, MatchUpdate } from './types';

export class DatabaseManager {
  private dbPath: string;
  private defaultMatch: Match = {
    id: 1,
    player1_name: 'Player 1',
    player1_logo: null,
    player1_fargo: null,
    player1_score: 0,
    player2_name: 'Player 2',
    player2_logo: null,
    player2_fargo: null,
    player2_score: 0,
    race_to: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  constructor() {
    // Create database file in the same directory as the executable
    this.dbPath = path.join(process.cwd(), 'billiards.json');
    this.initialize();
  }

  private initialize(): void {
    // Create default file if it doesn't exist
    if (!fs.existsSync(this.dbPath)) {
      this.writeMatch(this.defaultMatch);
    }
  }

  private readMatch(): Match {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      const match = JSON.parse(data) as Match;
      
      // Ensure all required fields exist (for backwards compatibility)
      return {
        ...this.defaultMatch,
        ...match,
        updated_at: match.updated_at || new Date().toISOString()
      };
    } catch (error) {
      // If file is corrupted or doesn't exist, return default
      console.warn('Error reading match data, using defaults:', error);
      return { ...this.defaultMatch };
    }
  }

  private writeMatch(match: Match): void {
    try {
      match.updated_at = new Date().toISOString();
      const data = JSON.stringify(match, null, 2);
      fs.writeFileSync(this.dbPath, data, 'utf8');
    } catch (error) {
      console.error('Error writing match data:', error);
      throw error;
    }
  }

  public getCurrentMatch(): Promise<Match> {
    return new Promise((resolve, reject) => {
      try {
        const match = this.readMatch();
        resolve(match);
      } catch (err) {
        reject(err);
      }
    });
  }

  public updateMatch(update: MatchUpdate): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const currentMatch = this.readMatch();
        const updatedMatch: Match = {
          ...currentMatch,
          ...update,
          updated_at: new Date().toISOString()
        };
        this.writeMatch(updatedMatch);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  public updateScore(player: 1 | 2, action: 'increment' | 'decrement'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const match = this.readMatch();
        const scoreField = player === 1 ? 'player1_score' : 'player2_score';
        const currentScore = match[scoreField] || 0;
        
        if (action === 'increment') {
          match[scoreField] = currentScore + 1;
        } else {
          match[scoreField] = Math.max(0, currentScore - 1);
        }
        
        this.writeMatch(match);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  public resetScores(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const match = this.readMatch();
        match.player1_score = 0;
        match.player2_score = 0;
        this.writeMatch(match);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  public close(): void {
    // No cleanup needed for file-based storage
  }
} 