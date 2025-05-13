import { _decorator, Component, BoxCollider2D, CCBoolean, CCFloat, Node, Size, UITransform, Vec2, Vec3, clamp} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GenPlatform')
export class GenPlatform extends Component {
    @property({
        type: CCFloat
    })
    platformMinWidth: number = 10;

    @property({
        type: CCFloat
    })
    platformMaxWidth: number = 200;

    @property({
        type: Node
    })
    bonusPlatform: Node = null;

    

   

    
    onLoad() {  
    }

    clamp(value: number, min: number, max: number) {
        return Math.max(min, Math.min(value, max))
    }

    initPlatform(positionX: number, initialWidth: number = 0 ) {
        this.platformMinWidth = 20
        this.platformMaxWidth = 75
        this.node.setPosition(new Vec3(positionX, -50, 0));
        const uiTransform = this.node.getComponent(UITransform)
        const clampedValue = this.platformMinWidth + Math.random() * (this.platformMaxWidth - this.platformMinWidth)
        uiTransform.width = initialWidth > 0 ? initialWidth : this.clamp(clampedValue, this.platformMinWidth, this.platformMaxWidth)
        console.log(uiTransform.width)
        const collider = this.node.getComponent(BoxCollider2D)
        collider.size.width = uiTransform.width
        collider.size.height = uiTransform.height - 5
        collider.offset = new Vec2(-10, -100)

        
    }

    
    isStickTouching(stickRightX: number): boolean {
        
        
        const platformLeft = this.node.position.x - this.node.getComponent(UITransform).width / 2
        const platformRight = this.node.position.x + this.node.getComponent(UITransform).width /2
        if (stickRightX > platformLeft && stickRightX < platformRight) {
            return true
        }
        return false
    }

    
   

}


