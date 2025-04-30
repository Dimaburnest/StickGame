import { _decorator, Component, Node, Prefab, instantiate, tween,Vec3, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GenStick')
export class GenStick extends Component {
    @property(Prefab)
    objectPrefab: Prefab;
    private currentObject: Node;
    private isTouching: boolean = false;
    private isGrowing: boolean = false;

    rotate() {
        const currentRotation = this.currentObject.eulerAngles;
        const targetRotation = new Vec3(currentRotation.x, currentRotation.y, currentRotation.z - 90);
        tween(this.currentObject)
            .to(1, { eulerAngles: targetRotation }, { easing: 'smooth' })
            .start();
    }
    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    onTouchStart(event: Event) {
        let canvas = director.getScene().getChildByName("Canvas");
        this.currentObject = instantiate(this.objectPrefab );
        this.currentObject.setParent(canvas);       
        this.currentObject.setSiblingIndex(3);
        this.currentObject.setPosition(-60,-105); 
        this.isGrowing = true;
        this.schedule(this.growObject.bind(this), 0.01);
        console.log("onTouch"), this.currentObject.name;
        this.isTouching = true;
    }
    onTouchEnd(event: Event) {
        this.isGrowing = false;
        this.unschedule(this.growObject);
        console.log("onTouchEnd"), this.currentObject.name;
        if (this.isTouching) {
            this.isTouching = false
            this, this.rotate()
        }
       
    }
    growObject() {
        if (this.isGrowing && this.currentObject) {
            const scaleY = this.currentObject.scale.y + 0.1;
            const scaleX = 1;
            const posX = this.currentObject.position.x;
            const posY = this.currentObject.position.y;
            this.currentObject.setScale(scaleX, scaleY);
            this.currentObject.setPosition(posX, posY);
            
            const currentPosition = this.currentObject.position;
            const updatePosition = new Vec3(currentPosition.x, currentPosition.y);
            this.currentObject.setPosition(updatePosition);
        }
    }
    
        
    }



