import Phaser from 'phaser';
import { DEPTHS } from '../constants/depths';

export class DebugMenu {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container | null = null;
    private isVisible: boolean = false;
    private toggleKey: Phaser.Input.Keyboard.Key;
    private currentLevelIndex: number = 0;
    private totalLevels: number = 3;
    private onLevelSkip: ((levelIndex: number) => void) | null = null;
    
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
        
        // Semi-transparent background
        const bg = this.scene.add.rectangle(400, 300, 400, 300, 0x000000, 0.85);
        bg.setStrokeStyle(2, 0x00ff00);
        
        // Title
        const title = this.scene.add.text(400, 180, 'DEBUG MENU', {
            fontSize: '32px',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // Current level info
        const levelInfo = this.scene.add.text(400, 230, `Current Level: ${this.currentLevelIndex + 1} / ${this.totalLevels}`, {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);
        
        // Instructions
        const instructions = this.scene.add.text(400, 280, 'Press number key to skip to level:', {
            fontSize: '18px',
            color: '#aaaaaa'
        }).setOrigin(0.5);
        
        // Level buttons info
        let yPos = 320;
        const buttonTexts: Phaser.GameObjects.Text[] = [];
        
        for (let i = 0; i < this.totalLevels; i++) {
            const levelName = this.getLevelName(i);
            const buttonText = this.scene.add.text(400, yPos, `${i + 1}: ${levelName}`, {
                fontSize: '16px',
                color: i === this.currentLevelIndex ? '#ffff00' : '#00ffff'
            }).setOrigin(0.5);
            
            buttonTexts.push(buttonText);
            yPos += 30;
        }
        
        // Close instruction
        const closeText = this.scene.add.text(400, yPos + 20, 'Press F1 to close', {
            fontSize: '14px',
            color: '#888888'
        }).setOrigin(0.5);
        
        // Add all elements to container
        this.container.add([bg, title, levelInfo, instructions, ...buttonTexts, closeText]);
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
        
        // If menu is visible, check for number keys
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
            }
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
            
            // Update current level display
            this.updateLevelDisplay();
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
        
        // Update button colors to highlight current level (indices 4+ are the level buttons)
        for (let i = 0; i < this.totalLevels; i++) {
            const buttonText = this.container.list[4 + i] as Phaser.GameObjects.Text;
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
}
