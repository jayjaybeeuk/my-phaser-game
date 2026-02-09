import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BiomeManager, BiomeType, BiomeConfig } from '../src/systems/BiomeManager';
import { MusicManager } from '../src/systems/MusicManager';

// Mock MusicManager to avoid Phaser dependencies
vi.mock('../src/systems/MusicManager', () => ({
    MusicManager: {
        shouldPlayAmbient: vi.fn(() => false),
    },
}));

const mockedShouldPlayAmbient = MusicManager.shouldPlayAmbient as unknown as ReturnType<typeof vi.fn>;

/**
 * Create a mock Phaser.Scene for testing Phaser-dependent BiomeManager methods
 */
function createMockScene() {
    const mockGraphics = {
        fillStyle: vi.fn().mockReturnThis(),
        fillRoundedRect: vi.fn().mockReturnThis(),
        lineStyle: vi.fn().mockReturnThis(),
        strokeRoundedRect: vi.fn().mockReturnThis(),
        fillCircle: vi.fn().mockReturnThis(),
        strokeCircle: vi.fn().mockReturnThis(),
        fillRect: vi.fn().mockReturnThis(),
        generateTexture: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
        clear: vi.fn(),
    };

    const mockRectangle = {
        setDepth: vi.fn().mockReturnThis(),
        setScrollFactor: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
    };

    const mockParticles = {
        setDepth: vi.fn().mockReturnThis(),
        destroy: vi.fn(),
    };

    const mockSound = {
        play: vi.fn(),
        stop: vi.fn(),
        pause: vi.fn(),
        isPlaying: true,
        setVolume: vi.fn(),
    };

    const mockScene = {
        cameras: {
            main: {
                setBackgroundColor: vi.fn(),
            },
        },
        add: {
            rectangle: vi.fn(() => mockRectangle),
            graphics: vi.fn(() => mockGraphics),
            particles: vi.fn(() => mockParticles),
        },
        sound: {
            add: vi.fn(() => mockSound),
        },
        cache: {
            audio: {
                exists: vi.fn(() => true),
            },
        },
    };

    return { mockScene, mockGraphics, mockRectangle, mockParticles, mockSound };
}

describe('BiomeManager', () => {
    beforeEach(() => {
        // Reset any state between tests
        BiomeManager.cleanup();
    });

    afterEach(() => {
        // Ensure ambientSound is null or has stop() to avoid cleanup errors
        const sound = (BiomeManager as any).ambientSound;
        if (sound && typeof sound.stop !== 'function') {
            (BiomeManager as any).ambientSound = null;
        }
        BiomeManager.cleanup();
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

        it('should return true for slime texture', () => {
            expect(BiomeManager.isSlipperySurface('brick-slime')).toBe(true);
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

        it('should return 0.5 for slime brick', () => {
            expect(BiomeManager.getFrictionForTexture('brick-slime')).toBe(0.5);
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

        it('should stop and clean up ambient sound', () => {
            const mockSound = { stop: vi.fn(), pause: vi.fn(), play: vi.fn(), isPlaying: true };
            (BiomeManager as any).ambientSound = mockSound;

            BiomeManager.cleanup();

            expect(mockSound.stop).toHaveBeenCalled();
            expect((BiomeManager as any).ambientSound).toBeNull();
        });

        it('should destroy and clean up particle emitter', () => {
            const mockEmitter = { destroy: vi.fn() };
            (BiomeManager as any).particleEmitter = mockEmitter;

            BiomeManager.cleanup();

            expect(mockEmitter.destroy).toHaveBeenCalled();
            expect((BiomeManager as any).particleEmitter).toBeNull();
        });

        it('should destroy and clean up fog overlay', () => {
            const mockFog = { destroy: vi.fn() };
            (BiomeManager as any).fogOverlay = mockFog;

            BiomeManager.cleanup();

            expect(mockFog.destroy).toHaveBeenCalled();
            expect((BiomeManager as any).fogOverlay).toBeNull();
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

        it('SLIME should have blob particles', () => {
            const slime = BiomeManager.getBiome(BiomeType.SLIME);
            expect(slime.visuals.ambientParticles).toBe('blobs');
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

        it('CRYSTAL should have fog', () => {
            const crystal = BiomeManager.getBiome(BiomeType.CRYSTAL);
            expect(crystal.visuals.fogColor).toBeDefined();
            expect(crystal.visuals.fogOpacity).toBeDefined();
        });

        it('TOXIC should have fog', () => {
            const toxic = BiomeManager.getBiome(BiomeType.TOXIC);
            expect(toxic.visuals.fogColor).toBeDefined();
            expect(toxic.visuals.fogOpacity).toBeDefined();
        });

        it('SLIME should have fog', () => {
            const slime = BiomeManager.getBiome(BiomeType.SLIME);
            expect(slime.visuals.fogColor).toBeDefined();
            expect(slime.visuals.fogOpacity).toBeDefined();
        });
    });

    // ============================================================
    // Tests for Phaser-dependent methods using mocked scene objects
    // ============================================================

    describe('applyBiome', () => {
        it('should set background color on the scene camera', () => {
            const { mockScene } = createMockScene();
            BiomeManager.applyBiome(mockScene as any, BiomeType.CAVERN);
            expect(mockScene.cameras.main.setBackgroundColor).toHaveBeenCalledWith(0x000000);
        });

        it('should set currentBiome after applying', () => {
            const { mockScene } = createMockScene();
            BiomeManager.applyBiome(mockScene as any, BiomeType.ARCTIC);
            expect(BiomeManager.getCurrentBiome()?.type).toBe(BiomeType.ARCTIC);
        });

        it('should return the biome config', () => {
            const { mockScene } = createMockScene();
            const result = BiomeManager.applyBiome(mockScene as any, BiomeType.LAVA);
            expect(result.type).toBe(BiomeType.LAVA);
            expect(result.name).toBe('Lava');
        });

        it('should create fog overlay for biomes with fog', () => {
            const { mockScene, mockRectangle } = createMockScene();
            BiomeManager.applyBiome(mockScene as any, BiomeType.ARCTIC);
            expect(mockScene.add.rectangle).toHaveBeenCalled();
            expect(mockRectangle.setDepth).toHaveBeenCalledWith(5);
            expect(mockRectangle.setScrollFactor).toHaveBeenCalledWith(0);
        });

        it('should not create fog overlay for CAVERN (no fog)', () => {
            const { mockScene } = createMockScene();
            BiomeManager.applyBiome(mockScene as any, BiomeType.CAVERN);
            expect(mockScene.add.rectangle).not.toHaveBeenCalled();
        });

        it('should create ambient particles for biomes with particles', () => {
            const { mockScene, mockGraphics } = createMockScene();
            BiomeManager.applyBiome(mockScene as any, BiomeType.ARCTIC);
            expect(mockScene.add.graphics).toHaveBeenCalled();
            expect(mockScene.add.particles).toHaveBeenCalled();
            expect(mockGraphics.destroy).toHaveBeenCalled();
        });

        it('should not create particles for CAVERN (no ambient particles)', () => {
            const { mockScene } = createMockScene();
            BiomeManager.applyBiome(mockScene as any, BiomeType.CAVERN);
            // graphics is not called for particle creation (CAVERN has no ambientParticles)
            expect(mockScene.add.particles).not.toHaveBeenCalled();
        });

        it('should attempt to play ambient sound when audio cache has it', () => {
            const { mockScene, mockSound } = createMockScene();
            mockedShouldPlayAmbient.mockReturnValueOnce(true);

            BiomeManager.applyBiome(mockScene as any, BiomeType.CAVERN);

            expect(mockScene.cache.audio.exists).toHaveBeenCalledWith('cavern-ambient');
            expect(mockScene.sound.add).toHaveBeenCalled();
            expect(mockSound.play).toHaveBeenCalled();
        });

        it('should not play ambient sound when music is playing', () => {
            const { mockScene, mockSound } = createMockScene();
            mockedShouldPlayAmbient.mockReturnValueOnce(false);

            BiomeManager.applyBiome(mockScene as any, BiomeType.CAVERN);

            expect(mockSound.play).not.toHaveBeenCalled();
        });

        it('should handle missing audio cache gracefully', () => {
            const { mockScene } = createMockScene();
            mockScene.cache.audio.exists.mockReturnValue(false);

            expect(() => BiomeManager.applyBiome(mockScene as any, BiomeType.CAVERN)).not.toThrow();
            expect(mockScene.sound.add).not.toHaveBeenCalled();
        });

        it('should handle audio errors gracefully', () => {
            const { mockScene } = createMockScene();
            mockScene.cache.audio.exists.mockImplementation(() => {
                throw new Error('Audio error');
            });

            expect(() => BiomeManager.applyBiome(mockScene as any, BiomeType.CAVERN)).not.toThrow();
        });

        it('should clean up existing fog when applying a new biome', () => {
            const { mockScene, mockRectangle } = createMockScene();
            // Apply Arctic first (has fog)
            BiomeManager.applyBiome(mockScene as any, BiomeType.ARCTIC);
            const destroyCalls = mockRectangle.destroy.mock.calls.length;

            // Apply another biome with fog
            BiomeManager.applyBiome(mockScene as any, BiomeType.LAVA);
            expect(mockRectangle.destroy.mock.calls.length).toBeGreaterThan(destroyCalls);
        });

        it('should clean up existing particles when applying a new biome', () => {
            const { mockScene, mockParticles } = createMockScene();
            BiomeManager.applyBiome(mockScene as any, BiomeType.ARCTIC);
            const destroyCalls = mockParticles.destroy.mock.calls.length;

            BiomeManager.applyBiome(mockScene as any, BiomeType.LAVA);
            expect(mockParticles.destroy.mock.calls.length).toBeGreaterThan(destroyCalls);
        });

        it('should apply each biome type without errors', () => {
            const biomeTypes = BiomeManager.getAllBiomeTypes();
            biomeTypes.forEach(type => {
                const { mockScene } = createMockScene();
                expect(() => BiomeManager.applyBiome(mockScene as any, type)).not.toThrow();
                BiomeManager.cleanup();
            });
        });
    });

    describe('particle creation for each biome type', () => {
        it('should generate snow particle texture for ARCTIC', () => {
            const { mockScene, mockGraphics } = createMockScene();
            BiomeManager.applyBiome(mockScene as any, BiomeType.ARCTIC);
            expect(mockGraphics.fillCircle).toHaveBeenCalled();
            expect(mockGraphics.generateTexture).toHaveBeenCalledWith('particle-snow', 4, 4);
        });

        it('should generate ember particle texture for LAVA', () => {
            const { mockScene, mockGraphics } = createMockScene();
            BiomeManager.applyBiome(mockScene as any, BiomeType.LAVA);
            expect(mockGraphics.fillCircle).toHaveBeenCalled();
            expect(mockGraphics.generateTexture).toHaveBeenCalledWith('particle-ember', 6, 6);
        });

        it('should generate spore particle texture for FOREST', () => {
            const { mockScene, mockGraphics } = createMockScene();
            BiomeManager.applyBiome(mockScene as any, BiomeType.FOREST);
            expect(mockGraphics.fillCircle).toHaveBeenCalled();
            expect(mockGraphics.generateTexture).toHaveBeenCalledWith('particle-spore', 3, 3);
        });

        it('should generate bubble particle texture for TOXIC', () => {
            const { mockScene, mockGraphics } = createMockScene();
            BiomeManager.applyBiome(mockScene as any, BiomeType.TOXIC);
            expect(mockGraphics.strokeCircle).toHaveBeenCalled();
            expect(mockGraphics.generateTexture).toHaveBeenCalledWith('particle-bubble', 8, 8);
        });

        it('should generate sparkle particle texture for CRYSTAL', () => {
            const { mockScene, mockGraphics } = createMockScene();
            BiomeManager.applyBiome(mockScene as any, BiomeType.CRYSTAL);
            expect(mockGraphics.fillRect).toHaveBeenCalled();
            expect(mockGraphics.generateTexture).toHaveBeenCalledWith('particle-sparkle', 5, 5);
        });

        it('should generate drip particle texture for UNDERGROUND', () => {
            const { mockScene, mockGraphics } = createMockScene();
            BiomeManager.applyBiome(mockScene as any, BiomeType.UNDERGROUND);
            expect(mockGraphics.fillRect).toHaveBeenCalled();
            expect(mockGraphics.generateTexture).toHaveBeenCalledWith('particle-drip', 4, 6);
        });

        it('should generate blob particle texture for SLIME', () => {
            const { mockScene, mockGraphics } = createMockScene();
            BiomeManager.applyBiome(mockScene as any, BiomeType.SLIME);
            expect(mockGraphics.fillCircle).toHaveBeenCalled();
            expect(mockGraphics.generateTexture).toHaveBeenCalledWith('particle-blob', 10, 10);
        });
    });

    describe('stopAmbientSound', () => {
        it('should stop the ambient sound when it exists', () => {
            const mockSound = { stop: vi.fn(), isPlaying: true };
            (BiomeManager as any).ambientSound = mockSound;

            BiomeManager.stopAmbientSound();

            expect(mockSound.stop).toHaveBeenCalled();
        });

        it('should not throw when no ambient sound exists', () => {
            (BiomeManager as any).ambientSound = null;
            expect(() => BiomeManager.stopAmbientSound()).not.toThrow();
        });

        it('should keep the sound reference after stopping (for resume)', () => {
            const mockSound = { stop: vi.fn(), isPlaying: true };
            (BiomeManager as any).ambientSound = mockSound;

            BiomeManager.stopAmbientSound();

            // Sound reference should be kept (not nulled) for potential resume
            expect((BiomeManager as any).ambientSound).toBe(mockSound);
        });
    });

    describe('pauseAmbientSound', () => {
        it('should pause playing ambient sound', () => {
            const mockSound = { pause: vi.fn(), isPlaying: true };
            (BiomeManager as any).ambientSound = mockSound;

            BiomeManager.pauseAmbientSound();

            expect(mockSound.pause).toHaveBeenCalled();
        });

        it('should not pause when sound is not playing', () => {
            const mockSound = { pause: vi.fn(), isPlaying: false };
            (BiomeManager as any).ambientSound = mockSound;

            BiomeManager.pauseAmbientSound();

            expect(mockSound.pause).not.toHaveBeenCalled();
        });

        it('should not throw when no ambient sound exists', () => {
            (BiomeManager as any).ambientSound = null;
            expect(() => BiomeManager.pauseAmbientSound()).not.toThrow();
        });
    });

    describe('resumeAmbientSound', () => {
        it('should resume stopped ambient sound', () => {
            const mockSound = { play: vi.fn(), isPlaying: false };
            (BiomeManager as any).ambientSound = mockSound;

            BiomeManager.resumeAmbientSound();

            expect(mockSound.play).toHaveBeenCalled();
        });

        it('should not play when sound is already playing', () => {
            const mockSound = { play: vi.fn(), isPlaying: true };
            (BiomeManager as any).ambientSound = mockSound;

            BiomeManager.resumeAmbientSound();

            expect(mockSound.play).not.toHaveBeenCalled();
        });

        it('should not throw when no ambient sound exists', () => {
            (BiomeManager as any).ambientSound = null;
            expect(() => BiomeManager.resumeAmbientSound()).not.toThrow();
        });
    });

    describe('setAmbientVolume', () => {
        it('should set volume when sound exists and has setVolume', () => {
            const mockSound = { setVolume: vi.fn() };
            (BiomeManager as any).ambientSound = mockSound;

            BiomeManager.setAmbientVolume(0.5);

            expect(mockSound.setVolume).toHaveBeenCalledWith(0.5);
        });

        it('should not throw when no ambient sound exists', () => {
            (BiomeManager as any).ambientSound = null;
            expect(() => BiomeManager.setAmbientVolume(0.5)).not.toThrow();
        });

        it('should not throw when sound has no setVolume method', () => {
            const mockSound = { stop: vi.fn() }; // needs stop for cleanup
            (BiomeManager as any).ambientSound = mockSound;
            expect(() => BiomeManager.setAmbientVolume(0.5)).not.toThrow();
        });
    });

    describe('getParticleConfig (private)', () => {
        const getParticleConfig = (type: string) => (BiomeManager as any).getParticleConfig(type);

        it('should return snow config with downward movement', () => {
            const config = getParticleConfig('snow');
            expect(config.y).toBe(-10);
            expect(config.quantity).toBe(2);
            expect(config.frequency).toBe(80);
        });

        it('should return embers config with upward movement', () => {
            const config = getParticleConfig('embers');
            expect(config.y).toBe(610);
            expect(config.lifespan).toBe(3000);
        });

        it('should return spores config with floating movement', () => {
            const config = getParticleConfig('spores');
            expect(config.lifespan).toBe(6000);
            expect(config.frequency).toBe(200);
        });

        it('should return bubbles config with upward movement', () => {
            const config = getParticleConfig('bubbles');
            expect(config.y).toBe(610);
            expect(config.frequency).toBe(200);
        });

        it('should return sparkles config with short lifespan', () => {
            const config = getParticleConfig('sparkles');
            expect(config.lifespan).toBe(1500);
            expect(config.frequency).toBe(120);
        });

        it('should return drips config with downward movement', () => {
            const config = getParticleConfig('drips');
            expect(config.y).toBe(-10);
            expect(config.lifespan).toBe(5000);
            expect(config.frequency).toBe(300);
        });

        it('should return blobs config with slow downward movement', () => {
            const config = getParticleConfig('blobs');
            expect(config.y).toBe(-10);
            expect(config.lifespan).toBe(6000);
            expect(config.frequency).toBe(250);
        });

        it('should return default base config for unknown particle type', () => {
            const config = getParticleConfig('unknown');
            expect(config.lifespan).toBe(4000);
            expect(config.quantity).toBe(1);
            expect(config.frequency).toBe(100);
        });
    });

    describe('playAmbientSound (via applyBiome)', () => {
        it('should stop existing ambient sound before playing new one', () => {
            const oldSound = { stop: vi.fn(), isPlaying: true };
            (BiomeManager as any).ambientSound = oldSound;

            const { mockScene } = createMockScene();
            BiomeManager.applyBiome(mockScene as any, BiomeType.ARCTIC);

            expect(oldSound.stop).toHaveBeenCalled();
        });

        it('should handle ambient sound with no soundKey gracefully', () => {
            // Register a biome with no ambient sound
            const silentBiome: BiomeConfig = {
                type: 'silent' as BiomeType,
                name: 'Silent',
                description: 'No sound',
                visuals: { backgroundColor: 0, brickTexture: 'brick', uiAccentColor: '#ffffff' },
                physics: { friction: 1, gravity: 1, airDepletionRate: 1, playerSpeedMultiplier: 1 },
                audio: {},
            };
            BiomeManager.registerBiome(silentBiome);

            const { mockScene } = createMockScene();
            expect(() => BiomeManager.applyBiome(mockScene as any, 'silent' as BiomeType)).not.toThrow();
        });
    });

    describe('complete biome data validation', () => {
        it('UNDERGROUND should have platform tint', () => {
            const biome = BiomeManager.getBiome(BiomeType.UNDERGROUND);
            expect(biome.visuals.platformTint).toBe(0x888899);
        });

        it('FOREST should have platform tint', () => {
            const biome = BiomeManager.getBiome(BiomeType.FOREST);
            expect(biome.visuals.platformTint).toBe(0x44aa44);
        });

        it('TOXIC should have platform tint', () => {
            const biome = BiomeManager.getBiome(BiomeType.TOXIC);
            expect(biome.visuals.platformTint).toBe(0x88ff00);
        });

        it('SLIME should have platform tint', () => {
            const biome = BiomeManager.getBiome(BiomeType.SLIME);
            expect(biome.visuals.platformTint).toBe(0x44dd66);
        });

        it('CAVERN should not have platform tint', () => {
            const biome = BiomeManager.getBiome(BiomeType.CAVERN);
            expect(biome.visuals.platformTint).toBeUndefined();
        });

        it('all standard biomes should have ambient sound defined', () => {
            const standardTypes = [
                BiomeType.CAVERN, BiomeType.UNDERGROUND, BiomeType.ARCTIC,
                BiomeType.LAVA, BiomeType.FOREST, BiomeType.CRYSTAL,
                BiomeType.TOXIC, BiomeType.SLIME,
            ];
            standardTypes.forEach(type => {
                const biome = BiomeManager.getBiome(type);
                expect(biome.audio.ambientSound).toBeTruthy();
            });
        });

        it('all standard biomes should have particle colors defined when particles are set', () => {
            const standardTypes = [
                BiomeType.CAVERN, BiomeType.UNDERGROUND, BiomeType.ARCTIC,
                BiomeType.LAVA, BiomeType.FOREST, BiomeType.CRYSTAL,
                BiomeType.TOXIC, BiomeType.SLIME,
            ];
            standardTypes.forEach(type => {
                const biome = BiomeManager.getBiome(type);
                if (biome.visuals.ambientParticles && biome.visuals.ambientParticles !== 'none') {
                    expect(biome.visuals.particleColor).toBeTypeOf('number');
                }
            });
        });

        it('LAVA should slow player movement', () => {
            const biome = BiomeManager.getBiome(BiomeType.LAVA);
            expect(biome.physics.playerSpeedMultiplier).toBe(0.9);
        });

        it('TOXIC should slow player movement', () => {
            const biome = BiomeManager.getBiome(BiomeType.TOXIC);
            expect(biome.physics.playerSpeedMultiplier).toBe(0.85);
        });

        it('SLIME should slightly slow player movement', () => {
            const biome = BiomeManager.getBiome(BiomeType.SLIME);
            expect(biome.physics.playerSpeedMultiplier).toBe(0.95);
        });

        it('CRYSTAL should speed up player movement', () => {
            const biome = BiomeManager.getBiome(BiomeType.CRYSTAL);
            expect(biome.physics.playerSpeedMultiplier).toBe(1.1);
        });
    });
});
