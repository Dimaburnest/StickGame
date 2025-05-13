import { _decorator, Component, Node, Label, director, Canvas } from 'cc';
import { GameManager } from "../scripts/GameManager"
const { ccclass, property } = _decorator;

@ccclass('GameEnd')
export class GameEnd extends Component {
    @property({
        type: Node
    })
    restartButton: Node = null

    @property({
        type: Node
    })
    startScreenButton: Node = null

    @property({
        type: Node
    })
    scoreNode: Node = null

    

   

    protected onLoad(): void {
        this.node.active = false
        this.node.setSiblingIndex(999)
        this.initTouchEvent()
    }

    
    initTouchEvent() {
        if (this.restartButton) {
            this.restartButton.on(
                Node.EventType.TOUCH_END, this.onRestartTouched, this
            )
        }
        if (this.startScreenButton) {
            this.startScreenButton.on(
                Node.EventType.TOUCH_END, this.onStartScreenTouched, this
            )
        }
    }

    

    onRestartTouched() {
        this.node.active = false

        const scene = director.getScene()
        const canvas = scene.getComponentInChildren(Canvas)
        canvas.getComponent(GameManager).restartGame()
    }

    

    onStartScreenTouched() {
        director.loadScene('MainMenu')

    }

    /**
     * Display the end game popup with the given score and best score.
     * @param {number} score - Current score.
     */

    showPopup(score: number) {
        this.node.active = true

        this.node.setSiblingIndex(this.node.parent.children.length - 1)
        this.scoreNode.getComponent(Label).string = score.toString()
    }

    
    hidePopup() {
        this.node.active = false
    }

    
    onGameEnd() {
        this.node.active = true
    }
}


