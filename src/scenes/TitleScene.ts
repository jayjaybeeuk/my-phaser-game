import Phaser from 'phaser';

export class TitleScene extends Phaser.Scene {
    private startKey!: Phaser.Input.Keyboard.Key;
    private enterKey!: Phaser.Input.Keyboard.Key;
    private pressStartText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        // Set background color to black
        this.cameras.main.setBackgroundColor('#000000');

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

        // Flashing "Press Start" text
        this.pressStartText = this.add.text(400, 530, 'PRESS ENTER OR START TO BEGIN', {
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
        
        // Setup gamepad
        this.setupGamepadInput();
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

    update() {
        if (this.isStartPressed()) {
            // Start the game
            this.scene.start('GameScene');
        }
    }
}
