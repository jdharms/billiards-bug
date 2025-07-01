import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import * as path from 'path';
import sea from 'node:sea';
import { DatabaseManager } from './database';
import { MatchUpdate, ScoreUpdate, ResetRequest, MatchBroadcast } from './types';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  serveClient: false  // Disable automatic client serving
});
const db = new DatabaseManager();

// Middleware
app.use(express.json());

// Static asset serving from SEA
function serveAsset(assetName: string, contentType: string) {
  return (_req: express.Request, res: express.Response) => {
    try {
      if (sea.isSea()) {
        // In SEA mode, serve from embedded assets
        const asset = sea.getAsset(assetName, 'utf8');
        res.setHeader('Content-Type', contentType);
        res.send(asset);
      } else {
        // In development mode, serve from file system
        const fs = require('fs');
        let filePath: string;
        
        if (assetName === 'socket.io.js') {
          // Special handling for Socket.IO client in development
          filePath = path.join(process.cwd(), 'node_modules/socket.io/client-dist/socket.io.min.js');
        } else {
          filePath = path.join(__dirname, 'public', assetName);
        }
        

        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          res.setHeader('Content-Type', contentType);
          res.send(content);
        } else {
          res.status(404).send('Asset not found');
        }
      }
    } catch (error) {
      console.error(`Error serving asset ${assetName}:`, error);
      res.status(404).send('Asset not found');
    }
  };
}

// Static asset routes
app.get('/control.css', serveAsset('control.css', 'text/css'));
app.get('/control.js', serveAsset('control.js', 'application/javascript'));
app.get('/overlay.css', serveAsset('overlay.css', 'text/css'));
app.get('/overlay.js', serveAsset('overlay.js', 'application/javascript'));
app.get('/assets/socket.io.js', serveAsset('socket.io.js', 'application/javascript'));


// Helper function to broadcast match updates
async function broadcastMatch(): Promise<void> {
  try {
    const match = await db.getCurrentMatch();
    const broadcast: MatchBroadcast = {
      player1_name: match.player1_name,
      player1_logo: match.player1_logo,
      player1_fargo: match.player1_fargo,
      player1_score: match.player1_score,
      player2_name: match.player2_name,
      player2_logo: match.player2_logo,
      player2_fargo: match.player2_fargo,
      player2_score: match.player2_score,
      race_to: match.race_to
    };
    io.emit('match_update', broadcast);
  } catch (error) {
    console.error('Error broadcasting match update:', error);
  }
}

// Routes
app.get('/', (_req, res) => {
  res.redirect('/control');
});

app.get('/control', serveAsset('control.html', 'text/html'));

app.get('/overlay', serveAsset('overlay.html', 'text/html'));

// API Routes
app.get('/api/match', async (_req, res) => {
  try {
    const match = await db.getCurrentMatch();
    res.json(match);
  } catch (error) {
    console.error('Error fetching match:', error);
    res.status(500).json({ error: 'Failed to fetch match data' });
  }
});

app.post('/api/match', async (req, res) => {
  try {
    const update: MatchUpdate = req.body;
    await db.updateMatch(update);
    await broadcastMatch();
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating match:', error);
    res.status(500).json({ error: 'Failed to update match' });
  }
});

app.post('/api/score', async (req, res) => {
  try {
    const { player, action }: ScoreUpdate = req.body;
    if (player !== 1 && player !== 2) {
      return res.status(400).json({ error: 'Invalid player number' });
    }
    if (action !== 'increment' && action !== 'decrement') {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    await db.updateScore(player, action);
    await broadcastMatch();
    return res.json({ success: true });
  } catch (error) {
    console.error('Error updating score:', error);
    return res.status(500).json({ error: 'Failed to update score' });
  }
});

app.post('/api/reset', async (req, res) => {
  try {
    const { confirm }: ResetRequest = req.body;
    if (!confirm) {
      return res.status(400).json({ error: 'Reset not confirmed' });
    }
    
    await db.resetScores();
    await broadcastMatch();
    return res.json({ success: true });
  } catch (error) {
    console.error('Error resetting scores:', error);
    return res.status(500).json({ error: 'Failed to reset scores' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Send current match data to newly connected client
  broadcastMatch();
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Server startup
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    server.listen(port, () => {
      console.log(`🎱 Billiards Bug server running on http://localhost:${port}`);
      console.log(`📊 Control interface: http://localhost:${port}/control`);
      console.log(`🎥 OBS overlay: http://localhost:${port}/overlay`);
      console.log(`🔧 Running in SEA mode: ${sea.isSea()}`);
      resolve();
    }).on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying ${port + 1}...`);
        startServer(port + 1).then(resolve).catch(reject);
      } else {
        reject(err);
      }
    });
  });
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  db.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer(PORT).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 