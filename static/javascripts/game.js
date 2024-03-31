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

		const ball = newBall(this)
		const paddles = newPaddles(this, board, spritePhysics.paddle)
	}
}

// Phaser config
const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	scene: Pinball,
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
	paddleCenter: { x: 0, y: h - h / 8 }
}

function newBall(scene) {
	const ball = scene.matter.add.sprite(
		pos.launch.x, pos.launch.y, 'ball'
	);
	ball.setScale(0.25);
	ball.setCircle(13);
	ball.setBounce(0.75);
	// ball.setVelocity(0, -20);
	return ball
}

function newPaddles(scene, board, shape, center = pos.paddleCenter) {
	const paddles = {
		left: scene.matter.add.sprite(0, 0, 'paddle', null, { shape: shape }),
		right: scene.matter.add.sprite(0, 0, 'paddle', null, { shape: shape }),
		apply: (func) => { func(paddles.left), func(paddles.right) },
		//fire: () => 
	}
	const leftOptions = { pointA: {x: 45, y: -3}, pointB: {x: center.x+200, y: 100}}
	const rightOptions = { pointA: {x: 45, y: -3}, pointB: {x: center.x-200, y: 100}}
	paddles.apply((paddle) => paddle.setScale(0.50))
	scene.matter.add.constraint(paddles.left, board, 0, 0.2, leftOptions)
	scene.matter.add.constraint(paddles.right, board, 0, 0.2, rightOptions)
	paddles.left.angle = 3.14 
	paddles.right.angle = -3.14
	return paddles
}

const game = new Phaser.Game(config);
