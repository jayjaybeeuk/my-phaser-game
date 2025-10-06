import Phaser from 'phaser';
import { MusicManager } from '../systems/MusicManager';

export class TitleScene extends Phaser.Scene {
    private startKey!: Phaser.Input.Keyboard.Key;
    private enterKey!: Phaser.Input.Keyboard.Key;
    private mKey!: Phaser.Input.Keyboard.Key;
    private pressStartText!: Phaser.GameObjects.Text;
    private musicToggleText!: Phaser.GameObjects.Text;
    private music!: Phaser.Sound.BaseSound;
    private canStart: boolean = false;

    constructor() {
        super({ key: 'TitleScene' });
    }

    preload() {
        // Load the intro music
        this.load.audio('introMusic', 'assets/sound/music-intro.wav');
    }

    create() {
        // Set background color to black
        this.cameras.main.setBackgroundColor('#000000');
        
        // Reset canStart flag
        this.canStart = false;

        // Start playing the intro music on loop (if enabled)
        this.music = this.sound.add('introMusic', {
            volume: 0.5,
            loop: true
        });
        
        if (MusicManager.isMusicEnabled()) {
            this.music.play();
        }

        // Game title
        this.add.text(400, 150, 'MANIACAL MINER', {
            fontSize: '64px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Subtitle
        this.add.text(400, 220, 'A Classic Platform Adventure', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(400, 320, 'Collect all items to reveal the exit', {
            fontSize: '20px',
            color: '#00ff00'
        }).setOrigin(0.5);

        this.add.text(400, 360, 'Avoid enemies and watch your air!', {
            fontSize: '20px',
            color: '#ff6666'
        }).setOrigin(0.5);

        // Controls
        this.add.text(400, 420, 'Controls:', {
            fontSize: '18px',
            color: '#ffff00'
        }).setOrigin(0.5);

        this.add.text(400, 450, 'Arrow Keys or Gamepad to Move', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(400, 475, 'UP Arrow or A Button to Jump', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Music toggle instruction
        this.add.text(400, 505, 'M or SELECT to Toggle Music', {
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
        const status = MusicManager.isMusicEnabled() ? 'ON' : 'OFF';
        const color = MusicManager.isMusicEnabled() ? '#00ff00' : '#ff0000';
        this.musicToggleText.setText(`Music: ${status}`);
        this.musicToggleText.setColor(color);
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
            
            // Start the game
            this.scene.start('GameScene');
        }
    }
}
