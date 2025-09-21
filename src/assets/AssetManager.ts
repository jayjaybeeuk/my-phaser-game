import Phaser from 'phaser';

export class AssetManager {
    static preloadAssets(scene: Phaser.Scene) {
        // Load the sprite sheet for the main character
        scene.load.spritesheet('player', 'assets/main-sprite.png', {
            frameWidth: 28,
            frameHeight: 43
        });
        
        // Load the animated coin sprite sheet
        scene.load.spritesheet('coin', 'assets/coin-sprite.png', {
            frameWidth: 14,
            frameHeight: 14
        });
        
        // Load the enemy spritesheets
        scene.load.spritesheet('enemy-one', 'assets/enemy-one-sprite.png', {
            frameWidth: 21,
            frameHeight: 26
        });
        
        scene.load.spritesheet('enemy-two', 'assets/enemy-two-sprite.png', {
            frameWidth: 25,
            frameHeight: 26
        });
        
        // Create basic textures
        AssetManager.createBasicTextures(scene);
    }

    static createBasicTextures(scene: Phaser.Scene) {
        scene.add.graphics()
            .fillStyle(0xff0000)
            .fillRect(0, 0, 32, 16)
            .generateTexture('platform', 32, 16);
        
        scene.add.graphics()
            .fillStyle(0xff00ff)
            .fillRect(0, 0, 24, 24)
            .generateTexture('enemy', 24, 24);
        
        scene.add.graphics()
            .fillStyle(0x00ffff)
            .fillRect(0, 0, 32, 32)
            .generateTexture('exit', 32, 32);
    }

    static createAnimations(scene: Phaser.Scene) {
        // Player animations
        scene.anims.create({
            key: 'idle',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 1
        });
        
        scene.anims.create({
            key: 'walk',
            frames: scene.anims.generateFrameNumbers('player', { start: 1, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        
        scene.anims.create({
            key: 'jump',
            frames: [{ key: 'player', frame: 4 }],
            frameRate: 1
        });
        
        // Coin animation
        scene.anims.create({
            key: 'coin-spin',
            frames: scene.anims.generateFrameNumbers('coin', { start: 0, end: 4 }),
            frameRate: 10,
            repeat: -1
        });
        
        // Enemy animations
        scene.anims.create({
            key: 'enemy-one-walk',
            frames: scene.anims.generateFrameNumbers('enemy-one', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1
        });
        
        scene.anims.create({
            key: 'enemy-two-walk',
            frames: scene.anims.generateFrameNumbers('enemy-two', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1
        });
    }
}
