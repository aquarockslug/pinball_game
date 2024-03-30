class Example extends Phaser.Scene
{
    preload ()
    {
	this.load.setBaseURL('assets/');

        this.load.image('wood', 'wood.jpg');
    }

    create ()
    {
       this.add.image(400, 300, 'wood');
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: Example,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 }
        }
    }
};

const game = new Phaser.Game(config);
