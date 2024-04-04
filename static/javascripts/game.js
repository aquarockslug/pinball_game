class Pinball extends Phaser.Scene {
	ball;
	paddles;

	preload() {
		this.load.setBaseURL('assets/');

		this.load.image('sky', 'sky.png');
		this.load.image('ball', 'silver_ball.png');
		this.load.image('paddleRight', 'paddleRight.png');
		this.load.image('paddleLeft', 'paddleLeft.png');

		this.load.json("sprites", "sprite-physics.json");

	}
	create() {
		const board = this.add.image(pos.center.x, pos.center.y, 'sky');
		board.setScale(1.5)
		
		this.createWalls()
		
		this.matter.world.engine.positionIterations = 12 
		this.matter.world.engine.velocityIterations = 8
		this.matter.world.runner.isFixed = true 
		// this.matter.world.runner.deltaMax = 2 
		// this.matter.world.runner.correction = 100 
		// this.matter.world.runner.deltaMin = 1 
      			
		this.matter.world.setGravity(0, 1, 0.001);
		
		this.paddles = newPaddles(this)
		this.ball = newBall(this)
	}
	update () {
		this.updatePaddles()
	}
	
	createWalls () {
		this.matter.add.rectangle(pos.center.x, h, w, 30, { isStatic: true })
		this.matter.add.rectangle(0, h/2, 30, h, { isStatic: true })
		this.matter.add.rectangle(w, h/2, 30, h, { isStatic: true })
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

		if ( paddles.left.angle <= -30) paddles.leftFired ? 
			paddles.left.setAngularVelocity(0) : // button held
			paddles.left.setAngularVelocity(0.1) // button released
		
		if ( paddles.right.angle >= 30) paddles.rightFired ? 
			paddles.right.setAngularVelocity(0) : // button held
			paddles.right.setAngularVelocity(-0.1) // button released

		if ( paddles.right.angle <= -10 ) paddles.right.angle = -10 // bottom limit
		if ( paddles.left.angle >= 10 ) paddles.left.angle = 10 // bottom limit
	}
}

// Phaser config
const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	scene: Pinball,
	input: {
		keyboard: true
	},
	physics: {
		default: "matter",
		matter: {
			timing: {
				timeScale: 2 
			},
			debug: true
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
	launch: { x: w - 50, y: h - 50 },
	paddleCenter: { x: w / 2, y: h - h / 5 }
}

function newBall(scene) {
	const ball = scene.matter.add.image(
		pos.launch.x, pos.launch.y, 'ball'
	);
	ball.setScale(0.35);
	ball.setCircle(18);
	ball.setBounce(0.4);
	ball.setVelocity(-6, -20);
	// ball.setMass(0.05)
	return this.ball
}

function newPaddles(scene, center = pos.paddleCenter) {
	const spritePhysics = scene.cache.json.get("sprites");
	const leftCollision = spritePhysics["paddleLeft"]
	const rightCollision = spritePhysics["paddleRight"]
	
	function fire(paddle, direction) { paddle.setAngularVelocity(0.1 * direction) }

	const paddles = {
		left: scene.matter.add.sprite(0, 0, 'paddleLeft', null, { shape: leftCollision }),
		right: scene.matter.add.sprite(0, 0, 'paddleRight', null, { shape: rightCollision }),
		apply: (func) => { func(paddles.left); func(paddles.right) },
		fire: {left: () => fire(paddles.left, -1), right: () => fire(paddles.right, 1)},
		leftFired: false,
		rightFired: false
	}

	paddles.apply((paddle) => paddle.setScale(0.5))
	// paddles.apply((paddle) => paddle.setMass(1))

	const options = { spread: 330, matter: {} }
	const leftOptions = { pointA: { x: center.x - options.spread/2, y: center.y}, ...options.matter}
	const rightOptions = {  pointA: { x: center.x + options.spread/2, y: center.y}, ...options.matter}
	scene.matter.add.worldConstraint(paddles.left, 0, 1.0, leftOptions)
	scene.matter.add.worldConstraint(paddles.right, 0, 1.0, rightOptions)
	return paddles
}

const game = new Phaser.Game(config);
