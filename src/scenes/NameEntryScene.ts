import Phaser from 'phaser';
import { HighScoreManager } from '../systems/HighScoreManager';
import { DEPTHS } from '../constants/depths';
import { TouchControls } from '../systems/TouchControls';

export class NameEntryScene extends Phaser.Scene {
    private nameInput: string = '';
    private nameText!: Phaser.GameObjects.Text;
    private cursorText!: Phaser.GameObjects.Text;
    private finalScore: number = 0;
    private rank: number = 1;
    private cursorBlinkTimer!: Phaser.Time.TimerEvent;
    private cursorVisible: boolean = true;
    private touchControls!: TouchControls;
    private selectedLetterIndex: number = 0;
    private letterButtons: Phaser.GameObjects.Text[] = [];
    private letterHighlight!: Phaser.GameObjects.Rectangle;

    constructor() {
        super({ key: 'NameEntryScene' });
    }

    init(data: { score: number }) {
        this.finalScore = data.score || 0;
        this.nameInput = '';
        this.rank = HighScoreManager.getRank(this.finalScore);
    }

    create() {
        // Background
        this.cameras.main.setBackgroundColor('#000000');

        // Title
        this.add.text(400, 100, 'HIGH SCORE!', {
            fontSize: '48px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Rank and score
        this.add.text(400, 160, `Rank: ${this.rank}`, {
            fontSize: '24px',
            color: '#00ff00'
        }).setOrigin(0.5);

        this.add.text(400, 200, `Score: ${this.finalScore}`, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Instructions
        this.add.text(400, 260, 'Enter your name (4 letters):', {
            fontSize: '24px',
            color: '#aaaaaa'
        }).setOrigin(0.5);

        // Name display area with underscores
        const nameDisplayY = 320;
        this.add.text(400, nameDisplayY, '____', {
            fontSize: '48px',
            color: '#444444',
            fontFamily: 'monospace'
        }).setOrigin(0.5);

        // Name input text (overlays the underscores)
        this.nameText = this.add.text(400, nameDisplayY, '', {
            fontSize: '48px',
            color: '#00ffff',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Cursor
        this.cursorText = this.add.text(
            400 + (this.nameInput.length * 29) - 43.5, // Adjust position based on character count
            nameDisplayY,
            '_',
            {
                fontSize: '48px',
                color: '#00ff00',
                fontFamily: 'monospace'
            }
        ).setOrigin(0.5);

        // Blink cursor
        this.cursorBlinkTimer = this.time.addEvent({
            delay: 500,
            callback: () => {
                this.cursorVisible = !this.cursorVisible;
                this.cursorText.setVisible(this.cursorVisible);
            },
            loop: true
        });

        // Instructions
        this.add.text(400, 400, 'Type A-Z, BACKSPACE to delete', {
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);

        this.add.text(400, 430, 'Press ENTER when done', {
            fontSize: '16px',
            color: '#888888'
        }).setOrigin(0.5);

        // Set up keyboard input
        this.input.keyboard!.on('keydown', this.handleKeyPress, this);

        // Create touch letter grid for mobile input
        this.createTouchLetterGrid();

        // Setup touch controls
        this.touchControls = new TouchControls(this);
    }

    private createTouchLetterGrid(): void {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const cols = 9;
        const startX = 130;
        const startY = 440;
        const cellW = 60;
        const cellH = 44;

        for (let i = 0; i < letters.length; i++) {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = startX + col * cellW;
            const y = startY + row * cellH;

            const letterText = this.add.text(x, y, letters[i], {
                fontSize: '28px',
                color: '#00ffff',
                fontFamily: 'monospace',
                fontStyle: 'bold'
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            letterText.on('pointerdown', () => {
                if (this.nameInput.length < 4) {
                    this.nameInput += letters[i];
                    this.updateNameDisplay();
                }
            });

            this.letterButtons.push(letterText);
        }

        // Add backspace and enter touch buttons
        const bkspX = startX + 7 * cellW;
        const enterX = startX + 8 * cellW;
        const btnY = startY + 3 * cellH;

        const bksp = this.add.text(bkspX - cellW / 2, btnY, 'DEL', {
            fontSize: '20px',
            color: '#ff6666',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        bksp.on('pointerdown', () => {
            if (this.nameInput.length > 0) {
                this.nameInput = this.nameInput.slice(0, -1);
                this.updateNameDisplay();
            }
        });

        const enter = this.add.text(enterX, btnY, 'OK', {
            fontSize: '20px',
            color: '#00ff00',
            fontFamily: 'monospace',
            fontStyle: 'bold'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        enter.on('pointerdown', () => {
            if (this.nameInput.length > 0) {
                this.submitScore();
            }
        });
    }

    update(): void {
        // Update touch edge detection for select button as confirm
        if (this.touchControls) {
            this.touchControls.updateSelectEdge();
            if (this.touchControls.consumeSelectPress() && this.nameInput.length > 0) {
                this.submitScore();
            }
        }
    }

    private handleKeyPress(event: KeyboardEvent) {
        const key = event.key.toUpperCase();

        // Handle letter input (A-Z)
        if (key.length === 1 && key >= 'A' && key <= 'Z' && this.nameInput.length < 4) {
            this.nameInput += key;
            this.updateNameDisplay();
        }
        // Handle backspace
        else if (event.key === 'Backspace' && this.nameInput.length > 0) {
            this.nameInput = this.nameInput.slice(0, -1);
            this.updateNameDisplay();
        }
        // Handle enter - submit
        else if (event.key === 'Enter' && this.nameInput.length > 0) {
            this.submitScore();
        }
    }

    private updateNameDisplay() {
        this.nameText.setText(this.nameInput);

        // Update cursor position
        const cursorX = 400 + (this.nameInput.length * 29) - 43.5;
        this.cursorText.setX(cursorX);

        // Reset cursor visibility
        this.cursorVisible = true;
        this.cursorText.setVisible(true);
    }

    private submitScore() {
        // Pad name if less than 4 characters
        const paddedName = this.nameInput.padEnd(4, '_');

        // Save the score
        HighScoreManager.saveScore(paddedName, this.finalScore);

        // Stop cursor blinking
        if (this.cursorBlinkTimer) {
            this.cursorBlinkTimer.remove();
        }

        // Show confirmation briefly
        this.add.text(400, 480, 'Score Saved!', {
            fontSize: '24px',
            color: '#00ff00'
        }).setOrigin(0.5);

        // Remove keyboard listener
        this.input.keyboard!.off('keydown', this.handleKeyPress, this);

        // Clean up touch controls
        if (this.touchControls) {
            this.touchControls.destroy();
        }

        // Wait a moment then go to title screen
        this.time.delayedCall(2000, () => {
            this.scene.start('TitleScene');
        });
    }
}
