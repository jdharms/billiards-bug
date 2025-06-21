# 🎱 Billiards Score Bug

A Node.js/TypeScript application that provides a web-based score control interface and transparent overlay for streaming billiards matches. Perfect for OBS Studio integration.

## ✨ Features

- **Real-time Score Tracking**: Update scores instantly with large, touch-friendly buttons
- **Player Management**: Set player names and optional logo URLs
- **OBS Overlay**: Transparent browser source for professional streaming
- **Socket.IO Integration**: Real-time synchronization between control and overlay
- **SQLite Database**: Persistent data storage with auto-initialization
- **Single Executable**: Compiles to a standalone Windows .exe file

## 🚀 Quick Start

### Development

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Access the Application**
   - Control Interface: http://localhost:3000/control
   - OBS Overlay: http://localhost:3000/overlay

### Production Build

1. **Build TypeScript**
   ```bash
   npm run build
   ```

2. **Start Production Server**
   ```bash
   npm start
   ```

3. **Create Windows Executable**
   ```bash
   npm run pkg
   ```

## 📋 API Endpoints

### GET /api/match
Returns current match data including player names, logos, and scores.

### POST /api/match
Update player information (names and logos).
```json
{
  "player1_name": "John Doe",
  "player1_logo": "https://example.com/logo1.png",
  "player2_name": "Jane Smith",
  "player2_logo": "https://example.com/logo2.png"
}
```

### POST /api/score
Update player scores.
```json
{
  "player": 1,
  "action": "increment"
}
```

### POST /api/reset
Reset both scores to 0.
```json
{
  "confirm": true
}
}
```

## 🎥 OBS Studio Setup

1. Add a **Browser Source** to your scene
2. Set URL to: `http://localhost:3000/overlay`
3. Set Width: `1920`, Height: `1080`
4. Check **Shutdown source when not visible**
5. Check **Refresh browser when scene becomes active**

The overlay features a transparent background and will appear at the bottom center of your stream.

## 🔧 Configuration

### Port Configuration
The server will automatically try ports 3000, 3001, 3002, etc. if the default port is in use.

### Database
- Database file: `billiards.db` (auto-created)
- Location: Same directory as executable
- Auto-initializes with default player data

## 📁 Project Structure

```
billiards-bug/
├── server.ts              # Main Express server
├── database.ts            # SQLite database operations
├── types.ts               # TypeScript type definitions
├── public/
│   ├── control.html       # Control interface
│   ├── overlay.html       # OBS overlay
│   ├── control.css        # Control interface styles
│   ├── overlay.css        # Overlay styles
│   ├── control.ts         # Control interface logic
│   ├── overlay.ts         # Overlay logic
│   └── uploads/           # Logo upload directory
├── dist/                  # Compiled JavaScript files
└── package.json           # Dependencies and scripts
```

## 🛠️ Technologies Used

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Real-time**: Socket.IO
- **Database**: SQLite3
- **Packaging**: pkg
- **Frontend**: Vanilla HTML/CSS/TypeScript

## 🎮 Usage

### Control Interface
1. **Player Setup**: Enter player names and optional logo URLs
2. **Score Control**: Use large +/- buttons to adjust scores
3. **Reset**: Reset both scores with confirmation dialog
4. **Copy URL**: Get the overlay URL for OBS

### OBS Overlay
- Automatically updates when scores change
- Displays player names, logos (if provided), and scores
- Professional broadcast appearance with animations

## 🔄 Real-time Updates

The application uses Socket.IO for real-time communication:
- Control interface sends updates to server
- Server broadcasts changes to all connected overlays
- Score animations trigger on updates

## 📦 Packaging

The application can be packaged into a single Windows executable:

```bash
npm run pkg
```

This creates a standalone .exe file in the `dist/` directory that includes:
- Node.js runtime
- All dependencies
- Static assets
- No installation required

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run build`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🔧 Troubleshooting

### Port Issues
If you get "EADDRINUSE" errors, the server will automatically try the next available port.

### Database Issues
Delete `billiards.db` to reset the database - it will auto-recreate with default data.

### Socket Connection Issues
Ensure your firewall allows connections to the application port.

---

Built with ❤️ for the billiards streaming community 