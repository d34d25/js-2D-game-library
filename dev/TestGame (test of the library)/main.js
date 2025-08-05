import testLevel from "./src/levels/testLevel.js";

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let lastTime = 0;
let accumulator = 0;
let elapsed = 0;

let fps = 0;
let frames = 0;
let fpsTimer = 0;


function gameLoop(timestamp)
{

    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    const frameTime = Math.min(dt, 0.25);
    lastTime = timestamp;
    accumulator += frameTime;
    elapsed += dt;

    frames++;
    fpsTimer += dt;

    if (fpsTimer >= 1) {
    fps = frames;
    frames = 0;
    fpsTimer = 0;
    }


    ctx.clearRect(0, 0, canvas.width, canvas.height);

    testLevel.update(dt);

    testLevel.render(ctx);

    ctx.fillStyle = "white";
    ctx.font = "16px monospace";
    ctx.fillText(`FPS: ${fps}`, 10, 20);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);