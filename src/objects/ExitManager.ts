import Phaser from 'phaser';
import { LevelConfig } from '../levels/LevelManager';
import { DEPTHS } from '../constants/depths';

export class ExitManager {
    private exit: Phaser.GameObjects.Sprite | null = null;
    private isVisible: boolean = false;

    constructor(private scene: Phaser.Scene) {}

    createExit(levelConfig: LevelConfig): void {
        // Create the exit as a sprite (not physics-enabled)
        this.exit = this.scene.add.sprite(levelConfig.exit.x, levelConfig.exit.y, 'exit');
        this.exit.setVisible(false);
        this.exit.setActive(false);
        this.exit.setDepth(DEPTHS.COLLECTIBLES);
        
        // Set to closed door frame (frame 0)
        this.exit.setFrame(0);
        
        this.isVisible = false;
    }

    showExit(): void {
        if (this.exit && !this.isVisible) {
            this.exit.setVisible(true);
            this.exit.setActive(true);
            
            // Play the opening animation
            this.exit.play('exit-open');
            
            // When opening animation completes, start the pulsing animation
            this.exit.once('animationcomplete', () => {
                this.exit?.play('exit-pulse');
                
                // Add a gentle scale pulsing effect
                this.scene.tweens.add({
                    targets: this.exit,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 1000,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
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
            this.exit.stop();
            this.scene.tweens.killTweensOf(this.exit);
        }
    }
}
