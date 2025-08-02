import { SoundPlayer } from "./src/sound.js";

const testSound = new SoundPlayer("./assets/0000076.WAV", 0);

await testSound.load();
let lastTime = 0;

function gameLoop(timestamp) {
    const deltaTime = (timestamp - lastTime) / 1000; // in seconds
    lastTime = timestamp;

    update(deltaTime);
    render();

    requestAnimationFrame(gameLoop);
}

function update(dt) 
{
    testSound.play();
    testSound.fadeVolume(0.2 * dt);
    console.log("", testSound.volume);

    setTimeout(1);
}

function render() 
{

}


requestAnimationFrame(gameLoop);
