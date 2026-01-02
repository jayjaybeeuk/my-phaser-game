import Phaser from 'phaser';
import { DEPTHS } from '../constants/depths';
import { MusicManager } from './MusicManager';
import { LevelManager } from '../levels/LevelManager';

export interface DebugOptions {
    collisionEnabled: boolean;
    unlimitedLives: boolean;
}

export class DebugMenu {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container | null = null;
    private isVisible: boolean = false;
    private toggleKey: Phaser.Input.Keyboard.Key;
    private currentLevelIndex: number = 0;
    private totalLevels: number = 20;
    private onLevelSkip: ((levelIndex: number) => void) | null = null;
    private onCollisionToggle: ((enabled: boolean) => void) | null = null;
    private collisionEnabled: boolean = true;
    private unlimitedLives: boolean = false;
    private collisionText: Phaser.GameObjects.Text | null = null;
    private livesText: Phaser.GameObjects.Text | null = null;
    private musicText: Phaser.GameObjects.Text | null = null;
    
    // Scrollable level list
    private levelListContainer: Phaser.GameObjects.Container | null = null;
    private levelTexts: Phaser.GameObjects.Text[] = [];
    private scrollOffset: number = 0;
    private visibleLevelCount: number = 8;
    private levelListMask: Phaser.Display.Masks.GeometryMask | null = null;
    private maskGraphics: Phaser.GameObjects.Graphics | null = null;
    private scrollUpButton: Phaser.GameObjects.Text | null = null;
    private scrollDownButton: Phaser.GameObjects.Text | null = null;
    
    constructor(scene: Phaser.Scene, currentLevelIndex: number, totalLevels: number) {
        this.scene = scene;
        this.currentLevelIndex = currentLevelIndex;
        this.totalLevels = totalLevels;
        
        // Use F1 key to toggle debug menu
        this.toggleKey = this.scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F1);
        
        this.createMenu();
    }
    
    private createMenu(): void {
        // Create container for all debug menu elements
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(DEPTHS.DEBUG_OVERLAY);
        this.container.setVisible(false);
        
        // Semi-transparent background
        const bg = this.scene.add.rectangle(400, 300, 500, 550, 0x000000, 0.95);
        bg.setStrokeStyle(2, 0x00ff00);
        
        // Title
        const title = this.scene.add.text(400, 55, 'DEBUG MENU', {
            fontSize: '32px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Current level info
        const levelInfo = this.scene.add.text(400, 95, `Current Level: ${this.currentLevelIndex + 1} / ${this.totalLevels}`, {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Separator 1
        const separator1 = this.scene.add.text(400, 120, '─────────────────────────', {
            fontSize: '14px',
            color: '#444444'
        }).setOrigin(0.5);
        
        // Debug options section
        const optionsTitle = this.scene.add.text(400, 145, 'DEBUG OPTIONS', {
            fontSize: '16px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        
        // Collision toggle
        this.collisionText = this.scene.add.text(400, 170, 'C: Collision Detection: ON', {
            fontSize: '14px',
            color: '#00ff00'
        }).setOrigin(0.5);
        
        // Lives toggle
        this.livesText = this.scene.add.text(400, 195, 'L: Unlimited Lives: OFF', {
            fontSize: '14px',
            color: '#ff0000'
        }).setOrigin(0.5);
        
        // Music/Ambient toggle
        this.musicText = this.scene.add.text(400, 220, 'M: Audio: MUSIC', {
            fontSize: '14px',
            color: '#00ffff'
        }).setOrigin(0.5);
        this.updateMusicText();
        
        // Separator 2
        const separator2 = this.scene.add.text(400, 248, '─────────────────────────', {
            fontSize: '14px',
            color: '#444444'
        }).setOrigin(0.5);
        
        // Level selection title
        const levelTitle = this.scene.add.text(400, 273, 'LEVEL SELECT (use ↑↓ or scroll)', {
            fontSize: '14px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        
        // Separator 3
        const separator3 = this.scene.add.text(400, 488, '─────────────────────────', {
            fontSize: '14px',
            color: '#444444'
        }).setOrigin(0.5);
        
        // Instructions
        const instructions = this.scene.add.text(400, 510, 'Click level or press 1-9, 0 for 10', {
            fontSize: '12px',
            color: '#888888'
        }).setOrigin(0.5);
        
        // Close instruction
        const closeText = this.scene.add.text(400, 535, 'Press F1 or ESC to close', {
            fontSize: '12px',
            color: '#666666'
        }).setOrigin(0.5);
        
        // Add background first, then other elements
        this.container.add(bg);
        this.container.add([
            title, 
            levelInfo, 
            separator1,
            optionsTitle,
            this.collisionText,
            this.livesText,
            this.musicText,
            separator2,
            levelTitle,
            separator3,
            instructions,
            closeText
        ]);
        
        // Create scrollable level list (added after other elements so it's on top)
        this.createLevelList();
        
        // Add scroll buttons
        this.createScrollButtons();
    }
    
    private createLevelList(): void {
        // Create container for level items - add directly to scene, not nested
        this.levelListContainer = this.scene.add.container(400, 380);
        this.levelListContainer.setDepth(DEPTHS.DEBUG_OVERLAY + 1);
        this.levelListContainer.setVisible(false);
        
        // Create mask graphics
        this.maskGraphics = this.scene.make.graphics({});
        this.maskGraphics.fillStyle(0xffffff);
        this.maskGraphics.fillRect(175, 290, 450, 195);
        this.levelListMask = this.maskGraphics.createGeometryMask();
        this.levelListContainer.setMask(this.levelListMask);
        
        // Get level names
        const levels = LevelManager.getAllLevels();
        
        // Create text for each level
        for (let i = 0; i < this.totalLevels; i++) {
            const levelName = levels[i]?.name || `Level ${i + 1}`;
            const displayNum = (i + 1).toString().padStart(2, ' ');
            
            const levelText = this.scene.add.text(0, i * 24 - (this.visibleLevelCount * 24 / 2), 
                `${displayNum}. ${levelName}`, {
                fontSize: '15px',
                color: i === this.currentLevelIndex ? '#ffff00' : '#ffffff',
                backgroundColor: i === this.currentLevelIndex ? '#444400' : '#111111',
                padding: { x: 10, y: 3 }
            }).setOrigin(0.5);
            
            // Make interactive
            levelText.setInteractive({ useHandCursor: true });
            levelText.on('pointerover', () => {
                if (i !== this.currentLevelIndex) {
                    levelText.setColor('#00ffff');
                    levelText.setBackgroundColor('#222266');
                }
            });
            levelText.on('pointerout', () => {
                if (i !== this.currentLevelIndex) {
                    levelText.setColor('#ffffff');
                    levelText.setBackgroundColor('#111111');
                }
            });
            levelText.on('pointerdown', () => {
                this.skipToLevel(i);
                this.hide();
            });
            
            this.levelTexts.push(levelText);
            this.levelListContainer.add(levelText);
        }
        
        // Setup mouse wheel scrolling
        this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any[], deltaX: number, deltaY: number) => {
            if (this.isVisible) {
                this.handleScroll(deltaY > 0 ? 1 : -1);
            }
        });
    }
    
    private createScrollButtons(): void {
        // Scroll up button
        this.scrollUpButton = this.scene.add.text(620, 310, '▲', {
            fontSize: '24px',
            color: '#00ff00'
        }).setOrigin(0.5);
        this.scrollUpButton.setInteractive({ useHandCursor: true });
        this.scrollUpButton.on('pointerdown', () => this.handleScroll(-1));
        this.scrollUpButton.on('pointerover', () => this.scrollUpButton!.setColor('#ffffff'));
        this.scrollUpButton.on('pointerout', () => this.scrollUpButton!.setColor('#00ff00'));
        
        // Scroll down button
        this.scrollDownButton = this.scene.add.text(620, 470, '▼', {
            fontSize: '24px',
            color: '#00ff00'
        }).setOrigin(0.5);
        this.scrollDownButton.setInteractive({ useHandCursor: true });
        this.scrollDownButton.on('pointerdown', () => this.handleScroll(1));
        this.scrollDownButton.on('pointerover', () => this.scrollDownButton!.setColor('#ffffff'));
        this.scrollDownButton.on('pointerout', () => this.scrollDownButton!.setColor('#00ff00'));
        
        this.container!.add([this.scrollUpButton, this.scrollDownButton]);
    }
    
    private handleScroll(direction: number): void {
        const maxScroll = Math.max(0, this.totalLevels - this.visibleLevelCount);
        this.scrollOffset = Phaser.Math.Clamp(this.scrollOffset + direction, 0, maxScroll);
        this.updateLevelListPosition();
    }
    
    private updateLevelListPosition(): void {
        if (this.levelListContainer) {
            // Subtract offset to move container UP when scrolling down (revealing lower levels)
            const targetY = 380 - (this.scrollOffset * 24);
            this.levelListContainer.y = targetY;
        }
        this.updateScrollButtonVisibility();
    }
    
    private updateScrollButtonVisibility(): void {
        const maxScroll = Math.max(0, this.totalLevels - this.visibleLevelCount);
        
        if (this.scrollUpButton) {
            this.scrollUpButton.setAlpha(this.scrollOffset > 0 ? 1 : 0.3);
        }
        if (this.scrollDownButton) {
            this.scrollDownButton.setAlpha(this.scrollOffset < maxScroll ? 1 : 0.3);
        }
    }
    
    private getLevelName(index: number): string {
        const levels = LevelManager.getAllLevels();
        return levels[index]?.name || `Level ${index + 1}`;
    }
    
    public update(): void {
        // Toggle visibility with F1 key
        if (Phaser.Input.Keyboard.JustDown(this.toggleKey)) {
            this.toggle();
        }
        
        // If menu is visible, check for input
        if (this.isVisible) {
            const keyboard = this.scene.input.keyboard;
            if (keyboard) {
                // ESC to close
                const escKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC, false);
                if (Phaser.Input.Keyboard.JustDown(escKey)) {
                    this.hide();
                    return;
                }
                
                // Arrow keys for scrolling
                const upKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP, false);
                const downKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN, false);
                
                if (Phaser.Input.Keyboard.JustDown(upKey)) {
                    this.handleScroll(-1);
                }
                if (Phaser.Input.Keyboard.JustDown(downKey)) {
                    this.handleScroll(1);
                }
                
                // Number keys 1-9 for levels 1-9
                for (let i = 0; i < Math.min(9, this.totalLevels); i++) {
                    const key = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE + i, false);
                    if (Phaser.Input.Keyboard.JustDown(key)) {
                        this.skipToLevel(i);
                        this.hide();
                        return;
                    }
                }
                
                // 0 key for level 10
                if (this.totalLevels >= 10) {
                    const zeroKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO, false);
                    if (Phaser.Input.Keyboard.JustDown(zeroKey)) {
                        this.skipToLevel(9);
                        this.hide();
                        return;
                    }
                }
                
                // Toggle collision with C key
                const cKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C, false);
                if (Phaser.Input.Keyboard.JustDown(cKey)) {
                    this.toggleCollision();
                }
                
                // Toggle unlimited lives with L key
                const lKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L, false);
                if (Phaser.Input.Keyboard.JustDown(lKey)) {
                    this.toggleUnlimitedLives();
                }
                
                // Toggle music with M key
                const mKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M, false);
                if (Phaser.Input.Keyboard.JustDown(mKey)) {
                    this.toggleMusic();
                }
            }
        }
    }
    
    private toggleCollision(): void {
        this.collisionEnabled = !this.collisionEnabled;
        this.updateCollisionText();
        
        if (this.onCollisionToggle) {
            this.onCollisionToggle(this.collisionEnabled);
        }
        
        console.log(`Debug: Collision detection ${this.collisionEnabled ? 'enabled' : 'disabled'}`);
    }
    
    private toggleUnlimitedLives(): void {
        this.unlimitedLives = !this.unlimitedLives;
        this.updateLivesText();
        
        console.log(`Debug: Unlimited lives ${this.unlimitedLives ? 'enabled' : 'disabled'}`);
    }
    
    private toggleMusic(): void {
        MusicManager.toggleMusic();
        this.updateMusicText();
        
        console.log(`Debug: Music & Ambient ${MusicManager.isMusicEnabled() ? 'enabled' : 'disabled'}`);
    }
    
    private updateCollisionText(): void {
        if (this.collisionText) {
            const status = this.collisionEnabled ? 'ON' : 'OFF';
            const color = this.collisionEnabled ? '#00ff00' : '#ff0000';
            this.collisionText.setText(`C: Collision Detection: ${status}`);
            this.collisionText.setColor(color);
        }
    }
    
    private updateLivesText(): void {
        if (this.livesText) {
            const status = this.unlimitedLives ? 'ON' : 'OFF';
            const color = this.unlimitedLives ? '#00ff00' : '#ff0000';
            this.livesText.setText(`L: Unlimited Lives: ${status}`);
            this.livesText.setColor(color);
        }
    }
    
    private updateMusicText(): void {
        if (this.musicText) {
            const musicOn = MusicManager.isMusicEnabled();
            const status = musicOn ? 'MUSIC' : 'AMBIENT';
            const color = '#00ffff';
            this.musicText.setText(`M: Audio: ${status}`);
            this.musicText.setColor(color);
        }
    }
    
    public toggle(): void {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
    
    public show(): void {
        if (this.container) {
            this.isVisible = true;
            this.container.setVisible(true);
            
            // Also show the level list container (it's separate)
            if (this.levelListContainer) {
                this.levelListContainer.setVisible(true);
            }
            
            // Update current level display and option states
            this.updateLevelDisplay();
            this.updateCollisionText();
            this.updateLivesText();
            this.updateMusicText();
            
            // Scroll to show current level
            this.scrollToCurrentLevel();
        }
    }
    
    private scrollToCurrentLevel(): void {
        const targetScroll = Math.max(0, this.currentLevelIndex - Math.floor(this.visibleLevelCount / 2));
        const maxScroll = Math.max(0, this.totalLevels - this.visibleLevelCount);
        this.scrollOffset = Phaser.Math.Clamp(targetScroll, 0, maxScroll);
        this.updateLevelListPosition();
    }
    
    public hide(): void {
        if (this.container) {
            this.isVisible = false;
            this.container.setVisible(false);
        }
        // Also hide the level list container
        if (this.levelListContainer) {
            this.levelListContainer.setVisible(false);
        }
    }
    
    private updateLevelDisplay(): void {
        if (!this.container) return;
        
        // Update the level info text (index 1 after bg at index 0)
        const levelInfoText = this.container.list[2] as Phaser.GameObjects.Text;
        if (levelInfoText && levelInfoText.setText) {
            levelInfoText.setText(`Current Level: ${this.currentLevelIndex + 1} / ${this.totalLevels}`);
        }
        
        // Update level list highlighting
        this.levelTexts.forEach((text, index) => {
            if (index === this.currentLevelIndex) {
                text.setColor('#ffff00');
                text.setBackgroundColor('#444400');
            } else {
                text.setColor('#ffffff');
                text.setBackgroundColor('#111111');
            }
        });
    }
    
    public updateCurrentLevel(levelIndex: number): void {
        this.currentLevelIndex = levelIndex;
        if (this.isVisible) {
            this.updateLevelDisplay();
            this.scrollToCurrentLevel();
        }
    }
    
    public setLevelSkipCallback(callback: (levelIndex: number) => void): void {
        this.onLevelSkip = callback;
    }
    
    public setCollisionToggleCallback(callback: (enabled: boolean) => void): void {
        this.onCollisionToggle = callback;
    }
    
    private skipToLevel(levelIndex: number): void {
        if (this.onLevelSkip && levelIndex >= 0 && levelIndex < this.totalLevels) {
            console.log(`Debug: Skipping to level ${levelIndex + 1} - ${this.getLevelName(levelIndex)}`);
            this.onLevelSkip(levelIndex);
        }
    }
    
    public destroy(): void {
        if (this.maskGraphics) {
            this.maskGraphics.destroy();
            this.maskGraphics = null;
        }
        if (this.levelListMask) {
            this.levelListMask.destroy();
            this.levelListMask = null;
        }
        if (this.levelListContainer) {
            this.levelListContainer.destroy();
            this.levelListContainer = null;
        }
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
        this.levelTexts = [];
    }
    
    public isMenuVisible(): boolean {
        return this.isVisible;
    }
    
    public getDebugOptions(): DebugOptions {
        return {
            collisionEnabled: this.collisionEnabled,
            unlimitedLives: this.unlimitedLives
        };
    }
    
    public isCollisionEnabled(): boolean {
        return this.collisionEnabled;
    }
    
    public isUnlimitedLivesEnabled(): boolean {
        return this.unlimitedLives;
    }
}
