export default class CountDown
{
  /** @type {Phaser.Time.TimerEvent} */
	timerEvent
	/** @type {Phaser.Scene} */
	scene

	/** @type {Phaser.GameObjects.Text} */
	label

	/**
	 * 
	 * @param {Phaser.Scene} scene 
	 * @param {Phaser.GameObjects.Text} label 
	 */
	constructor(scene, label)
	{
		this.scene = scene
		this.label = label
	}

	/**
	 * @param {() => void} callback
	 * @param {number} duration 
	 */
	start(callback, duration = 45000)
	{
    // 1️⃣ stop in case one is already running
    this.stop()

    this.duration = duration
    // 2️⃣ create a TimerEvent with given duration
    this.timerEvent = this.scene.time.addEvent({
      delay: duration,
      callback: () => {
        this.label.text = '0' // 👈 set to 0 since time is up

        this.stop()
        
        // 3️⃣ execute callback when finished
        if (callback)
        {
          callback()
        }
      }
    })
	}

	stop()
	{
    if (this.timerEvent)
    {
      this.timerEvent.destroy()
      this.timerEvent = undefined
    }
	}

	update()
	{
    if (!this.timerEvent || this.duration <= 0)
	  {
      return
    }

    // 1️⃣ get the elapsed time
    const elapsed = this.timerEvent.getElapsed()

    // 2️⃣ subtract from total duration
    const remaining = this.duration - elapsed

    // 3️⃣ convert from milliseconds to seconds
    const seconds = remaining / 1000

    // 4️⃣ change label to show new value
    this.label.text = seconds.toFixed(2)
  }
}
