/**
 * BiomeManager - Manages biome definitions and properties for levels
 * 
 * Biomes define the visual and physical characteristics of a level environment,
 * including colors, textures, physics modifiers, and ambient effects.
 */

import { MusicManager } from './MusicManager';

export enum BiomeType {
    CAVERN = 'cavern',
    UNDERGROUND = 'underground',
    ARCTIC = 'arctic',
    LAVA = 'lava',
    FOREST = 'forest',
    CRYSTAL = 'crystal',
    TOXIC = 'toxic',
    SLIME = 'slime'
}

export interface BiomePhysics {
    /** Friction multiplier (1.0 = normal, 0.5 = slippery, 2.0 = sticky) */
    friction: number;
    /** Gravity multiplier (1.0 = normal) */
    gravity: number;
    /** Air depletion rate multiplier (1.0 = normal) */
    airDepletionRate: number;
    /** Player speed multiplier (1.0 = normal) */
    playerSpeedMultiplier: number;
}

export interface BiomeVisuals {
    /** Background color (hex number) */
    backgroundColor: number;
    /** Platform brick texture key */
    brickTexture: string;
    /** Optional platform tint color */
    platformTint?: number;
    /** Ambient particle effect type */
    ambientParticles?: 'snow' | 'embers' | 'spores' | 'bubbles' | 'sparkles' | 'drips' | 'blobs' | 'none';
    /** Ambient particle color */
    particleColor?: number;
    /** Optional fog/overlay color and opacity */
    fogColor?: number;
    fogOpacity?: number;
    /** UI accent color for level name, etc */
    uiAccentColor?: string;
}

export interface BiomeAudio {
    /** Background ambient sound key */
    ambientSound?: string;
    /** Volume for ambient sound (0-1) */
    ambientVolume?: number;
    /** Custom music track for this biome */
    musicTrack?: string;
}

export interface BiomeConfig {
    /** Unique identifier for the biome */
    type: BiomeType;
    /** Display name */
    name: string;
    /** Description of the biome */
    description: string;
    /** Visual properties */
    visuals: BiomeVisuals;
    /** Physics properties */
    physics: BiomePhysics;
    /** Audio properties */
    audio: BiomeAudio;
}

/**
 * Default physics values (normal behavior)
 */
const DEFAULT_PHYSICS: BiomePhysics = {
    friction: 1.0,
    gravity: 1.0,
    airDepletionRate: 1.0,
    playerSpeedMultiplier: 1.0
};

/**
 * Biome definitions
 */
const BIOME_DEFINITIONS: Map<BiomeType, BiomeConfig> = new Map([
    [BiomeType.CAVERN, {
        type: BiomeType.CAVERN,
        name: 'Cavern',
        description: 'Dark underground caves with standard conditions',
        visuals: {
            backgroundColor: 0x000000,
            brickTexture: 'brick',
            uiAccentColor: '#ffff00'
        },
        physics: { ...DEFAULT_PHYSICS },
        audio: {
            ambientSound: 'cavern-ambient',
            ambientVolume: 0.25
        }
    }],
    
    [BiomeType.UNDERGROUND, {
        type: BiomeType.UNDERGROUND,
        name: 'Underground',
        description: 'Deep underground chambers with dim lighting',
        visuals: {
            backgroundColor: 0x0a0a1a,
            brickTexture: 'brick',
            platformTint: 0x888899,
            ambientParticles: 'drips',
            particleColor: 0x4444ff,
            uiAccentColor: '#aaaaff'
        },
        physics: { ...DEFAULT_PHYSICS },
        audio: {
            ambientSound: 'drip-ambient',
            ambientVolume: 0.3
        }
    }],
    
    [BiomeType.ARCTIC, {
        type: BiomeType.ARCTIC,
        name: 'Arctic',
        description: 'Frozen caves with slippery ice platforms',
        visuals: {
            backgroundColor: 0x001a4d,
            brickTexture: 'brick-ice',
            ambientParticles: 'snow',
            particleColor: 0xffffff,
            fogColor: 0xaaddff,
            fogOpacity: 0.1,
            uiAccentColor: '#00ffff'
        },
        physics: {
            friction: 0.3,  // Very slippery
            gravity: 1.0,
            airDepletionRate: 1.2,  // Cold air depletes faster
            playerSpeedMultiplier: 1.0
        },
        audio: {
            ambientSound: 'wind-ambient',
            ambientVolume: 0.2
        }
    }],
    
    [BiomeType.LAVA, {
        type: BiomeType.LAVA,
        name: 'Lava',
        description: 'Volcanic caves with intense heat',
        visuals: {
            backgroundColor: 0x1a0500,
            brickTexture: 'brick-lava',
            ambientParticles: 'embers',
            particleColor: 0xff4400,
            fogColor: 0xff2200,
            fogOpacity: 0.15,
            uiAccentColor: '#ff6600'
        },
        physics: {
            friction: 1.2,  // Slightly sticky
            gravity: 1.0,
            airDepletionRate: 1.5,  // Hot air depletes much faster
            playerSpeedMultiplier: 0.9  // Heat slows movement slightly
        },
        audio: {
            ambientSound: 'lava-ambient',
            ambientVolume: 0.4
        }
    }],
    
    [BiomeType.FOREST, {
        type: BiomeType.FOREST,
        name: 'Forest',
        description: 'Underground mushroom forest with spores',
        visuals: {
            backgroundColor: 0x0a1a0a,
            brickTexture: 'brick-moss',
            platformTint: 0x44aa44,
            ambientParticles: 'spores',
            particleColor: 0x88ff88,
            uiAccentColor: '#44ff44'
        },
        physics: {
            friction: 0.8,  // Slightly slippery (mossy)
            gravity: 0.9,  // Lighter gravity
            airDepletionRate: 0.8,  // Fresh air depletes slower
            playerSpeedMultiplier: 1.0
        },
        audio: {
            ambientSound: 'forest-ambient',
            ambientVolume: 0.3
        }
    }],
    
    [BiomeType.CRYSTAL, {
        type: BiomeType.CRYSTAL,
        name: 'Crystal',
        description: 'Crystalline caves with magical properties',
        visuals: {
            backgroundColor: 0x100020,
            brickTexture: 'brick-crystal',
            ambientParticles: 'sparkles',
            particleColor: 0xff88ff,
            fogColor: 0x8800ff,
            fogOpacity: 0.08,
            uiAccentColor: '#ff88ff'
        },
        physics: {
            friction: 1.0,
            gravity: 0.85,  // Lower gravity
            airDepletionRate: 1.0,
            playerSpeedMultiplier: 1.1  // Slightly faster
        },
        audio: {
            ambientSound: 'crystal-ambient',
            ambientVolume: 0.25
        }
    }],
    
    [BiomeType.TOXIC, {
        type: BiomeType.TOXIC,
        name: 'Toxic',
        description: 'Polluted caves filled with hazardous waste',
        visuals: {
            backgroundColor: 0x0a1a00,
            brickTexture: 'brick-toxic',
            platformTint: 0x88ff00,
            ambientParticles: 'bubbles',
            particleColor: 0x00ff00,
            fogColor: 0x44ff00,
            fogOpacity: 0.12,
            uiAccentColor: '#88ff00'
        },
        physics: {
            friction: 0.7,  // Slippery sludge
            gravity: 1.0,
            airDepletionRate: 2.0,  // Toxic air depletes very fast!
            playerSpeedMultiplier: 0.85  // Sluggish movement
        },
        audio: {
            ambientSound: 'toxic-ambient',
            ambientVolume: 0.35
        }
    }],

    [BiomeType.SLIME, {
        type: BiomeType.SLIME,
        name: 'Slime',
        description: 'Gooey caverns covered in sticky slime',
        visuals: {
            backgroundColor: 0x0a1a10,
            brickTexture: 'brick-slime',
            platformTint: 0x44dd66,
            ambientParticles: 'blobs',
            particleColor: 0x66ff88,
            fogColor: 0x22aa44,
            fogOpacity: 0.1,
            uiAccentColor: '#66ff88'
        },
        physics: {
            friction: 0.5,  // Slippery goo
            gravity: 0.9,   // Slightly floaty/bouncy feel
            airDepletionRate: 1.1,  // Slightly faster air drain from slime fumes
            playerSpeedMultiplier: 0.95  // Slightly slower in the goo
        },
        audio: {
            ambientSound: 'slime-ambient',
            ambientVolume: 0.3
        }
    }]
]);

export class BiomeManager {
    private static currentBiome: BiomeConfig | null = null;
    private static particleEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
    private static fogOverlay: Phaser.GameObjects.Rectangle | null = null;
    private static ambientSound: Phaser.Sound.BaseSound | null = null;
    
    /**
     * Get a biome configuration by type
     */
    static getBiome(type: BiomeType): BiomeConfig {
        const biome = BIOME_DEFINITIONS.get(type);
        if (!biome) {
            console.warn(`Biome type '${type}' not found, falling back to CAVERN`);
            return BIOME_DEFINITIONS.get(BiomeType.CAVERN)!;
        }
        return biome;
    }
    
    /**
     * Get all available biome types
     */
    static getAllBiomeTypes(): BiomeType[] {
        return Array.from(BIOME_DEFINITIONS.keys());
    }
    
    /**
     * Get all biome configurations
     */
    static getAllBiomes(): BiomeConfig[] {
        return Array.from(BIOME_DEFINITIONS.values());
    }
    
    /**
     * Apply a biome to a scene
     */
    static applyBiome(scene: Phaser.Scene, biomeType: BiomeType): BiomeConfig {
        const biome = this.getBiome(biomeType);
        this.currentBiome = biome;
        
        // Apply background color
        scene.cameras.main.setBackgroundColor(biome.visuals.backgroundColor);
        
        // Apply fog overlay if defined
        if (biome.visuals.fogColor !== undefined && biome.visuals.fogOpacity !== undefined) {
            this.createFogOverlay(scene, biome.visuals.fogColor, biome.visuals.fogOpacity);
        }
        
        // Apply ambient particles if defined
        if (biome.visuals.ambientParticles && biome.visuals.ambientParticles !== 'none') {
            this.createAmbientParticles(scene, biome);
        }
        
        // Apply ambient sound if defined
        if (biome.audio.ambientSound) {
            this.playAmbientSound(scene, biome);
        }
        
        return biome;
    }
    
    /**
     * Create fog overlay effect
     */
    private static createFogOverlay(scene: Phaser.Scene, color: number, opacity: number): void {
        // Clean up existing fog
        if (this.fogOverlay) {
            this.fogOverlay.destroy();
        }
        
        this.fogOverlay = scene.add.rectangle(400, 300, 800, 600, color, opacity);
        this.fogOverlay.setDepth(5); // Above platforms but below UI
        this.fogOverlay.setScrollFactor(0); // Fixed to camera
    }
    
    /**
     * Create ambient particle effects
     */
    private static createAmbientParticles(scene: Phaser.Scene, biome: BiomeConfig): void {
        // Clean up existing particles
        if (this.particleEmitter) {
            this.particleEmitter.destroy();
        }
        
        const particleType = biome.visuals.ambientParticles;
        const particleColor = biome.visuals.particleColor || 0xffffff;
        
        // Create a simple particle texture
        const graphics = scene.add.graphics();
        graphics.fillStyle(particleColor);
        
        switch (particleType) {
            case 'snow':
                graphics.fillCircle(2, 2, 2);
                graphics.generateTexture('particle-snow', 4, 4);
                break;
            case 'embers':
                graphics.fillCircle(3, 3, 3);
                graphics.generateTexture('particle-ember', 6, 6);
                break;
            case 'spores':
                graphics.fillCircle(1, 1, 1);
                graphics.generateTexture('particle-spore', 3, 3);
                break;
            case 'bubbles':
                graphics.lineStyle(1, particleColor);
                graphics.strokeCircle(4, 4, 3);
                graphics.generateTexture('particle-bubble', 8, 8);
                break;
            case 'sparkles':
                graphics.fillRect(0, 2, 5, 1);
                graphics.fillRect(2, 0, 1, 5);
                graphics.generateTexture('particle-sparkle', 5, 5);
                break;
            case 'drips':
                graphics.fillRect(1, 0, 2, 6);
                graphics.generateTexture('particle-drip', 4, 6);
                break;
            case 'blobs':
                graphics.fillCircle(4, 4, 4);
                graphics.fillCircle(6, 7, 2);
                graphics.generateTexture('particle-blob', 10, 10);
                break;
        }
        graphics.destroy();
        
        // Create particle emitter with appropriate settings
        const particles = scene.add.particles(0, 0, `particle-${particleType}`, this.getParticleConfig(particleType));
        particles.setDepth(4);
        
        this.particleEmitter = particles;
    }
    
    /**
     * Play ambient sound for a biome
     */
    private static playAmbientSound(scene: Phaser.Scene, biome: BiomeConfig): void {
        // Stop any existing ambient sound
        if (this.ambientSound) {
            this.ambientSound.stop();
            this.ambientSound = null;
        }
        
        const soundKey = biome.audio.ambientSound;
        if (!soundKey) return;
        
        // Check if the sound exists in the cache
        try {
            if (scene.cache.audio.exists(soundKey)) {
                this.ambientSound = scene.sound.add(soundKey, {
                    volume: biome.audio.ambientVolume ?? 0.3,
                    loop: true
                });
                
                // Only play ambient if music is disabled (they're mutually exclusive)
                if (MusicManager.shouldPlayAmbient()) {
                    this.ambientSound.play();
                    console.log(`Playing ambient sound: ${soundKey}`);
                } else {
                    console.log(`Ambient sound '${soundKey}' loaded but music is playing`);
                }
            } else {
                console.log(`Ambient sound '${soundKey}' not found - biome will work without it`);
            }
        } catch (error) {
            console.log(`Could not play ambient sound '${soundKey}':`, error);
        }
    }
    
    /**
     * Stop ambient sound completely
     */
    static stopAmbientSound(): void {
        if (this.ambientSound) {
            this.ambientSound.stop();
            // Don't null it - keep reference so we can resume
        }
    }
    
    /**
     * Pause ambient sound (keeps reference for resuming)
     */
    static pauseAmbientSound(): void {
        if (this.ambientSound && this.ambientSound.isPlaying) {
            this.ambientSound.pause();
            console.log('Ambient sound paused');
        }
    }
    
    /**
     * Resume ambient sound (called when music is turned off)
     */
    static resumeAmbientSound(): void {
        if (this.ambientSound && !this.ambientSound.isPlaying) {
            this.ambientSound.play();
            console.log('Ambient sound resumed');
        }
    }
    
    /**
     * Set ambient sound volume
     */
    static setAmbientVolume(volume: number): void {
        if (this.ambientSound && 'setVolume' in this.ambientSound) {
            (this.ambientSound as Phaser.Sound.WebAudioSound).setVolume(volume);
        }
    }
    
    /**
     * Get particle configuration based on type
     */
    private static getParticleConfig(type: string): Phaser.Types.GameObjects.Particles.ParticleEmitterConfig {
        const baseConfig: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
            x: { min: 0, max: 800 },
            lifespan: 4000,
            quantity: 1,
            frequency: 100,
            alpha: { start: 0.8, end: 0 }
        };
        
        switch (type) {
            case 'snow':
                return {
                    ...baseConfig,
                    y: -10,
                    speedY: { min: 20, max: 50 },
                    speedX: { min: -10, max: 10 },
                    scale: { min: 0.5, max: 1.5 },
                    quantity: 2,
                    frequency: 80
                };
            case 'embers':
                return {
                    ...baseConfig,
                    y: 610,
                    speedY: { min: -80, max: -40 },
                    speedX: { min: -20, max: 20 },
                    scale: { min: 0.3, max: 1.0 },
                    lifespan: 3000,
                    frequency: 150
                };
            case 'spores':
                return {
                    ...baseConfig,
                    y: { min: 0, max: 600 },
                    speedY: { min: -10, max: 10 },
                    speedX: { min: -15, max: 15 },
                    scale: { min: 0.5, max: 2.0 },
                    lifespan: 6000,
                    frequency: 200
                };
            case 'bubbles':
                return {
                    ...baseConfig,
                    y: 610,
                    speedY: { min: -60, max: -30 },
                    speedX: { min: -5, max: 5 },
                    scale: { min: 0.5, max: 1.5 },
                    frequency: 200
                };
            case 'sparkles':
                return {
                    ...baseConfig,
                    y: { min: 0, max: 600 },
                    speedY: { min: -5, max: 5 },
                    speedX: { min: -5, max: 5 },
                    scale: { min: 0.3, max: 1.0 },
                    lifespan: 1500,
                    frequency: 120,
                    alpha: { start: 1, end: 0 }
                };
            case 'drips':
                return {
                    ...baseConfig,
                    y: -10,
                    speedY: { min: 100, max: 150 },
                    speedX: 0,
                    scale: { min: 0.8, max: 1.2 },
                    lifespan: 5000,
                    frequency: 300
                };
            case 'blobs':
                return {
                    ...baseConfig,
                    y: -10,
                    speedY: { min: 40, max: 80 },
                    speedX: { min: -5, max: 5 },
                    scale: { min: 0.4, max: 1.2 },
                    lifespan: 6000,
                    frequency: 250,
                    alpha: { start: 0.7, end: 0.2 }
                };
            default:
                return baseConfig;
        }
    }
    
    /**
     * Clean up biome effects (call when leaving a scene)
     */
    static cleanup(): void {
        if (this.particleEmitter) {
            this.particleEmitter.destroy();
            this.particleEmitter = null;
        }
        if (this.fogOverlay) {
            this.fogOverlay.destroy();
            this.fogOverlay = null;
        }
        if (this.ambientSound) {
            this.ambientSound.stop();
            this.ambientSound = null;
        }
        this.currentBiome = null;
    }
    
    /**
     * Get the currently active biome
     */
    static getCurrentBiome(): BiomeConfig | null {
        return this.currentBiome;
    }
    
    /**
     * Check if a texture key indicates a slippery surface
     */
    static isSlipperySurface(textureKey: string): boolean {
        const slipperyTextures = ['brick-ice', 'brick-moss', 'brick-toxic', 'brick-slime'];
        return slipperyTextures.includes(textureKey);
    }
    
    /**
     * Get friction value for a texture
     */
    static getFrictionForTexture(textureKey: string): number {
        const frictionMap: { [key: string]: number } = {
            'brick': 1.0,
            'brick-ice': 0.3,
            'brick-lava': 1.2,
            'brick-moss': 0.8,
            'brick-crystal': 1.0,
            'brick-toxic': 0.7,
            'brick-slime': 0.5
        };
        return frictionMap[textureKey] ?? 1.0;
    }
    
    /**
     * Register a custom biome
     */
    static registerBiome(config: BiomeConfig): void {
        BIOME_DEFINITIONS.set(config.type, config);
    }
}
