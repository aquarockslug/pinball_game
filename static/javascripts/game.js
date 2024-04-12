class Pinball extends Phaser.Scene {
        ball;
        paddles;
        scoreboard;

        preload() {
                this.load.setBaseURL('assets/');
                [
                        ['sky', 'sky.png'],
                        ['board', 'board.png'],
                        ['ball', 'orange_ball.png'],
                        ['bumper', 'bumper_oval.png'],
                        ['shade', 'shade.png'],
                        ['wall', 'wall.png'],
                        ['paddleLeft', 'paddleLeft.png'],
                        ['paddleRight', 'paddleRight.png'],
                        ['slingshot', 'slingshot.png']
                ].forEach((asset) => this.load.image(asset[0], asset[1]))
                this.load.json("sprites", "sprite-physics.json");
        }

        async create() {
                this.add.image(pos.center.x, pos.center.y, 'sky').setScale(1.75)
                this.add.image(pos.center.x, pos.center.y, 'board');
                this.add.image(pos.center.x, pos.center.y, 'shade').setDepth(100)
                await Promise.all([
                        this.createWalls(), this.createBumpers(),
                        this.physicsSettings(), this.createSlingshots()
                ]);
                this.paddles = newPaddles(this)
                this.ball = newBall(this)
                // this.scoreboard = this.add.text(900, 75, 'Score: 0', { fontSize: '24px' });
        }

        update() {
                this.updatePaddles()
                this.handleCollision()
                this.clamp(17)
                this.ballReturn(17)

                // ball shrinks when higher on screen
                this.ball.setScale(this.mapVal(this.ball.body.position.y, 500, 100, 0.35, 0.2))
        }

        physicsSettings() {
                this.matter.world.engine.positionIterations = 12
                this.matter.world.engine.velocityIterations = 8
                this.matter.world.runner.isFixed = true
                // this.matter.world.runner.deltaMax = 2 
                // this.matter.world.runner.correction = 1 
                // this.matter.world.runner.deltaMin = 1 
                this.matter.world.setGravity(0, 1, 0.001);
        }

        clamp(amount) {
                if (this.ball.body.velocity.y < -amount) this.ball.setVelocityY(-amount)
                if (this.ball.body.velocity.y > amount) this.ball.setVelocityY(amount)
                if (this.ball.body.velocity.x < -amount) this.ball.setVelocityX(-amount)
                if (this.ball.body.velocity.x > amount) this.ball.setVelocityX(amount)
        }

        ballReturn(power = 15) {
                if (this.ball.body.position.x > 610 && this.ball.body.position.y < 570)
                        this.ball.setVelocityY(-power)

                if (this.ball.body.position.y < 570) return
                this.ball.setVelocityX(5)
                this.input.keyboard.on('keydown', (event) =>
                        event.key == "ArrowUp" && this.ball.body.position.x > 600 ?
                        this.ball.setVelocity(-1, -14) : null)
        }

        handleCollision() {
                this.matter.world.on("collisionstart", (event, bodyA, bodyB) => {
                        // console.log("collision start")
                        if (bodyA.label == "bumper" && bodyB.label == "ball") {
                                console.log("bumper")
                        }
                })
        }

        createSlingshots() {
                const spread = 300
                this.matter.add.sprite(pos.paddle.x + spread / 2, pos.paddle.y - 100, 'slingshot', null, {
                        shape: this.cache.json.get("sprites")["slingshotRight"],
                }).setScale(0.25).setBounce(1.5)
                this.matter.add.sprite(pos.paddle.x - spread / 2, pos.paddle.y - 100, 'slingshot', null, {
                        shape: this.cache.json.get("sprites")["slingshotLeft"],
                }).setScale(0.25).setBounce(1.5).setFlipX(true)
        }

        createWalls() {
                const wallSpread = 530
                const options = (angle) => ({
                        angle,
                        isStatic: true
                })

                this.matter.add.rectangle(pos.board.x, h - 100, 700, 30, options(Math.PI + Math.PI / 60))
                this.matter.add.rectangle(pos.board.x, 40, 400, 30, options(0))
                this.matter.add.rectangle(pos.board.x - wallSpread / 2, pos.board.y, 30, h, options(Math.PI / 16))
                this.matter.add.rectangle(pos.board.x + wallSpread / 2, pos.board.y, 10, h, options(-Math.PI / 16))

                this.createWall(pos.board.x - 210, pos.board.y + 64, 25, 0.3) // left gutter
                this.createWall(pos.board.x + 158, pos.board.y + 64, 155, 0.3) // right gutter
                this.createWall(pos.board.x + 200, pos.board.y - 25, 80, 1) // ball return
        }

        createWall(x, y, angle, length = 1) {
                this.matter.add.sprite(x, y, 'wall', {
                        shape: this.cache.json.get("sprites")['wall']
                }).setScale(length, 0.2).setStatic(true).setAngle(angle)
        }

        createBumpers(spread = 200) {
                this.newBumper(pos.paddle.x, pos.board.y - spread / 2 - 40, 0.5)
                this.newBumper(pos.paddle.x + spread / 2, pos.paddle.y - 325, 0.4)
                this.newBumper(pos.paddle.x - spread / 2, pos.paddle.y - 325, 0.4)
        }

        newBumper(x, y, scale) {
                const bumper = this.matter.add.sprite(x, y, 'bumper', null, {
                        shape: this.cache.json.get("sprites")["bumper_oval"]
                }).setDepth(50).setScale(scale)
                return bumper.setStatic(true).setBounce(1.0);
        }

        updatePaddles(input = this.input.keyboard, paddles = this.paddles) {
                input.on('keydown', (event) =>
                        event.key == "ArrowLeft" ? paddles.leftFired = true :
                        event.key == "ArrowRight" ? paddles.rightFired = true : null)
                input.on('keyup', (event) =>
                        event.key == "ArrowLeft" ? paddles.leftFired = false :
                        event.key == "ArrowRight" ? paddles.rightFired = false : null)

                if (paddles.leftFired) paddles.fire.left()
                if (paddles.rightFired) paddles.fire.right()

                if (paddles.left.angle <= -10) paddles.leftFired ?
                        paddles.left.setAngularVelocity(0) : // button held
                        paddles.left.setAngularVelocity(0.1) // button released

                if (paddles.right.angle >= 10) paddles.rightFired ?
                        paddles.right.setAngularVelocity(0) : // button held
                        paddles.right.setAngularVelocity(-0.1) // button released

                if (paddles.right.angle <= -20) paddles.right.angle = -20 // bottom limit
                if (paddles.left.angle >= 20) paddles.left.angle = 20 // bottom limit
        }

        mapVal(value, x1, y1, x2, y2) {
                return (value - x1) * (y2 - x2) / (y1 - x1) + x2;
        }
}

const config = {
        type: Phaser.AUTO,
        width: 1280,
        height: 720,
        scene: Pinball,
        input: {
                keyboard: true
        },
        physics: {
                default: "matter",
                matter: {
                        timing: {
                                timeScale: 1
                        },
                        debug: false
                }
        },
        plugins: {
                scene: [{
                        plugin: PhaserMatterCollisionPlugin,
                        key: "matterCollision",
                        mapping: "matterCollision"
                }]
        }
};

const [w, h] = [config.width, config.height]
pos = {
        center: {
                x: w / 2,
                y: h / 2
        },
        launch: {
                x: 670,
                y: 600
        },
        paddle: {
                x: 370,
                y: h / 2 + 100
        },
        board: {
                x: 395,
                y: h / 2
        }
}

function newBall(scene) {
        return scene.matter.add.image(pos.launch.x, pos.launch.y, 'ball', null, {
                label: 'ball'
        }).setScale(0.3).setCircle(17).setBounce(0.75).setMass(0.00001);
}

function newPaddles(scene, center = pos.paddle) {
        const shapes = scene.cache.json.get("sprites");

        function fire(paddle, direction) {
                paddle.setAngularVelocity(0.2 * direction)
        }

        const paddles = {
                left: scene.matter.add.sprite(0, 0, 'paddleLeft', null, {
                        shape: shapes["paddleLeft"]
                }),
                right: scene.matter.add.sprite(0, 0, 'paddleRight', null, {
                        shape: shapes["paddleRight"]
                }),
                apply: (func) => (func(paddles.left), func(paddles.right)),
                fire: {
                        left: () => fire(paddles.left, -1),
                        right: () => fire(paddles.right, 1)
                },
                leftFired: false,
                rightFired: false
        }

        paddles.apply((paddle) => paddle.setScale(0.35))
        paddles.apply((paddle) => paddle.setFriction(0.0))

        const options = {
                spread: 250,
                matter: {}
        }
        const opt = (x) => ({
                pointA: {
                        x,
                        y: center.y
                },
                ...options.matter
        })
        scene.matter.add.worldConstraint(
                paddles.left, 0, 1.0, opt(center.x - options.spread / 2))
        scene.matter.add.worldConstraint(
                paddles.right, 0, 1.0, opt(center.x + options.spread / 2))
        return paddles
}

const game = new Phaser.Game(config);
