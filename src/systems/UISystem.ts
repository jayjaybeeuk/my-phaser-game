import Phaser from 'phaser';

export class UISystem {
    private scoreText: Phaser.GameObjects.Text;
    private levelText: Phaser.GameObjects.Text;
    private itemsText: Phaser.GameObjects.Text;
    private airBar: Phaser.GameObjects.Graphics;
    private score: number = 0;
    private airRemaining: number = 100;

    constructor(scene: Phaser.Scene, levelName: string) {
        this.scoreText = scene.add.text(16, 16, 'Score: 0', { 
            fontSize: '32px', 
            color: '#ffffff' 
        });
        
        this.levelText = scene.add.text(16, 56, levelName, { 
            fontSize: '24px', 
            color: '#ffff00' 
        });
        
        this.itemsText = scene.add.text(16, 96, 'Items: 0', {
            fontSize: '20px',
            color: '#00ff00'
        });
        
        this.airBar = scene.add.graphics();
        scene.add.text(600, 40, 'AIR', {
            fontSize: '16px',
            color: '#ffffff'
        });
        
        scene.add.text(400, 570, 'Arrow keys to move, UP to jump, R to restart', {
            fontSize: '14px',
            color: '#888888'
        }).setOrigin(0.5);
        
        this.updateAirBar();
    }

    updateScore(newScore: number): void {
        this.score = newScore;
        this.scoreText.setText('Score: ' + this.score);
    }

    updateItemsRemaining(itemsLeft: number): void {
        this.itemsText.setText('Items: ' + itemsLeft);
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

    showGameOver(scene: Phaser.Scene, reason: string): void {
        scene.add.text(400, 250, 'GAME OVER', {
            fontSize: '48px',
            color: '#ff0000'
        }).setOrigin(0.5);
        
        scene.add.text(400, 300, 'Final Score: ' + this.score, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        scene.add.text(400, 340, reason, {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5);
        
        scene.add.text(400, 380, 'Press R to restart', {
            fontSize: '20px',
            color: '#888888'
        }).setOrigin(0.5);
    }

    showLevelComplete(scene: Phaser.Scene): void {
        scene.add.text(400, 250, 'LEVEL COMPLETE!', {
            fontSize: '48px',
            color: '#00ff00'
        }).setOrigin(0.5);
        
        scene.add.text(400, 300, 'Score: ' + this.score, {
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        scene.add.text(400, 340, 'Air Bonus: ' + (this.airRemaining * 10), {
            fontSize: '24px',
            color: '#ffff00'
        }).setOrigin(0.5);
        
        scene.add.text(400, 380, 'Press R to restart', {
            fontSize: '20px',
            color: '#888888'
        }).setOrigin(0.5);
    }
}
