# Building Single Executable Applications

This project uses Node.js v22+ native Single Executable Applications (SEA) to create standalone executables.

## Prerequisites

- Node.js v22.0.0 or higher
- npm

## Building

### Linux Executable

```bash
npm run sea-build
```

This creates `dist/billiards-bug` (Linux executable)

### Windows Executable

First, download the Windows Node.js binary:

```bash
npm run download-windows-node
```

Then build the Windows executable:

```bash
npm run sea-build-windows
```

This creates `dist/billiards-bug.exe` (Windows executable)

### Both Platforms

To build both Linux and Windows executables:

```bash
npm run sea-build-all
```

## What's Included

Each executable contains:
- ✅ Node.js v22 runtime
- ✅ Complete application code (bundled with esbuild)
- ✅ All dependencies (Express, Socket.IO, etc.)
- ✅ Static web assets (HTML, CSS, JS)
- ✅ Database functionality (JSON file-based)

## File Sizes

- Linux: ~118MB
- Windows: ~83MB

## Distribution

The executables are completely self-contained and require no installation:

1. Copy the executable to the target system
2. Run it directly
3. Open http://localhost:3000 in a browser

## Technical Details

- **Bundler**: esbuild (creates single JS file with all dependencies)
- **Assets**: Embedded using SEA asset system
- **Database**: JSON file (created automatically)
- **Ports**: Auto-detects available ports starting from 3000

## Development vs Production

- **Development**: `npm run dev` (serves from filesystem)
- **Production**: Use the SEA executables (serves from embedded assets)

The application automatically detects SEA mode and switches asset serving accordingly. 