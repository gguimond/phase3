import Phaser from 'phaser'
import CountDown from './CountDown'

const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

let items = [1,1,2,2,3,3,4,4,0]
shuffleArray(items)

const level = [
	[items[0], items[1], items[2]],
	[items[3], items[4], items[5]],
	[items[6], items[7], items[8]]
]

export default class Game extends Phaser.Scene
{
    selectedBoxes = []
    matchesCount = 0

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

    createBoxes(){
        const width = this.scale.width

        let xPer = 0.25
        let y = 150
        for (let row = 0; row < level.length; ++row)
        {
            for (let col = 0; col < level[row].length; ++col)
            {
                /** @type {Phaser.Physics.Arcade.Sprite} */
                const box = this.boxGroup.get(width * xPer, y, 'sokoban', 10)
                box.setSize(64, 32)
                    .setOffset(0, 32)
                    .setData('itemType', level[row][col])
                xPer += 0.25
            }
    
            xPer = 0.25
            y += 150
        }
    }

    /**
 * 
 * @param {Phaser.Physics.Arcade.Sprite} box 
 */
    openBox(box)
    {
        if (!box)
        {
            return
        }

        const itemType = box.getData('itemType')
            
        /** @type {Phaser.GameObjects.Sprite} */
        let item

        switch (itemType)
        {
            case 0:
			item = this.itemsGroup.get(box.x, box.y)
			item.setTexture('bear')
			break

            case 1:
                item = this.itemsGroup.get(box.x, box.y)
                item.setTexture('chicken')
                break

            case 2:
                item = this.itemsGroup.get(box.x, box.y)
                item.setTexture('duck')
                break

            case 3:
                item = this.itemsGroup.get(box.x, box.y)
                item.setTexture('parrot')
                break

            case 4:
                item = this.itemsGroup.get(box.x, box.y)
                item.setTexture('penguin')
                break
        }

        box.setData('opened', true)
        item.setData('sorted', true)
        item.setDepth(800)
        
        item.setActive(true) // 👈
	    item.setVisible(true) 

        item.scale = 0
        item.alpha = 0

        this.selectedBoxes.push({ box, item })

        this.tweens.add({
            targets: item,
            y: '-=50',
            alpha: 1,
            scale: 1,
            duration: 500,
            onComplete: () => {
                if (itemType === 0)
                {
                    // call handleBearSelected() if true
                    this.handleBearSelected()
                    return // 👈 and early exit
                }
                // check that we have 2️⃣ items recently opened
                if (this.selectedBoxes.length < 2)
                {
                    return
                }
    
                // we have to create this method
                this.checkForMatch()
            }
        })
    }

    handleBearSelected()
    {
        // get the selected box information
        const { box, item } = this.selectedBoxes.pop()

        // tint the bear red
        item.setTint(0xff0000)

        // set the box to frame 7 (a red box)
        box.setFrame(7)

        // disable the player and any movement
        this.player.active = false
        this.player.setVelocity(0, 0)
        this.freeze.play()
        // wait 1 second and then return to normal
        this.time.delayedCall(1000, () => {
            item.setTint(0xffffff)
            box.setFrame(10)
            box.setData('opened', false)

            this.tweens.add({
                targets: item,
                y: '+=50',
                alpha: 0,
                scale: 0,
                duration: 300,
                onComplete: () => {
                    this.player.active = true // 👈 re-activate the player
                }
            })
        })
    }

    checkForMatch()
    {
        // pop from end to get second and first opened boxes
        const second = this.selectedBoxes.pop()
        const first = this.selectedBoxes.pop()

        // no match if the revealed items are not the same texture
        if (first.item.texture !== second.item.texture)
        {
            this.bad.play()
            // hide the items and set box to no longer opened
            this.tweens.add({
                targets: [first.item, second.item],
                y: '+=50',
                alpha: 0,
                scale: 0,
                duration: 300,
                delay: 1000,
                onComplete: () => {
                    this.itemsGroup.killAndHide(first.item)
                    this.itemsGroup.killAndHide(second.item)

                    first.box.setData('opened', false)
                    second.box.setData('opened', false)
                }
            })
            return
        }
        ++this.matchesCount

        this.good.play()

	    // we have a match! wait 1 second then set box to frame 8
        this.time.delayedCall(1000, () => {
            first.box.setFrame(8)
            second.box.setFrame(8)
            if (this.matchesCount >= 4)
            {
                // game won
                this.countdown.stop()
                // 👇 disable and stop player like before
                this.player.active = false
                this.player.setVelocity(0, 0)

                // add a You Win! text 👇
                const { width, height } = this.scale
                this.add.text(width * 0.5, height -50, 'You Win!', {
                    fontSize: 48
                })
                .setOrigin(0.5)
                this.win.play()
                this.time.delayedCall(2000, () => {
                    document.location.reload()
                })
            }
        })
    }

    create()
    {
        const { width, height } = this.scale

        this.player = this.physics.add.sprite(width * 0.5, height * 0.6, 'sokoban')
            .setSize(40, 16)
		    .setOffset(12, 38)
            .play('down-idle')    

        this.boxGroup = this.physics.add.staticGroup()
		this.itemsGroup = this.add.group()

        this.createBoxes()

        // create a Text object 👇
		const timerLabel = this.add.text(width -75 , 50, '45', { fontSize: 48 })
        .setOrigin(0.5)

        // 👇 create a new instance
        this.countdown = new CountDown(this, timerLabel)
        this.countdown.start(this.handleCountdownFinished.bind(this))

        this.physics.add.collider(
            this.boxGroup,
            this.player,
            this.handlePlayerBoxCollide, // 👈 here
            undefined,
            this
        )

        this.good = this.sound.add("good", { loop: false })
        this.bad = this.sound.add("bad", { loop: false })
        this.gameOver = this.sound.add("game_over", { loop: false })
        this.win = this.sound.add("win", { loop: false })
        this.freeze = this.sound.add("freeze", { loop: false })
        this.sound.add("background", { loop: true }).play()

    }

    handlePlayerBoxCollide(player, box)
    {
        const opened = box.getData('opened')
	
        if (opened)
        {
            return
        }

        if (this.activeBox)
        {
            return
        }

        this.activeBox = box

        this.activeBox.setFrame(9)
    }

    updateActiveBox()
    {
        if (!this.activeBox)
        {
            return
        }

        // get the distance here 👇
        const distance = Phaser.Math.Distance.Between(
            this.player.x, this.player.y,
            this.activeBox.x, this.activeBox.y
        )

        if (distance < 64) // 👈 do nothing if still near
        {
            return
        }

        // return to using frame 10 when too far
        this.activeBox.setFrame(10)

        // and make activeBox undefined
        this.activeBox = undefined
    }

    updatePlayer()
    {
        if (!this.player.active)
        {
            return
        }
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

        const spaceJustPressed = Phaser.Input.Keyboard.JustUp(this.cursors.space)
        if (spaceJustPressed && this.activeBox)
        {
            this.openBox(this.activeBox)

            this.activeBox.setFrame(10)
            this.activeBox = undefined
        }
    }

    update(){
        this.updatePlayer()

        this.updateActiveBox()

        this.children.each(c => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            // @ts-ignore
            const child = c

            if (child.getData('sorted'))
            {
                return
            }

            child.setDepth(child.y)
        })
        this.countdown.update()
    }

    handleCountdownFinished()
    {
        // disable player like we've done before
        this.player.active = false
        this.player.setVelocity(0, 0)

        // create a You Lose! message
        const { width, height } = this.scale
        this.add.text(width * 0.5, height -50, 'You Lose!', { fontSize: 48 })
            .setOrigin(0.5)
        this.gameOver.play()
        this.time.delayedCall(2000, () => {
            document.location.reload()
        })
    }
}
