export interface LevelConfig {
    name: string;
    platforms: Array<{x: number, y: number, width: number}>;
    collectibles: Array<{x: number, y: number}>;
    enemies: Array<{
        x: number, 
        y: number, 
        type: 'enemy-one' | 'enemy-two' | 'basic',
        velocity: number,
        tint?: number
    }>;
    playerStart: {x: number, y: number};
    exit: {x: number, y: number};
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
                {x: 64, y: 120, width: 256},
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
            enemies: [
                {x: 300, y: 550, type: 'enemy-one', velocity: 80},
                {x: 500, y: 260, type: 'enemy-two', velocity: -75},
                {x: 150, y: 340, type: 'basic', velocity: 60, tint: 0x8000ff},
                {x: 400, y: 420, type: 'basic', velocity: -80, tint: 0xff4080}
            ]
        };
    }

    static createPlatforms(scene: Phaser.Scene, platforms: Phaser.Physics.Arcade.StaticGroup, levelConfig: LevelConfig) {
        levelConfig.platforms.forEach(platform => {
            for (let x = platform.x; x < platform.x + platform.width; x += 32) {
                platforms.create(x + 16, platform.y, 'platform').setTint(0xff0000);
            }
        });
    }
}
