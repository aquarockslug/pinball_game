class Pinball extends Phaser.Scene {
	ball;
	paddles;

	preload() {
		this.load.setBaseURL('assets/');
		[['sky', 'sky.png'], ['board', 'board.png'], ['ball', 'silver_ball.png'],
		['bumper', 'bumper_oval.png'], ['shade', 'shade.png'], 
		['paddleLeft', 'paddleLeft.png'], ['paddleRight', 'paddleRight.png']
		].forEach((asset) => this.load.image(asset[0], asset[1]))
		this.load.json("sprites", "sprite-physics.json");
	}

	create() {
		this.add.image(pos.center.x, pos.center.y, 'sky').setScale(1.75)
		this.add.image(pos.center.x, pos.center.y, 'board');
		this.add.image(pos.center.x, pos.center.y, 'shade').setDepth(100)
		this.createWalls()
		this.createBumpers()
		
		this.matter.world.engine.positionIterations = 12 
		this.matter.world.engine.velocityIterations = 8
		this.matter.world.runner.isFixed = true 
		// this.matter.world.runner.deltaMax = 2 
		// this.matter.world.runner.correction = 1 
		// this.matter.world.runner.deltaMin = 1 
		// this.matter.world.setGravity(0, 1, 0.001);
		
		this.paddles = newPaddles(this)
		this.ball = newBall(this)
	}

	update () {
		this.updatePaddles()

		// ball shrinks when higher on screen
		this.ball.setScale(this.mapVal(this.ball.body.position.y, 500, 100, 0.4, 0.28))

		// ball velocity clamp
		if ( this.ball.body.velocity.y < -14 ) { this.ball.setVelocityY(-14) }
		if ( this.ball.body.velocity.y > 14 ) { this.ball.setVelocityY(14) }
		if ( this.ball.body.velocity.x < -14 ) { this.ball.setVelocityX(-14) }
		if ( this.ball.body.velocity.x > 14 ) { this.ball.setVelocityX(14) }

		// ball return
		if ( this.ball.body.position.y < 570) return
		this.ball.setVelocityX(5)
		this.input.keyboard.on('keydown', (event) => 
			event.key == "ArrowUp" && this.ball.body.position.x > 600 ? 
				this.ball.setVelocity(-3, -40) : null)
	}
	
	createWalls () {
		const wallSpread = 580
		this.matter.add.rectangle(400, h - 80, 700, 50, 
			{ isStatic: true, angle: Math.PI + Math.PI / 60 })
		this.matter.add.rectangle(400, 40, 400, 50, { isStatic: true })
		this.matter.add.rectangle(pos.board.x - wallSpread/2, pos.board.y, 50, h, 
			{ isStatic: true, angle: Math.PI / 16 })
		this.matter.add.rectangle(pos.board.x + wallSpread/2, pos.board.y, 50, h, 
			{ isStatic: true, angle: -Math.PI / 16 })
	}

	createBumpers(spread=250) {
		this.newBumper(pos.board.x, pos.board.y-225, 0.4)
		this.newBumper(pos.board.x+spread/2, pos.board.y-spread/2, 0.5)
		this.newBumper(pos.board.x-spread/2, pos.board.y-spread/2, 0.5)
	}

	newBumper(x, y, scale) {
		const spritePhysics = this.cache.json.get("sprites");
		const bumper = this.matter.add.sprite(x, y, 'bumper', null, 
			{ shape: spritePhysics["bumper_oval"] })
		bumper.setDepth(50).setScale(scale)
		return bumper.setStatic(true).setBounce(1.0);
	}

	updatePaddles(input=this.input.keyboard, paddles=this.paddles) {
		input.on('keydown', (event) => 
			event.key == "ArrowLeft" ? paddles.leftFired = true :
			event.key == "ArrowRight" ? paddles.rightFired = true : null)
		input.on('keyup', (event) =>  
			event.key == "ArrowLeft" ? paddles.leftFired = false : 
			event.key == "ArrowRight" ? paddles.rightFired = false : null)
		
		if (paddles.leftFired ) paddles.fire.left() 
		if (paddles.rightFired ) paddles.fire.right()

		if ( paddles.left.angle <= -10) paddles.leftFired ? 
			paddles.left.setAngularVelocity(0) : // button held
			paddles.left.setAngularVelocity(0.1) // button released
		
		if ( paddles.right.angle >= 10) paddles.rightFired ? 
			paddles.right.setAngularVelocity(0) : // button held
			paddles.right.setAngularVelocity(-0.1) // button released

		if ( paddles.right.angle <= -20 ) paddles.right.angle = -20 // bottom limit
		if ( paddles.left.angle >= 20 ) paddles.left.angle = 20 // bottom limit
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
				timeScale: 1.5 
			},
			// debug: true
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
	center: { x: w / 2, y: h / 2 },
	launch: { x: 670, y:  600},
	paddleCenter: { x: 395, y: h / 2 + 100 },
	board: { x: 395, y: h / 2}
}

function newBall(scene) {
	const ball = scene.matter.add.image(pos.launch.x, pos.launch.y, 'ball');
	return ball.setScale(0.4).setCircle(24).setBounce(0.5);
}

function newPaddles(scene, center = pos.paddleCenter) {
	const spritePhysics = scene.cache.json.get("sprites");
	function fire(paddle, direction) { paddle.setAngularVelocity(0.15 * direction) }

	const paddles = {
		left: scene.matter.add.sprite(0, 0, 'paddleLeft', null, 
			{ shape: spritePhysics["paddleLeft"] }),
		right: scene.matter.add.sprite(0, 0, 'paddleRight', null, 
			{ shape: spritePhysics["paddleRight"] }),
		apply: (func) => { func(paddles.left); func(paddles.right) },
		fire: {left: () => fire(paddles.left, -1), right: () => fire(paddles.right, 1)},
		leftFired: false,
		rightFired: false
	}

	paddles.apply((paddle) => paddle.setScale(0.5))
	paddles.apply((paddle) => paddle.setFriction(0.0))

	const options = { spread: 345, matter: {} }
	const leftOptions = { pointA: { x: center.x - options.spread/2, y: center.y}, ...options.matter}
	const rightOptions = {  pointA: { x: center.x + options.spread/2, y: center.y}, ...options.matter}
	scene.matter.add.worldConstraint(paddles.left, 0, 1.0, leftOptions)
	scene.matter.add.worldConstraint(paddles.right, 0, 1.0, rightOptions)
	return paddles
}

const game = new Phaser.Game(config);
