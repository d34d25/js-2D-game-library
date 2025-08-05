const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const FIXED_TIMESTEP = 1 / 60;
let lastTime = 0;
let accumulator = 0;
let elapsed = 0;

function update()
{

}

function render()
{

}

function gameLoop(timestamp)
{

    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    const frameTime = Math.min(dt, 0.25);
    lastTime = timestamp;
    accumulator += frameTime;
    elapsed += dt;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    while (accumulator >= FIXED_TIMESTEP)
    {
        update();
        
        accumulator -= FIXED_TIMESTEP
    }

    render();

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);