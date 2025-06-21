# Billiards Score Bug - Developer Specification

## Overview
Create a Node.js application that compiles to a single Windows executable (.exe) for streaming billiards matches. The application provides a web-based control interface and a transparent overlay for OBS Studio.

## Architecture
```
Single Node.js Application
├── Express HTTP Server (localhost:3000)
├── Socket.IO WebSocket Server
├── SQLite Database (auto-initialized)
└── Static File Serving
```

## Technical Stack
- **Runtime**: Node.js 18+
- **Language/Type-Check**: Yes! Let's use TypeScript
- **Web Framework**: Express.js
- **Real-time Communication**: Socket.IO
- **Database**: SQLite3 with auto-initialization
- **Packaging**: pkg for single executable compilation
- **Frontend**: Vanilla HTML/CSS/TypeScript w/ minimal dependencies (no frameworks)

## Database Schema
```sql
-- Auto-created as 'billiards.db' in executable directory
CREATE TABLE matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_name TEXT NOT NULL DEFAULT 'Player 1',
    player1_logo TEXT DEFAULT NULL,
    player1_score INTEGER DEFAULT 0,
    player2_name TEXT NOT NULL DEFAULT 'Player 2',
    player2_logo TEXT DEFAULT NULL,
    player2_score INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default match on first run
INSERT INTO matches (id) VALUES (1);
```

## API Endpoints

### GET /
- Redirect to `/control`

### GET /control
- Serve control interface HTML page
- Load current match data from database

### GET /overlay
- Serve OBS overlay HTML page
- Transparent background with score display

### POST /api/match
```json
{
  "player1_name": "string",
  "player1_logo": "string|null",
  "player2_name": "string", 
  "player2_logo": "string|null"
}
```
- Update match player information
- Broadcast changes via Socket.IO

### POST /api/score
```json
{
  "player": 1|2,
  "action": "increment"|"decrement"
}
```
- Modify player score
- Broadcast changes via Socket.IO

### POST /api/reset
```json
{
  "confirm": true
}
```
- Reset both scores to 0
- Broadcast changes via Socket.IO

## Socket.IO Events

### Server → Client Events
```javascript
// Broadcast to all connected clients when data changes
socket.emit('match_update', {
  player1_name: "string",
  player1_logo: "string|null", 
  player1_score: number,
  player2_name: "string",
  player2_logo: "string|null",
  player2_score: number
});
```

## UI Requirements

### Control Page (/control)
- **Player Setup Section**:
  - Text inputs for player names
  - File upload for player logos (optional)
  - "Update Match" button

- **Score Control Section**:
  - Large buttons (80px+ height) for score increment/decrement
  - Current score display between buttons
  - Layout: `[-] [Score] [+]` for each player

- **Reset Section**:
  - "Reset Scores" button
  - Confirmation dialog before reset

- **Styling**: Clean, functional interface optimized for tablet/touch use

### Overlay Page (/overlay)
- **Transparent background** for OBS chroma key
- **Score bug display** at bottom of screen
- **Layout**: `[Player1 Name] [Score1] - [Score2] [Player2 Name]`
- **Styling**: Professional broadcast appearance with good contrast
- **Responsive**: Works at 1920x1080 and 1280x720 resolutions

## File Structure
```
billiards-bug/
├── package.json
├── server.ts
|-- types.ts
├── database.ts
├── public/
│   ├── control.html
│   ├── overlay.html
│   ├── control.css
│   ├── overlay.css
│   ├── control.ts
│   └── overlay.ts
└── README.md
```

## Application Behavior

### Startup
1. Check for `billiards.db` in executable directory
2. Initialize database with schema if not exists
3. Start Express server on port 3000
4. Auto-open browser to `http://localhost:3000/control`
5. Log server status to console

### Database Operations
- Always use match ID 1 (single active match)
- Update `updated_at` timestamp on all changes
- Handle SQLite file locking gracefully

### Error Handling
- Graceful database connection failures
- Port conflicts (try 3001, 3002, etc.)
- Invalid API requests return proper HTTP status codes
- Socket.IO connection failures handled on frontend

## Packaging Configuration

### package.json
This might need to be updated for TypeScript...
```json
{
  "name": "billiards-bug",
  "version": "1.0.0",
  "main": "server.js",
  "bin": "server.js",
  "pkg": {
    "targets": ["node18-win-x64"],
    "outputPath": "dist/",
    "assets": ["public/**/*"]
  }
}
```

### Build Command
```bash
pkg . --out-path dist/
```

## Deployment
- Single `.exe` file (~50-80MB)
- No installation required
- Creates `billiards.db` automatically
- Runs on Windows 10+ with no dependencies

## Non-Functional Requirements
- Startup time: < 5 seconds
- Score updates: < 100ms latency
- Memory usage: < 100MB
- Supports multiple simultaneous browser connections
- Graceful shutdown on Ctrl+C