import Phaser from 'phaser';

export class PlayerController {
    private player: Phaser.Physics.Arcade.Sprite;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private walkSound: Phaser.Sound.BaseSound;
    private jumpSound: Phaser.Sound.BaseSound;
    private isWalking: boolean = false;
    private wasOnGround: boolean = true; // Track if player was on ground last frame
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this.scene = scene;
        this.player = scene.physics.add.sprite(x, y, 'player');
        this.player.setBounce(0);
        this.player.setCollideWorldBounds(true);
        this.player.anims.play('idle');

        this.cursors = scene.input.keyboard!.createCursorKeys();
        
        // Create sounds with better error handling
        this.walkSound = this.createSound('walkSound', { volume: 0.3, loop: true });
        // Now use the actual jump sound file!
        this.jumpSound = this.createJumpSound();
    }
    
    private createSound(key: string, config: any): Phaser.Sound.BaseSound {
        try {
            const sound = this.scene.sound.add(key, config);
            console.log(`Successfully created sound: ${key}`);
            return sound;
        } catch (error) {
            console.log(`Failed to create sound: ${key}, using dummy sound`);
            return {
                play: () => console.log(`Would play: ${key}`),
                stop: () => console.log(`Would stop: ${key}`),
                isPlaying: false
            } as any;
        }
    }
    
    // Method to create jump sound when file is available
    private createJumpSound(): Phaser.Sound.BaseSound {
        try {
            // Jump sounds should NEVER loop - they're single event sounds
            return this.scene.sound.add('jumpSound', { volume: 0.5, loop: false });
        } catch (error) {
            return {
                play: () => {}, // Silent fallback
                stop: () => {},
                isPlaying: false
            } as any;
        }
    }

    getSprite(): Phaser.Physics.Arcade.Sprite {
        return this.player;
    }

    update(): void {
        const wasWalking = this.isWalking;
        this.isWalking = false;
        const isOnGround = this.player.body!.touching.down;
        
        // Player movement with animations
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-200);
            this.player.setFlipX(true); // Flip sprite to face left
            if (isOnGround) {
                this.player.anims.play('walk', true);
                this.isWalking = true;
            }
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(200);
            this.player.setFlipX(false); // Face right (normal)
            if (isOnGround) {
                this.player.anims.play('walk', true);
                this.isWalking = true;
            }
        } else {
            this.player.setVelocityX(0);
            if (isOnGround) {
                this.player.anims.play('idle', true);
            }
        }
        
        // Handle walking sound
        if (this.isWalking && isOnGround) {
            // Start walking sound if not already playing
            if (!this.walkSound.isPlaying) {
                this.walkSound.play();
            }
        } else {
            // Stop walking sound
            if (this.walkSound.isPlaying) {
                this.walkSound.stop();
            }
        }
        
        // Jumping - only trigger once when key is pressed AND player is on ground
        if (this.cursors.up.isDown && isOnGround && this.wasOnGround) {
            this.player.setVelocityY(-500);
            this.player.anims.play('jump', true);
            // Play jump sound only once per jump
            this.jumpSound.play();
            // Stop walking sound when jumping
            if (this.walkSound.isPlaying) {
                this.walkSound.stop();
            }
        }
        
        // Play jump animation when in air
        if (!isOnGround) {
            this.player.anims.play('jump', true);
        }
        
        // Update ground state for next frame
        this.wasOnGround = isOnGround;
    }

    stopAnimations(): void {
        this.player.anims.stop();
        // Stop all sounds when animations stop (game over/win)
        if (this.walkSound.isPlaying) {
            this.walkSound.stop();
        }
        if (this.jumpSound.isPlaying) {
            this.jumpSound.stop();
        }
    }
}
