import { BiomeManager } from './BiomeManager';

export class MusicManager {
    private static musicEnabled: boolean = true;
    private static currentLevelMusic: Phaser.Sound.BaseSound | null = null;
    private static initialized: boolean = false;

    /**
     * Initialize music state from localStorage
     * Call this early to ensure state is loaded
     */
    static initialize(): void {
        if (this.initialized) return;
        
        const stored = localStorage.getItem('musicEnabled');
        if (stored !== null) {
            this.musicEnabled = stored === 'true';
        }
        this.initialized = true;
        console.log(`MusicManager initialized: musicEnabled = ${this.musicEnabled}`);
    }

    static isMusicEnabled(): boolean {
        // Ensure initialized
        if (!this.initialized) {
            this.initialize();
        }
        return this.musicEnabled;
    }

    static toggleMusic(): boolean {
        this.musicEnabled = !this.musicEnabled;
        localStorage.setItem('musicEnabled', this.musicEnabled.toString());
        
        console.log(`Music toggled: musicEnabled = ${this.musicEnabled}`);
        
        // Music and ambient are mutually exclusive
        if (this.musicEnabled) {
            // Music ON → play music, stop ambient
            if (this.currentLevelMusic) {
                this.currentLevelMusic.play();
                console.log('Level music started');
            }
            BiomeManager.stopAmbientSound();
        } else {
            // Music OFF → stop music, play ambient
            if (this.currentLevelMusic) {
                this.currentLevelMusic.stop();
                console.log('Level music stopped');
            }
            BiomeManager.resumeAmbientSound();
        }
        
        return this.musicEnabled;
    }

    static setMusicEnabled(enabled: boolean): void {
        this.musicEnabled = enabled;
        localStorage.setItem('musicEnabled', enabled.toString());
        
        // Apply mutual exclusivity
        if (enabled) {
            if (this.currentLevelMusic) {
                this.currentLevelMusic.play();
            }
            BiomeManager.stopAmbientSound();
        } else {
            if (this.currentLevelMusic) {
                this.currentLevelMusic.stop();
            }
            BiomeManager.resumeAmbientSound();
        }
    }
    
    /**
     * Register the level music so MusicManager can control it
     */
    static setLevelMusic(music: Phaser.Sound.BaseSound | null): void {
        this.currentLevelMusic = music;
        console.log('Level music registered with MusicManager');
    }
    
    /**
     * Get the current level music reference
     */
    static getLevelMusic(): Phaser.Sound.BaseSound | null {
        return this.currentLevelMusic;
    }
    
    /**
     * Check if ambient sounds should play (when music is disabled)
     */
    static shouldPlayAmbient(): boolean {
        return !this.isMusicEnabled();
    }
    
    /**
     * Start playing level music if enabled, or ensure ambient plays if disabled
     * Call this after setting the level music
     */
    static startLevelMusicIfEnabled(): void {
        if (this.isMusicEnabled()) {
            // Music mode - play level music, ensure ambient is stopped
            if (this.currentLevelMusic) {
                this.currentLevelMusic.play();
                console.log('Level music playing');
            }
            BiomeManager.stopAmbientSound();
        } else {
            // Ambient mode - ensure level music is stopped, ambient plays
            if (this.currentLevelMusic && this.currentLevelMusic.isPlaying) {
                this.currentLevelMusic.stop();
            }
            BiomeManager.resumeAmbientSound();
            console.log('Ambient mode - ambient sound should be playing');
        }
    }
}
