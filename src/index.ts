import Phaser from 'phaser';
import { AssetManager } from './assets/AssetManager';
import { LevelManager } from './levels/LevelManager';
import { PlayerController } from './objects/PlayerController';
import { EnemyManager } from './objects/EnemyManager';
import { CollectiblesManager } from './objects/CollectiblesManager';
import { ExitManager } from './objects/ExitManager';
import { UISystem } from './systems/UISystem';
import { GameStateManager } from './systems/GameStateManager';

// Game scene class
class GameScene extends Phaser.Scene {
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
    private currentLevel = LevelManager.getCentralCavernLevel();

    preload() {
        AssetManager.preloadAssets(this);
    }

    create() {
        // Create animations
        AssetManager.createAnimations(this);
        
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
            // Check for restart
            if (this.restartKey.isDown) {
                this.scene.restart();
                this.resetGame();
            }
            return;
        }
        
        // Update game objects
        this.playerController.update();
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
        
        this.uiSystem.showLevelComplete(this);
        
        // Stop all animations
        this.enemyManager.stopAllAnimations();
        this.playerController.stopAnimations();
        this.collectiblesManager.stopAllAnimations();
        this.exitManager.stopAnimations();
        
        this.physics.pause();
        this.gameTimer.remove();
    }

    private gameOver(reason: string) {
        this.gameStateManager.setGameOver();
        
        this.uiSystem.showGameOver(this, reason);
        
        // Stop all animations
        this.enemyManager.stopAllAnimations();
        this.playerController.stopAnimations();
        this.collectiblesManager.stopAllAnimations();
        this.exitManager.stopAnimations();
        
        this.physics.pause();
        this.gameTimer.remove();
    }

    private resetGame() {
        this.gameStateManager.reset();
    }
}

// Game configuration
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
    scene: GameScene
};

// Start the game
new Phaser.Game(config);
