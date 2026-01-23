import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PlatformDetector } from '../src/utils/PlatformDetector';

describe('PlatformDetector', () => {
    // Save original values
    let originalUserAgent: string;
    let originalProcess: typeof process | undefined;

    beforeEach(() => {
        // Save originals
        originalUserAgent = navigator.userAgent;
        originalProcess = globalThis.process;

        // Reset to web browser defaults
        Object.defineProperty(navigator, 'userAgent', {
            value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            writable: true,
            configurable: true,
        });

        // Remove process to simulate browser
        Object.defineProperty(globalThis, 'process', {
            value: undefined,
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        // Restore originals
        Object.defineProperty(navigator, 'userAgent', {
            value: originalUserAgent,
            writable: true,
            configurable: true,
        });

        Object.defineProperty(globalThis, 'process', {
            value: originalProcess,
            writable: true,
            configurable: true,
        });
    });

    describe('isElectron', () => {
        it('should return false for regular web browser', () => {
            expect(PlatformDetector.isElectron()).toBe(false);
        });

        it('should return true when electron is in user agent', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Electron/28.0.0 Safari/537.36',
                writable: true,
                configurable: true,
            });

            expect(PlatformDetector.isElectron()).toBe(true);
        });

        it('should return true when process.versions.electron exists', () => {
            Object.defineProperty(globalThis, 'process', {
                value: {
                    versions: {
                        electron: '28.0.0',
                    },
                },
                writable: true,
                configurable: true,
            });

            expect(PlatformDetector.isElectron()).toBe(true);
        });

        it('should return false when process exists but no electron version', () => {
            Object.defineProperty(globalThis, 'process', {
                value: {
                    versions: {
                        node: '20.0.0',
                    },
                },
                writable: true,
                configurable: true,
            });

            expect(PlatformDetector.isElectron()).toBe(false);
        });

        it('should handle case-insensitive electron detection in user agent', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 ELECTRON/28.0.0',
                writable: true,
                configurable: true,
            });

            // The current implementation uses toLowerCase, so this should work
            expect(PlatformDetector.isElectron()).toBe(true);
        });
    });

    describe('isWeb', () => {
        it('should return true for regular web browser', () => {
            expect(PlatformDetector.isWeb()).toBe(true);
        });

        it('should return false when in Electron', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Mozilla/5.0 Electron/28.0.0',
                writable: true,
                configurable: true,
            });

            expect(PlatformDetector.isWeb()).toBe(false);
        });

        it('should return true when process exists but no electron', () => {
            Object.defineProperty(globalThis, 'process', {
                value: {
                    versions: {
                        node: '20.0.0',
                    },
                },
                writable: true,
                configurable: true,
            });

            expect(PlatformDetector.isWeb()).toBe(true);
        });
    });

    describe('isElectron and isWeb relationship', () => {
        it('isWeb should be the inverse of isElectron in browser context', () => {
            expect(PlatformDetector.isWeb()).toBe(!PlatformDetector.isElectron());
        });

        it('should return true for web and false for Electron in browser context', () => {
            expect(PlatformDetector.isElectron()).toBe(false);
            expect(PlatformDetector.isWeb()).toBe(true);
        });

        it('should return inverse values when Electron via process', () => {
            Object.defineProperty(globalThis, 'process', {
                value: {
                    versions: {
                        electron: '28.0.0',
                    },
                },
                writable: true,
                configurable: true,
            });

            const isElectron = PlatformDetector.isElectron();
            const isWeb = PlatformDetector.isWeb();

            expect(isElectron).toBe(true);
            expect(isWeb).toBe(false);
            expect(isElectron).not.toBe(isWeb);
        });
    });

    describe('edge cases', () => {
        it('should handle empty user agent string', () => {
            Object.defineProperty(navigator, 'userAgent', {
                value: '',
                writable: true,
                configurable: true,
            });

            expect(PlatformDetector.isElectron()).toBe(false);
            expect(PlatformDetector.isWeb()).toBe(true);
        });

        it('should handle process without versions object', () => {
            Object.defineProperty(globalThis, 'process', {
                value: {},
                writable: true,
                configurable: true,
            });

            expect(PlatformDetector.isElectron()).toBe(false);
        });

        it('should handle process.versions as non-object', () => {
            Object.defineProperty(globalThis, 'process', {
                value: {
                    versions: 'invalid',
                },
                writable: true,
                configurable: true,
            });

            expect(PlatformDetector.isElectron()).toBe(false);
        });

        it('should work when both indicators are present', () => {
            // Set both indicators
            Object.defineProperty(navigator, 'userAgent', {
                value: 'Electron/28.0.0',
                writable: true,
                configurable: true,
            });

            Object.defineProperty(globalThis, 'process', {
                value: {
                    versions: {
                        electron: '28.0.0',
                    },
                },
                writable: true,
                configurable: true,
            });

            expect(PlatformDetector.isElectron()).toBe(true);
        });
    });
});
