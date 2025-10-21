import Phaser from 'phaser';
import { HighScoreManager } from '../systems/HighScoreManager';
import { DEPTHS } from '../constants/depths';

export class NameEntryScene extends Phaser.Scene {
    private nameInput: string = '';
    private nameText!: Phaser.GameObjects.Text;
    private cursorText!: Phaser.GameObjects.Text;
    private finalScore: number = 0;
    private rank: number = 1;
    private cursorBlinkTimer!: Phaser.Time.TimerEvent;
    private cursorVisible: boolean = true;

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

        // Wait a moment then go to title screen
        this.time.delayedCall(2000, () => {
            this.scene.start('TitleScene');
        });
    }
}
