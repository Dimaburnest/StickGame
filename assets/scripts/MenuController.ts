
import {
    _decorator, Animation, Component, director, Node,
    tween, UITransform, Vec3, view
} from 'cc';
import { PlayerStates } from '../State/PlayerState'

const { ccclass, property } = _decorator;

@ccclass('MenuController')
export class MenuController extends Component {
    @property(Node) gameStartButton: Node = null

    @property(Node) playerStub: Node = null

    @property(Node) platformStub: Node = null

    @property(Animation) animation: Animation = null



    animationTime: number = 0.5

    protected onLoad(): void {
        if (this.gameStartButton) {
            this.gameStartButton.on(
                Node.EventType.TOUCH_END, this.onTouchEnd, this
            )
        } 
    }

    protected start(): void {
        this.animation = this.getComponent(Animation)
        this.animation.play(
            PlayerStates.Idle
        )  
    }

  

    onTouchEnd() {
        this.gameStartButton.active = false

        const platformTransform = this.platformStub.getComponent(UITransform)
        const playerTransform = this.playerStub.getComponent(UITransform)
        const targetPlatformPosition = new Vec3(
            -view.getVisibleSize().width / 2, -480, 0
        )
        const targetPlayerPosition = new Vec3(
            platformTransform.width / 2 - playerTransform.width / 1.2, this.playerStub.position.y, 0
        )
        tween(this.platformStub).to(
            this.animationTime, {
            position: targetPlatformPosition
        }).start()

        tween(this.playerStub).to(
            this.animationTime, {
            position: targetPlayerPosition
        }).start()

        this.scheduleOnce(
            () => {

                director.loadScene('MainScene')

            }, this.animationTime
        )
    }


    
}


