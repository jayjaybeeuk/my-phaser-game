import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BiomeManager, BiomeType, BiomeConfig, BiomePhysics, BiomeVisuals } from '../src/systems/BiomeManager';

// Mock MusicManager to avoid Phaser dependencies
vi.mock('../src/systems/MusicManager', () => ({
    MusicManager: {
        shouldPlayAmbient: vi.fn(() => false),
    },
}));

describe('BiomeManager', () => {
    beforeEach(() => {
        // Reset any state between tests
        BiomeManager.cleanup();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('getBiome', () => {
        it('should return CAVERN biome configuration', () => {
            const biome = BiomeManager.getBiome(BiomeType.CAVERN);
            expect(biome.type).toBe(BiomeType.CAVERN);
            expect(biome.name).toBe('Cavern');
            expect(biome.description).toBeTruthy();
        });

        it('should return UNDERGROUND biome configuration', () => {
            const biome = BiomeManager.getBiome(BiomeType.UNDERGROUND);
            expect(biome.type).toBe(BiomeType.UNDERGROUND);
            expect(biome.name).toBe('Underground');
        });

        it('should return ARCTIC biome configuration', () => {
            const biome = BiomeManager.getBiome(BiomeType.ARCTIC);
            expect(biome.type).toBe(BiomeType.ARCTIC);
            expect(biome.name).toBe('Arctic');
            expect(biome.physics.friction).toBe(0.3); // Slippery
        });

        it('should return LAVA biome configuration', () => {
            const biome = BiomeManager.getBiome(BiomeType.LAVA);
            expect(biome.type).toBe(BiomeType.LAVA);
            expect(biome.name).toBe('Lava');
            expect(biome.physics.airDepletionRate).toBe(1.5); // Faster air depletion
        });

        it('should return FOREST biome configuration', () => {
            const biome = BiomeManager.getBiome(BiomeType.FOREST);
            expect(biome.type).toBe(BiomeType.FOREST);
            expect(biome.name).toBe('Forest');
            expect(biome.physics.gravity).toBe(0.9); // Lower gravity
        });

        it('should return CRYSTAL biome configuration', () => {
            const biome = BiomeManager.getBiome(BiomeType.CRYSTAL);
            expect(biome.type).toBe(BiomeType.CRYSTAL);
            expect(biome.name).toBe('Crystal');
            expect(biome.physics.playerSpeedMultiplier).toBe(1.1); // Faster
        });

        it('should return TOXIC biome configuration', () => {
            const biome = BiomeManager.getBiome(BiomeType.TOXIC);
            expect(biome.type).toBe(BiomeType.TOXIC);
            expect(biome.name).toBe('Toxic');
            expect(biome.physics.airDepletionRate).toBe(2.0); // Very fast air depletion
        });

        it('should return SLIME biome configuration', () => {
            const biome = BiomeManager.getBiome(BiomeType.SLIME);
            expect(biome.type).toBe(BiomeType.SLIME);
            expect(biome.name).toBe('Slime');
            expect(biome.physics.friction).toBe(0.5); // Slippery goo
            expect(biome.physics.gravity).toBe(0.9); // Slightly floaty
        });

        it('should fallback to CAVERN for unknown biome type', () => {
            const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const biome = BiomeManager.getBiome('unknown' as BiomeType);
            expect(biome.type).toBe(BiomeType.CAVERN);
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('getAllBiomeTypes', () => {
        it('should return all 8 biome types', () => {
            const types = BiomeManager.getAllBiomeTypes();
            expect(types).toHaveLength(8);
        });

        it('should include all defined biome types', () => {
            const types = BiomeManager.getAllBiomeTypes();
            expect(types).toContain(BiomeType.CAVERN);
            expect(types).toContain(BiomeType.UNDERGROUND);
            expect(types).toContain(BiomeType.ARCTIC);
            expect(types).toContain(BiomeType.LAVA);
            expect(types).toContain(BiomeType.FOREST);
            expect(types).toContain(BiomeType.CRYSTAL);
            expect(types).toContain(BiomeType.SLIME);
            expect(types).toContain(BiomeType.TOXIC);
        });
    });

    describe('getAllBiomes', () => {
        it('should return all 8 biome configurations', () => {
            const biomes = BiomeManager.getAllBiomes();
            expect(biomes).toHaveLength(8);
        });

        it('should return complete biome configs', () => {
            const biomes = BiomeManager.getAllBiomes();
            biomes.forEach(biome => {
                expect(biome.type).toBeTruthy();
                expect(biome.name).toBeTruthy();
                expect(biome.description).toBeTruthy();
                expect(biome.visuals).toBeDefined();
                expect(biome.physics).toBeDefined();
                expect(biome.audio).toBeDefined();
            });
        });
    });

    describe('biome visuals', () => {
        it('should have valid background colors', () => {
            const biomes = BiomeManager.getAllBiomes();
            biomes.forEach(biome => {
                expect(biome.visuals.backgroundColor).toBeTypeOf('number');
                expect(biome.visuals.backgroundColor).toBeGreaterThanOrEqual(0);
            });
        });

        it('should have brick textures defined', () => {
            const biomes = BiomeManager.getAllBiomes();
            biomes.forEach(biome => {
                expect(biome.visuals.brickTexture).toBeTruthy();
            });
        });

        it('should have correct brick textures for each biome', () => {
            expect(BiomeManager.getBiome(BiomeType.CAVERN).visuals.brickTexture).toBe('brick');
            expect(BiomeManager.getBiome(BiomeType.ARCTIC).visuals.brickTexture).toBe('brick-ice');
            expect(BiomeManager.getBiome(BiomeType.LAVA).visuals.brickTexture).toBe('brick-lava');
            expect(BiomeManager.getBiome(BiomeType.FOREST).visuals.brickTexture).toBe('brick-moss');
            expect(BiomeManager.getBiome(BiomeType.CRYSTAL).visuals.brickTexture).toBe('brick-crystal');
            expect(BiomeManager.getBiome(BiomeType.TOXIC).visuals.brickTexture).toBe('brick-toxic');
        });

        it('should have UI accent colors', () => {
            const biomes = BiomeManager.getAllBiomes();
            biomes.forEach(biome => {
                expect(biome.visuals.uiAccentColor).toBeTruthy();
                expect(biome.visuals.uiAccentColor).toMatch(/^#[0-9a-fA-F]{6}$/);
            });
        });
    });

    describe('biome physics', () => {
        it('should have friction values between 0 and 2', () => {
            const biomes = BiomeManager.getAllBiomes();
            biomes.forEach(biome => {
                expect(biome.physics.friction).toBeGreaterThan(0);
                expect(biome.physics.friction).toBeLessThanOrEqual(2);
            });
        });

        it('should have gravity values between 0.5 and 1.5', () => {
            const biomes = BiomeManager.getAllBiomes();
            biomes.forEach(biome => {
                expect(biome.physics.gravity).toBeGreaterThan(0.5);
                expect(biome.physics.gravity).toBeLessThanOrEqual(1.5);
            });
        });

        it('should have air depletion rates between 0.5 and 3', () => {
            const biomes = BiomeManager.getAllBiomes();
            biomes.forEach(biome => {
                expect(biome.physics.airDepletionRate).toBeGreaterThan(0.5);
                expect(biome.physics.airDepletionRate).toBeLessThanOrEqual(3);
            });
        });

        it('should have player speed multipliers between 0.5 and 1.5', () => {
            const biomes = BiomeManager.getAllBiomes();
            biomes.forEach(biome => {
                expect(biome.physics.playerSpeedMultiplier).toBeGreaterThan(0.5);
                expect(biome.physics.playerSpeedMultiplier).toBeLessThanOrEqual(1.5);
            });
        });

        it('ARCTIC should be the most slippery', () => {
            const arctic = BiomeManager.getBiome(BiomeType.ARCTIC);
            const biomes = BiomeManager.getAllBiomes();
            biomes.forEach(biome => {
                if (biome.type !== BiomeType.ARCTIC) {
                    expect(arctic.physics.friction).toBeLessThanOrEqual(biome.physics.friction);
                }
            });
        });

        it('TOXIC should have the fastest air depletion', () => {
            const toxic = BiomeManager.getBiome(BiomeType.TOXIC);
            const biomes = BiomeManager.getAllBiomes();
            biomes.forEach(biome => {
                if (biome.type !== BiomeType.TOXIC) {
                    expect(toxic.physics.airDepletionRate).toBeGreaterThanOrEqual(biome.physics.airDepletionRate);
                }
            });
        });
    });

    describe('biome audio', () => {
        it('should have ambient sound keys defined', () => {
            const biomes = BiomeManager.getAllBiomes();
            biomes.forEach(biome => {
                // Most biomes should have ambient sounds
                if (biome.audio.ambientSound) {
                    expect(biome.audio.ambientSound).toBeTruthy();
                }
            });
        });

        it('should have ambient volumes between 0 and 1', () => {
            const biomes = BiomeManager.getAllBiomes();
            biomes.forEach(biome => {
                if (biome.audio.ambientVolume !== undefined) {
                    expect(biome.audio.ambientVolume).toBeGreaterThanOrEqual(0);
                    expect(biome.audio.ambientVolume).toBeLessThanOrEqual(1);
                }
            });
        });
    });

    describe('isSlipperySurface', () => {
        it('should return true for ice texture', () => {
            expect(BiomeManager.isSlipperySurface('brick-ice')).toBe(true);
        });

        it('should return true for moss texture', () => {
            expect(BiomeManager.isSlipperySurface('brick-moss')).toBe(true);
        });

        it('should return true for toxic texture', () => {
            expect(BiomeManager.isSlipperySurface('brick-toxic')).toBe(true);
        });

        it('should return false for regular brick', () => {
            expect(BiomeManager.isSlipperySurface('brick')).toBe(false);
        });

        it('should return false for lava texture', () => {
            expect(BiomeManager.isSlipperySurface('brick-lava')).toBe(false);
        });

        it('should return false for unknown texture', () => {
            expect(BiomeManager.isSlipperySurface('unknown-texture')).toBe(false);
        });
    });

    describe('getFrictionForTexture', () => {
        it('should return 1.0 for regular brick', () => {
            expect(BiomeManager.getFrictionForTexture('brick')).toBe(1.0);
        });

        it('should return 0.3 for ice brick', () => {
            expect(BiomeManager.getFrictionForTexture('brick-ice')).toBe(0.3);
        });

        it('should return 1.2 for lava brick', () => {
            expect(BiomeManager.getFrictionForTexture('brick-lava')).toBe(1.2);
        });

        it('should return 0.8 for moss brick', () => {
            expect(BiomeManager.getFrictionForTexture('brick-moss')).toBe(0.8);
        });

        it('should return 1.0 for crystal brick', () => {
            expect(BiomeManager.getFrictionForTexture('brick-crystal')).toBe(1.0);
        });

        it('should return 0.7 for toxic brick', () => {
            expect(BiomeManager.getFrictionForTexture('brick-toxic')).toBe(0.7);
        });

        it('should return 1.0 for unknown texture', () => {
            expect(BiomeManager.getFrictionForTexture('unknown')).toBe(1.0);
        });
    });

    describe('getCurrentBiome', () => {
        it('should return null initially', () => {
            expect(BiomeManager.getCurrentBiome()).toBeNull();
        });
    });

    describe('cleanup', () => {
        it('should not throw when called multiple times', () => {
            expect(() => {
                BiomeManager.cleanup();
                BiomeManager.cleanup();
                BiomeManager.cleanup();
            }).not.toThrow();
        });

        it('should reset current biome to null', () => {
            BiomeManager.cleanup();
            expect(BiomeManager.getCurrentBiome()).toBeNull();
        });
    });

    describe('registerBiome', () => {
        it('should allow registering a custom biome', () => {
            const customBiome: BiomeConfig = {
                type: 'custom' as BiomeType,
                name: 'Custom',
                description: 'A custom test biome',
                visuals: {
                    backgroundColor: 0x123456,
                    brickTexture: 'brick-custom',
                    uiAccentColor: '#ffffff',
                },
                physics: {
                    friction: 1.0,
                    gravity: 1.0,
                    airDepletionRate: 1.0,
                    playerSpeedMultiplier: 1.0,
                },
                audio: {},
            };

            BiomeManager.registerBiome(customBiome);
            const retrieved = BiomeManager.getBiome('custom' as BiomeType);
            expect(retrieved.name).toBe('Custom');
        });
    });

    describe('ambient particles', () => {
        it('ARCTIC should have snow particles', () => {
            const arctic = BiomeManager.getBiome(BiomeType.ARCTIC);
            expect(arctic.visuals.ambientParticles).toBe('snow');
        });

        it('LAVA should have ember particles', () => {
            const lava = BiomeManager.getBiome(BiomeType.LAVA);
            expect(lava.visuals.ambientParticles).toBe('embers');
        });

        it('FOREST should have spore particles', () => {
            const forest = BiomeManager.getBiome(BiomeType.FOREST);
            expect(forest.visuals.ambientParticles).toBe('spores');
        });

        it('TOXIC should have bubble particles', () => {
            const toxic = BiomeManager.getBiome(BiomeType.TOXIC);
            expect(toxic.visuals.ambientParticles).toBe('bubbles');
        });

        it('CRYSTAL should have sparkle particles', () => {
            const crystal = BiomeManager.getBiome(BiomeType.CRYSTAL);
            expect(crystal.visuals.ambientParticles).toBe('sparkles');
        });

        it('UNDERGROUND should have drip particles', () => {
            const underground = BiomeManager.getBiome(BiomeType.UNDERGROUND);
            expect(underground.visuals.ambientParticles).toBe('drips');
        });
    });

    describe('fog effects', () => {
        it('ARCTIC should have fog', () => {
            const arctic = BiomeManager.getBiome(BiomeType.ARCTIC);
            expect(arctic.visuals.fogColor).toBeDefined();
            expect(arctic.visuals.fogOpacity).toBeDefined();
            expect(arctic.visuals.fogOpacity).toBeGreaterThan(0);
        });

        it('LAVA should have fog', () => {
            const lava = BiomeManager.getBiome(BiomeType.LAVA);
            expect(lava.visuals.fogColor).toBeDefined();
            expect(lava.visuals.fogOpacity).toBeDefined();
        });

        it('CAVERN should not have fog', () => {
            const cavern = BiomeManager.getBiome(BiomeType.CAVERN);
            expect(cavern.visuals.fogColor).toBeUndefined();
        });
    });
});
