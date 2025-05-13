import {
    _decorator, BoxCollider2D, Collider2D, Contact2DType, IPhysics2DContact,
    CCFloat, Component, instantiate, math, Node, Prefab, tween,
    UITransform, Vec3, view, PhysicsSystem2D, log, Label, find
} from 'cc';
import { GameEnd } from './GameEnd'
import { GenPlatform } from './GenPlatform'
import { GenStick } from './GenStick'
import { Player } from './Player'
import { GameStates } from '../State/GameState'
import { PlayerStates } from '../State/PlayerState'
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {
    @property({
        type: Node
    })
    uiNode: Node = null

    @property({
        type: Node
    })
    rootNode: Node = null

    @property({
        type: Node
    })
    defaultPosition: Node = null

    @property({
        type: Prefab
    })
    stickPrefab: Prefab = null

    @property({
        type: Prefab
    })
    platformPrefab: Prefab = null

    @property({
        type: Prefab
    })
    playerPrefab: Prefab = null
    @property({
        type: CCFloat
    })
    playerPrefabWidth: number = 80

    @property({
        type: CCFloat
    })
    platformPrefabWidth: number = 200

    @property({
        type: Prefab
    })
    endGamePrefab: Prefab = null

    @property({
        type: Node
    })
    @property(Label)
    private countLabel: Label | null

    scoreNode: Node
    private endGamePopupInstance: Node = null
    private platformNode: Node = null
    private nextPlatformNode: Node = null
    private oldStickNode: Node = null
    private stickNode: Node = null
    private playerNode: Node = null
    private stickComponent: GenStick = null
    private endGameComponent: GameEnd = null 
    private _count: number = 0;
    private moveDetails = {
        distance: 0,
        startX: 0,
        targetX: 0,
        duration: 0,
        elapsedTime: 0,
        callback: null,
    }
    GameState = GameStates.Idle
    futurePlatformPosition: number

    protected onLoad() {
        console.log(this.endGameComponent)
        PhysicsSystem2D.instance.enable = true
        this.endGamePopupInstance = instantiate(this.endGamePrefab)
        this.uiNode.addChild(this.endGamePopupInstance)
        this.endGameComponent = this.endGamePopupInstance.getComponent(GameEnd) 
        this.initializeGameInstance()
        this.initTouchEvents()
        this.scoreNode = new Node("counter");
        this.scoreNode.setPosition(new Vec3 (0,200,0))
        this.scoreNode.getChildByName("Text")
        this.scoreNode.parent = this.node;
        this.countLabel = this.scoreNode.addComponent(Label);
        if (this.countLabel) {
            this.countLabel.string = "0";
        }
    }
    initializeGameInstance() {
        const initialPlatformX = -view.getVisibleSize().width/2
        const initialPlayerX = initialPlatformX + this.platformPrefabWidth / 2 - this.playerPrefabWidth / 1.2

        this.platformNode = this.createPlatform(initialPlatformX, this.platformPrefabWidth)

        this.futurePlatformPosition = this.platformNode.position.x

        this.playerNode = this.createPlayer(initialPlayerX)
        this.spawnNextPlatform()
        this.setState(GameStates.Idle, 'initializeGameInstance')
    }
    calculateNextPlatformPosition() {
        let offset = 25
        const minDistance = 175
        const maxDistance = view.getVisibleSize().width - this.platformPrefabWidth - offset +20

        let randomDistance = minDistance + Math.random() * (maxDistance - minDistance)
        let targetX = this.defaultPosition.position.x + randomDistance

        return targetX
    }

    movePlatformOntoScreen(platformNode: Node, targetXPlatform: number) {
        if (platformNode) {
            tween(platformNode)
                .to(0.5, { position: new Vec3(targetXPlatform, platformNode.position.y, 0) })
                .start()
        }
       

    }

    spawnNextPlatform() {
        const spawnX = view.getVisibleSize().width
        const targetXPlatform = this.calculateNextPlatformPosition()
        this.nextPlatformNode = this.createPlatform(spawnX, 0)

        this.movePlatformOntoScreen(this.nextPlatformNode, targetXPlatform)
        
    }

    createPlatform(positionX: number, initialWidth: number = 0) {

        let platformInstance = instantiate(this.platformPrefab)
        platformInstance.setSiblingIndex(996)
        this.rootNode.addChild(platformInstance)
        const platformComp = platformInstance.getComponent(GenPlatform)
        if (platformComp) {
            platformComp.initPlatform(positionX, initialWidth,)
        } else {
            console.error("Platform component is missing")
        }
        return platformInstance
    }
    protected update(deltaTime: number): void {
        if (this.GameState === GameStates.Touching && this.stickNode) {
            this.stickNode.getComponent(GenStick).growStick(deltaTime)
        }

        if ((this.GameState === GameStates.Running || this.GameState === GameStates.Coming) && this.moveDetails.targetX !== 0) {
            this.moveDetails.elapsedTime += deltaTime
            let progress = Math.min(this.moveDetails.elapsedTime / this.moveDetails.duration, 1)
            const newPositionX = math.lerp(this.moveDetails.startX, this.moveDetails.targetX, progress)
            this.playerNode.setPosition(new Vec3(newPositionX, this.playerNode.position.y, 0))

            if (progress >= 1) {
                this.setState(GameStates.End, 'update')
                this.moveDetails.targetX = 0
                if (this.moveDetails.callback) {
                    this.moveDetails.callback()
                }
            }
            const nextPlatformTransform = this.nextPlatformNode.getComponent(UITransform)
            if (nextPlatformTransform && this.playerNode.position.x >= this.nextPlatformNode.position.x - nextPlatformTransform.width / 2 && this.GameState === GameStates.Running) {
                this.setState(GameStates.Coming, 'update')
            }

        }

        if (this.GameState === GameStates.Running) {
            this.contactSomething()
        }
    }
    createPlayer(positionX: number) {

        let playerInstance = instantiate(this.playerPrefab)
        playerInstance.setSiblingIndex(996)
        this.rootNode.addChild(playerInstance)


        const platformTransform = this.platformNode.getComponent(UITransform)
        const playerTransform = playerInstance.getComponent(UITransform)
        if (platformTransform && playerTransform) {
            playerInstance.setPosition(new Vec3(
                positionX -20,
                this.platformNode.position.y + platformTransform.height / 2 - playerTransform.height / 2 -80,
                0  
            ))
        }

        return playerInstance
    }
    onTouchEnd() {

        const platformNodeTransform = this.platformNode.getComponent(UITransform)
        let playerPassCurrentPlatform =
            this.playerNode.position.x >= this.platformNode.position.x + platformNodeTransform.width / 2

        if (this.GameState === GameStates.Running && this.playerNode && playerPassCurrentPlatform) {
            this.playerNode.getComponent(Player).flipPlayer()

            return
        }

        if (this.GameState !== GameStates.Touching || !this.stickNode) {
            return
        }

        this.stickComponent = this.stickNode.getComponent(GenStick)

        if (this.stickComponent) {
            this.stickComponent.stoptStickGrowth()
            this.playerNode.getComponent(Player).setState(PlayerStates.HitStick)
            this.stickComponent.stickFall()
            this.setState(GameStates.End)
            this.scheduleOnce(this.checkResult.bind(this), this.stickComponent.angleTime)
        } else {
            console.error("Stick component is missing")
        }
    }
    initTouchEvents() {

        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)
    }
    createStick() {
        this.stickNode = instantiate(this.stickPrefab)
        this.stickNode.setSiblingIndex(998)
        this.rootNode.addChild(this.stickNode)
        const platformNodeTransform = this.platformNode.getComponent(UITransform)
        const stickNodeTransform = this.stickNode.getComponent(UITransform)
        let moveAmount = -view.getVisibleSize().width / 3
        this.stickNode.setPosition(
             moveAmount = -view.getVisibleSize().width / 3 -18,
            this.platformNode.position.y + platformNodeTransform.height / 2 - 110)

        stickNodeTransform.height = 0
        this.stickNode.angle = 0
        
    }
    
    onTouchStart() {
        if (this.GameState !== GameStates.Idle) {
            return
        }
        this.setState(GameStates.Touching)
        this.createStick()
        this.stickComponent = this.stickNode.getComponent(GenStick)
        if (this.stickComponent) {
            this.stickComponent.startStickGrowth()
            this.playerNode.getComponent(Player).setState(PlayerStates.StickGrow)
        } else {
            console.error("Stick component is missing")
        }
    }
    moveTo(targetPositionX: number, duration: number, onComplete: () => void) {
        this.moveDetails.startX = this.playerNode.position.x
        this.moveDetails.targetX = targetPositionX
        this.moveDetails.duration = duration
        this.moveDetails.elapsedTime = 0
        this.moveDetails.callback = onComplete
        this.setState(GameStates.Running)
        this.playerNode.getComponent(Player).setState(PlayerStates.Running)
        console.log("Char Moving")
    }
    checkResult() {
        if (!this.stickNode) {
            return
        }
        const stickNodeTransform = this.stickNode.getComponent(UITransform)
        const stickRightX = this.stickNode.position.x + stickNodeTransform.height
        const nextPlatformComp = this.nextPlatformNode.getComponent(GenPlatform)

        if (nextPlatformComp && nextPlatformComp.isStickTouching(stickRightX)) {
            this.onStickTouchPlatform()
        } else {
            this.onFailed()
        }
    }
    onStickTouchPlatform() {
        console.log("onStickTouchPlatform")
        const nextPlatformNodeTransform = this.nextPlatformNode.getComponent(UITransform)
        let nextPlatformEdge = this.nextPlatformNode.position.x + nextPlatformNodeTransform.width / 3

        this.moveDetails.distance = nextPlatformEdge - this.playerNode.position.x
        let moveTime = Math.abs(this.moveDetails.distance / 500)

        this.moveTo(nextPlatformEdge, moveTime, () => {
            this.scheduleOnce(() => {
                this.resetPlatformsAndPlayer()
                this.instantiateNextPlatform()
            })
            this.setState(GameStates.Idle, 'onStickTouchPlatform')
            this.playerNode.getComponent(Player).setState(PlayerStates.Idle)
        })
        
    }
    resetPlatformsAndPlayer() {

        let moveAmount = -view.getVisibleSize().width / 3
        let moveTime = 0.1
        const nextPlatformTransform = this.nextPlatformNode.getComponent(UITransform)
        const playerNodeTransform = this.playerNode.getComponent(UITransform)
        this.futurePlatformPosition =
            moveAmount - nextPlatformTransform.width / 2 + playerNodeTransform.width /1.3 

        tween(this.nextPlatformNode)
            .to(moveTime, {
                position: new Vec3(
                    moveAmount-20,
                    this.nextPlatformNode.position.y,
                    0)
            })
            .start()

        tween(this.playerNode)
            .to(moveTime, {
                position: new Vec3(
                    moveAmount-30,
                    this.playerNode.position.y,
                    0)
            })
            .start()

        if (this.stickNode) {
            let futureStickPosition = moveAmount - this.nextPlatformNode.position.x - nextPlatformTransform.width / 2 + playerNodeTransform.width / 1.3
            tween(this.stickNode)
                .to(moveTime, {
                    position: new Vec3(
                        this.stickNode.position.x + futureStickPosition -30,
                        this.stickNode.position.y,
                        0
                    )
                })
                .start()
        }

        this.platformNode.destroy()
        this.platformNode = null
        this.platformNode = this.nextPlatformNode


       
        

        if (this.oldStickNode) {
            this.oldStickNode.destroy()
            this.oldStickNode = null
        }
        this.oldStickNode = this.stickNode
        this.stickNode = null
        this.incrementCounter()
    }
    public incrementCounter() {
        this._count++;
        this.updateCounterDisplay();
    }

    private updateCounterDisplay() {
        if (this.countLabel) {
            this.countLabel.string = this._count.toString();
        }
    }

    
    onFailed() {
        const stickNodeTransform = this.stickNode.getComponent(UITransform)
        let moveLength = this.stickNode.position.x + stickNodeTransform.height - this.playerNode.position.x
        let moveTime = Math.abs(moveLength / 500)

        this.moveTo(this.stickNode.position.x + stickNodeTransform.height, moveTime, () => {
            this.playerNode.getComponent(Player).fall()

            this.stickComponent.stickOnFail()
            this.scheduleOnce(() => {
                this.endGame()
            }, 1)
        })
    }
    contactSomething() {
        let collider = this.playerNode.getComponent(BoxCollider2D)
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

        const otherLayer = otherCollider.node
        const isFlipped = selfCollider.node.getComponent(Player).isFlipped

        if (otherLayer.name === 'GenPlatform' && isFlipped) {
            this.onPlayerCrashInToPlatform()
        }
    }
    onPlayerCrashInToPlatform() {
        this.playerNode.getComponent(Player).fall()
        this.setState(GameStates.End)
        this.scheduleOnce(() => {
            this.endGame()
        }, 1)
    }
    endGame() {
        this.endGameComponent.showPopup(this._count)
        this.setState(GameStates.End)
        this.dispose()
        this.scoreNode.active = false

    }
    restartGame() {
        this.endGameComponent.hidePopup()
        this.dispose()
        this.initializeGameInstance()
        this.scoreNode.active = true
        this._count = 0
        if (this.countLabel) {
            this.countLabel.string = "0";
        }
    }
    dispose() {
        this.rootNode.removeAllChildren()
    }
    instantiateNextPlatform() {

        this.spawnNextPlatform()

        let platformAppearanceTime = this.moveDetails.distance / (200 * 3)
        tween(this.node)
            .to(platformAppearanceTime, {
                position: new Vec3(this.node.position.x - this.moveDetails.distance, this.node.position.y, 0)
            })
            .start()
    }
    setState(state: GameStates, methodName: string = '') {
        if (this.GameState !== state) {
            this.GameState = state

            // Log the game state and method name for debugging
            log('Game state:', state, 'Method:', methodName)
        }
    }
    

}



