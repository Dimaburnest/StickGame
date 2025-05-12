import { _decorator, Component, BoxCollider2D, CCBoolean, CCFloat, Node, Size, UITransform, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GenPlatform')
export class GenPlatform extends Component {
    @property({
        type: CCFloat
    })
    platformMinWidth: number = 50;

    @property({
        type: CCFloat
    })
    platformMaxWidth: number = 200;

   

    

   

    
    onLoad() {  
    }

    
    initPlatform(positionX: number, initialWidth: number = 0, bonusPlatformVisible: boolean = true) {
        

        this.node.setPosition(new Vec3(positionX, -50, 0));
        const uiTransform = this.node.getComponent(UITransform)
        uiTransform.width = initialWidth > 0 ? initialWidth : this.platformMinWidth + Math.random() * (this.platformMaxWidth - this.platformMinWidth)

        const collider = this.node.getComponent(BoxCollider2D)
        collider.size.width = uiTransform.width
        collider.size.height = uiTransform.height - 5
        collider.offset = new Vec2(0, -5)

        
    }

    
    isStickTouching(stickRightX: number): boolean {
        
        
        const platformLeft = this.node.position.x - this.node.getComponent(UITransform).width / 2
        const platformRight = this.node.position.x + this.node.getComponent(UITransform).width / 2
        if (stickRightX > platformLeft && stickRightX < platformRight) {
            return true
        }
        return false
    }

    
   

}


