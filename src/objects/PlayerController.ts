import Phaser from 'phaser';
import { BiomeManager } from '../systems/BiomeManager';

export class PlayerController {
    private player: Phaser.Physics.Arcade.Sprite;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private gamepad: Phaser.Input.Gamepad.Gamepad | null = null;
    private walkSound: Phaser.Sound.BaseSound;
    private jumpSound: Phaser.Sound.BaseSound;
    private isWalking: boolean = false;
    private wasOnGround: boolean = true; // Track if player was on ground last frame
    private scene: Phaser.Scene;
    private platforms?: Phaser.Physics.Arcade.StaticGroup; // Reference to platforms for ice detection

    constructor(scene: Phaser.Scene, x: number, y: number, platforms?: Phaser.Physics.Arcade.StaticGroup) {
        this.scene = scene;
        this.platforms = platforms;
        this.player = scene.physics.add.sprite(x, y, 'player');
        this.player.setBounce(0);
        // Don't use setCollideWorldBounds as we want custom wraparound behavior
        // We'll manually keep player in bounds except for bottom edge
        this.player.anims.play('idle');

        this.cursors = scene.input.keyboard!.createCursorKeys();
        
        // Setup gamepad support
        this.setupGamepad();
        
        // Create sounds with better error handling
        this.walkSound = this.createSound('walkSound', { volume: 0.3, loop: true });
        // Now use the actual jump sound file!
        this.jumpSound = this.createJumpSound();
    }
    
    private setupGamepad(): void {
        try {
            // Check if gamepad plugin exists
            if (!this.scene.input.gamepad) {
                console.log('Gamepad plugin not available');
                return;
            }
            
            console.log('Setting up gamepad support...');
            
            // Enable gamepad plugin if not already enabled
            if (!this.scene.input.gamepad.enabled) {
                this.scene.input.gamepad.start();
                console.log('Gamepad plugin started');
            } else {
                console.log('Gamepad plugin already enabled');
            }
            
            // Wait a bit for gamepad initialization on Mac
            this.scene.time.delayedCall(500, () => {
                this.checkForExistingGamepads();
            });
            
            // Listen for gamepad connection
            this.scene.input.gamepad.on('connected', (pad: Phaser.Input.Gamepad.Gamepad) => {
                console.log(`Gamepad connected: ${pad.id}`);
                console.log(`Gamepad index: ${pad.index}`);
                console.log(`Buttons available: ${pad.buttons.length}`);
                this.gamepad = pad;
            });
            
            this.scene.input.gamepad.on('disconnected', (pad: Phaser.Input.Gamepad.Gamepad) => {
                console.log(`Gamepad disconnected: ${pad.id}`);
                if (this.gamepad === pad) {
                    this.gamepad = null;
                }
            });
            
        } catch (error) {
            console.log('Gamepad setup failed:', error);
            console.log('Game will work with keyboard only');
        }
    }
    
    private checkForExistingGamepads(): void {
        try {
            if (this.scene.input.gamepad && this.scene.input.gamepad.total > 0) {
                console.log(`Found ${this.scene.input.gamepad.total} gamepad(s)`);
                for (let i = 0; i < this.scene.input.gamepad.total; i++) {
                    const pad = this.scene.input.gamepad.getPad(i);
                    if (pad) {
                        console.log(`Gamepad ${i}: ${pad.id}`);
                        if (!this.gamepad) {
                            this.gamepad = pad;
                            console.log(`Using gamepad: ${pad.id}`);
                        }
                    }
                }
            } else {
                console.log('No gamepads detected');
                console.log('Make sure your controller is connected and recognized by your browser');
                console.log('Try pressing a button on your controller...');
                
                // Set up a retry mechanism
                this.scene.time.delayedCall(2000, () => {
                    this.checkForExistingGamepads();
                });
            }
        } catch (error) {
            console.log('Error checking for gamepads:', error);
        }
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
    
    private getGamepadInput() {
        if (!this.gamepad) return { left: false, right: false, jump: false };
        
        try {
            // Get analog stick input (with deadzone)
            let leftStickX = 0;
            if (this.gamepad.leftStick) {
                leftStickX = this.gamepad.leftStick.x;
            }
            const deadzone = 0.2;
            
            // D-pad and button input with better Mac compatibility
            let dpadLeft = false;
            let dpadRight = false;
            let jumpButton = false;
            
            // Try different methods to access controls
            if (this.gamepad.left !== undefined) {
                dpadLeft = this.gamepad.left;
            }
            if (this.gamepad.right !== undefined) {
                dpadRight = this.gamepad.right;
            }
            
            // Add analog stick movement
            if (!dpadLeft && leftStickX < -deadzone) {
                dpadLeft = true;
            }
            if (!dpadRight && leftStickX > deadzone) {
                dpadRight = true;
            }
            
            // Try multiple button mappings for jump (Mac controllers vary)
            if (this.gamepad.A) jumpButton = this.gamepad.A;
            else if (this.gamepad.X) jumpButton = this.gamepad.X;
            else if (this.gamepad.Y) jumpButton = this.gamepad.Y;
            else if (this.gamepad.B) jumpButton = this.gamepad.B;
            
            // Fallback: try accessing buttons array directly
            if (!jumpButton && this.gamepad.buttons) {
                // Common button indices: 0=A, 1=B, 2=X, 3=Y
                for (let i = 0; i < Math.min(4, this.gamepad.buttons.length); i++) {
                    if (this.gamepad.buttons[i]?.pressed) {
                        jumpButton = true;
                        break;
                    }
                }
            }

            return {
                left: dpadLeft,
                right: dpadRight,
                jump: jumpButton
            };
            
        } catch (error) {
            console.log('Error reading gamepad input:', error);
            return { left: false, right: false, jump: false };
        }
    }

    getSprite(): Phaser.Physics.Arcade.Sprite {
        return this.player;
    }

    /**
     * Check if player is on a slippery surface and get friction value
     * Returns friction multiplier (1.0 = normal, lower = more slippery)
     */
    private getSurfaceFriction(): number {
        if (!this.platforms || !this.player.body?.touching.down) {
            return 1.0; // Normal friction when not on ground
        }
        
        const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
        const playerBottom = playerBody.bottom;
        const playerLeft = playerBody.left;
        const playerRight = playerBody.right;
        
        // Check all platform bricks to find the one directly below the player
        const bricks = this.platforms.getChildren();
        for (const brick of bricks) {
            const sprite = brick as Phaser.Physics.Arcade.Sprite;
            const brickBody = sprite.body as Phaser.Physics.Arcade.StaticBody;
            
            // Check if this brick is directly below the player (within a few pixels)
            if (Math.abs(brickBody.top - playerBottom) < 5) {
                // Check horizontal overlap
                if (playerRight > brickBody.left && playerLeft < brickBody.right) {
                    // Get friction from BiomeManager based on texture
                    return BiomeManager.getFrictionForTexture(sprite.texture.key);
                }
            }
        }
        
        return 1.0; // Default friction
    }
    
    /**
     * Legacy method - check if on ice (friction < 0.5)
     */
    private isOnIce(): boolean {
        return this.getSurfaceFriction() < 0.5;
    }

    checkVerticalWrap(sceneHeight: number = 600, sceneWidth: number = 800): void {
        // Manual bounds checking for left, right, and top
        const body = this.player.body as Phaser.Physics.Arcade.Body;
        const halfWidth = body.width / 2;
        const halfHeight = body.height / 2;
        
        // Keep player within left and right bounds
        if (this.player.x < halfWidth) {
            this.player.x = halfWidth;
            this.player.setVelocityX(0);
        } else if (this.player.x > sceneWidth - halfWidth) {
            this.player.x = sceneWidth - halfWidth;
            this.player.setVelocityX(0);
        }
        
        // Keep player below top bound
        if (this.player.y < halfHeight) {
            this.player.y = halfHeight;
            this.player.setVelocityY(0);
        }
        
        // Vertical wraparound: if player falls below bottom, wrap to top
        if (this.player.y > sceneHeight + halfHeight) {
            this.player.y = halfHeight; // Appear at top
            this.player.setVelocityY(100); // Give slight downward momentum for natural feel
        }
    }

    update(): void {
        const wasWalking = this.isWalking;
        this.isWalking = false;
        const isOnGround = this.player.body!.touching.down;
        const onIce = this.isOnIce();
        
        // Get input from both keyboard and gamepad
        const gamepadInput = this.getGamepadInput();
        const leftPressed = this.cursors.left.isDown || gamepadInput.left;
        const rightPressed = this.cursors.right.isDown || gamepadInput.right;
        const jumpPressed = this.cursors.up.isDown || gamepadInput.jump;
        
        // Ice physics constants
        const normalSpeed = 200;
        const iceAcceleration = 300; // Lower acceleration on ice
        const iceMaxSpeed = 250; // Slightly higher max speed on ice
        const iceFriction = 0.92; // Friction coefficient for ice (higher = more slippery)
        
        // Player movement with animations and ice physics
        if (leftPressed) {
            if (onIce) {
                // On ice: apply acceleration instead of instant velocity
                const currentVelX = this.player.body!.velocity.x;
                const newVelX = Math.max(currentVelX - iceAcceleration * (1/60), -iceMaxSpeed);
                this.player.setVelocityX(newVelX);
            } else {
                // Normal ground: instant velocity
                this.player.setVelocityX(-normalSpeed);
            }
            this.player.setFlipX(true); // Flip sprite to face left
            if (isOnGround) {
                this.player.anims.play('walk', true);
                this.isWalking = true;
            }
        } else if (rightPressed) {
            if (onIce) {
                // On ice: apply acceleration instead of instant velocity
                const currentVelX = this.player.body!.velocity.x;
                const newVelX = Math.min(currentVelX + iceAcceleration * (1/60), iceMaxSpeed);
                this.player.setVelocityX(newVelX);
            } else {
                // Normal ground: instant velocity
                this.player.setVelocityX(normalSpeed);
            }
            this.player.setFlipX(false); // Face right (normal)
            if (isOnGround) {
                this.player.anims.play('walk', true);
                this.isWalking = true;
            }
        } else {
            if (onIce) {
                // On ice: apply friction for gradual slowdown (sliding effect)
                const currentVelX = this.player.body!.velocity.x;
                this.player.setVelocityX(currentVelX * iceFriction);
                
                // Stop completely if velocity is very small
                if (Math.abs(currentVelX) < 5) {
                    this.player.setVelocityX(0);
                }
            } else {
                // Normal ground: instant stop
                this.player.setVelocityX(0);
            }
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
        if (jumpPressed && isOnGround && this.wasOnGround) {
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
