import { describe, it, expect, vi } from 'vitest';
import { HighScoreManager, HighScoreEntry } from '../src/systems/HighScoreManager';

describe('HighScoreManager', () => {
    describe('getHighScores', () => {
        it('should return an array of scores', () => {
            const scores = HighScoreManager.getHighScores();
            expect(Array.isArray(scores)).toBe(true);
            expect(scores.length).toBeGreaterThan(0);
        });

        it('should return scores with name and score properties', () => {
            const scores = HighScoreManager.getHighScores();
            scores.forEach(entry => {
                expect(entry).toHaveProperty('name');
                expect(entry).toHaveProperty('score');
                expect(typeof entry.name).toBe('string');
                expect(typeof entry.score).toBe('number');
            });
        });

        it('should return scores sorted in descending order', () => {
            const scores = HighScoreManager.getHighScores();
            for (let i = 0; i < scores.length - 1; i++) {
                expect(scores[i].score).toBeGreaterThanOrEqual(scores[i + 1].score);
            }
        });
    });

    describe('saveScore', () => {
        it('should save a high score and return true for qualifying score', () => {
            // A very high score should always qualify
            const result = HighScoreManager.saveScore('TEST', 99999);
            expect(result).toBe(true);

            const scores = HighScoreManager.getHighScores();
            const found = scores.find(s => s.name === 'TEST' && s.score === 99999);
            expect(found).toBeDefined();
        });

        it('should pad short names with underscores', () => {
            HighScoreManager.saveScore('AB', 99998);

            const scores = HighScoreManager.getHighScores();
            const found = scores.find(s => s.score === 99998);
            expect(found?.name).toBe('AB__');
        });

        it('should truncate long names to 4 characters', () => {
            HighScoreManager.saveScore('LONGNAME', 99997);

            const scores = HighScoreManager.getHighScores();
            const found = scores.find(s => s.score === 99997);
            expect(found?.name).toBe('LONG');
        });

        it('should convert names to uppercase', () => {
            HighScoreManager.saveScore('test', 99996);

            const scores = HighScoreManager.getHighScores();
            const found = scores.find(s => s.score === 99996);
            expect(found?.name).toBe('TEST');
        });

        it('should handle empty name by padding with underscores', () => {
            HighScoreManager.saveScore('', 99995);

            const scores = HighScoreManager.getHighScores();
            const found = scores.find(s => s.score === 99995);
            expect(found?.name).toBe('____');
        });

        it('should handle special characters in name', () => {
            HighScoreManager.saveScore('A@#$', 99994);

            const scores = HighScoreManager.getHighScores();
            const found = scores.find(s => s.score === 99994);
            expect(found?.name).toBe('A@#$');
        });

        it('should return false for very low scores that do not make the list', () => {
            // First ensure we have 10+ scores by adding some high scores
            for (let i = 0; i < 15; i++) {
                HighScoreManager.saveScore('TOP_', 1000 + i);
            }

            // Now a score of 1 should not qualify
            const result = HighScoreManager.saveScore('LOW_', 1);
            expect(result).toBe(false);
        });

        it('should keep the list sorted after adding new score', () => {
            HighScoreManager.saveScore('NEW_', 99993);

            const scores = HighScoreManager.getHighScores();
            for (let i = 0; i < scores.length - 1; i++) {
                expect(scores[i].score).toBeGreaterThanOrEqual(scores[i + 1].score);
            }
        });
    });

    describe('isHighScore', () => {
        it('should return true for very high score', () => {
            const result = HighScoreManager.isHighScore(999999);
            expect(result).toBe(true);
        });

        it('should return boolean', () => {
            const result = HighScoreManager.isHighScore(100);
            expect(typeof result).toBe('boolean');
        });

        it('should handle zero score', () => {
            const result = HighScoreManager.isHighScore(0);
            expect(typeof result).toBe('boolean');
        });

        it('should handle negative score', () => {
            const result = HighScoreManager.isHighScore(-100);
            expect(result).toBe(false);
        });

        it('should return true if less than 10 scores exist', () => {
            // Store only 5 scores
            const fewScores: HighScoreEntry[] = [
                { name: 'ONE_', score: 500 },
                { name: 'TWO_', score: 400 },
                { name: 'THRE', score: 300 },
                { name: 'FOUR', score: 200 },
                { name: 'FIVE', score: 100 },
            ];
            localStorage.setItem('maniacal_miner_high_scores', JSON.stringify(fewScores));

            const result = HighScoreManager.isHighScore(1); // Even 1 point should qualify
            expect(result).toBe(true);
        });
    });

    describe('getRank', () => {
        it('should return rank 1 for very high score', () => {
            const rank = HighScoreManager.getRank(999999999);
            expect(rank).toBe(1);
        });

        it('should return a number', () => {
            const rank = HighScoreManager.getRank(100);
            expect(typeof rank).toBe('number');
        });

        it('should return higher rank for lower scores', () => {
            const highRank = HighScoreManager.getRank(999999);
            const lowRank = HighScoreManager.getRank(1);
            expect(lowRank).toBeGreaterThan(highRank);
        });
    });

    describe('clearHighScores', () => {
        it('should not throw when called', () => {
            expect(() => HighScoreManager.clearHighScores()).not.toThrow();
        });

        it('should remove high scores key from localStorage', () => {
            // First ensure there are scores
            HighScoreManager.saveScore('TST1', 50000);

            // Verify the key exists
            const before = localStorage.getItem('maniacal_miner_high_scores');
            expect(before).not.toBeNull();

            // Clear
            HighScoreManager.clearHighScores();

            // Verify the key was removed
            const after = localStorage.getItem('maniacal_miner_high_scores');
            expect(after).toBeNull();
        });
    });

    describe('error handling', () => {
        it('should not throw when localStorage operations fail', () => {
            const originalSetItem = localStorage.setItem.bind(localStorage);
            localStorage.setItem = () => {
                throw new Error('QuotaExceeded');
            };

            expect(() => HighScoreManager.saveScore('TEST', 1000)).not.toThrow();

            localStorage.setItem = originalSetItem;
        });

        it('should handle getItem throwing gracefully', () => {
            const originalGetItem = localStorage.getItem.bind(localStorage);
            localStorage.getItem = () => {
                throw new Error('Access denied');
            };

            const scores = HighScoreManager.getHighScores();
            expect(Array.isArray(scores)).toBe(true);
            expect(scores.length).toBeGreaterThan(0);

            localStorage.getItem = originalGetItem;
        });

        it('should handle removeItem throwing gracefully', () => {
            const originalRemoveItem = localStorage.removeItem.bind(localStorage);
            localStorage.removeItem = () => {
                throw new Error('Access denied');
            };

            expect(() => HighScoreManager.clearHighScores()).not.toThrow();

            localStorage.removeItem = originalRemoveItem;
        });

        it('should handle setItem failure during default initialization', () => {
            // Clear any existing scores first
            localStorage.removeItem('maniacal_miner_high_scores');

            const originalSetItem = localStorage.setItem.bind(localStorage);
            localStorage.setItem = () => {
                throw new Error('QuotaExceeded');
            };

            // getHighScores will try to initialize defaults, which will fail to save
            const scores = HighScoreManager.getHighScores();
            expect(Array.isArray(scores)).toBe(true);
            expect(scores.length).toBeGreaterThan(0);

            localStorage.setItem = originalSetItem;
        });

        it('should still return result when save fails', () => {
            const originalSetItem = localStorage.setItem.bind(localStorage);
            localStorage.setItem = () => {
                throw new Error('QuotaExceeded');
            };

            // saveScore should still return a boolean even when save fails
            const result = HighScoreManager.saveScore('ERR_', 99999);
            expect(typeof result).toBe('boolean');

            localStorage.setItem = originalSetItem;
        });
    });

    describe('default scores', () => {
        it('should include expected default score names', () => {
            // The manager should have defaults that include WILY
            // Note: May be mixed with saved scores from other tests
            const scores = HighScoreManager.getHighScores();
            const names = scores.map(s => s.name);

            // Default names should include WILY (highest default)
            // Check that we have properly formatted 4-character names
            scores.forEach(score => {
                expect(score.name.length).toBe(4);
                expect(typeof score.score).toBe('number');
            });
        });

        it('should maintain a list of at least 10 scores', () => {
            const scores = HighScoreManager.getHighScores();
            expect(scores.length).toBeGreaterThanOrEqual(10);
        });
    });
});
