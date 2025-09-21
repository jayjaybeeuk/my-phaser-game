export class GameStateManager {
    private gameWon: boolean = false;
    private gameEnded: boolean = false;

    isGameWon(): boolean {
        return this.gameWon;
    }

    isGameEnded(): boolean {
        return this.gameEnded;
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
