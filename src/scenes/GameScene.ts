import Phaser from 'phaser';
import { AssetManager } from '../assets/AssetManager';
import { LevelManager } from '../levels/LevelManager';
import { PlayerController } from '../objects/PlayerController';
import { EnemyManager } from '../objects/EnemyManager';
import { CollectiblesManager } from '../objects/CollectiblesManager';
import { AirCapsuleManager } from '../objects/AirCapsuleManager';
import { ExitManager } from '../objects/ExitManager';
import { UISystem } from '../systems/UISystem';
import { GameStateManager } from '../systems/GameStateManager';
import { MusicManager } from '../systems/MusicManager';
import { DebugMenu } from '../systems/DebugMenu';
import { HighScoreManager } from '../systems/HighScoreManager';
import { DEPTHS } from '../constants/depths';

export class GameScene extends Phaser.Scene {
    private platforms!: Phaser.Physics.Arcade.StaticGroup;
    private playerController!: PlayerController;
    private enemyManager!: EnemyManager;
    private collectiblesManager!: CollectiblesManager;
    private airCapsuleManager!: AirCapsuleManager;
    private exitManager!: ExitManager;
    private uiSystem!: UISystem;
    private gameStateManager!: GameStateManager;
    private debugMenu!: DebugMenu;
    private gameTimer!: Phaser.Time.TimerEvent;
    private restartKey!: Phaser.Input.Keyboard.Key;
    private dingSound!: Phaser.Sound.BaseSound;
    private dieSound!: Phaser.Sound.BaseSound;
    private levelMusic!: Phaser.Sound.BaseSound;
    private currentLevel = LevelManager.getCentralCavernLevel();
    private currentLevelIndex = 0;
    private canPressKey: boolean = true;
    private isTransitioningLevel: boolean = false;
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
        this.load.audio('levelMusic', 'assets/sound/music-level.wav');
    }

    create() {
        // Set level-specific background color
        if (this.currentLevel.backgroundColor !== undefined) {
            this.cameras.main.setBackgroundColor(this.currentLevel.backgroundColor);
        }
        
        // Create animations
        AssetManager.createAnimations(this);
        
        // Start playing the level music on loop (if enabled)
        this.levelMusic = this.sound.add('levelMusic', {
            volume: 0.4,
            loop: true
        });
        
        if (MusicManager.isMusicEnabled()) {
            this.levelMusic.play();
        }
        
        // Initialize game systems
        this.gameStateManager = new GameStateManager();
        this.uiSystem = new UISystem(this, this.currentLevel.name);
        
        // Update lives display
        this.uiSystem.updateLives(this.gameStateManager.getLives());
        
        // Create coin collection sound
        this.dingSound = this.sound.add('dingSound', { volume: 0.6 });
        
        // Create death sound
        this.dieSound = this.sound.add('dieSound', { volume: 0.7 });
        
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
        
        // Create air capsules
        this.airCapsuleManager = new AirCapsuleManager(this);
        this.airCapsuleManager.createAirCapsules(this, this.currentLevel);
        
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
        
        // Initialize debug menu
        this.debugMenu = new DebugMenu(this, this.currentLevelIndex, this.levels.length);
        this.debugMenu.setLevelSkipCallback((levelIndex: number) => {
            this.skipToLevel(levelIndex);
        });
        this.debugMenu.setCollisionToggleCallback((enabled: boolean) => {
            this.handleCollisionToggle(enabled);
        });
        
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
    
    private isAnyKeyPressed(): boolean {
        // Only check for ENTER key
        const keyboard = this.input.keyboard;
        if (keyboard) {
            const enterKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER, false);
            if (Phaser.Input.Keyboard.JustDown(enterKey)) {
                return true;
            }
        }
        
        // Check for gamepad START button only
        try {
            if (this.input.gamepad && this.input.gamepad.total > 0) {
                const gamepad = this.input.gamepad.getPad(0);
                if (gamepad && gamepad.buttons) {
                    // Only check START button (button 9)
                    if (gamepad.buttons[9]?.pressed) {
                        return true;
                    }
                }
            }
        } catch (error) {
            // Gamepad check failed
        }
        
        return false;
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
        
        // Air capsule collisions
        this.physics.add.collider(this.airCapsuleManager.getGroup(), this.platforms);
        this.physics.add.overlap(
            this.playerController.getSprite(), 
            this.airCapsuleManager.getGroup(), 
            this.collectAirCapsule as any, 
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
        // Update debug menu
        this.debugMenu.update();
        
        if (this.gameStateManager.isGameEnded()) {
            // Don't allow key presses during level transitions
            if (this.isTransitioningLevel) {
                return;
            }
            
            // Check for any key press to continue or return to title (with delay to prevent immediate trigger)
            if (this.canPressKey && this.isAnyKeyPressed()) {
                if (this.gameStateManager.isGameWon()) {
                    // Game was won (either level complete or full game complete) - return to title
                    this.returnToTitle();
                } else if (this.gameStateManager.hasLivesRemaining()) {
                    // Lost a life but have lives remaining - continue on same level
                    this.continueLevel();
                } else {
                    // No lives left - return to title screen
                    this.returnToTitle();
                }
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
            // Only trigger game over if collision is enabled (air counts as collision)
            if (this.debugMenu.isCollisionEnabled()) {
                this.gameOver('Out of Air!');
            }
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
    
    private collectAirCapsule(player: any, capsule: any) {
        capsule.disableBody(true, true);
        
        // Play ding sound with higher pitch for air capsule
        const airSound = this.sound.add('dingSound', { volume: 0.8, rate: 1.5 });
        airSound.play();
        
        // Restore 20 air points
        const airRestored = 20;
        this.uiSystem.addAir(airRestored);
        
        // Show air restored message
        const airText = this.add.text(capsule.x, capsule.y - 30, `+${airRestored} AIR`, {
            fontSize: '20px',
            color: '#00ffff',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(DEPTHS.UI_TEXT);
        
        // Animate the text floating up and fading out
        this.tweens.add({
            targets: airText,
            y: capsule.y - 60,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => airText.destroy()
        });
    }

    private hitEnemy(player: any, enemy: any) {
        // Check if collision is disabled in debug menu
        if (!this.debugMenu.isCollisionEnabled()) {
            return; // Skip collision handling
        }
        
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
    
    private handleCollisionToggle(enabled: boolean): void {
        // When collision is toggled, we don't need to do anything here
        // The hitEnemy method already checks the debug menu state
        // Could add visual feedback here if desired
        console.log(`Collision detection ${enabled ? 'enabled' : 'disabled'}`);
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
        // Play death sound
        this.dieSound.play();
        
        // Check if unlimited lives is enabled
        if (!this.debugMenu.isUnlimitedLivesEnabled()) {
            // Lose a life normally
            const livesRemaining = this.gameStateManager.loseLife();
            this.uiSystem.updateLives(livesRemaining);
        }
        // else: unlimited lives - don't lose a life
        
        this.gameStateManager.setGameOver();
        
        // Show different message based on lives remaining
        this.uiSystem.showGameOver(this, reason, this.gameStateManager.hasLivesRemaining());
        
        // Stop all animations
        this.enemyManager.stopAllAnimations();
        this.playerController.stopAnimations();
        this.collectiblesManager.stopAllAnimations();
        this.airCapsuleManager.stopAllAnimations();
        this.exitManager.stopAnimations();
        
        // Stop the level music
        if (this.levelMusic) {
            this.levelMusic.stop();
        }
        
        this.physics.pause();
        this.gameTimer.remove();
        
        // Disable key press for a short moment to prevent immediate restart
        this.canPressKey = false;
        this.time.delayedCall(500, () => {
            this.canPressKey = true;
        });
    }

    private resetGame() {
        this.gameStateManager.reset();
        this.gameStateManager.resetLives();
        // Reset to first level when restarting
        this.currentLevelIndex = 0;
        this.currentLevel = this.levels[0];
    }
    
    private continueLevel() {
        // Reset game state but keep current level and score
        this.gameStateManager.reset();
        
        // Update debug menu to reflect current level
        this.debugMenu.updateCurrentLevel(this.currentLevelIndex);
        
        // Clean up UI elements and game objects
        this.children.removeAll();
        
        // Clear game objects
        this.platforms.clear(true, true);
        this.collectiblesManager.getGroup().clear(true, true);
        this.airCapsuleManager.getGroup().clear(true, true);
        this.enemyManager.getGroup().clear(true, true);
        this.playerController.getSprite().destroy();
        this.exitManager.getSprite()?.destroy();
        
        // Remove the timer if it exists
        if (this.gameTimer) {
            this.gameTimer.remove();
        }
        
        // Recreate the current level (preserving score)
        this.createLevel();
    }
    
    private returnToTitle() {
        // Stop music if playing
        if (this.levelMusic) {
            this.levelMusic.stop();
        }
        
        // Check if player achieved a high score
        const finalScore = this.uiSystem.getScore();
        if (HighScoreManager.isHighScore(finalScore)) {
            // Go to name entry scene
            this.scene.start('NameEntryScene', { score: finalScore });
        } else {
            // Reset to first level for next game
            this.currentLevelIndex = 0;
            this.currentLevel = this.levels[0];
            
            // Return to title scene
            this.scene.start('TitleScene');
        }
    }
    
    private showLevelComplete() {
        // Set flag to prevent key presses during transition
        this.isTransitioningLevel = true;
        
        this.uiSystem.showLevelComplete(this);
        
        // Stop all animations
        this.enemyManager.stopAllAnimations();
        this.playerController.stopAnimations();
        this.collectiblesManager.stopAllAnimations();
        this.airCapsuleManager.stopAllAnimations();
        this.exitManager.stopAnimations();
        
        this.physics.pause();
        this.gameTimer.remove();
    }
    
    private showGameComplete() {
        // Mark game as ended so update() will check for key presses
        this.gameStateManager.setGameOver();
        
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
        
        this.add.text(400, 380, 'Press ENTER or START to return to title', {
            fontSize: '20px',
            color: '#888888'
        }).setOrigin(0.5).setDepth(DEPTHS.LEVEL_COMPLETE_TEXT);
        
        // Stop all animations
        this.enemyManager.stopAllAnimations();
        this.playerController.stopAnimations();
        this.collectiblesManager.stopAllAnimations();
        this.airCapsuleManager.stopAllAnimations();
        this.exitManager.stopAnimations();
        
        // Stop the level music
        if (this.levelMusic) {
            this.levelMusic.stop();
        }
        
        this.physics.pause();
        this.gameTimer.remove();
        
        // Disable key press for a short moment to prevent immediate restart
        this.canPressKey = false;
        this.time.delayedCall(500, () => {
            this.canPressKey = true;
        });
    }
    
    private loadNextLevel() {
        // Clear transition flag
        this.isTransitioningLevel = false;
        
        // Move to next level
        this.currentLevelIndex++;
        this.currentLevel = this.levels[this.currentLevelIndex];
        
        // Update debug menu with new level index
        this.debugMenu.updateCurrentLevel(this.currentLevelIndex);
        
        // Reset game state
        this.gameStateManager.reset();
        
        // Clean up ALL UI elements and game objects
        this.children.removeAll();
        
        // Clear game objects
        this.platforms.clear(true, true);
        this.collectiblesManager.getGroup().clear(true, true);
        this.airCapsuleManager.getGroup().clear(true, true);
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
    
    private skipToLevel(levelIndex: number): void {
        // Validate level index
        if (levelIndex < 0 || levelIndex >= this.levels.length) {
            console.warn(`Invalid level index: ${levelIndex}`);
            return;
        }
        
        // Set the target level
        this.currentLevelIndex = levelIndex;
        this.currentLevel = this.levels[levelIndex];
        
        // Reset game state (but preserve score)
        this.gameStateManager.reset();
        
        // Clean up ALL UI elements and game objects
        this.children.removeAll();
        
        // Clear game objects
        this.platforms.clear(true, true);
        this.collectiblesManager.getGroup().clear(true, true);
        this.airCapsuleManager.getGroup().clear(true, true);
        this.enemyManager.getGroup().clear(true, true);
        this.playerController.getSprite().destroy();
        this.exitManager.getSprite()?.destroy();
        
        // Remove the timer if it exists
        if (this.gameTimer) {
            this.gameTimer.remove();
        }
        
        // Recreate debug menu
        this.debugMenu.destroy();
        this.debugMenu = new DebugMenu(this, this.currentLevelIndex, this.levels.length);
        this.debugMenu.setLevelSkipCallback((levelIndex: number) => {
            this.skipToLevel(levelIndex);
        });
        this.debugMenu.setCollisionToggleCallback((enabled: boolean) => {
            this.handleCollisionToggle(enabled);
        });
        
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
        
        // Restart the level music (if enabled)
        if (MusicManager.isMusicEnabled() && this.levelMusic) {
            this.levelMusic.play();
        }
        
        // Preserve score from previous level
        const currentScore = this.uiSystem ? this.uiSystem.getScore() : 0;
        
        // Update UI with new level name (this creates new UI elements)
        this.uiSystem = new UISystem(this, this.currentLevel.name);
        
        // Restore the score from previous level
        this.uiSystem.updateScore(currentScore);
        
        // Update lives display
        this.uiSystem.updateLives(this.gameStateManager.getLives());
        
        // Create coin collection sound
        this.dingSound = this.sound.add('dingSound', { volume: 0.6 });
        
        // Create death sound
        this.dieSound = this.sound.add('dieSound', { volume: 0.7 });
        
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
        
        // Create air capsules
        this.airCapsuleManager = new AirCapsuleManager(this);
        this.airCapsuleManager.createAirCapsules(this, this.currentLevel);
        
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
