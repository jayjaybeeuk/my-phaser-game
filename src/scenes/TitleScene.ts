import Phaser from 'phaser';
import { MusicManager } from '../systems/MusicManager';
import { HighScoreManager, HighScoreEntry } from '../systems/HighScoreManager';
import { PlatformDetector } from '../utils/PlatformDetector';

export class TitleScene extends Phaser.Scene {
    private startKey!: Phaser.Input.Keyboard.Key;
    private enterKey!: Phaser.Input.Keyboard.Key;
    private mKey!: Phaser.Input.Keyboard.Key;
    private pressStartText!: Phaser.GameObjects.Text;
    private musicToggleText!: Phaser.GameObjects.Text;
    private music!: Phaser.Sound.BaseSound;
    private canStart: boolean = false;
    private titleContainer!: Phaser.GameObjects.Container;
    private highScoreContainer!: Phaser.GameObjects.Container;
    private showingTitle: boolean = true;
    private rotationTimer!: Phaser.Time.TimerEvent;

    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        
        // Load the player sprite
        this.load.spritesheet('player', 'assets/images/main-sprite.png', {
            frameWidth: 28,
            frameHeight: 43
        });
        
        // Only load audio if NOT in Electron
        if (PlatformDetector.isWeb()) {
            this.load.audio('introMusic', 'assets/sound/music-intro.wav');
        }
    }

    create() {
        // Set background color to black
        this.cameras.main.setBackgroundColor('#000000');
        
        // Initialize MusicManager state from localStorage
        MusicManager.initialize();
        
        // Reset canStart flag
        this.canStart = false;

        // Start playing the intro music on loop (if enabled)
        if (PlatformDetector.isWeb() && this.cache.audio.exists('introMusic')) {
            this.music = this.sound.add('introMusic', {
                volume: 0.5,
                loop: true
            });
            
            if (MusicManager.isMusicEnabled()) {
                this.music.play();
            }
        } else {
            // Electron - create dummy sound object
            console.log('Running in Electron - audio disabled');
            this.music = { 
                play: () => {}, 
                stop: () => {}, 
                setLoop: () => {},
                isPlaying: false,
                once: () => {}
            } as any;
        }

        // Create player animations
        if (!this.anims.exists('walk')) {
            this.anims.create({
                key: 'walk',
                frames: this.anims.generateFrameNumbers('player', { start: 1, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
        }
        
        // Create both containers
        this.createTitleScreen();
        this.createHighScoreScreen();
        
        // Start with title screen visible
        this.titleContainer.setVisible(true);
        this.highScoreContainer.setVisible(false);
        this.showingTitle = true;
        
        // Setup rotation timer (10 seconds per screen)
        this.rotationTimer = this.time.addEvent({
            delay: 10000,
            callback: this.rotateScreens,
            callbackScope: this,
            loop: true
        });

        // Setup input
        this.startKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.enterKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.mKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        
        // Clear/reset all key states to prevent carryover from previous scene
        this.input.keyboard!.resetKeys();
        
        // Setup gamepad
        this.setupGamepadInput();
        
        // Delay start detection to prevent immediate start from game over screen
        this.time.delayedCall(1000, () => {
            this.canStart = true;
        });
    }

    private createTitleScreen(): void {
        this.titleContainer = this.add.container(0, 0);
        
        // Add animated player sprite below the title
        const playerSprite = this.add.sprite(400, 190, 'player');
        playerSprite.setScale(5);
        playerSprite.play('walk');
        
        // Game title
        const title = this.add.text(400, 150, 'MANIACAL MINER', {
            fontSize: '64px',
            color: '#ffff00',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Subtitle
        const subtitle = this.add.text(400, 220, 'A Classic Platform Adventure', {
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6
        }).setOrigin(0.5);

        // Instructions
        const inst1 = this.add.text(400, 320, 'Collect all items to reveal the exit', {
            fontSize: '20px',
            color: '#00ff00'
        }).setOrigin(0.5);

        const inst2 = this.add.text(400, 360, 'Avoid enemies and watch your air!', {
            fontSize: '20px',
            color: '#ff6666'
        }).setOrigin(0.5);

        // Controls
        const controlsTitle = this.add.text(400, 420, 'Controls:', {
            fontSize: '18px',
            color: '#ffff00'
        }).setOrigin(0.5);

        const controls1 = this.add.text(400, 450, 'Arrow Keys or Gamepad to Move', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const controls2 = this.add.text(400, 475, 'UP Arrow or A Button to Jump', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Music toggle instruction
        const musicInst = this.add.text(400, 505, 'M or SELECT to Toggle Audio', {
            fontSize: '16px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        
        // Music status indicator
        this.musicToggleText = this.add.text(400, 525, '', {
            fontSize: '14px',
            color: '#00ffff'
        }).setOrigin(0.5);
        this.updateMusicToggleText();

        // Flashing "Press Start" text
        this.pressStartText = this.add.text(400, 555, 'PRESS ENTER OR START TO BEGIN', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Make the text flash
        this.tweens.add({
            targets: this.pressStartText,
            alpha: 0.2,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Add all elements to container
        this.titleContainer.add([
            playerSprite,
            title,
            subtitle,
            inst1,
            inst2,
            controlsTitle,
            controls1,
            controls2,
            musicInst,
            this.musicToggleText,
            this.pressStartText
        ]);
    }

    private createHighScoreScreen(): void {
        this.highScoreContainer = this.add.container(0, 0);
        
        // Load high scores
        const highScores = HighScoreManager.getHighScores();

        // Title
        const title = this.add.text(400, 80, 'HIGH SCORES', {
            fontSize: '48px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.highScoreContainer.add(title);

        // Display high scores
        if (highScores.length === 0) {
            const noScores = this.add.text(400, 300, 'No high scores yet!', {
                fontSize: '24px',
                color: '#888888'
            }).setOrigin(0.5);

            const beFirst = this.add.text(400, 340, 'Be the first to set a record!', {
                fontSize: '18px',
                color: '#666666'
            }).setOrigin(0.5);

            this.highScoreContainer.add([noScores, beFirst]);
        } else {
            // Table headers
            const rankHeader = this.add.text(200, 140, 'RANK', {
                fontSize: '20px',
                color: '#00ff00'
            }).setOrigin(0.5);

            const nameHeader = this.add.text(400, 140, 'NAME', {
                fontSize: '20px',
                color: '#00ff00'
            }).setOrigin(0.5);

            const scoreHeader = this.add.text(600, 140, 'SCORE', {
                fontSize: '20px',
                color: '#00ff00'
            }).setOrigin(0.5);

            this.highScoreContainer.add([rankHeader, nameHeader, scoreHeader]);

            // Display each score
            let yPos = 180;
            highScores.forEach((entry, index) => {
                const rank = index + 1;
                const rankColor = rank === 1 ? '#ffff00' : rank === 2 ? '#c0c0c0' : rank === 3 ? '#cd7f32' : '#ffffff';

                // Rank with medal for top 3
                let rankText = `${rank}`;
                if (rank === 1) rankText = '1ST';
                else if (rank === 2) rankText = '2ND';
                else if (rank === 3) rankText = '3RD';
                else rankText = `${rank}TH`;

                const rankElement = this.add.text(200, yPos, rankText, {
                    fontSize: '20px',
                    color: rankColor,
                    fontFamily: 'monospace'
                }).setOrigin(0.5);

                const nameElement = this.add.text(400, yPos, entry.name, {
                    fontSize: '20px',
                    color: rankColor,
                    fontFamily: 'monospace',
                    fontStyle: 'bold'
                }).setOrigin(0.5);

                const scoreElement = this.add.text(600, yPos, entry.score.toString(), {
                    fontSize: '20px',
                    color: rankColor,
                    fontFamily: 'monospace'
                }).setOrigin(0.5);

                this.highScoreContainer.add([rankElement, nameElement, scoreElement]);

                yPos += 35;
            });
        }

        // Add instruction at bottom (same as title screen)
        const startText = this.add.text(400, 555, 'PRESS ENTER OR START TO BEGIN', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Make the text flash
        this.tweens.add({
            targets: startText,
            alpha: 0.2,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        this.highScoreContainer.add(startText);
    }

    private rotateScreens(): void {
        this.showingTitle = !this.showingTitle;
        
        if (this.showingTitle) {
            this.titleContainer.setVisible(true);
            this.highScoreContainer.setVisible(false);
        } else {
            // Refresh high scores when switching to that screen
            this.highScoreContainer.destroy();
            this.createHighScoreScreen();
            this.titleContainer.setVisible(false);
            this.highScoreContainer.setVisible(true);
        }
    }

    private setupGamepadInput(): void {
        try {
            if (!this.input.gamepad) {
                console.log('Gamepad plugin not available in title scene');
                return;
            }
            
            if (!this.input.gamepad.enabled) {
                this.input.gamepad.start();
            }
        } catch (error) {
            console.log('Title scene gamepad setup failed:', error);
        }
    }

    private isStartPressed(): boolean {
        // Check keyboard Enter key
        const keyboardStart = Phaser.Input.Keyboard.JustDown(this.startKey);
        
        // Check gamepad start button
        let gamepadStart = false;
        try {
            if (this.input.gamepad && this.input.gamepad.total > 0) {
                const gamepad = this.input.gamepad.getPad(0);
                if (gamepad && gamepad.buttons) {
                    // Start button (button 9) or A button (button 0)
                    gamepadStart = gamepad.buttons[9]?.pressed || gamepad.buttons[0]?.pressed;
                }
            }
        } catch (error) {
            // Gamepad check failed, just use keyboard
        }
        
        return keyboardStart || gamepadStart;
    }
    
    private isMusicTogglePressed(): boolean {
        // Check keyboard M key
        const keyboardToggle = Phaser.Input.Keyboard.JustDown(this.mKey);
        
        // Check gamepad select button
        let gamepadToggle = false;
        try {
            if (this.input.gamepad && this.input.gamepad.total > 0) {
                const gamepad = this.input.gamepad.getPad(0);
                if (gamepad && gamepad.buttons) {
                    // Select button (button 8)
                    gamepadToggle = gamepad.buttons[8]?.pressed;
                }
            }
        } catch (error) {
            // Gamepad check failed, just use keyboard
        }
        
        return keyboardToggle || gamepadToggle;
    }
    
    private updateMusicToggleText(): void {
        const musicOn = MusicManager.isMusicEnabled();
        const status = musicOn ? 'Music' : 'Ambient';
        this.musicToggleText.setText(`Audio: ${status}`);
        this.musicToggleText.setColor('#00ffff');
    }

    update() {
        // Check for music toggle
        if (this.isMusicTogglePressed()) {
            MusicManager.toggleMusic();
            this.updateMusicToggleText();
            
            // Toggle music playback immediately
            if (MusicManager.isMusicEnabled()) {
                if (!this.music.isPlaying) {
                    this.music.play();
                }
            } else {
                if (this.music.isPlaying) {
                    this.music.stop();
                }
            }
        }
        
        // Only allow starting after delay
        if (this.canStart && this.isStartPressed()) {
            // Stop the music before transitioning to game
            this.music.stop();
            
            // Clean up timer
            if (this.rotationTimer) {
                this.rotationTimer.remove();
            }
            
            // Start the game
            this.scene.start('GameScene');
        }
    }
}
