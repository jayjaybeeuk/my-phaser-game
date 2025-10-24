import Phaser from 'phaser';
import { TitleScene } from './scenes/TitleScene';
import { GameScene } from './scenes/GameScene';
import { NameEntryScene } from './scenes/NameEntryScene';
import { HighScoreScene } from './scenes/HighScoreScene';

// Game configuration
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    scale: {
        mode: Phaser.Scale.FIT,  // Fits game to screen while maintaining aspect ratio
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: 'game-container',
        fullscreenTarget: 'game-container'  // Element to go fullscreen
    },
    input: {
        gamepad: true,  // Enable gamepad support
        touch: true     // Enable touch input
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 800 },
            debug: false
        }
    },
    scene: [TitleScene, GameScene, NameEntryScene, HighScoreScene]
};

// Start the game
new Phaser.Game(config);
