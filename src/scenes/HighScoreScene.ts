import Phaser from 'phaser';
import { HighScoreManager, HighScoreEntry } from '../systems/HighScoreManager';

export class HighScoreScene extends Phaser.Scene {
    private highScores: HighScoreEntry[] = [];

    constructor() {
        super({ key: 'HighScoreScene' });
    }

    create() {
        // Background
        this.cameras.main.setBackgroundColor('#000000');

        // Load high scores
        this.highScores = HighScoreManager.getHighScores();

        // Title
        this.add.text(400, 80, 'HIGH SCORES', {
            fontSize: '48px',
            color: '#ffff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Display high scores
        if (this.highScores.length === 0) {
            this.add.text(400, 300, 'No high scores yet!', {
                fontSize: '24px',
                color: '#888888'
            }).setOrigin(0.5);

            this.add.text(400, 340, 'Be the first to set a record!', {
                fontSize: '18px',
                color: '#666666'
            }).setOrigin(0.5);
        } else {
            // Table headers
            this.add.text(200, 140, 'RANK', {
                fontSize: '20px',
                color: '#00ff00'
            }).setOrigin(0.5);

            this.add.text(400, 140, 'NAME', {
                fontSize: '20px',
                color: '#00ff00'
            }).setOrigin(0.5);

            this.add.text(600, 140, 'SCORE', {
                fontSize: '20px',
                color: '#00ff00'
            }).setOrigin(0.5);

            // Display each score
            let yPos = 180;
            this.highScores.forEach((entry, index) => {
                const rank = index + 1;
                const rankColor = rank === 1 ? '#ffff00' : rank === 2 ? '#c0c0c0' : rank === 3 ? '#cd7f32' : '#ffffff';

                // Rank with medal for top 3
                let rankText = `${rank}`;
                if (rank === 1) rankText = '🥇 ' + rankText;
                else if (rank === 2) rankText = '🥈 ' + rankText;
                else if (rank === 3) rankText = '🥉 ' + rankText;

                this.add.text(200, yPos, rankText, {
                    fontSize: '20px',
                    color: rankColor,
                    fontFamily: 'monospace'
                }).setOrigin(0.5);

                this.add.text(400, yPos, entry.name, {
                    fontSize: '20px',
                    color: rankColor,
                    fontFamily: 'monospace',
                    fontStyle: 'bold'
                }).setOrigin(0.5);

                this.add.text(600, yPos, entry.score.toString(), {
                    fontSize: '20px',
                    color: rankColor,
                    fontFamily: 'monospace'
                }).setOrigin(0.5);

                yPos += 35;
            });
        }

        // Footer message
        this.add.text(400, 550, 'Returning to title...', {
            fontSize: '16px',
            color: '#666666'
        }).setOrigin(0.5);
    }
}
