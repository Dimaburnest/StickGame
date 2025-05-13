import { _decorator, Component, Animation, log, tween, UITransform, Vec3 } from 'cc';
import { PlayerStates } from '../State/PlayerState';
const { ccclass, property } = _decorator;

@ccclass('Player')
export class Player extends Component {
    @property(Animation)
    animation: Animation = null

    private playerState: PlayerStates = PlayerStates.Idle
    public isFlipped: boolean = false

    
    onLoad() {
        this.setState(PlayerStates.Idle)
    }

    
    setState(state: PlayerStates) {
        if (this.playerState !== state) {
            this.playerState = state
            this.animation.play(state)
            log('Player state:', state, 'Animation:', this.animation.name)
        }
    }

    
    getState(): PlayerStates {
        return this.playerState
    }

    
    flipPlayer() {
        this.isFlipped = !this.isFlipped
        const uiTransform = this.node.getComponent(UITransform)
        this.node.setScale(new Vec3(1, this.isFlipped ? -1 : 1, 1))
        const newY = this.isFlipped ? this.node.position.y - uiTransform.width - 5 : this.node.position.y + uiTransform.width + 5
        this.node.setPosition(new Vec3(this.node.position.x, newY, 0))
        console.log('Player flipped:', this.isFlipped, 'New Position Y:', newY)
        
    }

    
    fall() {
        this.setState(PlayerStates.Falling)
        tween(this.node).to(0.5, {
            position: new Vec3(this.node.position.x, -1200, 0)
        }).start()
    }
    
}


