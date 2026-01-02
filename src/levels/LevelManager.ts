import { BiomeType, BiomeManager, BiomeConfig } from '../systems/BiomeManager';

export interface LevelConfig {
    name: string;
    /** Biome type for this level - determines visuals and physics */
    biome?: BiomeType;
    platforms: Array<{x: number, y: number, width: number}>;
    collectibles: Array<{x: number, y: number}>;
    airCapsules?: Array<{x: number, y: number}>; // Optional air capsules for each level
    enemies: Array<{
        x: number, 
        y: number, 
        type: 'enemy-one' | 'enemy-two' | 'enemy-three' | 'enemy-four' | 'basic',
        velocity: number,
        tint?: number
    }>;
    playerStart: {x: number, y: number};
    exit: {x: number, y: number};
    /** @deprecated Use biome instead - kept for backwards compatibility */
    backgroundColor?: number;
    /** @deprecated Use biome instead - kept for backwards compatibility */
    platformTint?: number;
    /** @deprecated Use biome instead - kept for backwards compatibility */
    brickTexture?: string;
}

export class LevelManager {
    /**
     * Get the effective biome config for a level
     * Uses the level's biome if specified, otherwise creates config from legacy properties
     */
    static getBiomeForLevel(levelConfig: LevelConfig): BiomeConfig {
        if (levelConfig.biome) {
            return BiomeManager.getBiome(levelConfig.biome);
        }
        
        // Fallback for legacy levels without biome - use CAVERN as default
        return BiomeManager.getBiome(BiomeType.CAVERN);
    }
    
    /**
     * Get the brick texture for a level (considers biome first, then legacy properties)
     */
    static getBrickTexture(levelConfig: LevelConfig): string {
        if (levelConfig.brickTexture) {
            return levelConfig.brickTexture;
        }
        if (levelConfig.biome) {
            const biome = BiomeManager.getBiome(levelConfig.biome);
            return biome.visuals.brickTexture;
        }
        return 'brick';
    }
    
    /**
     * Get the background color for a level (considers biome first, then legacy properties)
     */
    static getBackgroundColor(levelConfig: LevelConfig): number {
        if (levelConfig.backgroundColor !== undefined) {
            return levelConfig.backgroundColor;
        }
        if (levelConfig.biome) {
            const biome = BiomeManager.getBiome(levelConfig.biome);
            return biome.visuals.backgroundColor;
        }
        return 0x000000;
    }
    
    // =====================================================
    // LEVEL 1: Central Cavern (CAVERN biome - introductory)
    // =====================================================
    static getCentralCavernLevel(): LevelConfig {
        return {
            name: 'Central Cavern',
            biome: BiomeType.CAVERN,
            playerStart: {x: 100, y: 450},
            exit: {x: 400, y: 250},
            platforms: [
                // Ground level
                {x: 0, y: 584, width: 800},
                // Top platform
                {x: 64, y: 120, width: 206},
                {x: 360, y: 120, width: 376},
                // Second level platforms
                {x: 160, y: 200, width: 240},
                {x: 480, y: 200, width: 160},
                // Third level platforms
                {x: 32, y: 280, width: 160},
                {x: 352, y: 280, width: 160},
                {x: 608, y: 280, width: 160},
                // Fourth level platforms
                {x: 96, y: 360, width: 160},
                {x: 416, y: 360, width: 160},
                // Bottom level platforms
                {x: 192, y: 440, width: 160},
                {x: 544, y: 440, width: 160}
            ],
            collectibles: [
                {x: 128, y: 100}, {x: 256, y: 100}, {x: 384, y: 100}, {x: 512, y: 100}, {x: 640, y: 100},
                {x: 200, y: 180}, {x: 280, y: 180}, {x: 520, y: 180}, {x: 600, y: 180},
                {x: 72, y: 260}, {x: 152, y: 260}, {x: 392, y: 260}, {x: 472, y: 260}, {x: 648, y: 260},
                {x: 136, y: 340}, {x: 216, y: 340}, {x: 456, y: 340}, {x: 536, y: 340},
                {x: 232, y: 420}, {x: 312, y: 420}
            ],
            airCapsules: [
                {x: 700, y: 260},
                {x: 270, y: 420}
            ],
            enemies: [
                {x: 300, y: 550, type: 'enemy-one', velocity: 80},
                {x: 500, y: 260, type: 'enemy-two', velocity: -75},
                {x: 150, y: 340, type: 'enemy-three', velocity: 60},
                {x: 400, y: 420, type: 'enemy-four', velocity: -80}
            ]
        };
    }
    
    // =====================================================
    // LEVEL 2: Underground Chamber (UNDERGROUND biome)
    // =====================================================
    static getUndergroundChamberLevel(): LevelConfig {
        return {
            name: 'Underground Chamber',
            biome: BiomeType.UNDERGROUND,
            playerStart: {x: 50, y: 520},
            exit: {x: 720, y: 100},
            platforms: [
                // Ground level - more broken up
                {x: 0, y: 584, width: 200},
                {x: 280, y: 584, width: 160},
                {x: 520, y: 584, width: 280},
                // Staircase pattern on left
                {x: 32, y: 520, width: 96},
                {x: 64, y: 460, width: 96},
                {x: 96, y: 400, width: 96},
                {x: 128, y: 340, width: 96},
                {x: 160, y: 280, width: 96},
                // Center floating platforms
                {x: 300, y: 450, width: 200},
                {x: 280, y: 320, width: 120},
                {x: 450, y: 380, width: 120},
                {x: 380, y: 250, width: 160},
                // Right side platforms
                {x: 600, y: 500, width: 128},
                {x: 550, y: 420, width: 96},
                {x: 650, y: 340, width: 96},
                {x: 580, y: 260, width: 128},
                {x: 640, y: 180, width: 128},
                // Top platforms
                {x: 200, y: 120, width: 160},
                {x: 500, y: 120, width: 200}
            ],
            collectibles: [
                {x: 100, y: 564}, {x: 320, y: 564}, {x: 400, y: 564}, {x: 600, y: 564},
                {x: 80, y: 500}, {x: 112, y: 440}, {x: 144, y: 380}, {x: 176, y: 320}, {x: 208, y: 260},
                {x: 350, y: 430}, {x: 450, y: 430}, {x: 330, y: 300}, {x: 500, y: 360}, {x: 430, y: 230},
                {x: 640, y: 480}, {x: 590, y: 400}, {x: 690, y: 320}, {x: 620, y: 240}, {x: 680, y: 160},
                {x: 250, y: 100}, {x: 320, y: 100}, {x: 550, y: 100}, {x: 650, y: 100}
            ],
            airCapsules: [
                {x: 240, y: 320},
                {x: 650, y: 240}
            ],
            enemies: [
                {x: 350, y: 550, type: 'enemy-one', velocity: -100},
                {x: 450, y: 230, type: 'enemy-two', velocity: 90},
                {x: 80, y: 320, type: 'enemy-three', velocity: 70},
                {x: 620, y: 400, type: 'enemy-four', velocity: -85},
                {x: 280, y: 100, type: 'enemy-four', velocity: 60}
            ]
        };
    }

    // =====================================================
    // LEVEL 3: Arctic Zone (ARCTIC biome - slippery!)
    // =====================================================
    static getArcticZoneLevel(): LevelConfig {
        return {
            name: 'Arctic Zone',
            biome: BiomeType.ARCTIC,
            playerStart: {x: 50, y: 520},
            exit: {x: 400, y: 100},
            platforms: [
                // Ground level - icy floor with gaps
                {x: 0, y: 584, width: 160},
                {x: 224, y: 584, width: 192},
                {x: 480, y: 584, width: 160},
                {x: 704, y: 584, width: 96},
                // Lower platforms
                {x: 96, y: 500, width: 96},
                {x: 352, y: 520, width: 128},
                {x: 640, y: 500, width: 128},
                // Mid-level platforms
                {x: 32, y: 420, width: 128},
                {x: 224, y: 440, width: 96},
                {x: 400, y: 420, width: 160},
                {x: 640, y: 440, width: 96},
                // Upper-mid platforms
                {x: 128, y: 340, width: 128},
                {x: 320, y: 360, width: 96},
                {x: 480, y: 340, width: 128},
                {x: 680, y: 360, width: 96},
                // High platforms
                {x: 64, y: 260, width: 96},
                {x: 224, y: 280, width: 128},
                {x: 416, y: 260, width: 96},
                {x: 576, y: 280, width: 128},
                // Very high platforms
                {x: 160, y: 180, width: 96},
                {x: 320, y: 200, width: 160},
                {x: 544, y: 180, width: 96},
                // Top platforms
                {x: 96, y: 120, width: 128},
                {x: 288, y: 120, width: 224},
                {x: 576, y: 120, width: 128}
            ],
            collectibles: [
                {x: 80, y: 564}, {x: 280, y: 564}, {x: 360, y: 564}, {x: 540, y: 564}, {x: 740, y: 564},
                {x: 144, y: 480}, {x: 400, y: 500}, {x: 680, y: 480},
                {x: 80, y: 400}, {x: 272, y: 420}, {x: 480, y: 400}, {x: 688, y: 420},
                {x: 176, y: 320}, {x: 368, y: 340}, {x: 528, y: 320}, {x: 728, y: 340},
                {x: 112, y: 240}, {x: 280, y: 260}, {x: 464, y: 240}, {x: 632, y: 260},
                {x: 208, y: 160}, {x: 368, y: 180}, {x: 432, y: 180}, {x: 592, y: 160},
                {x: 144, y: 100}, {x: 336, y: 100}, {x: 400, y: 100}, {x: 464, y: 100}, {x: 624, y: 100}
            ],
            airCapsules: [
                {x: 100, y: 400},
                {x: 550, y: 240}
            ],
            enemies: [
                {x: 300, y: 550, type: 'enemy-one', velocity: -100},
                {x: 480, y: 400, type: 'enemy-two', velocity: 90},
                {x: 200, y: 320, type: 'enemy-three', velocity: 70},
                {x: 500, y: 240, type: 'enemy-four', velocity: -85},
                {x: 370, y: 180, type: 'enemy-four', velocity: 60},
                {x: 650, y: 340, type: 'enemy-four', velocity: -75}
            ]
        };
    }

    // =====================================================
    // LEVEL 4: Mushroom Grotto (FOREST biome)
    // =====================================================
    static getMushroomGrottoLevel(): LevelConfig {
        return {
            name: 'Mushroom Grotto',
            biome: BiomeType.FOREST,
            playerStart: {x: 50, y: 520},
            exit: {x: 750, y: 520},
            platforms: [
                // Ground with gaps (mushroom stepping stones needed)
                {x: 0, y: 584, width: 128},
                {x: 240, y: 584, width: 64},
                {x: 400, y: 584, width: 64},
                {x: 560, y: 584, width: 64},
                {x: 704, y: 584, width: 96},
                // Floating mushroom platforms
                {x: 128, y: 520, width: 80},
                {x: 304, y: 480, width: 80},
                {x: 464, y: 520, width: 80},
                {x: 624, y: 480, width: 80},
                // Mid level
                {x: 64, y: 420, width: 112},
                {x: 224, y: 380, width: 112},
                {x: 384, y: 420, width: 112},
                {x: 544, y: 380, width: 112},
                {x: 704, y: 420, width: 80},
                // Upper level
                {x: 144, y: 300, width: 96},
                {x: 304, y: 280, width: 96},
                {x: 464, y: 300, width: 96},
                {x: 624, y: 280, width: 96},
                // Top level
                {x: 224, y: 180, width: 112},
                {x: 416, y: 200, width: 112},
                {x: 608, y: 180, width: 112},
                // Ceiling areas
                {x: 96, y: 120, width: 80},
                {x: 320, y: 120, width: 160},
                {x: 560, y: 120, width: 80}
            ],
            collectibles: [
                {x: 64, y: 564}, {x: 272, y: 564}, {x: 432, y: 564}, {x: 592, y: 564}, {x: 752, y: 564},
                {x: 168, y: 500}, {x: 344, y: 460}, {x: 504, y: 500}, {x: 664, y: 460},
                {x: 120, y: 400}, {x: 280, y: 360}, {x: 440, y: 400}, {x: 600, y: 360}, {x: 744, y: 400},
                {x: 192, y: 280}, {x: 352, y: 260}, {x: 512, y: 280}, {x: 672, y: 260},
                {x: 280, y: 160}, {x: 472, y: 180}, {x: 664, y: 160},
                {x: 136, y: 100}, {x: 400, y: 100}, {x: 600, y: 100}
            ],
            airCapsules: [
                {x: 360, y: 100},
                {x: 744, y: 380}
            ],
            enemies: [
                {x: 170, y: 500, type: 'enemy-one', velocity: 60},
                {x: 340, y: 360, type: 'enemy-two', velocity: -70},
                {x: 510, y: 500, type: 'enemy-three', velocity: 65},
                {x: 665, y: 460, type: 'enemy-four', velocity: -55},
                {x: 400, y: 180, type: 'enemy-one', velocity: 75}
            ]
        };
    }

    // =====================================================
    // LEVEL 5: Molten Core (LAVA biome - fast air drain!)
    // =====================================================
    static getMoltenCoreLevel(): LevelConfig {
        return {
            name: 'Molten Core',
            biome: BiomeType.LAVA,
            playerStart: {x: 50, y: 120},
            exit: {x: 750, y: 520},
            platforms: [
                // Top start area
                {x: 0, y: 160, width: 160},
                // Descending path
                {x: 192, y: 200, width: 96},
                {x: 320, y: 240, width: 96},
                {x: 448, y: 280, width: 96},
                {x: 576, y: 320, width: 96},
                {x: 680, y: 360, width: 96},
                // Middle area bridges
                {x: 64, y: 300, width: 112},
                {x: 208, y: 340, width: 80},
                {x: 352, y: 380, width: 112},
                {x: 496, y: 420, width: 80},
                // Lower level
                {x: 32, y: 440, width: 128},
                {x: 192, y: 480, width: 96},
                {x: 336, y: 520, width: 112},
                {x: 480, y: 480, width: 96},
                {x: 624, y: 440, width: 96},
                // Ground level (lava floor - dangerous gaps!)
                {x: 0, y: 584, width: 64},
                {x: 256, y: 584, width: 64},
                {x: 480, y: 584, width: 64},
                {x: 704, y: 584, width: 96}
            ],
            collectibles: [
                {x: 80, y: 140}, {x: 140, y: 140},
                {x: 240, y: 180}, {x: 368, y: 220}, {x: 496, y: 260}, {x: 624, y: 300}, {x: 728, y: 340},
                {x: 120, y: 280}, {x: 248, y: 320}, {x: 408, y: 360}, {x: 536, y: 400},
                {x: 96, y: 420}, {x: 240, y: 460}, {x: 392, y: 500}, {x: 528, y: 460}, {x: 672, y: 420},
                {x: 32, y: 564}, {x: 288, y: 564}, {x: 512, y: 564}, {x: 752, y: 564}
            ],
            airCapsules: [
                {x: 400, y: 360},
                {x: 680, y: 420}
            ],
            enemies: [
                {x: 240, y: 180, type: 'enemy-one', velocity: 80},
                {x: 400, y: 360, type: 'enemy-two', velocity: -90},
                {x: 100, y: 420, type: 'enemy-three', velocity: 70},
                {x: 528, y: 460, type: 'enemy-four', velocity: -85},
                {x: 672, y: 420, type: 'enemy-one', velocity: 75}
            ]
        };
    }

    // =====================================================
    // LEVEL 6: Crystal Caverns (CRYSTAL biome - low gravity)
    // =====================================================
    static getCrystalCavernsLevel(): LevelConfig {
        return {
            name: 'Crystal Caverns',
            biome: BiomeType.CRYSTAL,
            playerStart: {x: 400, y: 520},
            exit: {x: 400, y: 80},
            platforms: [
                // Bottom center start
                {x: 320, y: 584, width: 160},
                // Spiral upward pattern
                {x: 480, y: 520, width: 112},
                {x: 600, y: 460, width: 96},
                {x: 560, y: 380, width: 112},
                {x: 440, y: 320, width: 96},
                {x: 320, y: 260, width: 112},
                {x: 200, y: 200, width: 96},
                {x: 160, y: 140, width: 112},
                // Opposite spiral
                {x: 160, y: 520, width: 112},
                {x: 80, y: 460, width: 96},
                {x: 120, y: 380, width: 112},
                {x: 240, y: 320, width: 96},
                {x: 480, y: 200, width: 96},
                {x: 520, y: 140, width: 112},
                // Top platform with exit
                {x: 304, y: 120, width: 192},
                // Side perches
                {x: 0, y: 300, width: 64},
                {x: 736, y: 300, width: 64}
            ],
            collectibles: [
                {x: 400, y: 564},
                {x: 536, y: 500}, {x: 648, y: 440}, {x: 616, y: 360}, {x: 488, y: 300}, {x: 376, y: 240}, {x: 248, y: 180}, {x: 216, y: 120},
                {x: 216, y: 500}, {x: 128, y: 440}, {x: 176, y: 360}, {x: 288, y: 300}, {x: 528, y: 180}, {x: 576, y: 120},
                {x: 32, y: 280}, {x: 768, y: 280},
                {x: 352, y: 100}, {x: 400, y: 100}, {x: 448, y: 100}
            ],
            airCapsules: [
                {x: 32, y: 280},
                {x: 768, y: 280}
            ],
            enemies: [
                {x: 540, y: 500, type: 'enemy-one', velocity: 70},
                {x: 130, y: 440, type: 'enemy-two', velocity: -65},
                {x: 320, y: 240, type: 'enemy-three', velocity: 60},
                {x: 480, y: 180, type: 'enemy-four', velocity: -75},
                {x: 400, y: 100, type: 'enemy-two', velocity: 80}
            ]
        };
    }

    // =====================================================
    // LEVEL 7: Toxic Tunnels (TOXIC biome - very fast air!)
    // =====================================================
    static getToxicTunnelsLevel(): LevelConfig {
        return {
            name: 'Toxic Tunnels',
            biome: BiomeType.TOXIC,
            playerStart: {x: 50, y: 280},
            exit: {x: 750, y: 280},
            platforms: [
                // Left entry area
                {x: 0, y: 320, width: 128},
                // Tunnel system - top route
                {x: 144, y: 200, width: 112},
                {x: 288, y: 160, width: 128},
                {x: 448, y: 200, width: 112},
                {x: 592, y: 160, width: 128},
                // Tunnel system - middle route
                {x: 144, y: 320, width: 96},
                {x: 272, y: 280, width: 112},
                {x: 416, y: 320, width: 96},
                {x: 544, y: 280, width: 112},
                // Tunnel system - bottom route
                {x: 144, y: 440, width: 112},
                {x: 288, y: 480, width: 128},
                {x: 448, y: 440, width: 112},
                {x: 592, y: 480, width: 128},
                // Exit area
                {x: 672, y: 320, width: 128},
                // Toxic pools (ground)
                {x: 0, y: 584, width: 160},
                {x: 320, y: 584, width: 160},
                {x: 640, y: 584, width: 160}
            ],
            collectibles: [
                {x: 64, y: 300},
                // Top route
                {x: 200, y: 180}, {x: 352, y: 140}, {x: 504, y: 180}, {x: 656, y: 140},
                // Middle route  
                {x: 192, y: 300}, {x: 328, y: 260}, {x: 464, y: 300}, {x: 600, y: 260},
                // Bottom route
                {x: 200, y: 420}, {x: 352, y: 460}, {x: 504, y: 420}, {x: 656, y: 460},
                {x: 736, y: 300},
                // Risky ground coins
                {x: 80, y: 564}, {x: 400, y: 564}, {x: 720, y: 564}
            ],
            airCapsules: [
                {x: 352, y: 260},
                {x: 504, y: 420}
            ],
            enemies: [
                {x: 200, y: 180, type: 'enemy-one', velocity: 90},
                {x: 328, y: 260, type: 'enemy-two', velocity: -85},
                {x: 464, y: 300, type: 'enemy-three', velocity: 80},
                {x: 656, y: 460, type: 'enemy-four', velocity: -90},
                {x: 200, y: 420, type: 'enemy-one', velocity: 75}
            ]
        };
    }

    // =====================================================
    // LEVEL 8: Central Cavern II (CAVERN - harder sequel)
    // =====================================================
    static getCentralCavernIILevel(): LevelConfig {
        return {
            name: 'Central Cavern II',
            biome: BiomeType.CAVERN,
            playerStart: {x: 750, y: 520},
            exit: {x: 50, y: 100},
            platforms: [
                // Ground with more gaps
                {x: 0, y: 584, width: 96},
                {x: 160, y: 584, width: 128},
                {x: 352, y: 584, width: 96},
                {x: 512, y: 584, width: 128},
                {x: 704, y: 584, width: 96},
                // Scattered platforms
                {x: 96, y: 500, width: 80},
                {x: 256, y: 480, width: 80},
                {x: 432, y: 500, width: 80},
                {x: 608, y: 480, width: 80},
                // Middle tier
                {x: 32, y: 400, width: 96},
                {x: 176, y: 380, width: 96},
                {x: 336, y: 400, width: 96},
                {x: 496, y: 380, width: 96},
                {x: 656, y: 400, width: 96},
                // Upper middle
                {x: 104, y: 300, width: 80},
                {x: 256, y: 280, width: 80},
                {x: 408, y: 300, width: 80},
                {x: 560, y: 280, width: 80},
                {x: 712, y: 300, width: 80},
                // High tier
                {x: 176, y: 200, width: 96},
                {x: 352, y: 180, width: 96},
                {x: 528, y: 200, width: 96},
                // Top - exit area
                {x: 0, y: 140, width: 128},
                {x: 256, y: 120, width: 112},
                {x: 448, y: 120, width: 112},
                {x: 640, y: 140, width: 112}
            ],
            collectibles: [
                {x: 48, y: 564}, {x: 224, y: 564}, {x: 400, y: 564}, {x: 576, y: 564}, {x: 752, y: 564},
                {x: 136, y: 480}, {x: 296, y: 460}, {x: 472, y: 480}, {x: 648, y: 460},
                {x: 80, y: 380}, {x: 224, y: 360}, {x: 384, y: 380}, {x: 544, y: 360}, {x: 704, y: 380},
                {x: 144, y: 280}, {x: 296, y: 260}, {x: 448, y: 280}, {x: 600, y: 260}, {x: 752, y: 280},
                {x: 224, y: 180}, {x: 400, y: 160}, {x: 576, y: 180},
                {x: 64, y: 120}, {x: 312, y: 100}, {x: 504, y: 100}, {x: 696, y: 120}
            ],
            airCapsules: [
                {x: 448, y: 280},
                {x: 80, y: 120}
            ],
            enemies: [
                {x: 136, y: 480, type: 'enemy-one', velocity: 90},
                {x: 296, y: 460, type: 'enemy-two', velocity: -85},
                {x: 384, y: 380, type: 'enemy-three', velocity: 95},
                {x: 600, y: 260, type: 'enemy-four', velocity: -90},
                {x: 400, y: 160, type: 'enemy-one', velocity: 85},
                {x: 504, y: 100, type: 'enemy-two', velocity: -80},
                {x: 80, y: 380, type: 'enemy-three', velocity: 75}
            ]
        };
    }

    // =====================================================
    // LEVEL 9: Frozen Wastes (ARCTIC - harder sequel)
    // =====================================================
    static getFrozenWastesLevel(): LevelConfig {
        return {
            name: 'Frozen Wastes',
            biome: BiomeType.ARCTIC,
            playerStart: {x: 750, y: 120},
            exit: {x: 50, y: 520},
            platforms: [
                // Top start
                {x: 656, y: 160, width: 144},
                // Descending ice slides
                {x: 544, y: 200, width: 80},
                {x: 416, y: 240, width: 96},
                {x: 288, y: 280, width: 80},
                {x: 160, y: 320, width: 96},
                {x: 32, y: 360, width: 80},
                // Alternate path
                {x: 480, y: 320, width: 112},
                {x: 352, y: 380, width: 80},
                {x: 224, y: 440, width: 112},
                {x: 544, y: 440, width: 96},
                {x: 680, y: 400, width: 80},
                // Ground level
                {x: 0, y: 584, width: 144},
                {x: 208, y: 584, width: 96},
                {x: 368, y: 584, width: 128},
                {x: 560, y: 584, width: 128},
                {x: 752, y: 584, width: 48},
                // Mid platforms
                {x: 608, y: 280, width: 80},
                {x: 96, y: 480, width: 80}
            ],
            collectibles: [
                {x: 704, y: 140}, {x: 752, y: 140},
                {x: 584, y: 180}, {x: 464, y: 220}, {x: 328, y: 260}, {x: 208, y: 300}, {x: 72, y: 340},
                {x: 536, y: 300}, {x: 392, y: 360}, {x: 280, y: 420}, {x: 592, y: 420}, {x: 720, y: 380},
                {x: 648, y: 260},
                {x: 72, y: 564}, {x: 256, y: 564}, {x: 432, y: 564}, {x: 624, y: 564},
                {x: 136, y: 460}
            ],
            airCapsules: [
                {x: 280, y: 420},
                {x: 72, y: 340}
            ],
            enemies: [
                {x: 584, y: 180, type: 'enemy-one', velocity: -100},
                {x: 328, y: 260, type: 'enemy-two', velocity: 95},
                {x: 536, y: 300, type: 'enemy-three', velocity: -90},
                {x: 280, y: 420, type: 'enemy-four', velocity: 85},
                {x: 432, y: 564, type: 'enemy-one', velocity: -100},
                {x: 648, y: 260, type: 'enemy-two', velocity: 90},
                {x: 136, y: 460, type: 'enemy-three', velocity: -80}
            ]
        };
    }

    // =====================================================
    // LEVEL 10: Deep Roots (FOREST)
    // =====================================================
    static getDeepRootsLevel(): LevelConfig {
        return {
            name: 'Deep Roots',
            biome: BiomeType.FOREST,
            playerStart: {x: 400, y: 80},
            exit: {x: 400, y: 520},
            platforms: [
                // Top - start
                {x: 320, y: 120, width: 160},
                // Root system descent
                {x: 176, y: 180, width: 112},
                {x: 512, y: 180, width: 112},
                {x: 80, y: 240, width: 96},
                {x: 320, y: 260, width: 160},
                {x: 624, y: 240, width: 96},
                {x: 176, y: 320, width: 128},
                {x: 496, y: 320, width: 128},
                {x: 32, y: 380, width: 112},
                {x: 336, y: 400, width: 128},
                {x: 656, y: 380, width: 112},
                {x: 176, y: 460, width: 96},
                {x: 528, y: 460, width: 96},
                // Bottom - exit
                {x: 336, y: 584, width: 128},
                {x: 0, y: 584, width: 112},
                {x: 688, y: 584, width: 112}
            ],
            collectibles: [
                {x: 368, y: 100}, {x: 432, y: 100},
                {x: 232, y: 160}, {x: 568, y: 160},
                {x: 128, y: 220}, {x: 400, y: 240}, {x: 672, y: 220},
                {x: 240, y: 300}, {x: 560, y: 300},
                {x: 88, y: 360}, {x: 400, y: 380}, {x: 712, y: 360},
                {x: 224, y: 440}, {x: 576, y: 440},
                {x: 56, y: 564}, {x: 400, y: 564}, {x: 744, y: 564}
            ],
            airCapsules: [
                {x: 400, y: 380},
                {x: 128, y: 220}
            ],
            enemies: [
                {x: 232, y: 160, type: 'enemy-one', velocity: 65},
                {x: 568, y: 160, type: 'enemy-two', velocity: -70},
                {x: 400, y: 240, type: 'enemy-three', velocity: 60},
                {x: 88, y: 360, type: 'enemy-four', velocity: 75},
                {x: 712, y: 360, type: 'enemy-one', velocity: -80},
                {x: 400, y: 564, type: 'enemy-two', velocity: 70}
            ]
        };
    }

    // =====================================================
    // LEVEL 11: Magma Falls (LAVA - harder sequel)
    // =====================================================
    static getMagmaFallsLevel(): LevelConfig {
        return {
            name: 'Magma Falls',
            biome: BiomeType.LAVA,
            playerStart: {x: 400, y: 520},
            exit: {x: 400, y: 80},
            platforms: [
                // Bottom center
                {x: 304, y: 584, width: 192},
                // Rising platforms - left side
                {x: 128, y: 520, width: 96},
                {x: 48, y: 440, width: 80},
                {x: 128, y: 360, width: 96},
                {x: 48, y: 280, width: 80},
                {x: 128, y: 200, width: 96},
                // Rising platforms - right side
                {x: 576, y: 520, width: 96},
                {x: 672, y: 440, width: 80},
                {x: 576, y: 360, width: 96},
                {x: 672, y: 280, width: 80},
                {x: 576, y: 200, width: 96},
                // Center stepping stones
                {x: 272, y: 480, width: 64},
                {x: 464, y: 480, width: 64},
                {x: 368, y: 400, width: 64},
                {x: 272, y: 320, width: 64},
                {x: 464, y: 320, width: 64},
                {x: 368, y: 240, width: 64},
                {x: 272, y: 160, width: 64},
                {x: 464, y: 160, width: 64},
                // Top exit platform
                {x: 304, y: 120, width: 192}
            ],
            collectibles: [
                {x: 352, y: 564}, {x: 448, y: 564},
                {x: 176, y: 500}, {x: 624, y: 500},
                {x: 304, y: 460}, {x: 496, y: 460},
                {x: 88, y: 420}, {x: 712, y: 420},
                {x: 400, y: 380},
                {x: 176, y: 340}, {x: 624, y: 340},
                {x: 304, y: 300}, {x: 496, y: 300},
                {x: 88, y: 260}, {x: 712, y: 260},
                {x: 400, y: 220},
                {x: 176, y: 180}, {x: 624, y: 180},
                {x: 304, y: 140}, {x: 496, y: 140},
                {x: 352, y: 100}, {x: 448, y: 100}
            ],
            airCapsules: [
                {x: 88, y: 260},
                {x: 712, y: 260}
            ],
            enemies: [
                {x: 176, y: 500, type: 'enemy-one', velocity: 85},
                {x: 624, y: 500, type: 'enemy-two', velocity: -90},
                {x: 400, y: 380, type: 'enemy-three', velocity: 80},
                {x: 304, y: 300, type: 'enemy-four', velocity: -95},
                {x: 496, y: 300, type: 'enemy-one', velocity: 90},
                {x: 400, y: 220, type: 'enemy-two', velocity: -85},
                {x: 400, y: 100, type: 'enemy-three', velocity: 95}
            ]
        };
    }

    // =====================================================
    // LEVEL 12: Amethyst Depths (CRYSTAL - harder sequel)
    // =====================================================
    static getAmethystDepthsLevel(): LevelConfig {
        return {
            name: 'Amethyst Depths',
            biome: BiomeType.CRYSTAL,
            playerStart: {x: 50, y: 280},
            exit: {x: 750, y: 280},
            platforms: [
                // Left entry
                {x: 0, y: 320, width: 112},
                // Crystal formations - zigzag pattern
                {x: 144, y: 240, width: 80},
                {x: 144, y: 400, width: 80},
                {x: 256, y: 320, width: 96},
                {x: 384, y: 200, width: 80},
                {x: 384, y: 440, width: 80},
                {x: 496, y: 320, width: 96},
                {x: 624, y: 240, width: 80},
                {x: 624, y: 400, width: 80},
                // Exit
                {x: 688, y: 320, width: 112},
                // Floating crystals
                {x: 320, y: 120, width: 64},
                {x: 416, y: 120, width: 64},
                {x: 320, y: 520, width: 64},
                {x: 416, y: 520, width: 64}
            ],
            collectibles: [
                {x: 56, y: 300},
                {x: 184, y: 220}, {x: 184, y: 380},
                {x: 304, y: 300},
                {x: 424, y: 180}, {x: 424, y: 420},
                {x: 544, y: 300},
                {x: 664, y: 220}, {x: 664, y: 380},
                {x: 744, y: 300},
                {x: 352, y: 100}, {x: 448, y: 100},
                {x: 352, y: 500}, {x: 448, y: 500}
            ],
            airCapsules: [
                {x: 352, y: 100},
                {x: 352, y: 500}
            ],
            enemies: [
                {x: 184, y: 220, type: 'enemy-one', velocity: 75},
                {x: 184, y: 380, type: 'enemy-two', velocity: -80},
                {x: 304, y: 300, type: 'enemy-three', velocity: 70},
                {x: 424, y: 180, type: 'enemy-four', velocity: -85},
                {x: 424, y: 420, type: 'enemy-one', velocity: 80},
                {x: 544, y: 300, type: 'enemy-two', velocity: -75},
                {x: 664, y: 220, type: 'enemy-three', velocity: 85}
            ]
        };
    }

    // =====================================================
    // LEVEL 13: Acid Pits (TOXIC - harder sequel)
    // =====================================================
    static getAcidPitsLevel(): LevelConfig {
        return {
            name: 'Acid Pits',
            biome: BiomeType.TOXIC,
            playerStart: {x: 50, y: 520},
            exit: {x: 750, y: 80},
            platforms: [
                // Bottom left start
                {x: 0, y: 584, width: 144},
                // Ascending acid-safe platforms
                {x: 176, y: 520, width: 80},
                {x: 80, y: 440, width: 96},
                {x: 208, y: 380, width: 80},
                {x: 96, y: 300, width: 96},
                {x: 224, y: 240, width: 80},
                // Middle column
                {x: 336, y: 480, width: 80},
                {x: 336, y: 360, width: 80},
                {x: 336, y: 240, width: 80},
                {x: 336, y: 120, width: 80},
                // Right ascending
                {x: 464, y: 520, width: 80},
                {x: 576, y: 440, width: 96},
                {x: 464, y: 360, width: 80},
                {x: 576, y: 280, width: 96},
                {x: 464, y: 200, width: 80},
                // Top right exit
                {x: 688, y: 120, width: 112}
            ],
            collectibles: [
                {x: 72, y: 564},
                {x: 216, y: 500}, {x: 128, y: 420}, {x: 248, y: 360}, {x: 144, y: 280}, {x: 264, y: 220},
                {x: 376, y: 460}, {x: 376, y: 340}, {x: 376, y: 220}, {x: 376, y: 100},
                {x: 504, y: 500}, {x: 624, y: 420}, {x: 504, y: 340}, {x: 624, y: 260}, {x: 504, y: 180},
                {x: 744, y: 100}
            ],
            airCapsules: [
                {x: 376, y: 340},
                {x: 144, y: 280}
            ],
            enemies: [
                {x: 128, y: 420, type: 'enemy-one', velocity: 90},
                {x: 376, y: 460, type: 'enemy-two', velocity: -100},
                {x: 624, y: 420, type: 'enemy-three', velocity: 95},
                {x: 376, y: 220, type: 'enemy-four', velocity: -90},
                {x: 504, y: 340, type: 'enemy-one', velocity: 100},
                {x: 624, y: 260, type: 'enemy-two', velocity: -95}
            ]
        };
    }

    // =====================================================
    // LEVEL 14: The Abyss (UNDERGROUND)
    // =====================================================
    static getTheAbyssLevel(): LevelConfig {
        return {
            name: 'The Abyss',
            biome: BiomeType.UNDERGROUND,
            playerStart: {x: 400, y: 80},
            exit: {x: 400, y: 520},
            platforms: [
                // Top center start
                {x: 320, y: 120, width: 160},
                // Narrow descent
                {x: 224, y: 180, width: 80},
                {x: 496, y: 180, width: 80},
                {x: 160, y: 240, width: 64},
                {x: 368, y: 260, width: 64},
                {x: 576, y: 240, width: 64},
                {x: 96, y: 320, width: 64},
                {x: 272, y: 340, width: 64},
                {x: 464, y: 340, width: 64},
                {x: 640, y: 320, width: 64},
                {x: 176, y: 420, width: 64},
                {x: 368, y: 400, width: 64},
                {x: 560, y: 420, width: 64},
                // Bottom exit
                {x: 320, y: 584, width: 160},
                // Side ledges
                {x: 0, y: 400, width: 80},
                {x: 720, y: 400, width: 80}
            ],
            collectibles: [
                {x: 368, y: 100}, {x: 432, y: 100},
                {x: 264, y: 160}, {x: 536, y: 160},
                {x: 192, y: 220}, {x: 400, y: 240}, {x: 608, y: 220},
                {x: 128, y: 300}, {x: 304, y: 320}, {x: 496, y: 320}, {x: 672, y: 300},
                {x: 40, y: 380}, {x: 760, y: 380},
                {x: 208, y: 400}, {x: 400, y: 380}, {x: 592, y: 400},
                {x: 368, y: 564}, {x: 432, y: 564}
            ],
            airCapsules: [
                {x: 40, y: 380},
                {x: 760, y: 380}
            ],
            enemies: [
                {x: 264, y: 160, type: 'enemy-one', velocity: 70},
                {x: 536, y: 160, type: 'enemy-two', velocity: -75},
                {x: 400, y: 240, type: 'enemy-three', velocity: 80},
                {x: 304, y: 320, type: 'enemy-four', velocity: -70},
                {x: 496, y: 320, type: 'enemy-one', velocity: 75},
                {x: 400, y: 380, type: 'enemy-two', velocity: -80},
                {x: 400, y: 564, type: 'enemy-three', velocity: 85}
            ]
        };
    }

    // =====================================================
    // LEVEL 15: Glacier Peak (ARCTIC)
    // =====================================================
    static getGlacierPeakLevel(): LevelConfig {
        return {
            name: 'Glacier Peak',
            biome: BiomeType.ARCTIC,
            playerStart: {x: 50, y: 520},
            exit: {x: 400, y: 80},
            platforms: [
                // Bottom
                {x: 0, y: 584, width: 160},
                {x: 640, y: 584, width: 160},
                // Mountain sides - left
                {x: 64, y: 500, width: 80},
                {x: 128, y: 420, width: 96},
                {x: 80, y: 340, width: 80},
                {x: 144, y: 260, width: 96},
                {x: 96, y: 180, width: 80},
                // Mountain sides - right
                {x: 656, y: 500, width: 80},
                {x: 576, y: 420, width: 96},
                {x: 640, y: 340, width: 80},
                {x: 560, y: 260, width: 96},
                {x: 624, y: 180, width: 80},
                // Center spine
                {x: 352, y: 520, width: 96},
                {x: 320, y: 440, width: 160},
                {x: 352, y: 360, width: 96},
                {x: 320, y: 280, width: 160},
                {x: 352, y: 200, width: 96},
                // Peak
                {x: 320, y: 120, width: 160}
            ],
            collectibles: [
                {x: 80, y: 564}, {x: 720, y: 564},
                {x: 104, y: 480}, {x: 696, y: 480},
                {x: 176, y: 400}, {x: 624, y: 400},
                {x: 120, y: 320}, {x: 680, y: 320},
                {x: 192, y: 240}, {x: 608, y: 240},
                {x: 136, y: 160}, {x: 664, y: 160},
                {x: 400, y: 500}, {x: 400, y: 420}, {x: 400, y: 340}, {x: 400, y: 260}, {x: 400, y: 180},
                {x: 368, y: 100}, {x: 432, y: 100}
            ],
            airCapsules: [
                {x: 400, y: 340},
                {x: 192, y: 240}
            ],
            enemies: [
                {x: 104, y: 480, type: 'enemy-one', velocity: -85},
                {x: 696, y: 480, type: 'enemy-two', velocity: 80},
                {x: 400, y: 420, type: 'enemy-three', velocity: -90},
                {x: 120, y: 320, type: 'enemy-four', velocity: 85},
                {x: 680, y: 320, type: 'enemy-one', velocity: -80},
                {x: 400, y: 260, type: 'enemy-two', velocity: 95},
                {x: 400, y: 100, type: 'enemy-three', velocity: -90}
            ]
        };
    }

    // =====================================================
    // LEVEL 16: Inferno's Heart (LAVA)
    // =====================================================
    static getInfernosHeartLevel(): LevelConfig {
        return {
            name: "Inferno's Heart",
            biome: BiomeType.LAVA,
            playerStart: {x: 50, y: 280},
            exit: {x: 750, y: 280},
            platforms: [
                // Entry
                {x: 0, y: 320, width: 96},
                // Ring structure
                {x: 176, y: 200, width: 80},
                {x: 304, y: 140, width: 192},
                {x: 544, y: 200, width: 80},
                {x: 176, y: 440, width: 80},
                {x: 304, y: 500, width: 192},
                {x: 544, y: 440, width: 80},
                // Center platforms
                {x: 256, y: 280, width: 64},
                {x: 368, y: 320, width: 64},
                {x: 480, y: 280, width: 64},
                {x: 368, y: 200, width: 64},
                {x: 368, y: 440, width: 64},
                // Exit
                {x: 704, y: 320, width: 96},
                // Connecting bridges
                {x: 96, y: 260, width: 64},
                {x: 96, y: 380, width: 64},
                {x: 640, y: 260, width: 64},
                {x: 640, y: 380, width: 64}
            ],
            collectibles: [
                {x: 48, y: 300},
                {x: 128, y: 240}, {x: 128, y: 360},
                {x: 216, y: 180}, {x: 584, y: 180},
                {x: 400, y: 120},
                {x: 288, y: 260}, {x: 400, y: 300}, {x: 512, y: 260},
                {x: 400, y: 180}, {x: 400, y: 420},
                {x: 216, y: 420}, {x: 584, y: 420},
                {x: 400, y: 480},
                {x: 672, y: 240}, {x: 672, y: 360},
                {x: 752, y: 300}
            ],
            airCapsules: [
                {x: 400, y: 300},
                {x: 400, y: 120}
            ],
            enemies: [
                {x: 128, y: 240, type: 'enemy-one', velocity: 90},
                {x: 128, y: 360, type: 'enemy-two', velocity: -85},
                {x: 400, y: 120, type: 'enemy-three', velocity: 95},
                {x: 288, y: 260, type: 'enemy-four', velocity: -100},
                {x: 512, y: 260, type: 'enemy-one', velocity: 95},
                {x: 400, y: 480, type: 'enemy-two', velocity: -90},
                {x: 672, y: 240, type: 'enemy-three', velocity: 85},
                {x: 672, y: 360, type: 'enemy-four', velocity: -80}
            ]
        };
    }

    // =====================================================
    // LEVEL 17: Emerald Grove (FOREST)
    // =====================================================
    static getEmeraldGroveLevel(): LevelConfig {
        return {
            name: 'Emerald Grove',
            biome: BiomeType.FOREST,
            playerStart: {x: 750, y: 80},
            exit: {x: 50, y: 520},
            platforms: [
                // Top right start
                {x: 688, y: 120, width: 112},
                // Tree canopy descent
                {x: 560, y: 160, width: 96},
                {x: 432, y: 120, width: 80},
                {x: 304, y: 160, width: 96},
                {x: 176, y: 120, width: 80},
                // Mid canopy
                {x: 624, y: 240, width: 80},
                {x: 480, y: 280, width: 112},
                {x: 320, y: 240, width: 80},
                {x: 160, y: 280, width: 112},
                // Lower branches
                {x: 560, y: 360, width: 96},
                {x: 400, y: 400, width: 112},
                {x: 240, y: 360, width: 96},
                {x: 80, y: 400, width: 112},
                // Ground - exit
                {x: 0, y: 584, width: 128},
                {x: 240, y: 584, width: 96},
                {x: 448, y: 584, width: 112},
                {x: 672, y: 584, width: 128},
                // Trunk platforms
                {x: 688, y: 480, width: 80},
                {x: 32, y: 480, width: 80}
            ],
            collectibles: [
                {x: 744, y: 100},
                {x: 608, y: 140}, {x: 472, y: 100}, {x: 352, y: 140}, {x: 216, y: 100},
                {x: 664, y: 220}, {x: 536, y: 260}, {x: 360, y: 220}, {x: 216, y: 260},
                {x: 608, y: 340}, {x: 456, y: 380}, {x: 288, y: 340}, {x: 136, y: 380},
                {x: 728, y: 460}, {x: 72, y: 460},
                {x: 64, y: 564}, {x: 288, y: 564}, {x: 504, y: 564}, {x: 728, y: 564}
            ],
            airCapsules: [
                {x: 536, y: 260},
                {x: 136, y: 380}
            ],
            enemies: [
                {x: 608, y: 140, type: 'enemy-one', velocity: -70},
                {x: 352, y: 140, type: 'enemy-two', velocity: 65},
                {x: 536, y: 260, type: 'enemy-three', velocity: -75},
                {x: 216, y: 260, type: 'enemy-four', velocity: 70},
                {x: 456, y: 380, type: 'enemy-one', velocity: -80},
                {x: 288, y: 564, type: 'enemy-two', velocity: 75},
                {x: 504, y: 564, type: 'enemy-three', velocity: -70}
            ]
        };
    }

    // =====================================================
    // LEVEL 18: Diamond Spire (CRYSTAL)
    // =====================================================
    static getDiamondSpireLevel(): LevelConfig {
        return {
            name: 'Diamond Spire',
            biome: BiomeType.CRYSTAL,
            playerStart: {x: 400, y: 520},
            exit: {x: 400, y: 80},
            platforms: [
                // Base
                {x: 288, y: 584, width: 224},
                // Tower structure - spiraling up
                {x: 192, y: 520, width: 80},
                {x: 528, y: 520, width: 80},
                {x: 144, y: 440, width: 96},
                {x: 560, y: 440, width: 96},
                {x: 240, y: 360, width: 80},
                {x: 480, y: 360, width: 80},
                {x: 192, y: 280, width: 96},
                {x: 512, y: 280, width: 96},
                {x: 288, y: 200, width: 80},
                {x: 432, y: 200, width: 80},
                // Spire peak
                {x: 336, y: 120, width: 128},
                // Floating crystals
                {x: 32, y: 320, width: 64},
                {x: 704, y: 320, width: 64},
                {x: 96, y: 200, width: 64},
                {x: 640, y: 200, width: 64}
            ],
            collectibles: [
                {x: 352, y: 564}, {x: 448, y: 564},
                {x: 232, y: 500}, {x: 568, y: 500},
                {x: 192, y: 420}, {x: 608, y: 420},
                {x: 280, y: 340}, {x: 520, y: 340},
                {x: 240, y: 260}, {x: 560, y: 260},
                {x: 328, y: 180}, {x: 472, y: 180},
                {x: 64, y: 300}, {x: 736, y: 300},
                {x: 128, y: 180}, {x: 672, y: 180},
                {x: 368, y: 100}, {x: 432, y: 100}
            ],
            airCapsules: [
                {x: 64, y: 300},
                {x: 736, y: 300}
            ],
            enemies: [
                {x: 232, y: 500, type: 'enemy-one', velocity: 75},
                {x: 568, y: 500, type: 'enemy-two', velocity: -80},
                {x: 192, y: 420, type: 'enemy-three', velocity: 70},
                {x: 608, y: 420, type: 'enemy-four', velocity: -75},
                {x: 280, y: 340, type: 'enemy-one', velocity: 85},
                {x: 520, y: 340, type: 'enemy-two', velocity: -80},
                {x: 400, y: 100, type: 'enemy-three', velocity: 90}
            ]
        };
    }

    // =====================================================
    // LEVEL 19: Biohazard Bay (TOXIC)
    // =====================================================
    static getBiohazardBayLevel(): LevelConfig {
        return {
            name: 'Biohazard Bay',
            biome: BiomeType.TOXIC,
            playerStart: {x: 400, y: 80},
            exit: {x: 400, y: 520},
            platforms: [
                // Top center
                {x: 320, y: 120, width: 160},
                // Hazmat containment descent
                {x: 160, y: 180, width: 112},
                {x: 528, y: 180, width: 112},
                {x: 64, y: 260, width: 96},
                {x: 352, y: 240, width: 96},
                {x: 640, y: 260, width: 96},
                {x: 176, y: 340, width: 80},
                {x: 544, y: 340, width: 80},
                {x: 80, y: 420, width: 96},
                {x: 320, y: 400, width: 160},
                {x: 624, y: 420, width: 96},
                // Bottom - toxic pools and exit
                {x: 176, y: 500, width: 80},
                {x: 544, y: 500, width: 80},
                {x: 320, y: 584, width: 160}
            ],
            collectibles: [
                {x: 368, y: 100}, {x: 432, y: 100},
                {x: 216, y: 160}, {x: 584, y: 160},
                {x: 112, y: 240}, {x: 400, y: 220}, {x: 688, y: 240},
                {x: 216, y: 320}, {x: 584, y: 320},
                {x: 128, y: 400}, {x: 400, y: 380}, {x: 672, y: 400},
                {x: 216, y: 480}, {x: 584, y: 480},
                {x: 368, y: 564}, {x: 432, y: 564}
            ],
            airCapsules: [
                {x: 400, y: 380},
                {x: 400, y: 220}
            ],
            enemies: [
                {x: 216, y: 160, type: 'enemy-one', velocity: 95},
                {x: 584, y: 160, type: 'enemy-two', velocity: -100},
                {x: 112, y: 240, type: 'enemy-three', velocity: 90},
                {x: 688, y: 240, type: 'enemy-four', velocity: -95},
                {x: 216, y: 320, type: 'enemy-one', velocity: 100},
                {x: 584, y: 320, type: 'enemy-two', velocity: -90},
                {x: 128, y: 400, type: 'enemy-three', velocity: 95},
                {x: 672, y: 400, type: 'enemy-four', velocity: -100}
            ]
        };
    }

    // =====================================================
    // LEVEL 20: The Final Descent (CAVERN - ultimate challenge)
    // =====================================================
    static getTheFinalDescentLevel(): LevelConfig {
        return {
            name: 'The Final Descent',
            biome: BiomeType.CAVERN,
            playerStart: {x: 400, y: 80},
            exit: {x: 400, y: 520},
            platforms: [
                // Top start
                {x: 320, y: 120, width: 160},
                // Gauntlet descent - narrow and dangerous
                {x: 176, y: 160, width: 64},
                {x: 560, y: 160, width: 64},
                {x: 96, y: 200, width: 64},
                {x: 368, y: 200, width: 64},
                {x: 640, y: 200, width: 64},
                {x: 240, y: 260, width: 64},
                {x: 496, y: 260, width: 64},
                {x: 128, y: 320, width: 64},
                {x: 368, y: 320, width: 64},
                {x: 608, y: 320, width: 64},
                {x: 240, y: 380, width: 64},
                {x: 496, y: 380, width: 64},
                {x: 96, y: 440, width: 64},
                {x: 368, y: 440, width: 64},
                {x: 640, y: 440, width: 64},
                {x: 176, y: 500, width: 64},
                {x: 560, y: 500, width: 64},
                // Final exit
                {x: 320, y: 584, width: 160}
            ],
            collectibles: [
                {x: 368, y: 100}, {x: 432, y: 100},
                {x: 208, y: 140}, {x: 592, y: 140},
                {x: 128, y: 180}, {x: 400, y: 180}, {x: 672, y: 180},
                {x: 272, y: 240}, {x: 528, y: 240},
                {x: 160, y: 300}, {x: 400, y: 300}, {x: 640, y: 300},
                {x: 272, y: 360}, {x: 528, y: 360},
                {x: 128, y: 420}, {x: 400, y: 420}, {x: 672, y: 420},
                {x: 208, y: 480}, {x: 592, y: 480},
                {x: 368, y: 564}, {x: 432, y: 564}
            ],
            airCapsules: [
                {x: 400, y: 300},
                {x: 400, y: 420}
            ],
            enemies: [
                {x: 208, y: 140, type: 'enemy-one', velocity: 100},
                {x: 592, y: 140, type: 'enemy-two', velocity: -95},
                {x: 400, y: 180, type: 'enemy-three', velocity: 105},
                {x: 272, y: 240, type: 'enemy-four', velocity: -100},
                {x: 528, y: 240, type: 'enemy-one', velocity: 95},
                {x: 160, y: 300, type: 'enemy-two', velocity: -110},
                {x: 640, y: 300, type: 'enemy-three', velocity: 100},
                {x: 272, y: 360, type: 'enemy-four', velocity: -105},
                {x: 528, y: 360, type: 'enemy-one', velocity: 110},
                {x: 400, y: 564, type: 'enemy-two', velocity: -100}
            ]
        };
    }

    // =====================================================
    // Get all levels in order
    // =====================================================
    static getAllLevels(): LevelConfig[] {
        return [
            this.getCentralCavernLevel(),        // 1
            this.getUndergroundChamberLevel(),   // 2
            this.getArcticZoneLevel(),           // 3
            this.getMushroomGrottoLevel(),       // 4
            this.getMoltenCoreLevel(),           // 5
            this.getCrystalCavernsLevel(),       // 6
            this.getToxicTunnelsLevel(),         // 7
            this.getCentralCavernIILevel(),      // 8
            this.getFrozenWastesLevel(),         // 9
            this.getDeepRootsLevel(),            // 10
            this.getMagmaFallsLevel(),           // 11
            this.getAmethystDepthsLevel(),       // 12
            this.getAcidPitsLevel(),             // 13
            this.getTheAbyssLevel(),             // 14
            this.getGlacierPeakLevel(),          // 15
            this.getInfernosHeartLevel(),        // 16
            this.getEmeraldGroveLevel(),         // 17
            this.getDiamondSpireLevel(),         // 18
            this.getBiohazardBayLevel(),         // 19
            this.getTheFinalDescentLevel()       // 20
        ];
    }

    static createPlatforms(scene: Phaser.Scene, platforms: Phaser.Physics.Arcade.StaticGroup, levelConfig: LevelConfig) {
        const brickTexture = this.getBrickTexture(levelConfig);
        const biome = levelConfig.biome ? BiomeManager.getBiome(levelConfig.biome) : null;
        const platformTint = levelConfig.platformTint || biome?.visuals.platformTint;
        
        levelConfig.platforms.forEach(platform => {
            for (let x = platform.x; x < platform.x + platform.width; x += 16) {
                const brick = platforms.create(x + 8, platform.y, brickTexture);
                if (platformTint) {
                    brick.setTint(platformTint);
                }
            }
        });
    }
    
    /**
     * Apply biome effects to a scene
     */
    static applyBiomeToScene(scene: Phaser.Scene, levelConfig: LevelConfig): void {
        if (levelConfig.biome) {
            BiomeManager.applyBiome(scene, levelConfig.biome);
        } else {
            // Legacy support - just set background color
            const bgColor = levelConfig.backgroundColor ?? 0x000000;
            scene.cameras.main.setBackgroundColor(bgColor);
        }
    }
    
    /**
     * Clean up biome effects (call when leaving level)
     */
    static cleanupBiome(): void {
        BiomeManager.cleanup();
    }
}
