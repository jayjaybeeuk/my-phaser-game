import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateManager } from '../src/systems/GameStateManager';

describe('GameStateManager', () => {
    let gameState: GameStateManager;

    beforeEach(() => {
        gameState = new GameStateManager();
    });

    describe('initial state', () => {
        it('should start with game not won', () => {
            expect(gameState.isGameWon()).toBe(false);
        });

        it('should start with game not ended', () => {
            expect(gameState.isGameEnded()).toBe(false);
        });

        it('should start with 3 lives', () => {
            expect(gameState.getLives()).toBe(3);
        });

        it('should have max lives of 3', () => {
            expect(gameState.getMaxLives()).toBe(3);
        });

        it('should have lives remaining', () => {
            expect(gameState.hasLivesRemaining()).toBe(true);
        });
    });

    describe('loseLife', () => {
        it('should decrease lives by 1', () => {
            gameState.loseLife();
            expect(gameState.getLives()).toBe(2);
        });

        it('should return remaining lives', () => {
            const remaining = gameState.loseLife();
            expect(remaining).toBe(2);
        });

        it('should not go below 0 lives', () => {
            gameState.loseLife(); // 2
            gameState.loseLife(); // 1
            gameState.loseLife(); // 0
            gameState.loseLife(); // still 0
            expect(gameState.getLives()).toBe(0);
        });

        it('should correctly report no lives remaining after losing all', () => {
            gameState.loseLife();
            gameState.loseLife();
            gameState.loseLife();
            expect(gameState.hasLivesRemaining()).toBe(false);
        });
    });

    describe('resetLives', () => {
        it('should reset lives to max lives', () => {
            gameState.loseLife();
            gameState.loseLife();
            gameState.resetLives();
            expect(gameState.getLives()).toBe(3);
        });

        it('should report lives remaining after reset', () => {
            gameState.loseLife();
            gameState.loseLife();
            gameState.loseLife();
            gameState.resetLives();
            expect(gameState.hasLivesRemaining()).toBe(true);
        });
    });

    describe('setGameWon', () => {
        it('should set game as won', () => {
            gameState.setGameWon();
            expect(gameState.isGameWon()).toBe(true);
        });

        it('should also set game as ended', () => {
            gameState.setGameWon();
            expect(gameState.isGameEnded()).toBe(true);
        });
    });

    describe('setGameOver', () => {
        it('should set game as ended', () => {
            gameState.setGameOver();
            expect(gameState.isGameEnded()).toBe(true);
        });

        it('should not set game as won', () => {
            gameState.setGameOver();
            expect(gameState.isGameWon()).toBe(false);
        });
    });

    describe('reset', () => {
        it('should reset game won state', () => {
            gameState.setGameWon();
            gameState.reset();
            expect(gameState.isGameWon()).toBe(false);
        });

        it('should reset game ended state', () => {
            gameState.setGameOver();
            gameState.reset();
            expect(gameState.isGameEnded()).toBe(false);
        });

        it('should not reset lives (only game state)', () => {
            gameState.loseLife();
            gameState.reset();
            expect(gameState.getLives()).toBe(2); // Lives are not reset by reset()
        });
    });

    describe('edge cases', () => {
        it('should handle multiple resets', () => {
            gameState.setGameWon();
            gameState.reset();
            gameState.reset();
            expect(gameState.isGameWon()).toBe(false);
            expect(gameState.isGameEnded()).toBe(false);
        });

        it('should handle setGameWon after setGameOver', () => {
            gameState.setGameOver();
            gameState.setGameWon();
            expect(gameState.isGameWon()).toBe(true);
            expect(gameState.isGameEnded()).toBe(true);
        });
    });
});
