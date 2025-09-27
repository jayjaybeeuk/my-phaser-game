import Phaser from 'phaser';
import { LevelConfig } from '../levels/LevelManager';
import { DEPTHS } from '../constants/depths';

export class ExitManager {
    private exit: Phaser.GameObjects.Sprite | null = null;
    private isVisible: boolean = false;

    constructor(private scene: Phaser.Scene) {}

    createExit(levelConfig: LevelConfig): void {
        // Create the exit as a regular sprite (not physics-enabled) so gravity doesn't affect it
        this.exit = this.scene.add.sprite(levelConfig.exit.x, levelConfig.exit.y, 'exit');
        this.exit.setVisible(false);
        this.exit.setActive(false);
        this.exit.setDepth(DEPTHS.COLLECTIBLES);
        this.isVisible = false;
    }

    showExit(): void {
        if (this.exit && !this.isVisible) {
            this.exit.setVisible(true);
            this.exit.setActive(true);
            
            // Add a pulsing effect to make it more noticeable
            this.scene.tweens.add({
                targets: this.exit,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
            
            this.isVisible = true;
        }
    }

    getSprite(): Phaser.GameObjects.Sprite | null {
        return this.exit;
    }

    isExitVisible(): boolean {
        return this.isVisible;
    }

    stopAnimations(): void {
        if (this.exit) {
            this.scene.tweens.killTweensOf(this.exit);
        }
    }
}
