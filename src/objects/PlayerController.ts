import Phaser from 'phaser';

export class PlayerController {
    private player: Phaser.Physics.Arcade.Sprite;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.player = scene.physics.add.sprite(x, y, 'player');
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);
        this.player.anims.play('idle');

        this.cursors = scene.input.keyboard!.createCursorKeys();
    }

    getSprite(): Phaser.Physics.Arcade.Sprite {
        return this.player;
    }

    update(): void {
        // Player movement with animations
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
            this.player.setFlipX(true); // Flip sprite to face left
            if (this.player.body!.touching.down) {
                this.player.anims.play('walk', true);
            }
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
            this.player.setFlipX(false); // Face right (normal)
            if (this.player.body!.touching.down) {
                this.player.anims.play('walk', true);
            }
        } else {
            this.player.setVelocityX(0);
            if (this.player.body!.touching.down) {
                this.player.anims.play('idle', true);
            }
        }
        
        // Jumping
        if (this.cursors.up.isDown && this.player.body!.touching.down) {
            this.player.setVelocityY(-500);
            this.player.anims.play('jump', true);
        }
        
        // Play jump animation when in air
        if (!this.player.body!.touching.down) {
            this.player.anims.play('jump', true);
        }
    }

    stopAnimations(): void {
        this.player.anims.stop();
    }
}
