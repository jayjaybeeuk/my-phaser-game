import Phaser from 'phaser';
import { DEPTHS } from '../constants/depths';

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
    private totalLevels: number = 3;
    private onLevelSkip: ((levelIndex: number) => void) | null = null;
    private onCollisionToggle: ((enabled: boolean) => void) | null = null;
    private collisionEnabled: boolean = true;
    private unlimitedLives: boolean = false;
    private collisionText: Phaser.GameObjects.Text | null = null;
    private livesText: Phaser.GameObjects.Text | null = null;
    
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
        this.container.setDepth(DEPTHS.UI_TEXT + 100); // Above everything
        this.container.setVisible(false);
        
        // Semi-transparent background (made taller for new options)
        const bg = this.scene.add.rectangle(400, 300, 450, 400, 0x000000, 0.85);
        bg.setStrokeStyle(2, 0x00ff00);
        
        // Title
        const title = this.scene.add.text(400, 140, 'DEBUG MENU', {
            fontSize: '32px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Current level info
        const levelInfo = this.scene.add.text(400, 190, `Current Level: ${this.currentLevelIndex + 1} / ${this.totalLevels}`, {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Separator
        const separator1 = this.scene.add.text(400, 220, '─────────────────────', {
            fontSize: '16px',
            color: '#444444'
        }).setOrigin(0.5);
        
        // Debug options section
        const optionsTitle = this.scene.add.text(400, 245, 'DEBUG OPTIONS', {
            fontSize: '18px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        
        // Collision toggle
        this.collisionText = this.scene.add.text(400, 275, 'C: Collision Detection: ON', {
            fontSize: '16px',
            color: '#00ff00'
        }).setOrigin(0.5);
        
        // Lives toggle
        this.livesText = this.scene.add.text(400, 305, 'L: Unlimited Lives: OFF', {
            fontSize: '16px',
            color: '#ff0000'
        }).setOrigin(0.5);
        
        // Separator
        const separator2 = this.scene.add.text(400, 335, '─────────────────────', {
            fontSize: '16px',
            color: '#444444'
        }).setOrigin(0.5);
        
        // Instructions
        const instructions = this.scene.add.text(400, 360, 'Press number key to skip to level:', {
            fontSize: '16px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        
        // Level buttons info
        let yPos = 390;
        const buttonTexts: Phaser.GameObjects.Text[] = [];
        
        for (let i = 0; i < this.totalLevels; i++) {
            const levelName = this.getLevelName(i);
            const buttonText = this.scene.add.text(400, yPos, `${i + 1}: ${levelName}`, {
                fontSize: '14px',
                color: i === this.currentLevelIndex ? '#ffff00' : '#00ffff'
            }).setOrigin(0.5);
            
            buttonTexts.push(buttonText);
            yPos += 25;
        }
        
        // Close instruction
        const closeText = this.scene.add.text(400, yPos + 15, 'Press F1 to close', {
            fontSize: '14px',
            color: '#888888'
        }).setOrigin(0.5);
        
        // Add all elements to container
        this.container.add([
            bg, 
            title, 
            levelInfo, 
            separator1,
            optionsTitle,
            this.collisionText,
            this.livesText,
            separator2,
            instructions, 
            ...buttonTexts, 
            closeText
        ]);
    }
    
    private getLevelName(index: number): string {
        const levelNames = ['Central Cavern', 'Underground Chamber', 'Arctic Zone'];
        return levelNames[index] || `Level ${index + 1}`;
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
                // Check keys 1-9 for level selection
                for (let i = 0; i < this.totalLevels && i < 9; i++) {
                    const key = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE + i, false);
                    if (Phaser.Input.Keyboard.JustDown(key)) {
                        this.skipToLevel(i);
                        this.hide();
                        break;
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
            
            // Update current level display and option states
            this.updateLevelDisplay();
            this.updateCollisionText();
            this.updateLivesText();
        }
    }
    
    public hide(): void {
        if (this.container) {
            this.isVisible = false;
            this.container.setVisible(false);
        }
    }
    
    private updateLevelDisplay(): void {
        if (!this.container) return;
        
        // Update the level info text (index 2 in container)
        const levelInfoText = this.container.list[2] as Phaser.GameObjects.Text;
        if (levelInfoText) {
            levelInfoText.setText(`Current Level: ${this.currentLevelIndex + 1} / ${this.totalLevels}`);
        }
        
        // Update button colors to highlight current level
        // Level buttons start at index 9 in the container
        for (let i = 0; i < this.totalLevels; i++) {
            const buttonText = this.container.list[9 + i] as Phaser.GameObjects.Text;
            if (buttonText) {
                buttonText.setColor(i === this.currentLevelIndex ? '#ffff00' : '#00ffff');
            }
        }
    }
    
    public updateCurrentLevel(levelIndex: number): void {
        this.currentLevelIndex = levelIndex;
        if (this.isVisible) {
            this.updateLevelDisplay();
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
            console.log(`Debug: Skipping to level ${levelIndex + 1}`);
            this.onLevelSkip(levelIndex);
        }
    }
    
    public destroy(): void {
        if (this.container) {
            this.container.destroy();
            this.container = null;
        }
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
