import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LevelManager, LevelConfig } from '../src/levels/LevelManager';
import { BiomeType, BiomeManager } from '../src/systems/BiomeManager';

// Mock MusicManager to avoid Phaser dependencies
vi.mock('../src/systems/MusicManager', () => ({
    MusicManager: {
        shouldPlayAmbient: vi.fn(() => false),
    },
}));

describe('LevelManager', () => {
    describe('getAllLevels', () => {
        it('should return 21 levels', () => {
            const levels = LevelManager.getAllLevels();
            expect(levels).toHaveLength(21);
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

        it('should return Central Cavern II level correctly', () => {
            const level = LevelManager.getCentralCavernIILevel();
            expect(level.name).toBe('Central Cavern II');
            expect(level.biome).toBe(BiomeType.CAVERN);
        });

        it('should return Frozen Wastes level correctly', () => {
            const level = LevelManager.getFrozenWastesLevel();
            expect(level.name).toBe('Frozen Wastes');
            expect(level.biome).toBe(BiomeType.ARCTIC);
        });

        it('should return Deep Roots level correctly', () => {
            const level = LevelManager.getDeepRootsLevel();
            expect(level.name).toBe('Deep Roots');
            expect(level.biome).toBe(BiomeType.FOREST);
        });

        it('should return Magma Falls level correctly', () => {
            const level = LevelManager.getMagmaFallsLevel();
            expect(level.name).toBe('Magma Falls');
            expect(level.biome).toBe(BiomeType.LAVA);
        });

        it('should return Amethyst Depths level correctly', () => {
            const level = LevelManager.getAmethystDepthsLevel();
            expect(level.name).toBe('Amethyst Depths');
            expect(level.biome).toBe(BiomeType.CRYSTAL);
        });

        it('should return Acid Pits level correctly', () => {
            const level = LevelManager.getAcidPitsLevel();
            expect(level.name).toBe('Acid Pits');
            expect(level.biome).toBe(BiomeType.TOXIC);
        });

        it('should return The Abyss level correctly', () => {
            const level = LevelManager.getTheAbyssLevel();
            expect(level.name).toBe('The Abyss');
            expect(level.biome).toBe(BiomeType.UNDERGROUND);
        });

        it('should return Glacier Peak level correctly', () => {
            const level = LevelManager.getGlacierPeakLevel();
            expect(level.name).toBe('Glacier Peak');
            expect(level.biome).toBe(BiomeType.ARCTIC);
        });

        it('should return Inferno\'s Heart level correctly', () => {
            const level = LevelManager.getInfernosHeartLevel();
            expect(level.name).toBe("Inferno's Heart");
            expect(level.biome).toBe(BiomeType.LAVA);
        });

        it('should return Emerald Grove level correctly', () => {
            const level = LevelManager.getEmeraldGroveLevel();
            expect(level.name).toBe('Emerald Grove');
            expect(level.biome).toBe(BiomeType.FOREST);
        });

        it('should return Diamond Spire level correctly', () => {
            const level = LevelManager.getDiamondSpireLevel();
            expect(level.name).toBe('Diamond Spire');
            expect(level.biome).toBe(BiomeType.CRYSTAL);
        });

        it('should return Biohazard Bay level correctly', () => {
            const level = LevelManager.getBiohazardBayLevel();
            expect(level.name).toBe('Biohazard Bay');
            expect(level.biome).toBe(BiomeType.TOXIC);
        });

        it('should return Slime Caverns level correctly', () => {
            const level = LevelManager.getSlimeCavernsLevel();
            expect(level.name).toBe('Slime Caverns');
            expect(level.biome).toBe(BiomeType.SLIME);
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

        it('should return correct biome for each biome type', () => {
            const arcticLevel = LevelManager.getArcticZoneLevel();
            expect(LevelManager.getBiomeForLevel(arcticLevel).type).toBe(BiomeType.ARCTIC);

            const lavaLevel = LevelManager.getMoltenCoreLevel();
            expect(LevelManager.getBiomeForLevel(lavaLevel).type).toBe(BiomeType.LAVA);

            const forestLevel = LevelManager.getMushroomGrottoLevel();
            expect(LevelManager.getBiomeForLevel(forestLevel).type).toBe(BiomeType.FOREST);
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

        it('should prioritize brickTexture over biome texture', () => {
            const levelWithBoth: LevelConfig = {
                name: 'Test',
                biome: BiomeType.ARCTIC,
                platforms: [],
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
                brickTexture: 'override-brick',
            };
            const texture = LevelManager.getBrickTexture(levelWithBoth);
            expect(texture).toBe('override-brick');
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

        it('should prioritize backgroundColor over biome color', () => {
            const levelWithBoth: LevelConfig = {
                name: 'Test',
                biome: BiomeType.ARCTIC,
                platforms: [],
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
                backgroundColor: 0xdeadbe,
            };
            const color = LevelManager.getBackgroundColor(levelWithBoth);
            expect(color).toBe(0xdeadbe);
        });

        it('should return 0 when backgroundColor is explicitly 0', () => {
            const levelWithZero: LevelConfig = {
                name: 'Test',
                biome: BiomeType.ARCTIC,
                platforms: [],
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
                backgroundColor: 0,
            };
            const color = LevelManager.getBackgroundColor(levelWithZero);
            // 0 is not undefined, so it should be returned
            expect(color).toBe(0);
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

        it('should include SLIME biome', () => {
            const levels = LevelManager.getAllLevels();
            const usedBiomes = new Set(levels.map(l => l.biome).filter(Boolean));
            expect(usedBiomes.has(BiomeType.SLIME)).toBe(true);
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

        it('should have air capsules on all 21 levels', () => {
            const levels = LevelManager.getAllLevels();
            levels.forEach(level => {
                expect(level.airCapsules).toBeDefined();
                expect(level.airCapsules!.length).toBeGreaterThan(0);
            });
        });
    });

    // ============================================================
    // Tests for Phaser-dependent methods using mocked scene objects
    // ============================================================

    describe('createPlatforms', () => {
        it('should create bricks for each platform segment', () => {
            const mockBrick = { setTint: vi.fn() };
            const mockPlatforms = {
                create: vi.fn(() => mockBrick),
            };
            const mockScene = {} as any;

            const level: LevelConfig = {
                name: 'Test',
                biome: BiomeType.CAVERN,
                platforms: [{ x: 0, y: 584, width: 32 }], // 32px wide = 2 bricks at 16px each
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
            };

            LevelManager.createPlatforms(mockScene, mockPlatforms as any, level);

            // 32px / 16px = 2 bricks
            expect(mockPlatforms.create).toHaveBeenCalledTimes(2);
        });

        it('should use correct brick texture from biome', () => {
            const mockBrick = { setTint: vi.fn() };
            const mockPlatforms = {
                create: vi.fn(() => mockBrick),
            };

            const level: LevelConfig = {
                name: 'Test',
                biome: BiomeType.ARCTIC,
                platforms: [{ x: 0, y: 584, width: 16 }],
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
            };

            LevelManager.createPlatforms({} as any, mockPlatforms as any, level);

            expect(mockPlatforms.create).toHaveBeenCalledWith(8, 584, 'brick-ice');
        });

        it('should apply platform tint from biome', () => {
            const mockBrick = { setTint: vi.fn() };
            const mockPlatforms = {
                create: vi.fn(() => mockBrick),
            };

            const level: LevelConfig = {
                name: 'Test',
                biome: BiomeType.UNDERGROUND, // Has platformTint 0x888899
                platforms: [{ x: 0, y: 584, width: 16 }],
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
            };

            LevelManager.createPlatforms({} as any, mockPlatforms as any, level);

            expect(mockBrick.setTint).toHaveBeenCalledWith(0x888899);
        });

        it('should apply legacy platformTint over biome tint', () => {
            const mockBrick = { setTint: vi.fn() };
            const mockPlatforms = {
                create: vi.fn(() => mockBrick),
            };

            const level: LevelConfig = {
                name: 'Test',
                biome: BiomeType.UNDERGROUND,
                platforms: [{ x: 0, y: 584, width: 16 }],
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
                platformTint: 0xff0000,
            };

            LevelManager.createPlatforms({} as any, mockPlatforms as any, level);

            expect(mockBrick.setTint).toHaveBeenCalledWith(0xff0000);
        });

        it('should not apply tint when no biome or platformTint', () => {
            const mockBrick = { setTint: vi.fn() };
            const mockPlatforms = {
                create: vi.fn(() => mockBrick),
            };

            const level: LevelConfig = {
                name: 'Test',
                biome: BiomeType.CAVERN, // CAVERN has no platformTint
                platforms: [{ x: 0, y: 584, width: 16 }],
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
            };

            LevelManager.createPlatforms({} as any, mockPlatforms as any, level);

            expect(mockBrick.setTint).not.toHaveBeenCalled();
        });

        it('should handle level with no biome', () => {
            const mockBrick = { setTint: vi.fn() };
            const mockPlatforms = {
                create: vi.fn(() => mockBrick),
            };

            const level: LevelConfig = {
                name: 'Test',
                platforms: [{ x: 0, y: 584, width: 16 }],
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
            };

            LevelManager.createPlatforms({} as any, mockPlatforms as any, level);

            // Should use default 'brick' texture
            expect(mockPlatforms.create).toHaveBeenCalledWith(8, 584, 'brick');
        });
    });

    describe('applyBiomeToScene', () => {
        it('should apply biome effects for level with biome', () => {
            const mockScene = {
                cameras: { main: { setBackgroundColor: vi.fn() } },
                add: {
                    rectangle: vi.fn(() => ({
                        setDepth: vi.fn().mockReturnThis(),
                        setScrollFactor: vi.fn().mockReturnThis(),
                    })),
                    graphics: vi.fn(() => ({
                        fillStyle: vi.fn().mockReturnThis(),
                        fillCircle: vi.fn().mockReturnThis(),
                        generateTexture: vi.fn().mockReturnThis(),
                        destroy: vi.fn(),
                    })),
                    particles: vi.fn(() => ({
                        setDepth: vi.fn().mockReturnThis(),
                    })),
                },
                sound: { add: vi.fn(() => ({ play: vi.fn(), stop: vi.fn() })) },
                cache: { audio: { exists: vi.fn(() => false) } },
            };

            const level = LevelManager.getCentralCavernLevel();
            LevelManager.applyBiomeToScene(mockScene as any, level);

            expect(mockScene.cameras.main.setBackgroundColor).toHaveBeenCalled();
        });

        it('should set background color for legacy level without biome', () => {
            const mockScene = {
                cameras: { main: { setBackgroundColor: vi.fn() } },
            };

            const legacyLevel: LevelConfig = {
                name: 'Legacy',
                platforms: [],
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
                backgroundColor: 0x112233,
            };

            LevelManager.applyBiomeToScene(mockScene as any, legacyLevel);

            expect(mockScene.cameras.main.setBackgroundColor).toHaveBeenCalledWith(0x112233);
        });

        it('should use black for legacy level without backgroundColor', () => {
            const mockScene = {
                cameras: { main: { setBackgroundColor: vi.fn() } },
            };

            const legacyLevel: LevelConfig = {
                name: 'Legacy',
                platforms: [],
                collectibles: [],
                enemies: [],
                playerStart: { x: 0, y: 0 },
                exit: { x: 100, y: 100 },
            };

            LevelManager.applyBiomeToScene(mockScene as any, legacyLevel);

            expect(mockScene.cameras.main.setBackgroundColor).toHaveBeenCalledWith(0x000000);
        });
    });

    describe('cleanupBiome', () => {
        beforeEach(() => {
            BiomeManager.cleanup();
        });

        it('should call BiomeManager.cleanup', () => {
            const cleanupSpy = vi.spyOn(BiomeManager, 'cleanup');
            LevelManager.cleanupBiome();
            expect(cleanupSpy).toHaveBeenCalled();
            cleanupSpy.mockRestore();
        });

        it('should not throw when called multiple times', () => {
            expect(() => {
                LevelManager.cleanupBiome();
                LevelManager.cleanupBiome();
            }).not.toThrow();
        });
    });
});
