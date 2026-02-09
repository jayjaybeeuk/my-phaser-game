import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
        // Isolate tests to avoid shared state issues with localStorage
        isolate: true,
        pool: 'forks',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts'],
            exclude: [
                'src/index.ts', // Main entry point (Phaser config)
                'src/scenes/**/*.ts', // Scenes require Phaser runtime
                'src/objects/**/*.ts', // Game objects require Phaser runtime
                'src/assets/**/*.ts', // Asset loading requires Phaser
                'src/systems/MusicManager.ts', // Requires Phaser sound API
                'src/systems/UISystem.ts', // Requires Phaser scene API
                'src/systems/DebugMenu.ts', // Requires Phaser scene API
                'src/systems/TouchControls.ts', // Requires Phaser scene API for UI
                'src/constants/**/*.ts', // Just constants, no logic to test
            ],
            thresholds: {
                lines: 80,
                functions: 80,
                branches: 80,
                statements: 80,
            },
        },
    },
});
