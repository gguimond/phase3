import Phaser from 'phaser'

export default class Game extends Phaser.Scene
{
	constructor()
	{
		super('game')
    }
    
    init() {
        this.cursors = this.input.keyboard.createCursorKeys()	
    }

	preload()
    {
        
    }

    create()
    {
        const { width, height } = this.scale

		this.player = this.physics.add.sprite(width * 0.5, height * 0.6, 'sokoban')
            .play('down-idle')    
    }

    update(){
        const speed = 200

        if (this.cursors.left.isDown)
        {
            this.player.setVelocity(-speed, 0)
            this.player.play('left-walk', true)
        }
        else if (this.cursors.right.isDown)
        {
            this.player.setVelocity(speed, 0)
            this.player.play('right-walk', true)
        }
        else if (this.cursors.up.isDown)
        {
            this.player.setVelocity(0, -speed)
            this.player.play('up-walk', true)
        }
        else if (this.cursors.down.isDown)
        {
            this.player.setVelocity(0, speed)
            this.player.play('down-walk', true)
        }
        else
        {
            this.player.setVelocity(0, 0)
            const key = this.player.anims.currentAnim.key
            const parts = key.split('-')
            const direction = parts[0]
            this.player.play(`${direction}-idle`)
        }
    }
}
