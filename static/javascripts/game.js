class Pinball extends Phaser.Scene {
	ball;
	paddles;

	preload() {
		this.load.setBaseURL('assets/');

		this.load.image('sky', 'sky.png');
		this.load.image('ball', 'silver_ball.png');
		this.load.image('paddle', 'paddle.png');

		this.load.json("sprites", "sprite-physics.json");

	}
	create() {
		const board = this.add.image(pos.center.x, pos.center.y, 'sky');
		board.setScale(1.5)
		
		this.createWalls()
	
		const spritePhysics = this.cache.json.get("sprites");
		
		this.paddles = newPaddles(this, spritePhysics.paddle)
		this.ball = newBall(this)
		
		// this.matter.alignBody(this.paddles.left, pos.paddleCenter.x - 120, 400, Phaser.Display.Align.LEFT_CENTER);
	}
	update () {
		this.updatePaddles()
	}
	
	createWalls () {
		this.matter.add.rectangle(pos.center.x, h, w, 10, { isStatic: true })
		this.matter.add.rectangle(0, h/2, 10, h, { isStatic: true })
		this.matter.add.rectangle(w, h/2, 10, h, { isStatic: true })
	}

	updatePaddles(input=this.input.keyboard, paddles=this.paddles) {
		input.on('keydown', (event) => 
			event.key == "ArrowLeft" ? paddles.leftFired = true :
			event.key == "ArrowRight" ? paddles.rightFired = true : null)
		input.on('keyup', (event) =>  
			event.key == "ArrowLeft" ? paddles.leftFired = false : 
			event.key == "ArrowRight" ? paddles.rightFired = false : null)
		
		if (paddles.leftFired ) { paddles.fire.left() } 
		if (paddles.rightFired) { paddles.fire.right() }
		
		if (paddles.left.angle == 160){
			paddles.left.setAngularVelocity(0.2)
		}
		if (paddles.left.angle > -160 && paddles.left.angle < 0){
			paddles.left.setAngularVelocity(0)
		}	
		if (paddles.right.angle == 30){
			paddles.right.setAngularVelocity(-0.25)
		}
		if (paddles.right.angle < -20 ){
			paddles.right.setAngularVelocity(0)
		}
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
	const ball = scene.matter.add.image(
		pos.launch.x, pos.launch.y, 'ball'
	);
	ball.setScale(0.35);
	ball.setCircle(15);
	ball.setBounce(0.75);
	ball.setVelocity(-6.5, -20);
	return this.ball
}

function newPaddles(scene, shape, center = pos.paddleCenter) {

	function fire(paddle, max, direction) {
		paddle.setAngle(max)
		// paddle.setAngularVelocity(0.5 * direction)
	}

	const paddles = {
		left: scene.matter.add.sprite(0, 0, 'paddle', null, { shape }),
		right: scene.matter.add.sprite(0, 0, 'paddle', null, { shape }),
		apply: (func) => { func(paddles.left); func(paddles.right) },
		fire: {left: () => fire(paddles.left, 160, -1), right: () => fire(paddles.right, 30, 1)},
		leftFired: false,
		rightFired: false
	}

	paddles.apply((paddle) => paddle.setScale(0.50))
	paddles.apply((paddle) => paddle.setMass(10))
	

	const paddleOptions = { damping: 1.0}
	const leftOptions = { pointA: { x: center.x - 120, y: center.y}, ...paddleOptions}
	const rightOptions = {  pointA: { x: center.x + 120, y: center.y}, ...paddleOptions}
	scene.matter.add.worldConstraint(paddles.left, 0, 1.0, leftOptions)
	scene.matter.add.worldConstraint(paddles.right, 0, 1.0, rightOptions)
	return paddles
}

const game = new Phaser.Game(config);
