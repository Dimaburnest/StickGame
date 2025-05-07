import { _decorator, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    private static instance: GameManager
    
    public static getInstance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager
        }
        return GameManager.instance
    }
    onLoad() {
        if (GameManager.instance) {
            this.destroy()
            return
        }
        GameManager.instance = this

        director.addPersistRootNode(this.node)
    }
    startGame() {
        console.log('игра началась')
    }
    endGame() {
        console.log('Игра завершена')
    }
    resetGame() {
        console.log('сброс игры')
    }
}


