# Maniacal Miner

A modern recreation of the classic Manic Miner platformer game, built with Phaser.js and TypeScript. Experience retro platforming action with challenging levels, moving enemies, and the iconic air depletion mechanic.

## Features

- **Classic Gameplay**: Authentic Manic Miner experience with modern web technologies
- **Three Unique Levels**: Central Cavern, Underground Chamber, and Arctic Zone
- **Core Mechanics**:
  - Air depletion system
  - Collectible items
  - Moving enemies with AI
  - Lives and high score system
  - High score name entry
- **Smooth Animation System**: Custom sprite animations for player and enemies
- **Audio Integration**: Full sound effects and music (web version)
- **Debug Menu**: Development tools for testing (level skip, collision debug, unlimited lives)
- **Cross-Platform**: Play in browser or as a standalone desktop application

## Technologies

- **Phaser.js** - Game engine
- **TypeScript** - Type-safe development
- **Webpack** - Module bundling and development server
- **Electron** - Desktop application framework
- **electron-builder** - Cross-platform desktop builds

## Installation

```bash
# Clone the repository
git clone [your-repo-url]
cd my-phaser-game

# Install dependencies
npm install
```

## Running the Game

### Development Mode
```bash
npm run dev
```
Opens at `http://localhost:8080` with hot reload enabled.

### Production Build
```bash
npm run build
```
Creates optimized build in `dist/` directory.

### Desktop Applications

#### Build for Mac
```bash
npm run build:mac
```

#### Build for Windows
```bash
npm run build:win
```

Built applications will be in the `dist/` directory.

## Controls

- **Arrow Keys** or **WASD** - Move left/right
- **Space** or **Up Arrow** - Jump
- **Gamepad Support** - Full controller compatibility with automatic detection

## Project Structure

```
my-phaser-game/
├── src/
│   ├── scenes/          # Game scenes (Menu, Game, GameOver)
│   ├── managers/        # AssetManager, LevelManager
│   ├── controllers/     # Player, Enemy controllers
│   ├── config/          # Game configuration
│   └── main.ts          # Entry point
├── public/
│   └── assets/          # Sprites, audio, level data
└── dist/                # Build output
```

## Known Issues

- **Desktop Builds**: Audio is currently disabled in Electron builds due to file protocol limitations. The web version retains full audio support.

## Deployment

Web version is deployed on Vercel for easy hosting and updates.

## License

[Your License Here]

## Acknowledgments

Based on the original Manic Miner by Matthew Smith (1983)
