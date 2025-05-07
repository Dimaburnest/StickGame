import { _decorator, Component, Node, Prefab,instantiate, tween,Vec3, director, randomRange, Scheduler } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GenStick')
export class GenStick extends Component {
    @property(Prefab)
    objectPrefab: Prefab;

    @property(Node)
    player: Node
    private currentObject: Node;
    @property(Prefab)
    genPlatform: Prefab 

    private isTouching: boolean = false;
    private isGrowing: boolean = false;

    private speedGrowing: number = 0.1

    private minX: number = 0;
    private maxX: number = 150;
    
    private minWidthScale: number = 0.5;
    private maxWidthScale: number = 2;
    


    rotate() {
        let currentRotation = this.currentObject.eulerAngles;
        let targetRotation = new Vec3(currentRotation.x, currentRotation.y, currentRotation.z - 90);
        tween(this.currentObject)
            .to(1, { eulerAngles: targetRotation }, { easing: 'smooth' })
            .start();
    }
    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }
    onTouchStart(event) {
        this.StickStatus()  
    }
    private StickStatus() {
        let canvas = director.getScene().getChildByName("Canvas");
        this.currentObject = instantiate(this.objectPrefab);
        this.currentObject.setParent(canvas);
        this.currentObject.setSiblingIndex(3);
        this.currentObject.setPosition(-100, -105);
        this.isGrowing = true;
        this.schedule(this.growObject.bind(this), 0.01);
        this.isTouching = true;
    }
    onTouchEnd(event) {
        this.isGrowing = false;
         this.unschedule(this.growObject);
        if (this.isTouching) {
            this.isTouching = false
            this.rotate()
            this.spawn()
        }
        delete this.schedule;
    }
    private growObject() {
        if (this.isGrowing && this.currentObject) {
            let posX = this.currentObject.position.x;
            let posY = this.currentObject.position.y;
            let scaleY = this.currentObject.scale.y + this.speedGrowing;
            let scaleX = 1;
            this.currentObject.setPosition(posX, posY);
            this.currentObject.setScale(scaleX, scaleY);
            let currentPosition = this.currentObject.position;
            let updatePosition = new Vec3(currentPosition.x, currentPosition.y);
            this.currentObject.setPosition(updatePosition);
           
        }
        
    }
    private spawn() {
        let canvas = director.getScene().getChildByName("Canvas");
        const newNode = instantiate(this.genPlatform);
        newNode.setParent(canvas);
        newNode.setSiblingIndex(3);
        let posX = this.randomRange(this.minX, this.maxX)
        newNode.setPosition(new Vec3(posX, -94, 0))
        
        let scaleX = this.randomRange(this.minWidthScale, this.maxWidthScale)
        newNode.setScale(scaleX, 1, 1)
        if (newNode) {
            this.moveToTarget(newNode.getPosition());
        }

    }
    moveToTarget(targetPos: Vec3) {
        tween(this.player)
            .to(2, { position: targetPos })
            .start();
    }
    randomRange(min: number, max: number): number {
        return Math.random() * (max - min) + min;
    }
    
        
    }



