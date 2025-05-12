import { _decorator, Component, Node, Label, tween, Vec3, UIOpacity } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Score')
export class Score extends Component {
    @property({
        type: Node
    })
    scoreTextNode: Node = null

    @property({
        type: Node
    })
    perfectLabelNode: Node = null

    public score: number = 0
    public bestScore: number = 0

    /** * Increases the score, and if it's a bonus, shows the perfect label animation. 
     * * @param {boolean} isBonus - Indicates if the score increase is a bonus. */

    increaseScore(isBonus: boolean = false) {

        this.score++
        if (isBonus) {
            this.perfectLabelNode.active = true
            const uiOpacity = this.perfectLabelNode.getComponent(UIOpacity)
            if (uiOpacity) {

                tween(this.perfectLabelNode)
                    .by(0.5, { position: new Vec3(0, 50, 0) })
                    .call(() => { uiOpacity.opacity = 255 })
                    .delay(0.5).call(() => { uiOpacity.opacity = 0 })
                    .by(0.3, { position: new Vec3(0, -50, 0) })
                    .start()

            }
        }
        this.updateScore()
    }
    saveBestScore() {
        if (this.score > this.bestScore) {

            this.bestScore = this.score
            console.log('New best score:', this.bestScore)
        }
    }
    updateScore() {
        const label = this.scoreTextNode.getComponent(Label)
        if (label) {
            label.string = this.score.toString()
        }
    }
    resetScore() {
        this.score = 0

        this.updateScore()
    }
}


