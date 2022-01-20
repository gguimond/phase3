import Phaser from "phaser";

import Scene from "./scenes/Scene.js";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
    },
  },
  scene: [Scene],
};

export default new Phaser.Game(config);
