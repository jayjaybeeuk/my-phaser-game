export interface HighScoreEntry {
    name: string;
    score: number;
}

export class HighScoreManager {
    private static readonly STORAGE_KEY = 'maniacal_miner_high_scores';
    private static readonly MAX_SCORES = 10;

    static saveScore(name: string, score: number): boolean {
        const scores = this.getHighScores();
        
        // Add new score
        scores.push({ name: name.toUpperCase().substring(0, 4).padEnd(4, '_'), score });
        
        // Sort by score (descending)
        scores.sort((a, b) => b.score - a.score);
        
        // Keep only top 10
        const topScores = scores.slice(0, this.MAX_SCORES);
        
        // Check if the new score made it into top 10
        const madeTopTen = topScores.some(entry => entry.name === name.toUpperCase().substring(0, 4).padEnd(4, '_') && entry.score === score);
        
        // Save to localStorage
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topScores));
        } catch (e) {
            console.error('Failed to save high scores:', e);
        }
        
        return madeTopTen;
    }

    static getHighScores(): HighScoreEntry[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Failed to load high scores:', e);
        }
        return [];
    }

    static isHighScore(score: number): boolean {
        const scores = this.getHighScores();
        
        // If we have less than 10 scores, it's automatically a high score
        if (scores.length < this.MAX_SCORES) {
            return true;
        }
        
        // Check if score is higher than the lowest top 10 score
        const lowestTopScore = scores[scores.length - 1].score;
        return score > lowestTopScore;
    }

    static getRank(score: number): number {
        const scores = this.getHighScores();
        
        // Find where this score would rank
        let rank = 1;
        for (const entry of scores) {
            if (score > entry.score) {
                break;
            }
            rank++;
        }
        
        return rank;
    }

    static clearHighScores(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (e) {
            console.error('Failed to clear high scores:', e);
        }
    }
}
