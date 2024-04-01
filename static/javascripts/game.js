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
		var leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
		var rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		leftKey.on('down', (event) => paddles.fire.left())
		rightKey.on('down', (event) => paddles.fire.right())
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

	const forcePos = {x: center.x, y: center.y + 1000}
	
	function fire(paddle) {
		scene.matter.applyForceFromPosition(paddle, forcePos, 0.1)
	}

	const paddles = {
		left: scene.matter.add.sprite(0, 0, 'paddle', null, { shape, ignoreGravity: true }),
		right: scene.matter.add.sprite(0, 0, 'paddle', null, { shape, ignoreGravity: true }),
		apply: (func) => { func(paddles.left); func(paddles.right) },
		fire: {left: () => fire(paddles.left), right: () => fire(paddles.right)}
	}

	// paddles.right.setFlipX(true)
	paddles.apply((paddle) => paddle.setScale(0.50))
	paddles.apply((paddle) => paddle.setMass(200))
	// paddles.apple((paddle) => paddle.setRo)

	const paddleOptions = { damping: 0.1 }
	const pointB =  { x: 0, y: 0}
	const leftOptions = { pointA: {x: center.x - 150, y: center.y}, pointB, ...paddleOptions}
	const rightOptions = { pointA: {x: center.x + 150, y: center.y}, pointB, ...paddleOptions}
	scene.matter.add.worldConstraint(paddles.left, 0, 1.0, leftOptions)
	scene.matter.add.worldConstraint(paddles.right, 0, 1.0, rightOptions)
	return paddles
}

const game = new Phaser.Game(config);
