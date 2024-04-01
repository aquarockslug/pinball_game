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
		var spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
		spacebar.on('down', (event) => paddles.fire())
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
	ball.setScale(0.25);
	ball.setCircle(13);
	ball.setBounce(0.75);
	// ball.setVelocity(0, -20);
	return ball
}

function newPaddles(scene, shape, center = pos.paddleCenter) {
	const paddles = {
		left: scene.matter.add.sprite(1, 0, 'paddle', null, { shape: shape, ignoreGravity: true }),
		right: scene.matter.add.sprite(0, 0, 'paddle', null, { shape: shape, ignoreGravity: true }),
		apply: (func) => { func(paddles.left), func(paddles.right) },
		fire: () => scene.matter.applyForceFromAngle(paddles.left, 0.5, Math.PI / 2)
	}
	const leftOptions = { pointA: {x: center.x - 200, y: center.y} }
	const rightOptions = { pointA: {x: center.x + 200, y: center.y} }
	paddles.apply((paddle) => paddle.setScale(0.50))
	scene.matter.add.worldConstraint(paddles.left, 0, 0.7, leftOptions)
	scene.matter.add.worldConstraint(paddles.right, 0, 0.7, rightOptions)
	return paddles
}

const game = new Phaser.Game(config);
