#!/bin/bash

# Script to download Windows Node.js binary for cross-compilation
NODE_VERSION="v22.16.0"
WINDOWS_DIR="dist/windows"

echo "🔽 Downloading Windows Node.js ${NODE_VERSION}..."

# Create directory if it doesn't exist
mkdir -p "$WINDOWS_DIR"
cd "$WINDOWS_DIR"

# Download if not already present
if [ ! -f "node-${NODE_VERSION}-win-x64.zip" ]; then
    echo "Downloading node-${NODE_VERSION}-win-x64.zip..."
    wget "https://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-win-x64.zip"
else
    echo "Windows Node.js already downloaded."
fi

# Extract if not already extracted
if [ ! -d "node-${NODE_VERSION}-win-x64" ]; then
    echo "Extracting Windows Node.js..."
    unzip -q "node-${NODE_VERSION}-win-x64.zip"
else
    echo "Windows Node.js already extracted."
fi

echo "✅ Windows Node.js ready for cross-compilation!"
echo "📍 Location: $(pwd)/node-${NODE_VERSION}-win-x64/node.exe" 