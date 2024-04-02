var ball;
var paddles;

class Pinball extends Phaser.Scene {
	preload() {
		this.load.setBaseURL('assets/');

		this.load.image('sky', 'sky.png');
		this.load.image('ball', 'silver_ball.png');
		this.load.image('paddle', 'paddle.png');

		this.load.json("sprites", "sprite-physics.json");

	}

	create() {
		const board = this.matter.add.image(pos.center.x, pos.center.y, 'sky');
		board.setScale(1.5)
		board.setStatic(board, true)
		
		const spritePhysics = this.cache.json.get("sprites");

		ball = newBall(this)
		paddles = newPaddles(this, spritePhysics.paddle)
	}
	update () {
		paddles.left.rotation = paddles.left.rotation + 0.4 

		this.input.keyboard.on('keydown', (event) => event.key == "ArrowLeft" ? paddles.leftFired = true : null)
	
		paddles.leftFired ? paddles.fire.left() : null
		paddles.rightFired ? paddles.fire.right() : null


		this.input.keyboard.on('keyup', (event) =>  event.key == "ArrowLeft" ? paddles.leftFired = false : 
							    event.key == "ArrowRight" ? paddles.rightFired = false : null)

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
	const ball = scene.matter.add.sprite(
		pos.launch.x, pos.launch.y, 'ball'
	);
	ball.setDepth(100);
	// ball.setScale(0.25);
	ball.setCircle(13);
	ball.setBounce(0.75);
	// ball.setVelocity(0, -20);
	return ball
}

function newPaddles(scene, shape, center = pos.paddleCenter) {

	const forcePos = {x: center.x, y: center.y - 1000}
	
	function fire(paddle, target_angle) {
		paddle.setAngle(target_angle)
	}

	const paddles = {
		left: scene.matter.add.sprite(0, 0, 'paddle', null, { shape }),
		right: scene.matter.add.sprite(0, 0, 'paddle', null, { shape }),
		apply: (func) => { func(paddles.left); func(paddles.right) },
		fire: {left: () => fire(paddles.left, 160), right: () => fire(paddles.right, 30)},
		leftFired: false,
		rightFired: false
	}

	paddles.apply((paddle) => paddle.setScale(0.50))
	paddles.apply((paddle) => paddle.setMass(500))

	const paddleOptions = { damping: 1.0 }
	const leftOptions = { pointA: {x: center.x - 100, y: center.y}, ...paddleOptions}
	const rightOptions = { pointA: {x: center.x + 100, y: center.y}, ...paddleOptions}
	scene.matter.add.worldConstraint(paddles.left, 0, 1, leftOptions)
	scene.matter.add.worldConstraint(paddles.right, 0, 1, rightOptions)
	return paddles
}

const game = new Phaser.Game(config);
