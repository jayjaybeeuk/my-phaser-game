import Phaser from 'phaser';
import { LevelConfig } from '../levels/LevelManager';

export class CollectiblesManager {
    private collectibles: Phaser.Physics.Arcade.Group;
    private totalCollectibles: number = 0;

    constructor(scene: Phaser.Scene) {
        this.collectibles = scene.physics.add.group();
    }

    getGroup(): Phaser.Physics.Arcade.Group {
        return this.collectibles;
    }

    createCollectibles(scene: Phaser.Scene, levelConfig: LevelConfig): void {
        this.totalCollectibles = levelConfig.collectibles.length;
        
        levelConfig.collectibles.forEach(pos => {
            const item = this.collectibles.create(pos.x, pos.y, 'coin');
            item.anims.play('coin-spin');
            item.setBounce(0.2);
        });
    }

    getTotalCount(): number {
        return this.totalCollectibles;
    }

    getRemainingCount(): number {
        return this.collectibles.countActive(true);
    }

    areAllCollected(): boolean {
        return this.collectibles.countActive(true) === 0;
    }
}
