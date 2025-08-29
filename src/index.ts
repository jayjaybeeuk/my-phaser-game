import Phaser from 'phaser';

// Game variables
let player: Phaser.Physics.Arcade.Sprite;
let platforms: Phaser.Physics.Arcade.StaticGroup;
let collectibles: Phaser.Physics.Arcade.Group;
let enemies: Phaser.Physics.Arcade.Group;
let cursors: Phaser.Types.Input.Keyboard.CursorKeys;
let score = 0;
let scoreText: Phaser.GameObjects.Text;
let levelText: Phaser.GameObjects.Text;
let itemsText: Phaser.GameObjects.Text;
let airBar: Phaser.GameObjects.Graphics;
let airRemaining = 100;
let gameTimer: Phaser.Time.TimerEvent;
let totalCollectibles = 0;
let gameWon = false;
let gameEnded = false;
let restartKey: Phaser.Input.Keyboard.Key;

const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 800 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

function preload(this: Phaser.Scene) {
    // Load the sprite sheet for the main character
    this.load.spritesheet('player', 'assets/main-sprite.png', {
        frameWidth: 28,
        frameHeight: 43
    });
    
    // Load the animated coin sprite sheet
    this.load.spritesheet('coin', 'assets/coin-sprite.png', {
        frameWidth: 14,
        frameHeight: 14
    });
    
    // Load the enemy spritesheets
    this.load.spritesheet('enemy-one', 'assets/enemy-one-sprite.png', {
        frameWidth: 21,
        frameHeight: 26
    });
    
    this.load.spritesheet('enemy-two', 'assets/enemy-two-sprite.png', {
        frameWidth: 25,
        frameHeight: 26
    });
    
    this.add.graphics()
        .fillStyle(0xff0000)
        .fillRect(0, 0, 32, 16)
        .generateTexture('platform', 32, 16);
    
    this.add.graphics()
        .fillStyle(0xff00ff)
        .fillRect(0, 0, 24, 24)
        .generateTexture('enemy', 24, 24);
    
    this.add.graphics()
        .fillStyle(0x00ffff)
        .fillRect(0, 0, 32, 32)
        .generateTexture('exit', 32, 32);
}

function create(this: Phaser.Scene) {
    // Create platforms group
    platforms = this.physics.add.staticGroup();
    
    // Create the level layout based on Manic Miner's Central Cavern
    createLevel();
    
    // Create player
    player = this.physics.add.sprite(100, 450, 'player');
    player.setBounce(0);
    player.setCollideWorldBounds(true);
    
    // Create player animations
    this.anims.create({
        key: 'idle',
        frames: [{ key: 'player', frame: 0 }],
        frameRate: 1
    });
    
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('player', { start: 1, end: 3 }),
        frameRate: 8,
        repeat: -1
    });
    
    this.anims.create({
        key: 'jump',
        frames: [{ key: 'player', frame: 4 }],
        frameRate: 1
    });
    
    // Set default animation
    player.anims.play('idle');
    
    // Create coin animation
    this.anims.create({
        key: 'coin-spin',
        frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 4 }),
        frameRate: 10,
        repeat: -1
    });
    
    // Create enemy walking animations
    this.anims.create({
        key: 'enemy-one-walk',
        frames: this.anims.generateFrameNumbers('enemy-one', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1
    });
    
    this.anims.create({
        key: 'enemy-two-walk',
        frames: this.anims.generateFrameNumbers('enemy-two', { start: 0, end: 5 }),
        frameRate: 8,
        repeat: -1
    });
    
    // Player physics
    this.physics.add.collider(player, platforms);
    
    // Create collectibles
    collectibles = this.physics.add.group();
    createCollectibles.call(this);
    
    // Create enemies
    enemies = this.physics.add.group();
    createEnemies.call(this);
    
    // Physics collisions
    this.physics.add.collider(collectibles, platforms);
    this.physics.add.collider(enemies, platforms);
    this.physics.add.overlap(player, collectibles, collectItem as any, undefined, this);
    this.physics.add.overlap(player, enemies, hitEnemy as any, undefined, this);
    
    // Create controls
    cursors = this.input.keyboard!.createCursorKeys();
    
    // UI Elements
    scoreText = this.add.text(16, 16, 'Score: 0', { 
        fontSize: '32px', 
        color: '#ffffff' 
    });
    
    levelText = this.add.text(16, 56, 'Central Cavern', { 
        fontSize: '24px', 
        color: '#ffff00' 
    });
    
    // Items remaining counter
    itemsText = this.add.text(16, 96, 'Items: 20', {
        fontSize: '20px',
        color: '#00ff00'
    });
    
    // Air bar
    airBar = this.add.graphics();
    updateAirBar();
    
    this.add.text(600, 40, 'AIR', {
        fontSize: '16px',
        color: '#ffffff'
    });
    
    // Start air depletion timer
    gameTimer = this.time.addEvent({
        delay: 1000,
        callback: depleteAir,
        callbackScope: this,
        loop: true
    });
    
    // Add game instructions
    this.add.text(400, 570, 'Arrow keys to move, UP to jump, R to restart', {
        fontSize: '14px',
        color: '#888888'
    }).setOrigin(0.5);
    
    // Add restart key
    restartKey = this.input.keyboard!.addKey('R');
}

function createLevel() {
    // Ground level
    for (let x = 0; x < 800; x += 32) {
        platforms.create(x + 16, 584, 'platform').setTint(0xff0000);
    }
    
    // Main platforms (recreating the Central Cavern layout)
    // Top platform
    for (let x = 64; x < 320; x += 32) {
        platforms.create(x, 120, 'platform').setTint(0xff0000);
    }
    for (let x = 360; x < 736; x += 32) {
        platforms.create(x, 120, 'platform').setTint(0xff0000);
    }
    
    // Second level platforms
    for (let x = 160; x < 400; x += 32) {
        platforms.create(x, 200, 'platform').setTint(0xff0000);
    }
    
    for (let x = 480; x < 640; x += 32) {
        platforms.create(x, 200, 'platform').setTint(0xff0000);
    }
    
    // Third level platforms
    for (let x = 32; x < 192; x += 32) {
        platforms.create(x, 280, 'platform').setTint(0xff0000);
    }
    
    for (let x = 352; x < 512; x += 32) {
        platforms.create(x, 280, 'platform').setTint(0xff0000);
    }
    
    for (let x = 608; x < 768; x += 32) {
        platforms.create(x, 280, 'platform').setTint(0xff0000);
    }
    
    // Fourth level platforms
    for (let x = 96; x < 256; x += 32) {
        platforms.create(x, 360, 'platform').setTint(0xff0000);
    }
    
    for (let x = 416; x < 576; x += 32) {
        platforms.create(x, 360, 'platform').setTint(0xff0000);
    }
    
    // Bottom level platforms
    for (let x = 192; x < 352; x += 32) {
        platforms.create(x, 440, 'platform').setTint(0xff0000);
    }
    
    for (let x = 544; x < 704; x += 32) {
        platforms.create(x, 440, 'platform').setTint(0xff0000);
    }
}

function createCollectibles(this: Phaser.Scene) {
    // Place collectibles throughout the level (20 items typical for Manic Miner)
    const collectiblePositions = [
        {x: 128, y: 100}, {x: 256, y: 100}, {x: 384, y: 100}, {x: 512, y: 100}, {x: 640, y: 100},
        {x: 200, y: 180}, {x: 280, y: 180}, {x: 520, y: 180}, {x: 600, y: 180},
        {x: 72, y: 260}, {x: 152, y: 260}, {x: 392, y: 260}, {x: 472, y: 260}, {x: 648, y: 260},
        {x: 136, y: 340}, {x: 216, y: 340}, {x: 456, y: 340}, {x: 536, y: 340},
        {x: 232, y: 420}, {x: 312, y: 420}
    ];
    
    totalCollectibles = collectiblePositions.length;
    
    collectiblePositions.forEach(pos => {
        const item = collectibles.create(pos.x, pos.y, 'coin');
        item.anims.play('coin-spin');
        item.setBounce(0.2);
    });
}

function createEnemies(this: Phaser.Scene) {
    // Create moving enemies with different movement patterns
    // Bottom floor walking enemy using enemy-one spritesheet
    const enemy1 = enemies.create(300, 550, 'enemy-one');
    enemy1.setVelocityX(80);
    enemy1.setBounce(1);
    enemy1.setCollideWorldBounds(true);
    enemy1.anims.play('enemy-one-walk');
    enemy1.setFlipX(false); // Not flipped when going right initially
    
    // Second animated enemy using enemy-two spritesheet
    const enemy2 = enemies.create(500, 260, 'enemy-two');
    enemy2.setVelocityX(-75);
    enemy2.setBounce(1);
    enemy2.setCollideWorldBounds(true);
    enemy2.anims.play('enemy-two-walk');
    enemy2.setFlipX(true); // Flipped when going left initially
    
    const enemy3 = enemies.create(150, 340, 'enemy');
    enemy3.setTint(0x8000ff);
    enemy3.setVelocityX(60);
    enemy3.setBounce(1);
    enemy3.setCollideWorldBounds(true);
    
    const enemy4 = enemies.create(400, 420, 'enemy');
    enemy4.setTint(0xff4080);
    enemy4.setVelocityX(-80);
    enemy4.setBounce(1);
    enemy4.setCollideWorldBounds(true);
}

function update(this: Phaser.Scene) {
    if (gameEnded) {
        // Check for restart
        if (restartKey.isDown) {
            this.scene.restart();
            resetGame();
        }
        return;
    }
    
    // Player movement with animations
    if (cursors.left.isDown) {
        player.setVelocityX(-200);
        player.setFlipX(true); // Flip sprite to face left
        if (player.body!.touching.down) {
            player.anims.play('walk', true);
        }
    } else if (cursors.right.isDown) {
        player.setVelocityX(200);
        player.setFlipX(false); // Face right (normal)
        if (player.body!.touching.down) {
            player.anims.play('walk', true);
        }
    } else {
        player.setVelocityX(0);
        if (player.body!.touching.down) {
            player.anims.play('idle', true);
        }
    }
    
    // Jumping
    if (cursors.up.isDown && player.body!.touching.down) {
        player.setVelocityY(-500);
        player.anims.play('jump', true);
    }
    
    // Play jump animation when in air
    if (!player.body!.touching.down) {
        player.anims.play('jump', true);
    }
    
    // Enemy AI - simple bouncing
    enemies.children.entries.forEach((enemy: any) => {
        if (enemy.body.touching.left || enemy.body.touching.right) {
            enemy.setVelocityX(-enemy.body.velocity.x);
        }
        
        // Set sprite direction for animated enemies based on current velocity
        if (enemy.texture.key === 'enemy-one' || enemy.texture.key === 'enemy-two') {
            enemy.setFlipX(enemy.body.velocity.x < 0); // Flip when going left
        }
    });
    
    // Check win condition
    if (collectibles.countActive(true) === 0 && !gameWon) {
        winLevel.call(this);
    }
    
    // Check if air runs out
    if (airRemaining <= 0 && !gameEnded) {
        gameOver.call(this);
    }
}

function collectItem(this: Phaser.Scene, player: any, collectible: any) {
    collectible.disableBody(true, true);
    score += 100;
    scoreText.setText('Score: ' + score);
    
    // Update items counter
    const itemsLeft = collectibles.countActive(true);
    itemsText.setText('Items: ' + itemsLeft);
    
    // Add bonus air for each item collected
    airRemaining = Math.min(100, airRemaining + 2);
    updateAirBar();
}

function hitEnemy(this: Phaser.Scene, player: any, enemy: any) {
    if (!gameEnded) {
        gameOver.call(this);
    }
}

function depleteAir(this: Phaser.Scene) {
    if (!gameEnded) {
        airRemaining -= 1;
        updateAirBar();
    }
}

function updateAirBar() {
    airBar.clear();
    
    // Change color based on air level
    let color = 0x00ff00; // Green
    if (airRemaining < 30) {
        color = 0xff0000; // Red
    } else if (airRemaining < 60) {
        color = 0xffff00; // Yellow
    }
    
    airBar.fillStyle(color);
    airBar.fillRect(600, 16, airRemaining * 2, 20);
    airBar.lineStyle(2, 0xffffff);
    airBar.strokeRect(600, 16, 200, 20);
}

function winLevel(this: Phaser.Scene) {
    gameWon = true;
    gameEnded = true;
    
    this.add.text(400, 250, 'LEVEL COMPLETE!', {
        fontSize: '48px',
        color: '#00ff00'
    }).setOrigin(0.5);
    
    this.add.text(400, 300, 'Score: ' + score, {
        fontSize: '32px',
        color: '#ffffff'
    }).setOrigin(0.5);
    
    this.add.text(400, 340, 'Air Bonus: ' + (airRemaining * 10), {
        fontSize: '24px',
        color: '#ffff00'
    }).setOrigin(0.5);
    
    this.add.text(400, 380, 'Press R to restart', {
        fontSize: '20px',
        color: '#888888'
    }).setOrigin(0.5);
    
    this.physics.pause();
    gameTimer.remove();
}

function gameOver(this: Phaser.Scene) {
    gameEnded = true;
    
    this.add.text(400, 250, 'GAME OVER', {
        fontSize: '48px',
        color: '#ff0000'
    }).setOrigin(0.5);
    
    this.add.text(400, 300, 'Final Score: ' + score, {
        fontSize: '32px',
        color: '#ffffff'
    }).setOrigin(0.5);
    
    const reason = airRemaining <= 0 ? 'Out of Air!' : 'Touched Enemy!';
    this.add.text(400, 340, reason, {
        fontSize: '24px',
        color: '#ffff00'
    }).setOrigin(0.5);
    
    this.add.text(400, 380, 'Press R to restart', {
        fontSize: '20px',
        color: '#888888'
    }).setOrigin(0.5);
    
    this.physics.pause();
    gameTimer.remove();
}

function resetGame() {
    score = 0;
    airRemaining = 100;
    gameWon = false;
    gameEnded = false;
    totalCollectibles = 0;
}

// Start the game
new Phaser.Game(config);
