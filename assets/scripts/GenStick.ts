import { _decorator, Component, director , Canvas, tween, UITransform, Vec3} from 'cc';
import { GameManager } from './GameManager';
const { ccclass, property } = _decorator;

@ccclass('GenStick')
export class GenStick extends Component {
    @property({
        type: Number
    })
    stickGrowthRate: number = 400

    @property({
        type: Number
    })
    angleTime: number = 1

    private isGrowing: boolean = false

    startStickGrowth() {
        this.isGrowing = true
    }

    stoptStickGrowth() {
        this.isGrowing = false
    }
    /**
   * @param {number} deltaTime - Time between frames.
   */
    growStick(deltaTime: number) {
        if (this.isGrowing) {
            const uiTransform = this.node.getComponent(UITransform)
            if (uiTransform) {
                uiTransform.height += this.stickGrowthRate * deltaTime
                if (uiTransform.height >= 2500) {
                    this.stoptStickGrowth()
                    const scene = director.getScene()
                    const canvas = scene.getComponentInChildren(Canvas)
                    canvas.getComponent(GameManager).onTouchEnd
                }
            }

        }
    }
    stickFall() {
        tween(this.node)
            .to(this.angleTime, { angle: -90 })
            .start()
    }

    
    stickOnFail() {
        tween(this.node)
            .to(this.angleTime, { angle: -180 })
            .start()
    }


    
}


