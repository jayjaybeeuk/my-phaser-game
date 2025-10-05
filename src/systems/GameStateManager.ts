export class GameStateManager {
    private gameWon: boolean = false;
    private gameEnded: boolean = false;
    private lives: number = 3;
    private maxLives: number = 3;

    isGameWon(): boolean {
        return this.gameWon;
    }

    isGameEnded(): boolean {
        return this.gameEnded;
    }
    
    getLives(): number {
        return this.lives;
    }
    
    getMaxLives(): number {
        return this.maxLives;
    }
    
    loseLife(): number {
        this.lives = Math.max(0, this.lives - 1);
        return this.lives;
    }
    
    hasLivesRemaining(): boolean {
        return this.lives > 0;
    }
    
    resetLives(): void {
        this.lives = this.maxLives;
    }

    setGameWon(): void {
        this.gameWon = true;
        this.gameEnded = true;
    }

    setGameOver(): void {
        this.gameEnded = true;
    }

    reset(): void {
        this.gameWon = false;
        this.gameEnded = false;
    }
}
