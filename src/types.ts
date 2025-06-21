export interface Match {
  id: number;
  player1_name: string;
  player1_logo: string | null;
  player1_fargo: number | null;
  player1_score: number;
  player2_name: string;
  player2_logo: string | null;
  player2_fargo: number | null;
  player2_score: number;
  race_to: number;
  created_at: string;
  updated_at: string;
}

export interface MatchUpdate {
  player1_name: string;
  player1_logo: string | null;
  player1_fargo: number | null;
  player2_name: string;
  player2_logo: string | null;
  player2_fargo: number | null;
  race_to: number;
}

export interface ScoreUpdate {
  player: 1 | 2;
  action: 'increment' | 'decrement';
}

export interface ResetRequest {
  confirm: boolean;
}

export interface MatchBroadcast {
  player1_name: string;
  player1_logo: string | null;
  player1_fargo: number | null;
  player1_score: number;
  player2_name: string;
  player2_logo: string | null;
  player2_fargo: number | null;
  player2_score: number;
  race_to: number;
} 