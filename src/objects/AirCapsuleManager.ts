import Phaser from 'phaser';
import { LevelConfig } from '../levels/LevelManager';

export class AirCapsuleManager {
    private airCapsules: Phaser.Physics.Arcade.Group;
    private totalCapsules: number = 0;

    constructor(scene: Phaser.Scene) {
        this.airCapsules = scene.physics.add.group();
    }

    getGroup(): Phaser.Physics.Arcade.Group {
        return this.airCapsules;
    }

    createAirCapsules(scene: Phaser.Scene, levelConfig: LevelConfig): void {

        this.totalCapsules = (levelConfig.airCapsules?.length) ?? 0;
        
        (levelConfig.airCapsules ?? []).forEach(pos => {
            const capsule = this.airCapsules.create(pos.x, pos.y, 'air-capsule');
            capsule.anims.play('air-capsule-float');
            capsule.setBounce(0.2);
        });
    }

    getTotalCount(): number {
        return this.totalCapsules;
    }

    getRemainingCount(): number {
        return this.airCapsules.countActive(true);
    }

    stopAllAnimations(): void {
        this.airCapsules.children.entries.forEach((child) => {
            const capsule = child as Phaser.Physics.Arcade.Sprite;
            if (capsule.anims) {
                capsule.anims.stop();
            }
        });
    }
}
