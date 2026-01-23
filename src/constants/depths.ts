/**
 * Depth constants for proper layering of game objects
 * Higher values appear in front of lower values
 */
export const DEPTHS = {
    // Background elements
    BACKGROUND: 0,
    LEVEL_BACKGROUND: 1,
    
    // Game world objects
    PLATFORMS: 10,
    COLLECTIBLES: 15,
    ENEMIES: 20,
    PLAYER: 25,
    
    // UI elements
    UI_BACKGROUND: 100,
    UI_TEXT: 101,
    UI_SCORE: 102,
    
    // Overlays and modals
    GAME_OVER_BACKGROUND: 200,
    GAME_OVER_TEXT: 201,
    LEVEL_COMPLETE_BACKGROUND: 200,
    LEVEL_COMPLETE_TEXT: 201,
    
    // Top-level overlays
    DEBUG_OVERLAY: 1000,
    LOADING_SCREEN: 2000
} as const;
