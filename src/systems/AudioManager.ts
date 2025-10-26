import Phaser from 'phaser';

export class AudioManager {
    private static audioCache: Map<string, Phaser.Sound.BaseSound | null> = new Map();
    private static loadAttempted: Set<string> = new Set();

    /**
     * Try to load an audio file. Returns immediately with a dummy sound.
     * If loading succeeds, future calls will return the real sound.
     */
    static getSound(scene: Phaser.Scene, key: string, path: string, config?: Phaser.Types.Sound.SoundConfig): Phaser.Sound.BaseSound {
        // Check if we already have this sound cached
        if (this.audioCache.has(key)) {
            const cached = this.audioCache.get(key);
            if (cached) {
                return cached;
            }
        }

        // Check if the sound is already loaded in Phaser's cache
        if (scene.cache.audio.exists(key)) {
            const sound = scene.sound.add(key, config);
            this.audioCache.set(key, sound);
            return sound;
        }

        // If we haven't tried loading this yet, start loading it
        if (!this.loadAttempted.has(key)) {
            this.loadAttempted.add(key);
            this.loadAudioAsync(scene, key, path, config);
        }

        // Return a dummy sound that does nothing
        return this.createDummySound();
    }

    /**
     * Load audio asynchronously without blocking the scene
     */
    private static loadAudioAsync(scene: Phaser.Scene, key: string, path: string, config?: Phaser.Types.Sound.SoundConfig) {
        console.log(`Attempting to load audio: ${key} from ${path}`);
        
        const loader = new Phaser.Loader.LoaderPlugin(scene);
        
        loader.audio(key, path);
        
        loader.once('complete', () => {
            if (scene.cache.audio.exists(key)) {
                console.log(`Successfully loaded audio: ${key}`);
                const sound = scene.sound.add(key, config);
                this.audioCache.set(key, sound);
            } else {
                console.warn(`Failed to load audio: ${key}`);
                this.audioCache.set(key, null);
            }
            loader.destroy();
        });

        loader.once('loaderror', (file: any) => {
            console.warn(`Failed to load audio: ${key}`);
            this.audioCache.set(key, null);
            loader.destroy();
        });

        // Set a timeout to prevent hanging
        setTimeout(() => {
            if (!this.audioCache.has(key)) {
                console.warn(`Audio load timeout: ${key}`);
                this.audioCache.set(key, null);
                loader.destroy();
            }
        }, 3000);

        loader.start();
    }

    /**
     * Create a dummy sound object that does nothing
     */
    private static createDummySound(): Phaser.Sound.BaseSound {
        return {
            play: () => false,
            stop: () => {},
            pause: () => {},
            resume: () => {},
            setLoop: () => {},
            setVolume: () => {},
            setRate: () => {},
            destroy: () => {},
            isPlaying: false,
            isPaused: false,
            once: () => {},
            on: () => {},
            off: () => {},
        } as any;
    }

    /**
     * Check if a sound is available (loaded)
     */
    static isSoundAvailable(key: string): boolean {
        const cached = this.audioCache.get(key);
        return cached !== null && cached !== undefined;
    }

    /**
     * Clear the audio cache
     */
    static clearCache() {
        this.audioCache.clear();
        this.loadAttempted.clear();
    }
}
