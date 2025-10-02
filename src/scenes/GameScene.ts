import Phaser from 'phaser';
import { AssetManager } from '../assets/AssetManager';
import { LevelManager } from '../levels/LevelManager';
import { PlayerController } from '../objects/PlayerController';
import { EnemyManager } from '../objects/EnemyManager';
import { CollectiblesManager } from '../objects/CollectiblesManager';
import { ExitManager } from '../objects/ExitManager';
import { UISystem } from '../systems/UISystem';
import { GameStateManager } from '../systems/GameStateManager';
import { DEPTHS } from '../constants/depths';

export class GameScene extends Phaser.Scene {
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private playerController!: PlayerController;
    private enemyManager!: EnemyManager;
    private collectiblesManager!: CollectiblesManager;
    private exitManager!: ExitManager;
    private uiSystem!: UISystem;
    private gameStateManager!: GameStateManager;
    private gameTimer!: Phaser.Time.TimerEvent;
    private restartKey!: Phaser.Input.Keyboard.Key;
    private dingSound!: Phaser.Sound.BaseSound;
    private levelMusic!: Phaser.Sound.BaseSound;
    private currentLevel = LevelManager.getCentralCavernLevel();
    private currentLevelIndex = 0;
    private levels = [
        LevelManager.getCentralCavernLevel(),
        LevelManager.getUndergroundChamberLevel(),
        LevelManager.getArcticZoneLevel()
    ];

    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        AssetManager.preloadAssets(this);
        
        // Load level music
        this.load.audio('levelMusic', 'assets/music-level.wav');
    }

    create() {
        // Set level-specific background color
        if (this.currentLevel.backgroundColor !== undefined) {
            this.cameras.main.setBackgroundColor(this.currentLevel.backgroundColor);
        }
        
        // Create animations
        AssetManager.createAnimations(this);
        
        // Start playing the level music on loop
        this.levelMusic = this.sound.add('levelMusic', {
            volume: 0.4,
            loop: true
        });
        this.levelMusic.play();
        
        // Initialize game systems
        this.gameStateManager = new GameStateManager();
        this.uiSystem = new UISystem(this, this.currentLevel.name);
        
        // Create coin collection sound
        this.dingSound = this.sound.add('dingSound', { volume: 0.6 });
        
        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        LevelManager.createPlatforms(this, this.platforms, this.currentLevel);
        
        // Create player
        this.playerController = new PlayerController(
            this, 
            this.currentLevel.playerStart.x, 
            this.currentLevel.playerStart.y
        );
        
        // Create collectibles
        this.collectiblesManager = new CollectiblesManager(this);
        this.collectiblesManager.createCollectibles(this, this.currentLevel);
        this.uiSystem.updateItemsRemaining(this.collectiblesManager.getRemainingCount());
        
        // Create exit (hidden initially)
        this.exitManager = new ExitManager(this);
        this.exitManager.createExit(this.currentLevel);
        
        // Create enemies
        this.enemyManager = new EnemyManager(this);
        this.enemyManager.createEnemies(this, this.currentLevel);
        
        // Set up physics collisions
        this.setupPhysics();
        
        // Start air depletion timer
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.depleteAir,
            callbackScope: this,
            loop: true
        });
        
        // Add restart key
        this.restartKey = this.input.keyboard!.addKey('R');
        
        // Setup gamepad for restart functionality
        this.setupGamepadInput();
    }
    
    private setupGamepadInput(): void {
        try {
            // Check if gamepad plugin exists
            if (!this.input.gamepad) {
                console.log('Gamepad plugin not available in main scene');
                return;
            }
            
            // Enable gamepad plugin
            if (!this.input.gamepad.enabled) {
                this.input.gamepad.start();
            }
        } catch (error) {
            console.log('Main scene gamepad setup failed:', error);
        }
    }
    
    private isRestartPressed(): boolean {
        // Check keyboard R key
        const keyboardRestart = this.restartKey.isDown;
        
        // Check gamepad start/menu button or select button
        let gamepadRestart = false;
        try {
            if (this.input.gamepad && this.input.gamepad.total > 0) {
                const gamepad = this.input.gamepad.getPad(0);
                if (gamepad && gamepad.buttons) {
                    // Start button, Select button, or any shoulder button for restart
                    gamepadRestart = gamepad.buttons[9]?.pressed || // Start button
                                    gamepad.buttons[8]?.pressed || // Select button  
                                    gamepad.buttons[4]?.pressed || // L1/LB
                                    gamepad.buttons[5]?.pressed;   // R1/RB
                }
            }
        } catch (error) {
            // Gamepad check failed, just use keyboard
        }
        
        return keyboardRestart || gamepadRestart;
    }

    private setupPhysics() {
        // Player collisions
        this.physics.add.collider(this.playerController.getSprite(), this.platforms);
        
        // Collectibles collisions
        this.physics.add.collider(this.collectiblesManager.getGroup(), this.platforms);
        this.physics.add.overlap(
            this.playerController.getSprite(), 
            this.collectiblesManager.getGroup(), 
            this.collectItem as any, 
            undefined, 
            this
        );
        
        // Enemy collisions
        this.physics.add.collider(this.enemyManager.getGroup(), this.platforms);
        this.physics.add.overlap(
            this.playerController.getSprite(), 
            this.enemyManager.getGroup(), 
            this.hitEnemy as any, 
            undefined, 
            this
        );
        
        // Note: Exit collision is handled manually in update() since exit is not a physics sprite
    }

    update() {
        if (this.gameStateManager.isGameEnded()) {
            // Check for restart from keyboard or gamepad
            if (this.isRestartPressed()) {
                this.scene.restart();
                this.resetGame();
            }
            return;
        }
        
        // Update game objects
        this.playerController.update();
        
        // Check for vertical wraparound and manual bounds (for levels with gaps in floor)
        this.playerController.checkVerticalWrap(600, 800);
        
        this.enemyManager.update();
        
        // Check if all items collected - show exit
        if (this.collectiblesManager.areAllCollected() && !this.exitManager.isExitVisible()) {
            this.exitManager.showExit();
            // Show message that exit appeared
            const exitText = this.add.text(400, 150, 'EXIT APPEARED!', {
                fontSize: '24px',
                color: '#00ff00'
            }).setOrigin(0.5);
            
            // Fade out the message after 2 seconds
            this.time.delayedCall(2000, () => {
                this.tweens.add({
                    targets: exitText,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => exitText.destroy()
                });
            });
        }
        
        // Check exit collision manually (since exit is not a physics sprite)
        if (this.exitManager.isExitVisible() && !this.gameStateManager.isGameEnded()) {
            const player = this.playerController.getSprite();
            const exit = this.exitManager.getSprite();
            
            if (player && exit) {
                const distance = Phaser.Math.Distance.Between(
                    player.x, player.y,
                    exit.x, exit.y
                );
                
                // If player is close enough to exit (within 30 pixels), trigger win
                if (distance < 30) {
                    this.winLevel();
                }
            }
        }
        
        // Check if air runs out
        if (this.uiSystem.getAirRemaining() <= 0 && !this.gameStateManager.isGameEnded()) {
            this.gameOver('Out of Air!');
        }
    }

    private collectItem(player: any, collectible: any) {
        collectible.disableBody(true, true);
        
        // Play ding sound when coin is collected
        this.dingSound.play();
        
        const newScore = this.uiSystem.getScore() + 100;
        this.uiSystem.updateScore(newScore);
        
        // Update items counter
        this.uiSystem.updateItemsRemaining(this.collectiblesManager.getRemainingCount());
        
        // Coins no longer give air bonus - air only depletes over time
    }

    private hitEnemy(player: any, enemy: any) {
        if (!this.gameStateManager.isGameEnded()) {
            this.gameOver('Touched Enemy!');
        }
    }

    private depleteAir() {
        if (!this.gameStateManager.isGameEnded()) {
            // Deplete air twice as fast (2 per second instead of 1)
            this.uiSystem.depleteAir(2);
        }
    }

    private winLevel() {
        this.gameStateManager.setGameWon();
        
        // Check if there's a next level
        if (this.currentLevelIndex < this.levels.length - 1) {
            // Progress to next level
            this.showLevelComplete();
            
            // Wait 2 seconds then load next level
            this.time.delayedCall(2000, () => {
                this.loadNextLevel();
            });
        } else {
            // Game completed - all levels finished!
            this.showGameComplete();
        }
    }

    private gameOver(reason: string) {
        this.gameStateManager.setGameOver();
        
        this.uiSystem.showGameOver(this, reason);
        
        // Stop all animations
        this.enemyManager.stopAllAnimations();
        this.playerController.stopAnimations();
        this.collectiblesManager.stopAllAnimations();
        this.exitManager.stopAnimations();
        
        // Stop the level music
        if (this.levelMusic) {
            this.levelMusic.stop();
        }
        
        this.physics.pause();
        this.gameTimer.remove();
    }

    private resetGame() {
        this.gameStateManager.reset();
        // Reset to first level when restarting
        this.currentLevelIndex = 0;
        this.currentLevel = this.levels[0];
    }
    
    private showLevelComplete() {
        this.uiSystem.showLevelComplete(this);
        
        // Stop all animations
        this.enemyManager.stopAllAnimations();
        this.playerController.stopAnimations();
        this.collectiblesManager.stopAllAnimations();
        this.exitManager.stopAnimations();
        
        this.physics.pause();
        this.gameTimer.remove();
    }
    
    private showGameComplete() {
        // Show final completion message
        const bg = this.add.rectangle(400, 300, 500, 300, 0xc0c0c0, 0.9);
        bg.setOrigin(0.5);
        bg.setDepth(DEPTHS.LEVEL_COMPLETE_BACKGROUND);
        
        this.add.text(400, 220, 'GAME COMPLETE!', {
            fontSize: '48px',
            color: '#00ff00'
        }).setOrigin(0.5).setDepth(DEPTHS.LEVEL_COMPLETE_TEXT);
        
        this.add.text(400, 280, 'All levels conquered!', {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(DEPTHS.LEVEL_COMPLETE_TEXT);
        
        this.add.text(400, 340, 'Final Score: ' + this.uiSystem.getScore(), {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5).setDepth(DEPTHS.LEVEL_COMPLETE_TEXT);
        
        // Stop all animations
        this.enemyManager.stopAllAnimations();
        this.playerController.stopAnimations();
        this.collectiblesManager.stopAllAnimations();
        this.exitManager.stopAnimations();
        
        // Stop the level music
        if (this.levelMusic) {
            this.levelMusic.stop();
        }
        
        this.physics.pause();
        this.gameTimer.remove();
    }
    
    private loadNextLevel() {
        // Move to next level
        this.currentLevelIndex++;
        this.currentLevel = this.levels[this.currentLevelIndex];
        
        // Reset game state
        this.gameStateManager.reset();
        
        // Clean up ALL UI elements and game objects
        this.children.removeAll();
        
        // Clear game objects
        this.platforms.clear(true, true);
        this.collectiblesManager.getGroup().clear(true, true);
        this.enemyManager.getGroup().clear(true, true);
        this.playerController.getSprite().destroy();
        this.exitManager.getSprite()?.destroy();
        
        // Remove the timer if it exists
        if (this.gameTimer) {
            this.gameTimer.remove();
        }
        
        // Create new level
        this.createLevel();
    }
    
    private createLevel() {
        // Set level-specific background color
        if (this.currentLevel.backgroundColor !== undefined) {
            this.cameras.main.setBackgroundColor(this.currentLevel.backgroundColor);
        } else {
            this.cameras.main.setBackgroundColor('#000000'); // Default black
        }
        
        // Preserve score from previous level
        const currentScore = this.uiSystem ? this.uiSystem.getScore() : 0;
        
        // Update UI with new level name (this creates new UI elements)
        this.uiSystem = new UISystem(this, this.currentLevel.name);
        
        // Restore the score from previous level
        this.uiSystem.updateScore(currentScore);
        
        // Create coin collection sound
        this.dingSound = this.sound.add('dingSound', { volume: 0.6 });
        
        // Create platforms
        this.platforms = this.physics.add.staticGroup();
        LevelManager.createPlatforms(this, this.platforms, this.currentLevel);
        
        // Create player
        this.playerController = new PlayerController(
            this, 
            this.currentLevel.playerStart.x, 
            this.currentLevel.playerStart.y
        );
        
        // Create collectibles
        this.collectiblesManager = new CollectiblesManager(this);
        this.collectiblesManager.createCollectibles(this, this.currentLevel);
        this.uiSystem.updateItemsRemaining(this.collectiblesManager.getRemainingCount());
        
        // Create exit (hidden initially)
        this.exitManager = new ExitManager(this);
        this.exitManager.createExit(this.currentLevel);
        
        // Create enemies
        this.enemyManager = new EnemyManager(this);
        this.enemyManager.createEnemies(this, this.currentLevel);
        
        // Set up physics collisions
        this.setupPhysics();
        
        // Start air depletion timer
        this.gameTimer = this.time.addEvent({
            delay: 1000,
            callback: this.depleteAir,
            callbackScope: this,
            loop: true
        });
        
        // Resume physics
        this.physics.resume();
    }
}
