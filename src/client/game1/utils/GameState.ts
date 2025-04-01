export class GameState {
          private static _instance: GameState;
        
          public isGameOver = false;
        
          private constructor() {}
        
          public static getInstance(): GameState {
            if (!GameState._instance) {
              GameState._instance = new GameState();
            }
            return GameState._instance;
          }
        
          gameOver() {
            this.isGameOver = true;
            alert("Game Over!");
          }
        }
        