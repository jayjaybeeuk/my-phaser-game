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
        
        // Load sound effects (fallback to generated sounds if files don't exist)
        AssetManager.loadOrCreateSounds(scene);
        
        // Create basic textures
        AssetManager.createBasicTextures(scene);
    }

    static loadOrCreateSounds(scene: Phaser.Scene) {
        console.log('Loading sound assets...');
        
        // Load available sound files
        scene.load.audio('walkSound', 'assets/walk-sound.wav');
        scene.load.audio('jumpSound', 'assets/jump-sound.wav');
        scene.load.audio('dingSound', 'assets/ding-sound.wav');
        
        // Add comprehensive error handling
        scene.load.on('filefailed', (key: string, type: string, url: string) => {
            console.error(`Failed to load ${type}: ${key} from ${url}`);
        });
        
        scene.load.on('fileload', (key: string, type: string, data: any) => {
            console.log(`Successfully loaded ${type}: ${key}`);
        });
        
        scene.load.on('complete', () => {
            console.log('Sound loading complete');
        });
    }

    static createBasicTextures(scene: Phaser.Scene) {
        // Create platform texture (white so tinting works properly)
        const platformGraphics = scene.add.graphics();
        platformGraphics.fillStyle(0xffffff);
        platformGraphics.fillRect(0, 0, 32, 16);
        platformGraphics.generateTexture('platform', 32, 16);
        platformGraphics.destroy();
        
        // Create enemy texture
        const enemyGraphics = scene.add.graphics();
        enemyGraphics.fillStyle(0xff00ff);
        enemyGraphics.fillRect(0, 0, 24, 24);
        enemyGraphics.generateTexture('enemy', 24, 24);
        enemyGraphics.destroy();
        
        // Create exit texture
        const exitGraphics = scene.add.graphics();
        exitGraphics.fillStyle(0x00ffff);
        exitGraphics.fillRect(0, 0, 32, 32);
        exitGraphics.generateTexture('exit', 32, 32);
        exitGraphics.destroy();
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
