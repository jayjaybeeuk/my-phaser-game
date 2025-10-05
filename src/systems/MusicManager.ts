export class MusicManager {
    private static musicEnabled: boolean = true;

    static isMusicEnabled(): boolean {
        // Check localStorage first
        const stored = localStorage.getItem('musicEnabled');
        if (stored !== null) {
            this.musicEnabled = stored === 'true';
        }
        return this.musicEnabled;
    }

    static toggleMusic(): boolean {
        this.musicEnabled = !this.musicEnabled;
        localStorage.setItem('musicEnabled', this.musicEnabled.toString());
        return this.musicEnabled;
    }

    static setMusicEnabled(enabled: boolean): void {
        this.musicEnabled = enabled;
        localStorage.setItem('musicEnabled', enabled.toString());
    }
}
