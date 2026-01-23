import { describe, it, expect } from 'vitest';
import { LevelManager, LevelConfig } from '../src/levels/LevelManager';
import { BiomeType } from '../src/systems/BiomeManager';

describe('LevelManager', () => {
    describe('getAllLevels', () => {
        it('should return 20 levels', () => {
            const levels = LevelManager.getAllLevels();
            expect(levels).toHaveLength(20);
        });

        it('should have unique level names', () => {
            const levels = LevelManager.getAllLevels();
            const names = levels.map(l => l.name);
            const uniqueNames = new Set(names);
            expect(uniqueNames.size).toBe(names.length);
        });

        it('should have all required properties on each level', () => {
            const levels = LevelManager.getAllLevels();
            levels.forEach((level, index) => {
                expect(level.name).toBeTruthy();
                expect(level.playerStart).toBeDefined();
                expect(level.playerStart.x).toBeTypeOf('number');
                expect(level.playerStart.y).toBeTypeOf('number');
                expect(level.exit).toBeDefined();
                expect(level.exit.x).toBeTypeOf('number');
                expect(level.exit.y).toBeTypeOf('number');
                expect(Array.isArray(level.platforms)).toBe(true);
                expect(Array.isArray(level.collectibles)).toBe(true);
                expect(Array.isArray(level.enemies)).toBe(true);
            });
        });
    });

    describe('individual level getters', () => {
        it('should return Central Cavern level correctly', () => {
            const level = LevelManager.getCentralCavernLevel();
            expect(level.name).toBe('Central Cavern');
            expect(level.biome).toBe(BiomeType.CAVERN);
        });

        it('should return Underground Chamber level correctly', () => {
            const level = LevelManager.getUndergroundChamberLevel();
            expect(level.name).toBe('Underground Chamber');
            expect(level.biome).toBe(BiomeType.UNDERGROUND);
        });

        it('should return Arctic Zone level correctly', () => {
            const level = LevelManager.getArcticZoneLevel();
            expect(level.name).toBe('Arctic Zone');
            expect(level.biome).toBe(BiomeType.ARCTIC);
        });

        it('should return Mushroom Grotto level correctly', () => {
            const level = LevelManager.getMushroomGrottoLevel();
            expect(level.name).toBe('Mushroom Grotto');
            expect(level.biome).toBe(BiomeType.FOREST);
        });

        it('should return Molten Core level correctly', () => {
            const level = LevelManager.getMoltenCoreLevel();
            expect(level.name).toBe('Molten Core');
            expect(level.biome).toBe(BiomeType.LAVA);
        });

        it('should return Crystal Caverns level correctly', () => {
            const level = LevelManager.getCrystalCavernsLevel();
            expect(level.name).toBe('Crystal Caverns');
            expect(level.biome).toBe(BiomeType.CRYSTAL);
        });

        it('should return Toxic Tunnels level correctly', () => {
            const level = LevelManager.getToxicTunnelsLevel();
            expect(level.name).toBe('Toxic Tunnels');
            expect(level.biome).toBe(BiomeType.TOXIC);
        });

        it('should return The Final Descent level correctly', () => {
            const level = LevelManager.getTheFinalDescentLevel();
            expect(level.name).toBe('The Final Descent');
            expect(level.biome).toBe(BiomeType.CAVERN);
        });
    });

    describe('getBiomeForLevel', () => {
        it('should return biome config for level with biome', () => {
            const level = LevelManager.getCentralCavernLevel();
            const biome = LevelManager.getBiomeForLevel(level);
            expect(biome.type).toBe(BiomeType.CAVERN);
        });

        it('should return CAVERN biome for level without biome', () => {
            const levelWithoutBiome: LevelConfig = {
                name: 'Test Level',
                platforms: [],
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
            };
            const biome = LevelManager.getBiomeForLevel(levelWithoutBiome);
            expect(biome.type).toBe(BiomeType.CAVERN);
        });
    });

    describe('getBrickTexture', () => {
        it('should return custom brickTexture if specified', () => {
            const levelWithCustomTexture: LevelConfig = {
                name: 'Test',
                platforms: [],
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
                brickTexture: 'custom-brick',
            };
            const texture = LevelManager.getBrickTexture(levelWithCustomTexture);
            expect(texture).toBe('custom-brick');
        });

        it('should return biome texture if biome specified', () => {
            const level = LevelManager.getArcticZoneLevel();
            const texture = LevelManager.getBrickTexture(level);
            expect(texture).toBe('brick-ice');
        });

        it('should return default brick texture as fallback', () => {
            const levelWithoutTexture: LevelConfig = {
                name: 'Test',
                platforms: [],
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
            };
            const texture = LevelManager.getBrickTexture(levelWithoutTexture);
            expect(texture).toBe('brick');
        });
    });

    describe('getBackgroundColor', () => {
        it('should return custom backgroundColor if specified', () => {
            const levelWithCustomColor: LevelConfig = {
                name: 'Test',
                platforms: [],
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
                backgroundColor: 0xff0000,
            };
            const color = LevelManager.getBackgroundColor(levelWithCustomColor);
            expect(color).toBe(0xff0000);
        });

        it('should return biome background color if biome specified', () => {
            const level = LevelManager.getArcticZoneLevel();
            const color = LevelManager.getBackgroundColor(level);
            expect(color).toBe(0x001a4d); // Arctic biome color
        });

        it('should return black as default', () => {
            const levelWithoutColor: LevelConfig = {
                name: 'Test',
                platforms: [],
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
            };
            const color = LevelManager.getBackgroundColor(levelWithoutColor);
            expect(color).toBe(0x000000);
        });
    });

    describe('level data integrity', () => {
        it('should have valid platform data for all levels', () => {
            const levels = LevelManager.getAllLevels();
            levels.forEach(level => {
                level.platforms.forEach(platform => {
                    expect(platform.x).toBeTypeOf('number');
                    expect(platform.y).toBeTypeOf('number');
                    expect(platform.width).toBeTypeOf('number');
                    expect(platform.width).toBeGreaterThan(0);
                });
            });
        });

        it('should have valid collectible positions for all levels', () => {
            const levels = LevelManager.getAllLevels();
            levels.forEach(level => {
                level.collectibles.forEach(collectible => {
                    expect(collectible.x).toBeTypeOf('number');
                    expect(collectible.y).toBeTypeOf('number');
                    expect(collectible.x).toBeGreaterThanOrEqual(0);
                    expect(collectible.y).toBeGreaterThanOrEqual(0);
                });
            });
        });

        it('should have valid enemy data for all levels', () => {
            const levels = LevelManager.getAllLevels();
            const validEnemyTypes = ['enemy-one', 'enemy-two', 'enemy-three', 'enemy-four', 'basic'];

            levels.forEach(level => {
                level.enemies.forEach(enemy => {
                    expect(enemy.x).toBeTypeOf('number');
                    expect(enemy.y).toBeTypeOf('number');
                    expect(enemy.velocity).toBeTypeOf('number');
                    expect(validEnemyTypes).toContain(enemy.type);
                });
            });
        });

        it('should have at least one platform on every level', () => {
            const levels = LevelManager.getAllLevels();
            levels.forEach(level => {
                expect(level.platforms.length).toBeGreaterThan(0);
            });
        });

        it('should have at least one collectible on every level', () => {
            const levels = LevelManager.getAllLevels();
            levels.forEach(level => {
                expect(level.collectibles.length).toBeGreaterThan(0);
            });
        });

        it('should have at least one enemy on every level', () => {
            const levels = LevelManager.getAllLevels();
            levels.forEach(level => {
                expect(level.enemies.length).toBeGreaterThan(0);
            });
        });
    });

    describe('level biome distribution', () => {
        it('should use all biome types across levels', () => {
            const levels = LevelManager.getAllLevels();
            const usedBiomes = new Set(levels.map(l => l.biome).filter(Boolean));

            // Check that all biome types are used
            expect(usedBiomes.has(BiomeType.CAVERN)).toBe(true);
            expect(usedBiomes.has(BiomeType.UNDERGROUND)).toBe(true);
            expect(usedBiomes.has(BiomeType.ARCTIC)).toBe(true);
            expect(usedBiomes.has(BiomeType.LAVA)).toBe(true);
            expect(usedBiomes.has(BiomeType.FOREST)).toBe(true);
            expect(usedBiomes.has(BiomeType.CRYSTAL)).toBe(true);
            expect(usedBiomes.has(BiomeType.TOXIC)).toBe(true);
        });
    });

    describe('air capsules', () => {
        it('should have air capsules defined on levels that have them', () => {
            const level = LevelManager.getCentralCavernLevel();
            expect(level.airCapsules).toBeDefined();
            expect(level.airCapsules?.length).toBeGreaterThan(0);
        });

        it('should have valid air capsule positions', () => {
            const levels = LevelManager.getAllLevels();
            levels.forEach(level => {
                if (level.airCapsules) {
                    level.airCapsules.forEach(capsule => {
                        expect(capsule.x).toBeTypeOf('number');
                        expect(capsule.y).toBeTypeOf('number');
                        expect(capsule.x).toBeGreaterThanOrEqual(0);
                        expect(capsule.y).toBeGreaterThanOrEqual(0);
                    });
                }
            });
        });
    });
});
