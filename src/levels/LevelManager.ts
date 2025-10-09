export interface LevelConfig {
    name: string;
    platforms: Array<{x: number, y: number, width: number}>;
    collectibles: Array<{x: number, y: number}>;
    airCapsules?: Array<{x: number, y: number}>; // Optional air capsules for each level
    enemies: Array<{
        x: number, 
        y: number, 
        type: 'enemy-one' | 'enemy-two' | 'basic',
        velocity: number,
        tint?: number
    }>;
    playerStart: {x: number, y: number};
    exit: {x: number, y: number};
    backgroundColor?: number;
    platformTint?: number;
}

export class LevelManager {
    static getCentralCavernLevel(): LevelConfig {
        return {
            name: 'Central Cavern',
            playerStart: {x: 100, y: 450},
            exit: {x: 400, y: 250}, // Center of the screen, middle level
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
                {x: 700, y: 260}, // Top right area - requires navigation to upper platforms
                {x: 270, y: 420}  // Mid-bottom area - accessible but requires backtracking
            ],
            enemies: [
                {x: 300, y: 550, type: 'enemy-one', velocity: 80},
                {x: 500, y: 260, type: 'enemy-two', velocity: -75},
                {x: 150, y: 340, type: 'basic', velocity: 60, tint: 0x8000ff},
                {x: 400, y: 420, type: 'basic', velocity: -80, tint: 0xff4080}
            ]
        };
    }
    
    static getUndergroundChamberLevel(): LevelConfig {
        return {
            name: 'Underground Chamber',
            playerStart: {x: 50, y: 520},
            exit: {x: 720, y: 100}, // Top right corner - harder to reach
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
                
                // Right side platforms - challenging jumps
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
                // Bottom area coins
                {x: 100, y: 564}, {x: 320, y: 564}, {x: 400, y: 564}, {x: 600, y: 564},
                // Staircase coins
                {x: 80, y: 500}, {x: 112, y: 440}, {x: 144, y: 380}, {x: 176, y: 320}, {x: 208, y: 260},
                // Center platform coins
                {x: 350, y: 430}, {x: 450, y: 430}, {x: 330, y: 300}, {x: 500, y: 360}, {x: 430, y: 230},
                // Right side coins - harder to reach
                {x: 640, y: 480}, {x: 590, y: 400}, {x: 690, y: 320}, {x: 620, y: 240}, {x: 680, y: 160},
                // Top area coins
                {x: 250, y: 100}, {x: 320, y: 100}, {x: 550, y: 100}, {x: 650, y: 100}
            ],
            airCapsules: [
                {x: 240, y: 320}, // Left side of staircase - mid-height
                {x: 650, y: 240}  // Right side upper area - requires difficult navigation
            ],
            enemies: [
                {x: 350, y: 550, type: 'enemy-one', velocity: -100},
                {x: 450, y: 230, type: 'enemy-two', velocity: 90},
                {x: 80, y: 320, type: 'basic', velocity: 70, tint: 0xff8000}, // Orange enemy
                {x: 620, y: 400, type: 'basic', velocity: -85, tint: 0x00ff80}, // Green enemy
                {x: 280, y: 100, type: 'basic', velocity: 60, tint: 0x8080ff}  // Light blue enemy
            ]
        };
    }

    static getArcticZoneLevel(): LevelConfig {
        return {
            name: 'Arctic Zone',
            backgroundColor: 0x001a4d, // Dark blue background
            platformTint: 0x4db8ff,    // Light blue platforms
            playerStart: {x: 50, y: 520},
            exit: {x: 400, y: 100}, // Top center - requires navigating the ice platforms
            platforms: [
                // Ground level - icy floor with gaps
                {x: 0, y: 584, width: 160},
                {x: 224, y: 584, width: 192},
                {x: 480, y: 584, width: 160},
                {x: 704, y: 584, width: 96},
                
                // Lower platforms - floating ice blocks
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
                
                // Top platforms - near exit
                {x: 96, y: 120, width: 128},
                {x: 288, y: 120, width: 224},
                {x: 576, y: 120, width: 128}
            ],
            collectibles: [
                // Ground level
                {x: 80, y: 564}, {x: 280, y: 564}, {x: 360, y: 564}, {x: 540, y: 564}, {x: 740, y: 564},
                // Lower platforms
                {x: 144, y: 480}, {x: 400, y: 500}, {x: 680, y: 480},
                // Mid-level
                {x: 80, y: 400}, {x: 272, y: 420}, {x: 480, y: 400}, {x: 688, y: 420},
                // Upper-mid
                {x: 176, y: 320}, {x: 368, y: 340}, {x: 528, y: 320}, {x: 728, y: 340},
                // High platforms
                {x: 112, y: 240}, {x: 280, y: 260}, {x: 464, y: 240}, {x: 632, y: 260},
                // Very high
                {x: 208, y: 160}, {x: 368, y: 180}, {x: 432, y: 180}, {x: 592, y: 160},
                // Top level
                {x: 144, y: 100}, {x: 336, y: 100}, {x: 400, y: 100}, {x: 464, y: 100}, {x: 624, y: 100}
            ],
            airCapsules: [
                {x: 100, y: 400}, // Lower left area - accessible early
                {x: 550, y: 240}  // Upper right area - requires vertical navigation
            ],
            enemies: [
                {x: 300, y: 550, type: 'enemy-one', velocity: -100},
                {x: 480, y: 400, type: 'enemy-two', velocity: 90},
                {x: 200, y: 320, type: 'basic', velocity: 70, tint: 0xaaffff}, // Ice white enemy
                {x: 500, y: 240, type: 'basic', velocity: -85, tint: 0x0080ff}, // Ice blue enemy
                {x: 370, y: 180, type: 'basic', velocity: 60, tint: 0x80c0ff}, // Light ice blue enemy
                {x: 650, y: 340, type: 'basic', velocity: -75, tint: 0x00ffff}  // Cyan enemy
            ]
        };
    }

    static createPlatforms(scene: Phaser.Scene, platforms: Phaser.Physics.Arcade.StaticGroup, levelConfig: LevelConfig) {
        const platformTint = levelConfig.platformTint || 0xff0000; // Default to red if not specified
        levelConfig.platforms.forEach(platform => {
            for (let x = platform.x; x < platform.x + platform.width; x += 32) {
                platforms.create(x + 16, platform.y, 'platform').setTint(platformTint);
            }
        });
    }
}
