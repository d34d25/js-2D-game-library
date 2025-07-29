import { Input } from "./src/input.js";
import { UI_Element } from "./src/ui.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const input = new Input(canvas);
const button = new UI_Element({position: {x: 20,y:20}, size: {w:50,h:25}});

function update() 
{

    if (input.isKeyPressed('Space'))
    {
        console.log('Space key pressed!');
    }

    if (input.isKeyDown('KeyW'))
    {
        console.log('w key pressed!');
    }

    if (input.isKeyDown('KeyA'))
    {
        console.log('a key pressed!');
    }

    if (input.isKeyDown('KeyS'))
    {
        console.log('s key pressed!');
    }

    if (input.isKeyDown('KeyD'))
    {
        console.log('d key pressed!');
    }

    if (input.isKeyReleased('KeyH'))
    {
        console.log('H key released!');
    }

    if (input.isMousePressed(1))
    {
        console.log('Mouse clicked at:', input.getMousePosition());
    }

    if(button.isClicked(input.getMousePosition(), input.isMouseDown(0)))
    {
        ctx.fillStyle = 'red';
    }
    else
    {
        ctx.fillStyle = 'blue';
    }

    input.update();
}

function render() 
{
    
    ctx.fillRect(button.position.x, button.position.y, button.size.w, button.size.h);
}

function gameLoop() {
  update();
  render();
  requestAnimationFrame(gameLoop);
}

gameLoop();
