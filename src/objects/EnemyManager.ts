import Phaser from 'phaser';
import { LevelConfig } from '../levels/LevelManager';

export class EnemyManager {
    private enemies: Phaser.Physics.Arcade.Group;

    constructor(scene: Phaser.Scene) {
        this.enemies = scene.physics.add.group();
    }

    getGroup(): Phaser.Physics.Arcade.Group {
        return this.enemies;
    }

    createEnemies(scene: Phaser.Scene, levelConfig: LevelConfig): void {
        levelConfig.enemies.forEach(enemyConfig => {
            let enemy: Phaser.Physics.Arcade.Sprite;

            if (enemyConfig.type === 'enemy-one') {
                enemy = this.enemies.create(enemyConfig.x, enemyConfig.y, 'enemy-one');
                enemy.anims.play('enemy-one-walk');
                enemy.setFlipX(enemyConfig.velocity < 0);
            } else if (enemyConfig.type === 'enemy-two') {
                enemy = this.enemies.create(enemyConfig.x, enemyConfig.y, 'enemy-two');
                enemy.anims.play('enemy-two-walk');
                enemy.setFlipX(enemyConfig.velocity < 0);
            } else {
                enemy = this.enemies.create(enemyConfig.x, enemyConfig.y, 'enemy');
                if (enemyConfig.tint) {
                    enemy.setTint(enemyConfig.tint);
                }
            }

            enemy.setVelocityX(enemyConfig.velocity);
            enemy.setBounce(1);
            enemy.setCollideWorldBounds(true);
        });
    }

    update(): void {
        // Enemy AI - simple bouncing
        this.enemies.children.entries.forEach((enemy: any) => {
            if (enemy.body.touching.left || enemy.body.touching.right) {
                enemy.setVelocityX(-enemy.body.velocity.x);
            }
            
            // Set sprite direction for animated enemies based on current velocity
            if (enemy.texture.key === 'enemy-one' || enemy.texture.key === 'enemy-two') {
                enemy.setFlipX(enemy.body.velocity.x < 0); // Flip when going left
            }
        });
    }

    stopAllAnimations(): void {
        this.enemies.children.entries.forEach((enemy: any) => {
            enemy.anims.stop();
        });
    }
}
