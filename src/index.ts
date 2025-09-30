import Phaser from 'phaser';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    input: {
        gamepad: true  // Enable gamepad support
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 800 },
            debug: false
        }
    },
    scene: [TitleScene, GameScene]
};

// Start the game
new Phaser.Game(config);
