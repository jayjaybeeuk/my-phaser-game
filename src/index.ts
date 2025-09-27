import Phaser from 'phaser';
import { AssetManager } from './assets/AssetManager';
import { LevelManager } from './levels/LevelManager';
import { PlayerController } from './objects/PlayerController';
import { EnemyManager } from './objects/EnemyManager';
import { CollectiblesManager } from './objects/CollectiblesManager';
import { UISystem } from './systems/UISystem';
import { GameStateManager } from './systems/GameStateManager';

// Game scene class
class GameScene extends Phaser.Scene {
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private playerController!: PlayerController;
    private enemyManager!: EnemyManager;
    private collectiblesManager!: CollectiblesManager;
    private uiSystem!: UISystem;
    private gameStateManager!: GameStateManager;
    private gameTimer!: Phaser.Time.TimerEvent;
    private restartKey!: Phaser.Input.Keyboard.Key;
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
        
        // Check win condition
        if (this.collectiblesManager.areAllCollected() && !this.gameStateManager.isGameWon()) {
            this.winLevel();
        }
        
        // Check if air runs out
        if (this.uiSystem.getAirRemaining() <= 0 && !this.gameStateManager.isGameEnded()) {
            this.gameOver('Out of Air!');
        }
    }

    private collectItem(player: any, collectible: any) {
        collectible.disableBody(true, true);
        
        const newScore = this.uiSystem.getScore() + 100;
        this.uiSystem.updateScore(newScore);
        
        // Update items counter
        this.uiSystem.updateItemsRemaining(this.collectiblesManager.getRemainingCount());
        
        // Add bonus air for each item collected
        this.uiSystem.addAir(2);
    }

    private hitEnemy(player: any, enemy: any) {
        if (!this.gameStateManager.isGameEnded()) {
            this.gameOver('Touched Enemy!');
        }
    }

    private depleteAir() {
        if (!this.gameStateManager.isGameEnded()) {
            this.uiSystem.depleteAir();
        }
    }

    private winLevel() {
        this.gameStateManager.setGameWon();
        
        this.uiSystem.showLevelComplete(this);
        
        // Stop all animations
        this.enemyManager.stopAllAnimations();
        this.playerController.stopAnimations();
        this.collectiblesManager.stopAllAnimations();
        
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
