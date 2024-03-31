class Pinball extends Phaser.Scene
{
    preload ()
    {
	this.load.setBaseURL('assets/');

        this.load.image('sky', 'sky.png');
        this.load.image('ball', 'silver_ball.png');
        this.load.image('paddle', 'paddle.png');

	this.load.json("sprites", "sprite-physics.json");
    }

    create ()
    {
	const background = this.add.image(pos.center.x, pos.center.y, 'sky');
	background.setScale(1.5)

    	const spritePhysics = this.cache.json.get("sprites");
	
	const ball = newBall(this)
	const paddles = newPaddles(this, spritePhysics.obstacle)
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
	center: {x: w/2, y: h/2},
	launch: {x: w-50, y: h-50},
	paddleCenter: {x: w/2, y: h-h/8}
}

function newBall(scene) {
	const ball = scene.matter.add.sprite(pos.launch.x, pos.launch.y, 'ball');
	ball.setScale(0.25);
	ball.setCircle(13);
        ball.setBounce(0.75);
        ball.setVelocity(0, -20);
	return ball
}

function newPaddles(scene, shape, center=pos.paddleCenter) {
	const paddles = {
		left: scene.matter.add.sprite(
			center.x-100, center.y, 'paddle', null, {shape: shape}),
		right: scene.matter.add.sprite(
			center.x+100, center.y, 'paddle', null, {shape: shape}),
		apply: (func) => {func(paddles.left), func(paddles.right)}, 
		//fire: () => 
	}
	paddles.apply((paddle) => paddle.setScale(0.25))
	return paddles
}

const game = new Phaser.Game(config);
