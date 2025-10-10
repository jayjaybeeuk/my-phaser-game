import Phaser from 'phaser';
import { DEPTHS } from '../constants/depths';

export class UISystem {
    private scoreText: Phaser.GameObjects.Text;
    private levelText: Phaser.GameObjects.Text;
    private itemsText: Phaser.GameObjects.Text;
    private livesText: Phaser.GameObjects.Text;
    private airBar: Phaser.GameObjects.Graphics;
    private score: number = 0;
    private airRemaining: number = 100;

    constructor(scene: Phaser.Scene, levelName: string) {

        this.levelText = scene.add.text(16, 36, levelName, { 
            fontSize: '20px', 
            color: '#ffff00' 
        }).setDepth(DEPTHS.UI_TEXT);

        this.scoreText = scene.add.text(16, 16, 'Score: 0', { 
            fontSize: '20px', 
            color: '#ffffff' 
        }).setDepth(DEPTHS.UI_TEXT);
        
        this.itemsText = scene.add.text(180, 16, 'Items: 0', {
            fontSize: '20px',
            color: '#00ff00'
        }).setDepth(DEPTHS.UI_TEXT);

        this.livesText = scene.add.text(340, 16, 'Lives: 3', {
            fontSize: '20px',
            color: '#ff00ff'
        }).setDepth(DEPTHS.UI_TEXT);
        
        this.airBar = scene.add.graphics().setDepth(DEPTHS.UI_BACKGROUND);
        scene.add.text(600, 40, 'AIR', {
            fontSize: '16px',
            color: '#ffffff'
        }).setDepth(DEPTHS.UI_TEXT);

        this.updateAirBar();
    }

    updateScore(newScore: number): void {
        this.score = newScore;
        this.scoreText.setText('Score: ' + this.score);
    }

    updateItemsRemaining(itemsLeft: number): void {
        this.itemsText.setText('Items: ' + itemsLeft);
    }
    
    updateLives(lives: number): void {
        this.livesText.setText('Lives: ' + lives);
        
        // Change color based on lives remaining
        if (lives <= 1) {
            this.livesText.setColor('#ff0000'); // Red
        } else if (lives <= 2) {
            this.livesText.setColor('#ffff00'); // Yellow
        } else {
            this.livesText.setColor('#ff00ff'); // Magenta
        }
    }

    updateAir(airLevel: number): void {
        this.airRemaining = Math.max(0, Math.min(100, airLevel));
        this.updateAirBar();
    }

    addAir(amount: number): void {
        this.updateAir(this.airRemaining + amount);
    }

    depleteAir(amount: number = 1): void {
        this.updateAir(this.airRemaining - amount);
    }

    getAirRemaining(): number {
        return this.airRemaining;
    }

    getScore(): number {
        return this.score;
    }

    private updateAirBar(): void {
        this.airBar.clear();
        
        // Change color based on air level
        let color = 0x00ff00; // Green
        if (this.airRemaining < 30) {
            color = 0xff0000; // Red
        } else if (this.airRemaining < 60) {
            color = 0xffff00; // Yellow
        }
        
        this.airBar.fillStyle(color);
        this.airBar.fillRect(600, 16, this.airRemaining * 2, 20);
        this.airBar.lineStyle(2, 0xffffff);
        this.airBar.strokeRect(600, 16, 200, 20);
    }

    showGameOver(scene: Phaser.Scene, reason: string, hasLivesRemaining: boolean): void {
        // Add silver background
        const bg = scene.add.rectangle(400, 300, 450, 250, 0xc0c0c0, 0.9);
        bg.setOrigin(0.5);
        bg.setDepth(DEPTHS.GAME_OVER_BACKGROUND);

        if (hasLivesRemaining) {
            // Lost a life but can continue
            scene.add.text(400, 230, 'LIFE LOST!', {
                fontSize: '48px',
                color: '#ff6600'
            }).setOrigin(0.5).setDepth(DEPTHS.GAME_OVER_TEXT);
            
            scene.add.text(400, 290, reason, {
                fontSize: '24px',
                color: '#ffff00'
            }).setOrigin(0.5).setDepth(DEPTHS.GAME_OVER_TEXT);
            
            scene.add.text(400, 330, 'Press ENTER or START to continue', {
                fontSize: '20px',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(DEPTHS.GAME_OVER_TEXT);
        } else {
            // Game over - no lives left
            scene.add.text(400, 230, 'GAME OVER', {
                fontSize: '48px',
                color: '#ff0000'
            }).setOrigin(0.5).setDepth(DEPTHS.GAME_OVER_TEXT);
            
            scene.add.text(400, 290, 'Final Score: ' + this.score, {
                fontSize: '32px',
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(DEPTHS.GAME_OVER_TEXT);
            
            scene.add.text(400, 330, reason, {
                fontSize: '24px',
                color: '#ffff00'
            }).setOrigin(0.5).setDepth(DEPTHS.GAME_OVER_TEXT);
            
            scene.add.text(400, 370, 'Press ENTER or START to return to title', {
                fontSize: '20px',
                color: '#888888'
            }).setOrigin(0.5).setDepth(DEPTHS.GAME_OVER_TEXT);
        }
    }

    showLevelComplete(scene: Phaser.Scene): void {
        // Add silver background for level complete
        const bg = scene.add.rectangle(400, 300, 450, 250, 0xc0c0c0, 0.9);
        bg.setOrigin(0.5);
        bg.setDepth(DEPTHS.LEVEL_COMPLETE_BACKGROUND);
        
        scene.add.text(400, 250, 'LEVEL COMPLETE!', {
            fontSize: '48px',
            color: '#00ff00'
        }).setOrigin(0.5).setDepth(DEPTHS.LEVEL_COMPLETE_TEXT);
        
        scene.add.text(400, 300, 'Score: ' + this.score, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(DEPTHS.LEVEL_COMPLETE_TEXT);
        
        scene.add.text(400, 340, 'Air Bonus: ' + (this.airRemaining * 10), {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5).setDepth(DEPTHS.LEVEL_COMPLETE_TEXT);
    }
}
