import levelOne from "./src/levels/levelOne.js";

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

let lastTime = 0;
let accumulator = 0;
let elapsed = 0;

let currentLevel = 1;
let levels = [levelOne];

function gameLoop(timestamp)
{

    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    const frameTime = Math.min(dt, 0.25);
    lastTime = timestamp;
    accumulator += frameTime;
    elapsed += dt;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    levelOne.update(dt);

    levelOne.render(ctx);

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);